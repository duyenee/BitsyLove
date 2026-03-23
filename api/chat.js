export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ reply: "Missing GEMINI_API_KEY on Vercel." });
  }

  try {
    // FIX: Đảm bảo có "models/" trong URL
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `System: You are Bitsy, a smart AI Agent for Sahara AI. Assist Henry with Web3. Keep responses concise and in English. User: ${message}`
          }]
        }]
      }),
    });

    const data = await response.json();

    if (data.error) {
      // Hiển thị lỗi chi tiết để Henry dễ kiểm tra
      return res.status(500).json({ reply: "Google Error: " + data.error.message });
    }

    const reply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: reply });

  } catch (error) {
    res.status(500).json({ reply: "Connection Error. Please check Vercel logs." });
  }
}
