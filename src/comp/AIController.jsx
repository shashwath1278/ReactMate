import React, { useEffect, useState } from 'react';
import { useStockfish } from './StockfishEngine';
import { handleMove, getFEN } from '../hex';
import { makeCustomAIMove } from '../utils/CustomAI';
import { Chess } from 'chess.js';

const AIController = ({ isAITurn, color, difficulty = 'easy' }) => {
  const [thinking, setThinking] = useState(false);
  
  // Set depth based on difficulty
  const getDepthForDifficulty = (diff) => {
    switch(diff) {
      case 'easy': return 1;
      case 'medium': return 5;  // Medium will use lower depth Stockfish
      case 'hard': return 10;   // Hard uses full depth
      default: return 5;
    }
  };
  
  const depthValue = getDepthForDifficulty(difficulty);
  
  const { getBestMove, calculateMoveWithDepth } = useStockfish(depthValue);

  useEffect(() => {
    if (isAITurn && !thinking) {
      const makeAIMove = async () => {
        setThinking(true);
        // Add a small delay to make it feel more natural
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
          // Use custom AI for easy and sometimes for medium difficulties
          if (difficulty === 'easy' || (difficulty === 'medium' && Math.random() < 0.35)) {
            // Create a new Chess instance with the current game state
            // This ensures we always have a valid chess instance
            const fen = getFEN();
            const chess = new Chess(fen);
            
            // Make sure we have a valid chess instance before proceeding
            if (chess) {
              const move = makeCustomAIMove(chess, difficulty);
              
              if (move) {
                handleMove(move.from, move.to, move.promotion);
                setThinking(false);
                return;
              }
            }
          }
          
          // For medium difficulty with Stockfish (65% chance)
          if (difficulty === 'medium') {
            // Use a lower depth for medium difficulty
            const move = await calculateMoveWithDepth(5);
            if (move) {
              const { from, to, promotion } = move;
              handleMove(from, to, promotion);
              setThinking(false);
              return;
            }
          }

          // For hard difficulty or fallback, use full-depth Stockfish
          const move = await getBestMove();
          if (move) {
            const { from, to, promotion } = move;
            handleMove(from, to, promotion);
          }
        } catch (error) {
          console.error("AI move error:", error);
        } finally {
          setThinking(false);
        }
      };
      
      makeAIMove();
    }
  }, [isAITurn, thinking, difficulty, getBestMove, calculateMoveWithDepth]);

  return null;
};

export default AIController;
