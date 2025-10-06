import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { companies } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

async function verifyWebhookSignature(
  body: string,
  webhookId: string,
  webhookTimestamp: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const payload = `${webhookId}.${webhookTimestamp}.${body}`;
  
  // Use Web Crypto API (Edge Runtime compatible)
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  );
  
  // Convert to base64
  const expectedSignature = btoa(
    String.fromCharCode(...new Uint8Array(signatureBuffer))
  );

  // Handle multiple space-delimited signatures
  const signatures = signature.split(' ');
  for (const sig of signatures) {
    const parts = sig.split(',');
    const sigValue = parts.length > 1 ? parts[1] : sig;
    
    if (sigValue === expectedSignature) {
      return true;
    }
  }
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const webhookId = request.headers.get('webhook-id');
    const webhookTimestamp = request.headers.get('webhook-timestamp');
    const webhookSignature = request.headers.get('webhook-signature');

    if (!webhookId || !webhookTimestamp || !webhookSignature) {
      console.log('Missing webhook headers, accepting anyway for development');
    }

    const rawBody = await request.text();

    // Verify signature only if secret is configured
    if (process.env.WEBHOOK_SECRET && process.env.WEBHOOK_SECRET !== 'your_webhook_secret_from_parallel_settings') {
      if (webhookId && webhookTimestamp && webhookSignature) {
        const isValid = await verifyWebhookSignature(
          rawBody,
          webhookId,
          webhookTimestamp,
          webhookSignature,
          process.env.WEBHOOK_SECRET
        );

        if (!isValid) {
          console.error('Invalid webhook signature');
          return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 401 }
          );
        }
      }
    }

    const payload = JSON.parse(rawBody);
    console.log('Webhook received:', JSON.stringify(payload, null, 2));

    const { type, data } = payload;

    if (type !== 'task_run.status') {
      return NextResponse.json({ received: true });
    }

    const { run_id, status, metadata } = data;
    const companyId = metadata?.company_id;

    if (!companyId) {
      console.error('No company_id in metadata');
      return NextResponse.json(
        { error: 'Missing company_id' },
        { status: 400 }
      );
    }

    console.log(`Processing webhook for company ${companyId}, status: ${status}`);

    if (status === 'completed') {
      // Fetch the full result from Parallel.ai
      const resultResponse = await fetch(
        `https://api.parallel.ai/v1/tasks/runs/${run_id}/result`,
        {
          headers: {
            'x-api-key': process.env.PARALLEL_API_KEY!,
          },
        }
      );

      if (!resultResponse.ok) {
        throw new Error('Failed to fetch result from Parallel.ai');
      }

      const result = await resultResponse.json();

      // Analyze with OpenAI to get fit score and pitch
      let fitScore = null;
      let pitch = null;
      let employeeCount = null;
      
      if (process.env.OPENAI_API_KEY) {
        try {
          const { analyzeCompanyFit } = await import('@/lib/openai-analyzer');
          const analysis = await analyzeCompanyFit(result.output);
          if (analysis) {
            fitScore = analysis.fitScore;
            pitch = analysis.pitch;
            employeeCount = analysis.employeeCount || null;
          }
        } catch (error) {
          console.error('OpenAI analysis failed:', error);
        }
      }

      // Update database with completed result and analysis
      await db
        .update(companies)
        .set({
          status: 'completed',
          response: result.output,
          fitScore,
          pitch,
          employeeCount,
          updatedAt: new Date(),
        })
        .where(eq(companies.id, companyId));

      console.log(`Successfully updated company ${companyId} with completed result`);
      if (fitScore) {
        console.log(`  Fit Score: ${fitScore}, Pitch: ${pitch?.substring(0, 50)}...`);
      }
    } else if (status === 'failed') {
      // Update database with failure
      await db
        .update(companies)
        .set({
          status: 'failed',
          error: data.error?.message || 'Task failed',
          updatedAt: new Date(),
        })
        .where(eq(companies.id, companyId));

      console.log(`Updated company ${companyId} with failure status`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
