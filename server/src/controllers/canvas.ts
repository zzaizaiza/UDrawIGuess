import { Request, Response } from 'express';
import OpenAI from 'openai';

// 初始化OpenAI客户端
// 验证环境变量
if (!process.env.OPENAI_API_KEY) {
  throw new Error('请在.env文件中设置OPENAI_API_KEY环境变量');
}

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "GrokAPIKEY",
  baseURL: process.env.OPENAI_BASE_URL || "https://api.x.ai/v1"
});

// 处理画布猜测的控制器函数
export async function handleCanvasGuess(req: Request, res: Response) {
  try {
    const { imageData } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: '未提供画布数据' });
    }

    // 验证图像数据格式
    if (!imageData.startsWith('data:image/')) {
      return res.status(400).json({ error: '无效的图像数据格式' });
    }

    // 调用OpenAI Vision API进行图像识别
    const response = await openai.chat.completions.create({
      model: "grok-2-vision-1212",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "这幅画画的是什么？请用English回答，并给出你的猜测理由。" },
            {
              type: "image_url",
              image_url: {
                url: imageData,
                "detail": "high",
              }
            }
          ]
        }
      ],
      max_tokens: 300
    });

    // 返回AI的猜测结果
    return res.json({
      guess: response.choices[0]?.message?.content || '无法识别图像'
    });

  } catch (error) {
    console.error('画布猜测处理错误:', error);
    return res.status(500).json({ error: '服务器处理请求时出错' });
  }
}