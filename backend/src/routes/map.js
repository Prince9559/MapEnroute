const express = require('express');
const router = express.Router();

// 1. Existing Travel Assistant AI
router.post('/ai-analyze', async (req, res) => {
  try {
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ success: false, message: 'API Key missing' });

    const targetModel = 'gemini-3.8-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

    const googleRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are MapEnroute AI Travel Assistant for India.
Route Query: "${prompt}"

Provide quick, concise bullet points covering:
• Top authentic cafes / dhabas on this route
• Highway name & road conditions
• Fuel & EV pitstops

Keep it direct and brief.`,
              },
            ],
          },
        ],
      }),
    });

    const data = await googleRes.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.json({ success: true, reply: reply || 'No recommendations generated.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 2. NEW: Universal AI Geocoder for ANY village, town, or bazaar in India
router.post('/geocode-ai', async (req, res) => {
  try {
    const { placeName } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!placeName || !apiKey) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    const targetModel = 'gemini-3.8-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

    const prompt = `You are a precision Indian GIS geocoding tool.
Find the approximate GPS latitude and longitude for this place, village, town, or landmark in India:
"${placeName}"

Return ONLY valid JSON with this exact format and nothing else (no markdown, no backticks):
{"lat": 25.2613, "lng": 82.6140, "displayName": "Name, District, State"}`;

    const googleRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await googleRes.json();
    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(text);
    return res.json({
      success: true,
      data: {
        lat: parseFloat(parsed.lat),
        lng: parseFloat(parsed.lng),
        displayName: parsed.displayName || placeName,
      },
    });
  } catch (err) {
    console.error('AI Geocode Error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;