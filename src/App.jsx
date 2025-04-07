import React, { useEffect, useState } from 'react';
import './App.css';
import Chessboard from './comp/Chessboard';
import { gust, repGame, resetGame } from './hex';
import AIController from './comp/AIController';
import EvaluationInfo from './comp/EvaluationInfo';

function App({ initialMode = "offline", hideControls = false }) {
  const [board, setBoard] = useState([]);  
  const [flip, setFlip] = useState(false); 
  const [autoFlip, setAutoFlip] = useState(true); 
  const [previousAutoFlip, setPreviousAutoFlip] = useState(true); // Store previous auto-flip state
  const [promotionInProgress, setPromotionInProgress] = useState(false); 
  const [isAIEnabled, setIsAIEnabled] = useState(initialMode === "ai");
  const [isAITurn, setIsAITurn] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [evaluation, setEvaluation] = useState(0); // 0 means equal, positive for white advantage
  const [isGameInProgress, setIsGameInProgress] = useState(false); // Track if a game is in progress

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

      // Check if game has started (any moves made)
      if (gameState.history && gameState.history.length > 1) {
        setIsGameInProgress(true);
      } else {
        setIsGameInProgress(false);
      }

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

  const createRipple = (event) => {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.className = 'button-ripple';
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  const toggleAI = () => {
    // Only show confirmation if a game is in progress
    if (isGameInProgress) {
      const confirmed = window.confirm("Are you sure you want to switch game modes? Your current game will be reset.");
      if (!confirmed) {
        return; // Cancel if user doesn't confirm
      }
    }
    
    // Reset the game when toggling AI mode
    resetGame();
    
    const newAIState = !isAIEnabled;
    setIsAIEnabled(newAIState);
    
    if (newAIState) {
      // Store current auto-flip state and turn it off when AI is enabled
      setPreviousAutoFlip(autoFlip);
      setAutoFlip(false);
    } else {
      // Restore previous auto-flip state when AI is disabled
      setAutoFlip(previousAutoFlip);
    }
  };

  const handleResetGame = () => {
    // Only show confirmation if a game is in progress
    if (isGameInProgress) {
      const confirmed = window.confirm("Are you sure you want to reset the game?");
      if (!confirmed) {
        return; // Cancel if user doesn't confirm
      }
    }
    
    resetGame();
  };

  const changeDifficulty = () => {
    const levels = ['easy', 'medium', 'hard'];
    const currentIndex = levels.indexOf(difficulty);
    const nextIndex = (currentIndex + 1) % levels.length;
    setDifficulty(levels[nextIndex]);
  };

  // Calculate evaluation bar height based on advantage
  const getEvaluationBarStyle = () => {
    // Clamp evaluation between -10 and 10 for display purposes
    const clampedEval = Math.min(Math.max(evaluation, -10), 10);
    // Convert to a percentage (0% = black winning completely, 100% = white winning completely)
    const heightPercentage = ((clampedEval + 10) / 20) * 100;
    return {
      height: `${heightPercentage}%`,
    };
  };

  return (
    <div className="App">
      <div className='new'>
        <div className="chess-container">
          {/* Side panel with AI info and eval bar */}
          {isAIEnabled && (
            <div className="side-panel">
              <div className="thinking-indicator">
                {isAITurn ? (
                  <>
                    <span className="hourglass"></span>
                    AI is thinking...
                  </>
                ) : (
                  "Your turn"
                )}
              </div>
              
              <div className="side-panel-evaluation-container">
                <div className="evaluation-bubble">
                  <EvaluationInfo setEvaluation={setEvaluation} />
                </div>
              </div>
              
              <div className="evaluation-bar-container">
                <div 
                  className={`evaluation-bar ${evaluation >= 0 ? 'eval-white' : 'eval-black'}`}
                  style={getEvaluationBarStyle()}
                ></div>
              </div>
              
              {/* Difficulty button moved to side panel */}
              <button className="difficulty-button" onClick={(e) => {createRipple(e); changeDifficulty();}}>
                Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </button>
            </div>
          )}
          
          {/* Chess board in its own container */}
          <div className={`board-container ${!isAIEnabled ? 'board-only' : ''}`}>
            <Chessboard 
              board={board} 
              flip={flip} 
              onPromotionStart={stopAutoFlip} 
              onPromotionEnd={resumeAutoFlip}  
            />
          </div>
          
          {/* Hidden AI engine controller */}
          {isAIEnabled && (
            <div style={{display: 'none'}}>
              <AIController isAITurn={isAITurn} color="b" difficulty={difficulty} />
            </div>
          )}
        </div>
        
        {/* Buttons in a separate container */}
        <div className="controls-container">
          <div className='button-container'>
            <button className="reset-button" onClick={(e) => {createRipple(e); handleResetGame();}}>
              Reset Game
            </button>
            <button className="flip-button" onClick={(e) => {createRipple(e); setFlip(prevFlip => !prevFlip);}}>
              Flip Board
            </button>
            <button className="auto-flip-button" onClick={(e) => {createRipple(e); setAutoFlip(prev => !prev);}} disabled={isAIEnabled}>
              {autoFlip ? 'Disable Auto Flip' : 'Enable Auto Flip'}
            </button>
            <button className="ai-toggle-button" onClick={(e) => {createRipple(e); toggleAI();}}>
              {isAIEnabled ? 'Play 2 Players' : 'Play vs AI'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
