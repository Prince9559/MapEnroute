const express = require('express');
const router = express.Router();

router.post('/ai-analyze', async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log('Incoming AI Prompt:', prompt);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('ERROR: GEMINI_API_KEY backend .env me nahi mili!');
      return res.status(500).json({ 
        success: false, 
        message: 'GEMINI_API_KEY not found in backend .env' 
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const googleRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are MapEnroute AI Travel Assistant. The user is asking about travel/routes in India. 
Question: "${prompt}"

Provide a direct, practical response covering:
- Specific actual cafes/dhabas/eateries on this route
- Highway name / route condition
- Petrol / EV advice

Format cleanly with concise bullet points. Avoid robotic introductory phrases.`
              }
            ]
          }
        ]
      })
    });

    const data = await googleRes.json();

    if (data.error) {
      console.error('Google Gemini API Error:', data.error);
      return res.status(500).json({ success: false, message: data.error.message });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('Gemini generated reply successfully!');

    return res.json({
      success: true,
      reply: reply || 'Could not generate advice for this route.'
    });

  } catch (err) {
    console.error('Backend catch error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;