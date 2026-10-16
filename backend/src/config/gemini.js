const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');

// Ensure env variables are loaded even if this file is imported first
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error('⚠️ GEMINI_API_KEY is not defined in .env file!');
}

const ai = new GoogleGenAI({
  vertexai: false,
  apiKey: process.env.GEMINI_API_KEY
});

module.exports = ai;