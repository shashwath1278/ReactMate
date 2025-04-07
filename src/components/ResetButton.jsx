import React from 'react';
import { resetGame } from '../hex';

const ResetButton = ({ className }) => {
  return (
    <button 
      className={className || "reset-button"}
      onClick={resetGame}
    >
      Reset Game
    </button>
  );
};

export default ResetButton;
