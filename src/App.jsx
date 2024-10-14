import { useEffect, useState } from 'react';
import './App.css';
import Chessboard from './comp/Chessboard';
import { gust, repGame } from './hex';
import { resetGame } from './hex';

function App() {
  const [board, setBoard] = useState([]);  
  const [flip, setFlip] = useState(false); 

  useEffect(() => {
    repGame(); 
    const sub = gust.subscribe((gameState) => {
      setBoard(gameState.board); 
      setFlip(gameState.turn === 'b'); 
      
    });

    return () => {
      sub.unsubscribe(); 
    };
  }, []);


  return (
    <div className="App">
      <div className='new'>
        <Chessboard board={board} flip={flip} />
      
      <div className='button-container'>
        <button className="reset-button" onClick={resetGame}>
          Reset Game
        </button>
        <button className="flip-button" onClick={() => setFlip(prevFlip => !prevFlip)}>
          Flip Board
        </button>
      </div>
    </div>
    </div>
  );
}

export default App;