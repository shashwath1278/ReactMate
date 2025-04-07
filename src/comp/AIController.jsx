import React, { useEffect, useState } from 'react';
import { useStockfish } from './StockfishEngine';
import { handleMove } from '../hex';

const AIController = ({ isAITurn, color, difficulty = 'medium' }) => {
  const [thinking, setThinking] = useState(false);
  
  // Map difficulty settings to Stockfish depth
  const depthMap = {
    easy: 10,
    medium: 16,
    hard: 22
  };
  
  const { getBestMove } = useStockfish(depthMap[difficulty] || 16);

  useEffect(() => {
    if (isAITurn && !thinking) {
      const makeAIMove = async () => {
        setThinking(true);
        // Add a small delay to make it feel more natural
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
          const move = await getBestMove();
          if (move) {
            const { from, to, promotion } = move;
            handleMove(from, to, promotion || 'q'); // Default to queen if no promotion specified
          }
        } catch (err) {
          console.error("Error making AI move:", err);
        } finally {
          setThinking(false);
        }
      };
      
      makeAIMove();
    }
  }, [isAITurn, thinking, getBestMove]);

  return (
    <div className="ai-status">
      {thinking && isAITurn && <div className="thinking-indicator">AI is thinking...</div>}
    </div>
  );
};

export default AIController;
