import express from 'express';
import { handleCanvasGuess } from '../controllers/canvas';

const router = express.Router();

// 处理画布猜测请求
router.post('/guess', handleCanvasGuess);

export { router };