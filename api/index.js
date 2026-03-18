module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  
  // 确认你在 Vercel 填的名字是 GEMINI_API_KEY
  const apiKey = process.env.GEMINI_API_KEY;
  
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const url = new URL(req.url, `${protocol}://${host}`);
  const topic = url.searchParams.get('topic') || "生活";

  // 【终极对齐】：v1beta 版本 + gemini-1.5-flash 模型
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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
    
    // 如果失败，会显示具体的 Google 错误信息
    if (result.error) {
      return res.status(200).send(`<h3>❌ Google 拒绝了请求</h3><p>原因：${result.error.message}</p>`);
    }

    const aiText = result.candidates[0].content.parts[0].text;

    res.status(200).send(`
      <div style="padding: 20px; font-family: sans-serif; max-width: 500px; margin: auto; border: 2px solid #000; border-radius: 15px; box-shadow: 8px 8px 0px #000;">
        <h2 style="background: #000; color: #fff; padding: 10px; display: inline-block; font-size: 1.2em;">Ka 的 AI 灵感站</h2>
        <p style="font-size: 1.3em; line-height: 1.6; font-weight: bold; color: #333; margin: 20px 0;">"${aiText}"</p>
        <div style="border-top: 1px solid #eee; padding-top: 10px;">
          <p style="color: #666;">当前话题：${topic}</p>
          <a href="/api/index?topic=觉醒" style="color: #0070f3; text-decoration: none; font-weight: bold;">[ 换个话题测试 ]</a>
        </div>
      </div>
    `);
  } catch (error) {
    res.status(500).send(`<h3>❌ 系统唤醒失败</h3><p>具体原因：${error.message}</p>`);
  }
};

