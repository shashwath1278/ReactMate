import { useEffect, useState } from 'react';
import './App.css';
import Chessboard from './comp/Chessboard';
import { gust, repGame } from './hex';
import { resetGame } from './hex';
import AIController from './comp/AIController';
import EvaluationInfo from './comp/EvaluationInfo';

function App({ initialMode = "offline", hideControls = false }) {
  const [board, setBoard] = useState([]);  
  const [flip, setFlip] = useState(false); 
  const [autoFlip, setAutoFlip] = useState(true); 
  const [promotionInProgress, setPromotionInProgress] = useState(false); 
  const [isAIEnabled, setIsAIEnabled] = useState(initialMode === "ai");
  const [isAITurn, setIsAITurn] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');

  useEffect(() => {
    // Set AI mode based on initialMode
    if (initialMode === 'ai') {
      setIsAIEnabled(true);
    } else {
      setIsAIEnabled(false);
    }
    
    // Parse URL parameters to set initial game mode
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode');
    
    if (modeParam === 'ai') {
      setIsAIEnabled(true);
    } else if (modeParam === 'online') {
      // Initialize online mode logic if applicable
      setIsAIEnabled(false);
    } else if (modeParam === 'offline') {
      setIsAIEnabled(false);
    }
  }, [initialMode]);

  useEffect(() => {
    repGame(); 
    const sub = gust.subscribe((gameState) => {
      setBoard(gameState.board); 

      // Update AI turn based on current game state
      if (isAIEnabled) {
        setIsAITurn(gameState.turn === 'b');
      } else {
        setIsAITurn(false);
      }

      // Only auto-flip if autoFlip is enabled and no promotion is happening
      if (autoFlip && !promotionInProgress) {
        const shouldFlip = gameState.turn === 'b'; 
        setFlip(shouldFlip); 
      }
    });

    return () => {
      sub.unsubscribe(); 
    };
  }, [autoFlip, promotionInProgress, isAIEnabled]);  

  const stopAutoFlip = () => {
    setPromotionInProgress(true);
  };

  const resumeAutoFlip = () => {
    setPromotionInProgress(false);
  };

  const toggleAI = () => {
    setIsAIEnabled(!isAIEnabled);
  };

  const changeDifficulty = () => {
    const levels = ['easy', 'medium', 'hard'];
    const currentIndex = levels.indexOf(difficulty);
    const nextIndex = (currentIndex + 1) % levels.length;
    setDifficulty(levels[nextIndex]);
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
        
        {/* AI Components */}
        {isAIEnabled && (
          <AIController isAITurn={isAITurn} color="b" difficulty={difficulty} />
        )}
        
        {isAIEnabled && (
          <div className="evaluation-container">
            <EvaluationInfo />
          </div>
        )}
      
        {/* Only show buttons if hideControls is false */}
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
          <button className="ai-toggle-button" onClick={toggleAI}>
            {isAIEnabled ? 'Play 2 Players' : 'Play vs AI'}
          </button>
          {isAIEnabled && (
            <button className="difficulty-button" onClick={changeDifficulty}>
              Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
