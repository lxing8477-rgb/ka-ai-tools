const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const genAI = new GoogleGenerativeAI("AIzaSyATIRwyY4Lmk6CO06Y-eXy6S9KbKuWxJdc");
  
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const url = new URL(req.url, `${protocol}://${host}`);
  const topic = url.searchParams.get('topic');

  let html = `
    <div style="text-align:center; padding: 30px; font-family: sans-serif; max-width: 500px; margin: auto; margin-top: 50px; background: #fff; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        <h2 style="color: #1a1a1a;">🤖 Ka 的 AI 爆款推文站</h2>
        <p style="color: #666; font-size: 14px;">寻找有缘人，一键生成 X 灵感</p>
        <form action="/api/index" method="GET" style="margin-top: 20px;">
            <input name="topic" type="text" placeholder="输入话题..." required style="width:100%; padding:15px; border:1px solid #eee; border-radius:10px; margin-bottom:15px; outline:none; box-sizing: border-box;">
            <button type="submit" style="width:100%; padding:15px; background: #000; color:white; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">生成推文</button>
        </form>
  `;

  if (topic) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent("针对话题" + topic + "写3条爆款X推文");
      const response = await result.response;
      const text = response.text().replace(/\n/g, '<br>');
      html += `<div style="margin-top:20px; padding:20px; background:#f0f7ff; border-radius:12px; text-align:left; font-size:15px; border:1px solid #cce5ff;">\${text}</div>`;
    } catch (e) {
      html += `<p style="color:red; margin-top:20px;">❌ AI 还在打瞌睡，请检查密钥</p>`;
    }
  }

  html += `<p style="margin-top:30px; color:#ccc; font-size:11px;">© 2026 Ka · 实战实验室</p></div>`;
  res.end(html);
};
