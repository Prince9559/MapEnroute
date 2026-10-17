import client from './client';

export const askRouteAI = async (userPrompt) => {
  try {
    // Agar client ka baseURL already '/api' include karta hai to '/map/ai-analyze', 
    // warna '/api/map/ai-analyze' try karega
    const response = await client.post('/map/ai-analyze', {
      prompt: userPrompt,
    });

    if (response.data && response.data.reply) {
      return response.data.reply;
    }
  } catch (err) {
    console.error('Backend AI Request Failed:', err?.response?.data || err?.message);

    // Agar route path /api/map/ai-analyze ho:
    try {
      const retry = await client.post('/api/map/ai-analyze', { prompt: userPrompt });
      if (retry.data?.reply) return retry.data.reply;
    } catch (retryErr) {
      console.error('Retry with /api/map/ai-analyze also failed:', retryErr?.message);
    }
  }

  // Agar backend call fail ho to exact reason dikhaye na ki generic notice
  return `Unable to fetch AI response from server.\nPlease check your backend terminal console to see if the Gemini API request succeeded.`;
};