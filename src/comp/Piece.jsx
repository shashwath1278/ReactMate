import React from 'react';
import { useDrag, DragPreviewImage } from 'react-dnd';

const Piece = ({ piece: { type, color }, position, isAIGame, aiColor }) => {
  // Check if the piece belongs to the AI
  const isAIPiece = isAIGame && color === aiColor;

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'piece',
    item: { id: `${position}_${type}_${color}` },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    // Disable dragging for AI pieces
    canDrag: () => !isAIPiece
  });

  // Make sure the image is properly loaded
  const pieceImage = require(`../assets/images/${type}_${color}.png`);
  
  // Prepare inline styles for AI pieces
  const pieceContainerStyle = {
    opacity: isDragging ? 0 : 1,
    cursor: isAIPiece ? 'not-allowed' : 'grab',
    position: 'relative'
  };
  
  return (
    <>
      {!isAIPiece && <DragPreviewImage connect={preview} src={pieceImage} />}
      <div
        className='piece-container'
        ref={!isAIPiece ? drag : null}
        style={pieceContainerStyle}
      >
        <img 
          className='piece' 
          src={pieceImage} 
          alt={`${type}_${color}`} 
          style={isAIPiece ? { filter: 'brightness(0.9)' } : {}}
        />
      </div>
    </>
  );
};

export default Piece;
