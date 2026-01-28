import Anthropic from '@anthropic-ai/sdk';

let client = null;

function getClient() {
  if (client) return client;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  client = new Anthropic({ apiKey });
  return client;
}

/**
 * Analyze CV text using Claude
 */
export async function analyzeCv(cvText, role) {
  const anthropic = getClient();

  const prompt = `You are a recruitment assistant. Analyze the following CV/resume for a ${role || 'general'} position.

Extract and summarize:
1. **Key Skills**: List the most relevant technical and soft skills
2. **Experience Summary**: Brief overview of work history and years of experience
3. **Education**: Degrees, certifications, relevant training
4. **Strengths**: 3-5 notable strengths for this role
5. **Areas of Concern**: Any gaps or potential concerns (be constructive)
6. **Overall Fit**: Brief assessment of fit for the ${role || 'role'} position (1-2 sentences)

CV Content:
---
${cvText.slice(0, 15000)}
---

Respond in JSON format:
{
  "skills": ["skill1", "skill2", ...],
  "experienceSummary": "...",
  "yearsOfExperience": number or null,
  "education": ["degree1", "cert1", ...],
  "strengths": ["strength1", "strength2", ...],
  "concerns": ["concern1", ...],
  "overallFit": "..."
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [
      { role: 'user', content: prompt }
    ]
  });

  const content = response.content[0].text;

  // Extract JSON from the response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse Claude response as JSON');
  }

  try {
    const analysis = JSON.parse(jsonMatch[0]);
    return {
      ...analysis,
      analyzedAt: new Date().toISOString(),
      model: 'claude-sonnet-4-20250514'
    };
  } catch (parseError) {
    throw new Error(`Failed to parse analysis JSON: ${parseError.message}`);
  }
}

export default { analyzeCv };
