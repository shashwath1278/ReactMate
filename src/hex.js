import { Chess } from 'chess.js'; 
import { BehaviorSubject } from 'rxjs';

const game = new Chess();

export const gust = new BehaviorSubject({
  board: game.board(),
  turn: game.turn(), 
  
});

export function move(from, to, promotion) {
  try {
    let tempMove = { from, to };

    if (promotion) {
      tempMove.promotion = promotion;  
    }


    const legalMove = game.move(tempMove); 


    if (legalMove) {
      setGame();  

      if (game.isStalemate() || game.isDraw() || game.isInsufficientMaterial()) {
        alert("The game is a draw!");
      }

      if (game.isCheckmate()) {
        alert("CHECKMATE");
      } else if (game.inCheck()) {
        console.log("Check!");
      }

      if (game.isGameOver() && window.confirm("GAME OVER! Do you want to restart?")) {
        game.reset();
        setGame();
      }
    } else {
      console.log("Invalid move, move was not made.");
    }
  } catch (err) {
    console.log("Invalid move");
  }
}


export function handleMove(from, to, promotionPiece) {
  const promotions = game.moves({ verbose: true }).filter(m => m.promotion);

  
  if (promotions.some(pawn => pawn.from === from && pawn.to === to)) {
  
    const promotion = promotions.find(pawn => pawn.from === from && pawn.to === to);
    const upcomingPromotion = { from, to, color: promotion.color };

    
    gust.next({ upcomingPromotion });
   
  }


  move(from, to, promotionPiece); 
}

function setGame() {
  gust.next({
    board: game.board(),
    turn: game.turn(),
  });
  
}


export function repGame() {
  setGame();
}

export function resetGame() {
  game.reset();
  setGame();
}
