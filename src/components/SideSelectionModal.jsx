import React from 'react';
import '../styles/SideSelectionModal.css';

const SideSelectionModal = ({ isOpen, onClose, onSelectSide }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Choose Your Side</h2>
        <div className="side-options">
          <button 
            className="side-option white" 
            onClick={() => onSelectSide('white')}
          >
            <span className="piece-icon">♔</span>
            <span>Play as White</span>
          </button>
          <button 
            className="side-option black" 
            onClick={() => onSelectSide('black')}
          >
            <span className="piece-icon">♚</span>
            <span>Play as Black</span>
          </button>
        </div>
        <button className="cancel-button" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default SideSelectionModal;
