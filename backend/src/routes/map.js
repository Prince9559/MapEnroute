const express = require('express');
const router = express.Router();

// 1. Travel Assistant AI
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

// 2. 100% Bulletproof Universal AI Geocoder (Any Indian Village / Town / Market)
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

    console.log(`Geocoding request received for: "${placeName}"`);

    const targetModel = 'gemini-3.8-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

    const promptText = `Find the realistic GPS Latitude and Longitude for this Indian location, village, town, or market:
Location query: "${placeName}"

Return strictly a single JSON object with this exact shape:
{"lat": 25.2613, "lng": 82.6140, "displayName": "Name, District, State"}

Do not include any greeting, markdown ticks, or extra words. Only raw JSON.`;

    const googleRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          temperature: 0.1, // High deterministic accuracy
        },
      }),
    });

    const data = await googleRes.json();

    if (data.error) {
      console.error('Gemini Geocode API Error:', data.error);
      return res.status(500).json({ success: false, message: data.error.message });
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('Gemini raw output:', rawText);

    // Robust JSON extraction using regex (even if AI puts backticks or extra text)
    const jsonMatch = rawText.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      throw new Error(`Invalid AI format received: ${rawText}`);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.lat || !parsed.lng) {
      throw new Error('Coordinates missing in AI response');
    }

    console.log(`Successfully geocoded "${placeName}" -> Lat: ${parsed.lat}, Lng: ${parsed.lng}`);

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