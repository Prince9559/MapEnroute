const express = require('express');
const router = express.Router();

// 1. AI Travel Assistant
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

// 2. High-Speed Ultra-Light AI Geocoder
router.post('/geocode-ai', async (req, res) => {
  try {
    const { placeName } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!placeName) {
      return res.status(400).json({ success: false, message: 'placeName is required' });
    }

    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'GEMINI_API_KEY missing' });
    }

    console.log(`Geocoding request for: "${placeName}"`);

    const targetModel = 'gemini-3.8-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

    const promptText = `Indian place query: "${placeName}"
Output ONLY this JSON and nothing else:
{"lat": 25.0, "lng": 82.0, "displayName": "Name, State"}`;

    const googleRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          maxOutputTokens: 60, // Minimal tokens = 1 second response
          temperature: 0.1,
        },
      }),
    });

    const data = await googleRes.json();

    if (data.error) {
      console.error('Gemini API Error:', data.error);
      return res.status(500).json({ success: false, message: data.error.message });
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = rawText.match(/\{[\s\S]*?\}/);

    if (!jsonMatch) {
      throw new Error(`Invalid format: ${rawText}`);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    console.log(`Geocoded "${placeName}" successfully -> (${parsed.lat}, ${parsed.lng})`);

    return res.json({
      success: true,
      data: {
        lat: Number(parsed.lat),
        lng: Number(parsed.lng),
        latitude: Number(parsed.lat),
        longitude: Number(parsed.lng),
        displayName: parsed.displayName || placeName,
      },
    });
  } catch (err) {
    console.error('AI Geocode Route Error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});


module.exports = router;