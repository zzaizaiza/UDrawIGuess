import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { router as canvasRouter } from './routes/canvas';

// 加载环境变量
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 中间件配置
app.use(express.json({ limit: '50mb' }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true
}));

// 路由配置
app.use('/api/canvas', canvasRouter);

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});