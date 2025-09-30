import { db } from './src/db';
import { companies } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function updateStuckCompanies() {
  console.log('🔍 Checking stuck companies...\n');
  
  const processingCompanies = await db
    .select()
    .from(companies)
    .where(eq(companies.status, 'processing'));

  if (processingCompanies.length === 0) {
    console.log('✅ No stuck companies!');
    return;
  }

  for (const company of processingCompanies) {
    if (!company.runId) continue;

    console.log(`📊 Checking: ${company.url}`);
    console.log(`   Run ID: ${company.runId}`);

    try {
      // Check status
      const statusResponse = await fetch(
        `https://api.parallel.ai/v1/tasks/runs/${company.runId}`,
        {
          headers: { 'x-api-key': process.env.PARALLEL_API_KEY! },
        }
      );

      const statusData = await statusResponse.json();
      const status = statusData.status;

      console.log(`   Status: ${status}`);

      if (status === 'completed') {
        // Fetch result
        const resultResponse = await fetch(
          `https://api.parallel.ai/v1/tasks/runs/${company.runId}/result`,
          {
            headers: { 'x-api-key': process.env.PARALLEL_API_KEY! },
          }
        );

        const resultData = await resultResponse.json();

        // Analyze with OpenAI
        let fitScore = null;
        let pitch = null;
        
        if (process.env.OPENAI_API_KEY) {
          try {
            const { analyzeCompanyFit } = await import('./src/lib/openai-analyzer');
            const analysis = await analyzeCompanyFit(resultData.output);
            if (analysis) {
              fitScore = analysis.fitScore;
              pitch = analysis.pitch;
              console.log(`   💡 Fit Score: ${fitScore}`);
            }
          } catch (error) {
            console.log('   ⚠️  OpenAI analysis failed');
          }
        }

        // Update database
        await db
          .update(companies)
          .set({
            status: 'completed',
            response: resultData.output,
            fitScore,
            pitch,
            updatedAt: new Date(),
          })
          .where(eq(companies.id, company.id));

        console.log('   ✅ Updated to completed!\n');
      } else if (status === 'failed') {
        await db
          .update(companies)
          .set({
            status: 'failed',
            error: statusData.error?.message || 'Task failed',
            updatedAt: new Date(),
          })
          .where(eq(companies.id, company.id));

        console.log('   ❌ Marked as failed\n');
      } else {
        console.log('   ⏳ Still processing...\n');
      }
    } catch (error) {
      console.error(`   ⚠️  Error checking ${company.url}:`, error);
    }
  }

  console.log('✅ Done!');
}

updateStuckCompanies().catch(console.error);
