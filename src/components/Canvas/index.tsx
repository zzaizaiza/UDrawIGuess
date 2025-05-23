import React from 'react';
import axios from 'axios';

interface CanvasProps {
  width?: number;
  height?: number;
}

const hasDrawnContent = (imageData: ImageData): boolean => {
  const data = imageData.data;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] !== 0) return true;
  }
  return false;
};

const Canvas: React.FC<CanvasProps> = ({ width = 600, height = 400 }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [context, setContext] = React.useState<CanvasRenderingContext2D | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        setContext(ctx);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent) => {
    const { offsetX, offsetY } = e.nativeEvent;
    if (context) {
      context.beginPath();
      context.moveTo(offsetX, offsetY);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !context) return;
    const { offsetX, offsetY } = e.nativeEvent;
    context.lineTo(offsetX, offsetY);
    context.stroke();
  };

  const stopDrawing = () => {
    if (context) {
      context.closePath();
      setIsDrawing(false);
    }
  };

  const clearCanvas = () => {
    if (context && canvasRef.current) {
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const [isLoading, setIsLoading] = React.useState(false);
  const [aiGuess, setAiGuess] = React.useState('');

  const handleAiGuess = async () => {
    if (!canvasRef.current) {
      console.error('Canvas引用不存在');
      setAiGuess('画布初始化失败');
      return;
    }
    
    try {
      setIsLoading(true);
      setAiGuess('');
      
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) {
        console.error('无法获取画布上下文');
        setAiGuess('画布上下文获取失败');
        return;
      }

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasRef.current.width;
      tempCanvas.height = canvasRef.current.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) {
        console.error('无法创建临时画布上下文');
        setAiGuess('图像处理失败');
        return;
      }

      tempCtx.fillStyle = '#fff';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.drawImage(canvasRef.current, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);

      if (!hasDrawnContent(imageData)) {
        console.log('画布为空');
        setAiGuess('请先在画布上画些内容');
        return;
      }
      
      const base64Image = tempCanvas.toDataURL('image/png', 1.0);
      
      if (!base64Image || base64Image === 'data:,' || base64Image.length < 100) {
        console.error('无效的base64图像数据:', base64Image.substring(0, 100) + '...');
        setAiGuess('无法获取有效的画布数据');
        return;
      }
      
      const response = await axios.post('http://localhost:3000/api/canvas/guess', {
        imageData: base64Image
      });
      
      setAiGuess(response.data.guess);
    } catch (error) {
      console.error('AI猜测出错:', error);
      if (axios.isAxiosError(error)) {
        setAiGuess(`请求失败: ${error.message}`);
      } else {
        setAiGuess('抱歉，AI猜测出现错误');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
      />
      <div className="button-group">
        <button onClick={clearCanvas} className="clear-button">
          清空画布
        </button>
        <button 
          onClick={handleAiGuess} 
          className="guess-button"
          disabled={isLoading}
        >
          {isLoading ? '正在思考...' : '让AI猜测'}
        </button>
      </div>
      {aiGuess && (
        <div className="guess-result">
          <h3>AI的猜测：</h3>
          <p>{aiGuess}</p>
        </div>
      )}
    </div>
  );
};

export default Canvas;