import { useEffect, useState } from 'react';
import './App.css';
import Chessboard from './comp/Chessboard';
import { gust, repGame } from './hex';
import { resetGame } from './hex';

function App() {
  const [board, setBoard] = useState([]);  
  const [flip, setFlip] = useState(false); 
  const [autoFlip, setAutoFlip] = useState(true); 
  const [promotionInProgress, setPromotionInProgress] = useState(false); // Track promotion state

  useEffect(() => {
    repGame(); 
    const sub = gust.subscribe((gameState) => {
      setBoard(gameState.board); 

      // Only auto-flip if autoFlip is enabled and no promotion is happening
      if (autoFlip && !promotionInProgress) {
        const shouldFlip = gameState.turn === 'b'; 
        setFlip(shouldFlip); 
      }
    });

    return () => {
      sub.unsubscribe(); 
    };
  }, [autoFlip, promotionInProgress]);  

  const stopAutoFlip = () => {
    setPromotionInProgress(true); // Set promotion state to true
  };

  const resumeAutoFlip = () => {
    setPromotionInProgress(false); // Set promotion state to false
  };

  return (
    <div className="App">
      <div className='new'>
        <Chessboard 
          board={board} 
          flip={flip} 
          onPromotionStart={stopAutoFlip} 
          onPromotionEnd={resumeAutoFlip}  
        />
      
        <div className='button-container'>
          <button className="reset-button" onClick={resetGame}>
            Reset Game
          </button>
          <button className="flip-button" onClick={() => setFlip(prevFlip => !prevFlip)}>
            Flip Board
          </button>
          <button className="auto-flip-button" onClick={() => setAutoFlip(prev => !prev)}>
            {autoFlip ? 'Disable Auto Flip' : 'Enable Auto Flip'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
