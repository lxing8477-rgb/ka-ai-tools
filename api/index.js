module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const apiKey = process.env.GEMINI_API_KEY;
  
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const url = new URL(req.url, `${protocol}://${req.headers.host}`);
  const topic = url.searchParams.get('topic') || "哲学";

  // 【通关方案】：直接使用 v1 版本的 gemini-pro，这是最稳定的老牌型号
  const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `请以深刻的哲学视角，写一段关于“${topic}”的推文，100字以内。` }] }]
      })
    });

    const result = await response.json();

    if (result.error) {
      // 如果 gemini-pro 也不行，尝试强制降级到 gemini-1.0-pro
      return res.status(200).send(`
        <div style="padding:20px; border:2px solid orange;">
          <h3>⚠️ Google 仍在调整路径</h3>
          <p>错误：${result.error.message}</p>
          <p>💡 建议：请确保你的 API Key 是在 <a href="https://aistudio.google.com/">Google AI Studio</a> 刚创建的。</p>
        </div>
      `);
    }

    const aiText = result.candidates[0].content.parts[0].text;

    res.status(200).send(`
      <div style="padding:40px; font-family:sans-serif; max-width:500px; margin:auto; border:4px solid #000; background:#fff;">
        <h2 style="text-transform:uppercase; letter-spacing:2px; border-bottom:4px solid #000; padding-bottom:10px;">Ka's AI Station</h2>
        <p style="font-size:1.5em; line-height:1.4; font-weight:900; margin:30px 0;">"${aiText}"</p>
        <div style="background:#000; color:#fff; padding:10px; font-size:0.8em;">TOPIC: ${topic}</div>
        <br>
        <button onclick="window.location.reload()" style="width:100%; padding:15px; background:#000; color:#fff; border:none; cursor:pointer; font-weight:bold;">GET NEXT INSIGHT</button>
      </div>
    `);
  } catch (err) {
    res.status(500).send(`<h3>❌ 彻底断流</h3><p>${err.message}</p>`);
  }
};



