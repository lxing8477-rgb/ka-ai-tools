const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // 必须设置这个，网页才能正确显示中文
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  // 这里直接用你在 Vercel 填的那个“暗号”名字
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).send("<h3>❌ 找不到密钥</h3><p>请检查 Vercel 的 Environment Variables 是否设置了 GEMINI_API_KEY</p>");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 获取网页输入框传过来的话题
    let topic = "生活";
    if (req.method === 'POST' && req.body && req.body.topic) {
      topic = req.body.topic;
    }

    const prompt = `你是一个推文专家。请根据话题 "${topic}" 写一段有深度、精炼且有哲学感的 X (Twitter) 推文。`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 如果是 API 请求，返回 JSON
    if (req.method === 'POST') {
      return res.status(200).json({ text: text });
    }

    // 如果是直接打开网页，显示一段文字
    res.status(200).send(`<h2>✨ 生成成功：</h2><p>${text}</p>`);

  } catch (error) {
    res.status(500).send(`<h3>❌ AI 闹脾气了</h3><p>${error.message}</p>`);
  }
};

