import { resetGame } from "../hex";
import Boardsq from "./Boardsq";

export default function Chessboard({ board }) {


  const xdim = ["1", "2", "3", "4", "5", "6", "7", "8"]
  function isDarkSquare(i) {
    const { x, y } = getDimensions(i)
    return (x + y) % 2 === 1

  }

  function getDimensions(i) {
    const x = i % 8;
    const y = Math.abs(Math.floor((i / 8) - 7))
    return { x, y }
  }

  function getPosition(i) {
    const { x, y } = getDimensions(i)
    const ydim = ["a", "b", "c", "d", "e", "f", "g", "h"][x]
    return `${ydim}${y + 1}`
  }


  return (
    <>
      <div className='chessboard'>
        {board.flat().map((piece, i) => (
          <div key={i} className="sq">
            <Boardsq position={getPosition(i)} dark={isDarkSquare(i)} u={piece} />
          </div>
        ))}

      </div>
      <div className="reset-container" ><button onClick={resetGame} className="reset-button">
        Reset Game
      </button></div></>
  );
};

