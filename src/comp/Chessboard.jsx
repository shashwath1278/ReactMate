import { useEffect, useState } from "react";
import Boardsq from "./Boardsq";

export default function Chessboard({ board, flip, onMove, onPromotionStart, onPromotionEnd, isAIGame, aiColor }) {
  const [displayBoard, setDisplayBoard] = useState([]);
  const [isFlipped, setIsFlipped] = useState(flip);

  useEffect(() => {
    if (Array.isArray(board)) {
      setDisplayBoard(board.flat());
    }

    const timeoutId = setTimeout(() => {
      setIsFlipped(flip);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [board, flip]);

  useEffect(() => {
    if (Array.isArray(board)) {
      setDisplayBoard(isFlipped ? board.flat().reverse() : board.flat());
    }
  }, [isFlipped, board]);

  function isDarkSquare(i) {
    const { x, y } = getDimensions(i);
    return (x + y) % 2 === 0; // Fix to ensure a1 is dark
  }

  function getDimensions(i) {
    const x = !isFlipped ? i % 8 : Math.abs((i % 8) - 7);
    const y = !isFlipped ? Math.abs(Math.floor(i / 8 - 7)) : Math.floor(i / 8);
    return { x, y };
  }

  function getPosition(i) {
    const { x, y } = getDimensions(i);
    const ydim = ["a", "b", "c", "d", "e", "f", "g", "h"][x];
    return `${ydim}${y + 1}`;
  }

  return (
    <>
      <div className="chessboard">
        {displayBoard.map((piece, i) => (
          <div key={i} className="sq">
            <Boardsq 
              position={getPosition(i)} 
              dark={isDarkSquare(i)} 
              u={piece} 
              onMove={onMove} 
              onPromotionEnd={onPromotionEnd} 
              onPromotionStart={onPromotionStart}
              isAIGame={isAIGame}
              aiColor={aiColor}
              flip={flip}
            />
          </div>
        ))}
      </div>
    </>
  );
}
