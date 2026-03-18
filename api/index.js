module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const apiKey = process.env.GEMINI_API_KEY;
  
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const url = new URL(req.url, `${protocol}://${host}`);
  const topic = url.searchParams.get('topic') || "生活";

  // 【终极变动】：去掉 v1beta，直接用 v1 版本，模型名用最稳的 gemini-1.5-flash
  const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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
    
    // 增加一个详细报错检查，让我们一眼看出是哪里的问题
    if (result.error) {
      return res.status(200).send(`<h3>❌ Google 返回了错误</h3><p>代码：${result.error.code}</p><p>消息：${result.error.message}</p>`);
    }

    const aiText = result.candidates[0].content.parts[0].text;

    res.status(200).send(`
      <div style="padding: 20px; font-family: sans-serif; max-width: 500px; margin: auto; border: 2px solid #000; border-radius: 15px;">
        <h2 style="background: #000; color: #fff; padding: 10px; display: inline-block;">Ka 的灵感推文</h2>
        <p style="font-size: 1.3em; line-height: 1.5; font-weight: bold;">"${aiText}"</p>
        <hr>
        <p>话题：${topic}</p>
        <button onclick="window.location.reload()">再来一条</button>
      </div>
    `);
  } catch (error) {
    res.status(500).send(`<h3>❌ 彻底唤醒失败</h3><p>本地报错：${error.message}</p>`);
  }
};
