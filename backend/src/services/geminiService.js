const ai = require('../config/gemini');

const analyzePlaceWithGemini = async (placeName, rating, userRatingCount, reviewsText) => {
  const prompt = `You are a travel and food assistant analyzing a stop for someone on a road trip.
Place Name: ${placeName}
Rating: ${rating} / 5
Total Ratings: ${userRatingCount}
Customer Reviews:
${reviewsText || 'No detailed reviews provided.'}

Please analyze this place and respond strictly in this structured JSON format:
{
  "summary": "Short 1-2 sentence overview of the vibe and food/service",
  "positivePoints": ["point 1", "point 2"],
  "negativePoints": ["point 1", "point 2"],
  "recommendedFor": "Quick bite, Family dinner, Fuel stop, etc.",
  "finalScoreOutOf10": 8.5
}
Ensure the score is realistic based on the reviews and ratings. Return valid JSON only, no markdown wrapping.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt
  });

  return response.text;
};

module.exports = {
  analyzePlaceWithGemini
};