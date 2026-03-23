export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ reply: "Configuration Error: GEMINI_API_KEY is missing on Vercel." });
  }

  try {
    // Using stable v1 API and standard gemini-1.5-flash model
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `System: You are Bitsy, a smart AI Agent for Sahara AI. Your tone is professional, witty, and helpful. You are assisting Henry with Web3 and AI infrastructure. Keep responses concise and always in English.
            
            User message: ${message}`
          }]
        }]
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ reply: `Google Error: ${data.error.message}` });
    }

    if (data.candidates && data.candidates[0].content) {
      const reply = data.candidates[0].content.parts[0].text;
      res.status(200).json({ reply: reply });
    } else {
      res.status(500).json({ reply: "Error: AI failed to generate a response." });
    }
  } catch (error) {
    res.status(500).json({ reply: "Connection Error: Failed to reach Google AI services." });
  }
}
