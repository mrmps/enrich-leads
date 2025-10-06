import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { companies } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { RESEARCH_PROMPT } from '@/lib/research-prompt';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Insert into database
    const [company] = await db
      .insert(companies)
      .values({
        url,
        status: 'pending',
      })
      .returning();

    // Send to Parallel.ai
    const parallelResponse = await fetch('https://api.parallel.ai/v1/tasks/runs', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.PARALLEL_API_KEY!,
        'Content-Type': 'application/json',
        'parallel-beta': 'webhook-2025-08-12',
      },
      body: JSON.stringify({
        input: `Research this company: ${url}\n\n${RESEARCH_PROMPT}`,
        processor: 'base',
        ...(process.env.WEBHOOK_URL?.startsWith('https://') && {
          webhook: {
            url: process.env.WEBHOOK_URL,
            event_types: ['task_run.status'],
          },
        }),
        metadata: {
          company_id: company.id,
        },
      }),
    });

    if (!parallelResponse.ok) {
      const errorText = await parallelResponse.text();
      throw new Error(`Parallel API error: ${errorText}`);
    }

    const parallelData = await parallelResponse.json();

    // Update with run_id
    await db
      .update(companies)
      .set({
        runId: parallelData.run_id,
        status: 'processing',
        updatedAt: new Date(),
      })
      .where(eq(companies.id, company.id));

    return NextResponse.json({
      success: true,
      companyId: company.id,
      runId: parallelData.run_id,
    });
  } catch (error) {
    console.error('Error creating company research:', error);
    
    // Check if it's a duplicate URL error
    const errorMessage = error instanceof Error ? error.message : 'Failed to initiate research';
    if (errorMessage.includes('unique') || errorMessage.includes('duplicate')) {
      return NextResponse.json(
        { error: 'This company URL has already been added. Please check the table below.' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allCompanies = await db.select().from(companies);
    return NextResponse.json({ companies: allCompanies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    await db.delete(companies).where(eq(companies.id, id));

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    );
  }
}
