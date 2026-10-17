const express = require('express');
const router = express.Router();

router.post('/ai-analyze', async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log('Incoming AI Prompt:', prompt);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'GEMINI_API_KEY not found in backend .env',
      });
    }

    // List of model candidates in order of priority
    const modelCandidates = [
      'gemini-2.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro',
      'gemini-pro',
    ];

    let reply = null;
    let lastError = null;

    const requestPayload = {
      contents: [
        {
          parts: [
            {
              text: `You are MapEnroute AI Travel Assistant. The user is asking about travel/routes in India:
"${prompt}"

Provide authentic, specific guidance for this exact route covering:
- Specific cafes, dhabas, or restaurants along this route
- Highway name / route road conditions
- Fuel pumps and EV charging points

Keep it clear, structured with bullet points, and practical for drivers.`,
            },
          ],
        },
      ],
    };

    // Try candidates until one succeeds
    for (const model of modelCandidates) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const googleRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload),
        });

        const data = await googleRes.json();

        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          reply = data.candidates[0].content.parts[0].text;
          console.log(`Gemini response generated successfully using model: ${model}`);
          break;
        } else if (data.error) {
          lastError = data.error.message;
          console.warn(`Model ${model} failed: ${data.error.message}`);
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    if (!reply) {
      return res.status(500).json({
        success: false,
        message: lastError || 'Failed to generate response with available Gemini models',
      });
    }

    return res.json({
      success: true,
      reply,
    });
  } catch (err) {
    console.error('Server AI Route Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;