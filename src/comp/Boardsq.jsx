import React, { useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import Gridsq from './Gridsq';
import Piece from './Piece';
import { gust } from '../hex';
import { handleMove, validateMove } from '../hex';
import Promotion from './Promotion';

const Boardsq = ({ u, dark, position, onMove, onPromotionStart, onPromotionEnd }) => {
  const [promo, updatePromo] = useState(null);
  const [moveHighlight, setMoveHighlight] = useState(null);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'piece',
    canDrop: (item) => {
      const [fromPosition] = item.id.split('_');
      return true;
    },
    hover: (item) => {
      const [fromPosition] = item.id.split('_');
      const isValid = validateMove(fromPosition, position);
      setMoveHighlight(isValid ? 'valid' : 'invalid');
    },
    drop: (item) => {
      const [fromPosition] = item.id.split('_');
      if (onMove) {
        onMove(fromPosition, position); 
      } else {
        handleMove(fromPosition, position); 
      }
      setMoveHighlight(null);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  useEffect(() => {
    if (!isOver) {
      setMoveHighlight(null);
    }
  }, [isOver]);

  useEffect(() => {
    const newpart = gust.subscribe(({ upcomingPromotion }) => {
      if (upcomingPromotion && upcomingPromotion.to === position) {
        updatePromo(upcomingPromotion);
        if (onPromotionStart) onPromotionStart(); 
      }
    });

    return () => newpart.unsubscribe(); 
  }, [position, onPromotionStart]);

  const handlePromotionSelection = (promotionPiece) => {
    handleMove(promo.from, promo.to, promotionPiece); 
    updatePromo(null); 
    if (onPromotionEnd) onPromotionEnd();
  };

  return (
    <div className='fret' ref={drop}>
      <Gridsq dark={dark}>
        {promo ? (
          <Promotion 
            promotion={promo} 
            onSelect={handlePromotionSelection} 
          />
        ) : u ? (
          <Piece position={position} piece={u} />
        ) : null}
        
        {moveHighlight && (
          <div className={`${moveHighlight}-move-highlight`}></div>
        )}
      </Gridsq>
    </div>
  );
};

export default Boardsq;
