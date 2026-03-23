export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ reply: "Configuration Error: GEMINI_API_KEY is missing on Vercel." });
  }

  try {
    // UPGRADED: Switched to gemini-1.5-pro for better reasoning and technical analysis
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `System Persona: You are Siggy, the smart and witty cat mascot AI Agent for Sahara AI. 
            Expertise: You are an expert in Web3, DeSci, and AI infrastructure. You assist Henry with project drafts and complex technical analysis (TA).
            Style: Professional yet feline-witty. Use concise English. Occasional cat emojis 🐾 are welcome.
            Current Task: ${message}`
          }]
        }]
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ reply: `Google Pro Error: ${data.error.message}` });
    }

    if (data.candidates && data.candidates[0].content) {
      const reply = data.candidates[0].content.parts[0].text;
      res.status(200).json({ reply: reply });
    } else {
      res.status(500).json({ reply: "Siggy is thinking too hard... Please try again." });
    }
  } catch (error) {
    res.status(500).json({ reply: "Connection Error: Siggy couldn't reach the Sahara network." });
  }
}
