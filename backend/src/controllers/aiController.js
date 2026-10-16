const { analyzePlaceWithGemini } = require('../services/geminiService');

// @desc    Analyze a place using Google Places Details + Gemini AI
// @route   GET /api/ai/places/:placeId/analyze
// @access  Public
const analyzePlace = async (req, res) => {
  try {
    const { placeId } = req.params;

    if (!placeId) {
      return res.status(400).json({
        success: false,
        message: 'placeId is required'
      });
    }

    // Step 1: Fetch place details & reviews from Google Places API
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask':
            'id,displayName,formattedAddress,location,rating,userRatingCount,reviews'
        }
      }
    );

    const placeData = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: placeData.error?.message || 'Failed to fetch place details'
      });
    }

    // Step 2: Combine reviews into a single text block
    const reviewsList = (placeData.reviews || [])
      .map((r) => r.text?.text)
      .filter(Boolean);

    const reviewsText = reviewsList.join('\n\n');

    // Step 3: Analyze with Gemini AI
    const rawAiOutput = await analyzePlaceWithGemini(
      placeData.displayName?.text,
      placeData.rating || 0,
      placeData.userRatingCount || 0,
      reviewsText
    );

    let parsedAnalysis;
    try {
      // Clean markdown codeblocks if model adds any
      const cleaned = rawAiOutput.replace(/```json|```/g, '').trim();
      parsedAnalysis = JSON.parse(cleaned);
    } catch {
      parsedAnalysis = { rawOutput: rawAiOutput };
    }

    return res.status(200).json({
      success: true,
      place: {
        id: placeData.id,
        name: placeData.displayName?.text,
        address: placeData.formattedAddress,
        rating: placeData.rating,
        userRatingCount: placeData.userRatingCount
      },
      analysis: parsedAnalysis
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  analyzePlace
};