module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  
  // 1. 获取钥匙（确保 Vercel 里名字对齐）
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(200).send("<h3>❌ 没找到钥匙</h3><p>请检查 Vercel 环境变量名是否为 GEMINI_API_KEY</p>");

  // 2. 获取话题
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const url = new URL(req.url, `${protocol}://${req.headers.host}`);
  const topic = url.searchParams.get('topic') || "生活";

  // 3. 【核心改动】使用最稳的 V1 正式版路径和模型名
  const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const requestData = {
    contents: [{ parts: [{ text: `请写一段关于“${topic}”的哲学感悟，适合发在 X (推特) 上，语言要精炼且有深度。` }] }]
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();

    // 4. 报错拦截
    if (result.error) {
      return res.status(200).send(`
        <div style="padding:20px; border:2px solid red; font-family:sans-serif;">
          <h3>❌ Google 拒绝了请求</h3>
          <p>错误代码：${result.error.code}</p>
          <p>具体消息：${result.error.message}</p>
          <hr>
          <p>💡 建议：如果显示 API_KEY_INVALID，请去 Vercel 重新贴一下 Key，确保没有空格。</p>
        </div>
      `);
    }

    const aiText = result.candidates[0].content.parts[0].text;

    // 5. 成功后的漂亮显示
    res.status(200).send(`
      <div style="padding:30px; font-family:sans-serif; max-width:500px; margin:auto; border:3px solid #000; border-radius:20px; box-shadow: 10px 10px 0px #000;">
        <h2 style="margin-top:0;">✨ Ka 的 AI 灵感</h2>
        <p style="font-size:1.4em; line-height:1.5; color:#222;">"${aiText}"</p>
        <div style="margin-top:20px; color:#666;">话题：${topic}</div>
        <button onclick="window.location.reload()" style="margin-top:15px; padding:10px 20px; background:#000; color:#fff; border:none; border-radius:5px; cursor:pointer;">再来一条</button>
      </div>
    `);
  } catch (err) {
    res.status(500).send(`<h3>❌ 彻底唤醒失败</h3><p>${err.message}</p>`);
  }
};


