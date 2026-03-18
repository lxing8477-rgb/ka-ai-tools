const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  
  // 这里的暗号要对齐 Vercel 里的名字
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).send("❌ 环境变量 GEMINI_API_KEY 没找到");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // 关键改动：换成这个最新的稳定名字
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // 获取话题参数
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const url = new URL(req.url, `${protocol}://${host}`);
    const topic = url.searchParams.get('topic') || "生活";

    const prompt = `你是一个推文专家。请根据话题 "${topic}" 写一段有深度、有哲学感的推文，要求语言精炼。`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).send(`
      <div style="padding: 20px; font-family: sans-serif;">
        <h2>✨ AI 为你生成的推文：</h2>
        <p style="font-size: 1.2em; color: #333;">${text}</p>
        <hr>
        <p>输入的话题：${topic}</p>
        <a href="/api/index?topic=尼采">换个话题试试</a>
      </div>
    `);
  } catch (error) {
    res.status(500).send(`<h3>❌ AI 闹脾气了</h3><p>${error.message}</p>`);
  }
};



