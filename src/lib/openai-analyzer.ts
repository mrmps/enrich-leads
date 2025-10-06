import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AnalysisResult {
  fitScore: string;
  pitch: string;
  employeeCount?: string;
}

export async function analyzeCompanyFit(researchData: unknown): Promise<AnalysisResult | null> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not set, skipping analysis');
    return null;
  }

  try {
    const prompt = `Based on the following deep research about a company, extract:

1. A fit score from 1-10 for Inference.net (where 10 = perfect fit, 1 = no fit)
2. A concise, compelling 2-3 sentence pitch for why Inference.net would be valuable to them
3. The company's employee count (if available in the research data)

Research Context:
${JSON.stringify(researchData, null, 2)}

Inference.net offers:
- Custom AI models trained for specific use cases
- Workhorse models (ClipTagger-12b for video captioning, Schematron for HTML→JSON extraction)
- 2-3x faster than top models
- Up to 90% cheaper than OpenAI/Anthropic/Gemini
- Private and fully owned models
- Best for companies spending >$50k/month on LLM APIs

For employee count, extract the number if available, or provide a range (e.g., "50-100", "1000-5000", "10000+").
If not available, set as null.

Respond in JSON format only:
{
  "fitScore": "X/10",
  "pitch": "Your pitch here",
  "employeeCount": "number or range or null"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-5',
      messages: [
        {
          role: 'system',
          content: 'You are a sales analyst helping qualify leads for Inference.net, a custom AI model training company. Extract fit scores and create compelling pitches based on company research.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const result = JSON.parse(content);
    return {
      fitScore: result.fitScore || 'N/A',
      pitch: result.pitch || 'Unable to generate pitch',
      employeeCount: result.employeeCount || null
    };
  } catch (error) {
    console.error('Error analyzing company fit with OpenAI:', error);
    return null;
  }
}
