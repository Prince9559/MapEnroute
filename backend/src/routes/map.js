const express = require('express');
const router = express.Router();

// POST /api/map/ai-analyze (ya /map/ai-analyze)
router.post('/ai-analyze', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY missing in backend .env');
      return res.status(500).json({ success: false, message: 'Gemini API key missing on server' });
    }

    // Google Gemini API call
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const apiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an expert AI Travel Assistant for an Indian navigation app called MapEnroute.
Answer this exact query with authentic local spots, highway numbers, fuel/EV stations, and practical driving tips:
"${prompt}"

Format with clean bullet points and concise sections.`,
              },
            ],
          },
        ],
      }),
    });

    const data = await apiResponse.json();

    if (data.error) {
      console.error('Gemini API Error from Google:', data.error);
      return res.status(500).json({ success: false, message: data.error.message });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return res.json({
      success: true,
      reply: reply || 'No insights available for this location.',
    });
  } catch (error) {
    console.error('Server error in /ai-analyze:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;