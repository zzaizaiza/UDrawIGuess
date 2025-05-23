import React from 'react';
import Canvas from '../../components/Canvas';
import './style.css';

const Home: React.FC = () => {
  const [aiGuess, setAiGuess] = React.useState<string>('');

  return (
    <div className="home-container">
      <h1 className="title">AI 你画我猜</h1>
      <div className="content">
        <div className="canvas-section">
          <h2>画板</h2>
          <Canvas />
        </div>
        <div className="result-section">
          <h2>AI 猜测结果</h2>
          <div className="result-box">
            {aiGuess ? (
              <p>{aiGuess}</p>
            ) : (
              <p className="placeholder">AI正在等待您的创作...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;