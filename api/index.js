module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const apiKey = process.env.GEMINI_API_KEY;
  
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const url = new URL(req.url, `${protocol}://${host}`);
  const topic = url.searchParams.get('topic') || "生活";

  // 关键微调：这里加上了 -latest
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  const data = {
    contents: [{
      parts: [{ text: `你是一个推文专家。请根据话题 "${topic}" 写一段有深度、有哲学感的推文。` }]
    }]
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.error) throw new Error(result.error.message);

    const aiText = result.candidates[0].content.parts[0].text;

    res.status(200).send(`
      <div style="padding: 20px; font-family: sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #0070f3;">✨ Ka 的灵感生成器</h2>
        <p style="font-size: 1.2em; line-height: 1.6; background: #fdfdfd; padding: 15px; border-radius: 8px; color: #333;">${aiText}</p>
        <p style="color: #999; font-size: 0.8em;">话题：${topic}</p>
        <a href="/api/index?topic=命运" style="color: #0070f3; text-decoration: none; font-weight: bold;">[ 换个话题 ]</a>
      </div>
    `);
  } catch (error) {
    res.status(500).send(`<h3>❌ 唤醒失败</h3><p>具体原因：${error.message}</p>`);
  }
};
