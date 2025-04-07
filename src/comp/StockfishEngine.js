import { useEffect, useRef, useState } from 'react';
import { gust, getFEN } from '../hex';

export const useStockfish = (depth = 18) => {
  const stockfish = useRef(null);
  const gameState = useRef(gust.getValue());
  const [evaluation, setEvaluation] = useState(null);

  useEffect(() => {
    // Initialize Web Worker
    stockfish.current = new Worker('/stockfish.js');
    
    // Set up UCI protocol
    stockfish.current.postMessage('uci');
    stockfish.current.postMessage('isready');
    stockfish.current.postMessage('ucinewgame');
    
    // Set up message handler for evaluation info
    stockfish.current.onmessage = (e) => {
      const message = e.data;
      
      // Parse evaluation data
      const evalInfo = parseEvaluation(message);
      if (evalInfo) {
        setEvaluation(evalInfo);
      }
      
      // Handle best move responses in getBestMove's promise handler
    };

    // Subscribe to game state changes
    const subscription = gust.subscribe(state => {
      gameState.current = state;
    });

    return () => {
      if (stockfish.current) {
        stockfish.current.terminate();
      }
      subscription.unsubscribe();
    };
  }, []);

  const getBestMove = () => {
    return new Promise((resolve) => {
      const fen = getFEN(); // Use the getFEN function directly from hex.js
      
      stockfish.current.postMessage(`position fen ${fen}`);
      stockfish.current.postMessage(`go depth ${depth}`);

      const messageHandler = (e) => {
        if (e.data.startsWith('bestmove')) {
          const bestMove = e.data.split(' ')[1];
          stockfish.current.removeEventListener('message', messageHandler);
          resolve(parseStockfishMove(bestMove));
        }
      };

      stockfish.current.addEventListener('message', messageHandler);
    });
  };

  const parseStockfishMove = (move) => {
    if (!move || move === '(none)') {
      return null;
    }
    const from = move.substring(0, 2);
    const to = move.substring(2, 4);
    const promotion = move.length > 4 ? move[4] : null;
    return { from, to, promotion };
  };

  return { getBestMove, evaluation };
};

const parseEvaluation = (message) => {
  if (message.startsWith('info depth')) {
    const parts = message.split(' ');
    const scoreIndex = parts.indexOf('score');
    if (scoreIndex > -1) {
      const type = parts[scoreIndex + 1];
      const value = parts[scoreIndex + 2];
      
      if (type === 'cp') {
        const score = parseFloat(value) / 100;
        return `Evaluation: ${score > 0 ? '+' : ''}${score.toFixed(2)} pawns`;
      } else if (type === 'mate') {
        return `Mate in ${Math.abs(parseInt(value))}`;
      }
    }
  }
  return null;
};

export default useStockfish;
