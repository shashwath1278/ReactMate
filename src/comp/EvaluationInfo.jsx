import React, { useEffect, useState } from 'react';
import { gust } from '../hex';

const EvaluationInfo = ({ setEvaluation }) => {
  // Add local state to display the evaluation
  const [localEvaluation, setLocalEvaluation] = useState(0);

  useEffect(() => {
    const subscription = gust.subscribe(gameState => {
      if (gameState && gameState.board) {
        try {
          // Calculate material advantage
          let whiteMaterial = 0;
          let blackMaterial = 0;
          
          const pieceValues = {
            'p': 1,   // pawn
            'n': 3,   // knight
            'b': 3,   // bishop
            'r': 5,   // rook
            'q': 9,   // queen
            'k': 0    // king (not counted in material)
          };
          
          gameState.board.flat().forEach(piece => {
            if (!piece) return;
            
            const value = pieceValues[piece.type.toLowerCase()] || 0;
            if (piece.color === 'w') {
              whiteMaterial += value;
            } else {
              blackMaterial += value;
            }
          });
          
          const advantage = whiteMaterial - blackMaterial;
          
          // Update both the local state and parent component state
          setLocalEvaluation(advantage);
          if (setEvaluation) {
            setEvaluation(advantage);
          }
          
        } catch (error) {
          console.error("Evaluation error:", error);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [setEvaluation]);

  return (
    <div>
      Evaluation: {localEvaluation > 0 ? `+${localEvaluation}` : localEvaluation}
    </div>
  );
};

export default EvaluationInfo;
