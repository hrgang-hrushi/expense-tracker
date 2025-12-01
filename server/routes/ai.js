import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, systems, facilities, crew, timestamp } = req.body;

    // Build contextual system prompt
    const context = `
You are an AI assistant for a space station monitoring system.
Use telemetry data and crew/facility info to give accurate, calm, and useful answers.

SYSTEMS DATA:
${JSON.stringify(systems, null, 2)}

FACILITIES:
${JSON.stringify(facilities, null, 2)}

CREW MEMBERS:
${JSON.stringify(crew, null, 2)}

User message: ${message.content}
Time: ${timestamp}
`;

    const result = await model.generateContent(context);
    const aiResponse = result.response.text();

    res.json({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      role: 'assistant',
      content: 'I encountered an error processing your request. Please try again later.',
      error: error.message
    });
  }
});

export default router;
