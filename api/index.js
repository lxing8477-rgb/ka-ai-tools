const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const apiKey = process.env.GEMINI_API_KEY || "AIzaSyATIRwyY4Lmk6C0O6Y-eXy6S9KbKuWxJdc";
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // 这里换成最稳定的模型名字
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const fullUrl = `${protocol}://${req.headers.host}${req.url}`;
    const { searchParams } = new URL(fullUrl);
    const topic = searchParams.get('topic') || "生活";

    const result = await model.generateContent(`写一段关于 ${topic} 的哲学感悟推文`);
    const response = await result.response;
    const text = response.text();

    res.status(200).send(`
      <div style="padding: 20px; font-family: sans-serif; line-height: 1.6;">
        <h2 style="color: #1a1a1a;">✨ 卡的 AI 灵感：</h2>
        <p style="font-size: 1.2em;">${text}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666;">话题：${topic} | 生成时间：${new Date().toLocaleString()}</p>
        <a href="/api/index?topic=哲学" style="color: #0070f3; text-decoration: none;">再来一条</a>
      </div>
    `);
  } catch (e) {
    res.status(500).send(`<h3>❌ AI 闹脾气了</h3><p>${e.message}</p>`);
  }
};


