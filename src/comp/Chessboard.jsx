import { useEffect, useState } from "react";
import Boardsq from "./Boardsq";
import { resetGame } from "../hex";

export default function Chessboard({ board, flip, onMove }) {
  const [displayBoard, setDisplayBoard] = useState([]);

 

useEffect(() => {
  
  if (board) {
    setDisplayBoard(flip ? board.flat().reverse() : board.flat());
  }
}, [board, flip]);


  function isDarkSquare(i) {
    const { x, y } = getDimensions(i);
    return (x + y) % 2 === 1;
  }

  function getDimensions(i) {
    const x =!flip?i % 8:Math.abs((i%8)-7);
    const y = !flip?Math.abs(Math.floor(i / 8 - 7)):Math.floor(i / 8 );
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
            <Boardsq position={getPosition(i)} dark={isDarkSquare(i)} u={piece} onMove={onMove} />
          </div>
        ))}
      </div>
      <div className="reset-container">
        <button onClick={resetGame} className="reset-button">
          Reset Game
        </button>
      </div>
    </>
  );
}
