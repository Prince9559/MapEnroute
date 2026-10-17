const express = require('express');
const router = express.Router();

router.post('/ai-analyze', async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log('Incoming AI Prompt:', prompt);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY backend .env me nahi mili');
      return res.status(500).json({
        success: false,
        message: 'GEMINI_API_KEY not found in backend .env',
      });
    }

    // Jo model aapke Postman me direct work kar raha tha
    const targetModel = 'gemini-3.8-flash';

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

    const googleRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are MapEnroute AI Travel Assistant. The user asks about travel/route in India:
"${prompt}"

Give authentic, specific recommendations for this exact query:
- Specific famous cafes, dhabas, or restaurants on this route
- Highway name / route road conditions
- Fuel pumps and EV charging points

Keep it structured with clean bullet points.`,
              },
            ],
          },
        ],
      }),
    });

    const data = await googleRes.json();

    if (data.error) {
      console.error('Gemini API Error:', data.error);
      return res.status(500).json({
        success: false,
        message: data.error.message,
      });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('Gemini generated reply successfully!');

    return res.json({
      success: true,
      reply: reply || 'No recommendations generated.',
    });
  } catch (error) {
    console.error('Server catch error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;