module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(200).send("<h3>❌ 诊断结果：未检测到钥匙</h3><p>请在 Vercel 设置中添加 GEMINI_API_KEY。</p>");
  }

  const topic = "哲学"; 
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const data = {
    contents: [{ parts: [{ text: `写一段关于${topic}的推文` }] }]
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (result.error) {
      // 这里的详细信息会告诉我们 Google 拒绝的真相
      return res.status(200).send(`
        <div style="padding: 20px; border: 2px solid red;">
          <h3>❌ Google 拒绝详情：</h3>
          <p><b>错误类型：</b> ${result.error.status}</p>
          <p><b>具体原因：</b> ${result.error.message}</p>
          <p>💡 如果显示 'API_KEY_INVALID'，请重新检查你的密钥。</p>
          <p>💡 如果显示 'User location is not supported'，说明需要换个代理或模型。</p>
        </div>
      `);
    }

    const aiText = result.candidates[0].content.parts[0].text;
    res.status(200).send(`<h2>✨ 终于成功了！</h2><p>${aiText}</p>`);

  } catch (error) {
    res.status(500).send(`<h3>❌ 本地网络故障</h3><p>${error.message}</p>`);
  }
};

