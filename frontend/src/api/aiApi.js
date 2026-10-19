import client from './client';

export const askRouteAI = async (userPrompt) => {
  try {
    const response = await client.post(
      '/map/ai-analyze',
      { prompt: userPrompt },
      { timeout: 45000 } // AI generation ke liye timeout 45 seconds kar diya
    );

    if (response.data && response.data.reply) {
      return response.data.reply;
    }

    return response.data?.message || 'No response received from AI service.';
  } catch (err) {
    const errMsg = err?.response?.data?.message || err?.message || 'Server connection failed';
    console.error('AI Request Error:', errMsg);
    throw new Error(errMsg);
  }
};