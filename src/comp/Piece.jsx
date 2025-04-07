import React from 'react';
import { useDrag, DragPreviewImage } from 'react-dnd';

const Piece = ({ piece: { type, color }, position }) => {
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'piece',
    item: { id: `${position}_${type}_${color}` },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Make sure the image is properly loaded
  const pieceImage = require(`../assets/images/${type}_${color}.png`);
  
  return (
    <>
      <DragPreviewImage connect={preview} src={pieceImage} />
      <div
        className='piece-container'
        ref={drag}
        style={{ opacity: isDragging ? 0 : 1 }}
      >
        <img 
          className='piece' 
          src={pieceImage} 
          alt={`${type}_${color}`} 
        />
      </div>
    </>
  );
};

export default Piece;
