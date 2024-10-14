import React, { useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import Gridsq from './Gridsq';
import Piece from './Piece';
import { gust } from '../hex';
import { handleMove } from '../hex'; 
import Promotion from './Promotion';


const Boardsq = ({ u, dark, position, onMove }) => {
  const [promo, updatePromo] = useState(null);

  const [, drop] = useDrop({
    accept: 'piece',
    drop: (item) => {
      const [fromPosition] = item.id.split('_');
      if (onMove) {
        onMove(fromPosition, position); 
      } else {
        handleMove(fromPosition, position); 
      }
    },
  });

  useEffect(() => {
    const newpart = gust.subscribe(({ upcomingPromotion }) => {
      if (upcomingPromotion && upcomingPromotion.to === position) {
        updatePromo(upcomingPromotion);
      }
    });

    return () => newpart.unsubscribe(); 
  }, [position]);

  const handlePromotionSelection = (promotionPiece) => {
    handleMove(promo.from, promo.to, promotionPiece); 
    updatePromo(null); 
  };
  

  return (
    <div className='fret' ref={drop}>
      <Gridsq dark={dark}>
        {promo ? (
          <Promotion promotion={promo} onSelect={handlePromotionSelection} />
        ) : u ? (
          <Piece position={position} piece={u} />
        ) : null}
      </Gridsq>
    </div>
  );
};

export default Boardsq;
