import { Chess } from 'chess.js'; 
import { BehaviorSubject } from 'rxjs';

const game = new Chess();

// Expose FEN for Stockfish integration
export function getFEN() {
  return game.fen();
}

// Make FEN accessible to window for StockfishEngine
if (typeof window !== 'undefined') {
  window.chessFEN = getFEN();
}

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
    
    // If this is an AI move with promotion piece directly provided
    if (promotionPiece) {
      move(from, to, promotionPiece);
      return;
    }
    
    // For user moves, show the promotion UI
    const upcomingPromotion = { from, to, color: promotion.color };
    gust.next({ upcomingPromotion });
    return;
  }

  // Regular move (non-promotion)
  move(from, to); 
}

function setGame() {
  const state = {
    board: game.board(),
    turn: game.turn(),
  };
  
  gust.next(state);
  window.chessFEN = getFEN();
}

export function repGame() {
  setGame();
}

export function resetGame() {
  game.reset();
  setGame();
}

// Add this function to validate moves
export function validateMove(from, to) {
  // Get the current chess game state
  const chess = getCurrentChessInstance();
  
  // Check if the move is valid according to chess rules
  try {
    const move = chess.move({
      from: from,
      to: to,
      promotion: 'q' // Default to queen for checking validity
    });
    
    // If move is valid, undo it (we're just checking, not making the move)
    if (move) {
      chess.undo();
      return true;
    }
    return false;
  } catch (e) {
    // If there's an error, the move is invalid
    return false;
  }
}

// Helper function to get current chess instance
function getCurrentChessInstance() {
  // Access your chess.js instance from your current code
  // This implementation depends on how you've structured your code
  return game; // Or however you access your chess instance
}
