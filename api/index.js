module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  
  // 直接把钥匙焊死在代码里（这就是你刚才要的密钥）
  const apiKey = "AIzaSyATIRwyY4Lmk6C0O6Y-eXy6S9KbKuWxJdc";
  
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const url = new URL(req.url, `${protocol}://${req.headers.host}`);
  const topic = url.searchParams.get('topic') || "坚持";

  // 用最稳的 v1 正式版接口
  const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const requestData = {
    contents: [{ parts: [{ text: `请写一段关于“${topic}”的哲学推文。` }] }]
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();

    if (result.error) {
      return res.status(200).send(`<h3>❌ 依旧报错</h3><p>${result.error.message}</p>`);
    }

    const aiText = result.candidates[0].content.parts[0].text;

    res.status(200).send(`
      <div style="padding:40px; font-family:sans-serif; text-align:center;">
        <h1 style="color:#0070f3;">🎉 成了，卡！</h1>
        <p style="font-size:1.5em; line-height:1.6; border:2px solid #000; padding:20px; display:inline-block;">${aiText}</p>
        <br><br>
        <a href="/api/index?topic=哲学" style="text-decoration:none; color:#666;">[ 点击这里换个话题 ]</a>
      </div>
    `);
  } catch (err) {
    res.status(500).send(`<h3>❌ 网络连接失败</h3><p>${err.message}</p>`);
  }
};
