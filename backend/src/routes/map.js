const express = require('express');
const router = express.Router();

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

module.exports = router;