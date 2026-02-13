const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

function buildSystemPrompt(context, enhancementLevel) {
  const projectType = context?.projectType || 'general';
  const framework = context?.framework && context.framework !== 'none' ? context.framework : 'unspecified';
  const teamConventions = (context?.teamConventions || '').trim();
  const level = enhancementLevel || 'smart';

  return [
    'You are an expert prompt enhancement assistant.',
    'Your job is to rewrite a user prompt into a clearer, more actionable prompt while preserving user intent.',
    'Return only the final enhanced prompt text with no markdown fences and no extra commentary.',
    `Enhancement level: ${level}.`,
    `Project type: ${projectType}.`,
    `Framework: ${framework}.`,
    teamConventions ? `Team conventions: ${teamConventions}.` : 'Team conventions: none provided.',
    'Focus on structure, specificity, constraints, acceptance criteria, and expected output format when relevant.'
  ].join(' ');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Missing DEEPSEEK_API_KEY in server environment'
    });
  }

  const { prompt, context, enhancementLevel } = req.body || {};

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const deepseekResponse = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content: buildSystemPrompt(context, enhancementLevel)
          },
          {
            role: 'user',
            content: prompt.trim()
          }
        ]
      })
    });

    const payload = await deepseekResponse.json().catch(() => ({}));

    if (!deepseekResponse.ok) {
      const deepseekMessage = payload?.error?.message || payload?.error || 'DeepSeek request failed';
      return res.status(deepseekResponse.status).json({ error: deepseekMessage });
    }

    const enhancedPrompt = payload?.choices?.[0]?.message?.content?.trim();

    if (!enhancedPrompt) {
      return res.status(502).json({ error: 'DeepSeek returned an empty response' });
    }

    return res.status(200).json({ enhancedPrompt });
  } catch (error) {
    if (error?.name === 'AbortError') {
      return res.status(499).json({ error: 'Request cancelled' });
    }

    return res.status(500).json({ error: 'Failed to enhance prompt' });
  }
};
