module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  
  // 这里的钥匙名字必须和你 Vercel 填的一致
  const apiKey = process.env.GEMINI_API_KEY;
  
  // 获取话题
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const url = new URL(req.url, `${protocol}://${host}`);
  const topic = url.searchParams.get('topic') || "生活";

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const data = {
    contents: [{
      parts: [{ text: `你是一个推文专家。请根据话题 "${topic}" 写一段有深度、有哲学感的推文，要求语言精炼。` }]
    }]
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error.message);
    }

    const aiText = result.candidates[0].content.parts[0].text;

    res.status(200).send(`
      <div style="padding: 20px; font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #333; border-bottom: 2px solid #0070f3; padding-bottom: 10px;">✨ Ka 的 AI 灵感站</h2>
        <p style="font-size: 1.2em; color: #444; line-height: 1.6; background: #f9f9f9; padding: 15px; border-left: 5px solid #0070f3;">${aiText}</p>
        <p style="color: #888; font-size: 0.9em;">当前话题：${topic}</p>
        <a href="/api/index?topic=命运" style="display: inline-block; padding: 10px 20px; background: #0070f3; color: white; text-decoration: none; border-radius: 5px;">换个话题试试</a>
      </div>
    `);
  } catch (error) {
    res.status(500).send(`<h3>❌ 唤醒失败</h3><p>报错原因：${error.message}</p>`);
  }
};




