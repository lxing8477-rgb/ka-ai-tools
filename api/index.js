module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  
  // 1. 获取密钥
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(200).send("<h3>❌ 缺少钥匙</h3>");

  // 2. 获取话题
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const url = new URL(req.url, `${protocol}://${req.headers.host}`);
  const topic = url.searchParams.get('topic') || "生活";

  // 3. 【最关键的变动】：使用 v1 正式版 + flash 模型的全称
  // 这个地址是 Google 官方文档里最推荐的“正式通道”
  const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const requestData = {
    contents: [{ 
      parts: [{ text: `你是一个哲学博主。请根据话题“${topic}”写一段深刻、精炼的推文，带一点尼采或休谟的风格。` }] 
    }]
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();

    // 4. 如果还是拒绝，显示最详细的信息
    if (result.error) {
      return res.status(200).send(`
        <div style="padding:20px; border:2px solid red;">
          <h3>❌ Google 依然拒绝：</h3>
          <p>错误码：${result.error.code}</p>
          <p>原因：${result.error.message}</p>
          <p>💡 建议：如果显示 API_KEY_INVALID，请去 Vercel 检查密钥是否带了空格或引号。</p>
        </div>
      `);
    }

    const aiText = result.candidates[0].content.parts[0].text;

    // 5. 成功后的大气显示
    res.status(200).send(`
      <div style="padding:30px; font-family:sans-serif; max-width:500px; margin:50px auto; border:3px solid #000; border-radius:20px; box-shadow: 10px 10px 0px #000;">
        <h2 style="margin-top:0; border-bottom: 2px solid #000; padding-bottom: 10px;">✨ Ka 的 AI 灵感站</h2>
        <p style="font-size:1.4em; line-height:1.6; color:#222; font-weight: 500;">"${aiText}"</p>
        <div style="margin-top:20px; color:#666; font-style: italic;"># ${topic}</div>
        <hr>
        <button onclick="window.location.reload()" style="padding:12px 25px; background:#000; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">再换一个灵感</button>
      </div>
    `);
  } catch (err) {
    res.status(500).send(`<h3>❌ 本地连接失败</h3><p>${err.message}</p>`);
  }
};


