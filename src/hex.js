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

// Add a simple opening book for common first moves
const openingBook = {
  // Empty board - first moves
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -': ['e4', 'd4', 'c4', 'Nf3'],
  // Common responses to e4
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3': ['e5', 'c5', 'e6', 'c6'],
  // Common responses to d4
  'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3': ['Nf6', 'd5', 'e6'],
  // A few more common positions from early opening theory
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6': ['Nf3', 'Nc3'],
  'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6': ['Nf3', 'c3', 'Nc3'],
};

// Reference to the chess engine API (make sure this exists in your codebase)
// If you don't have a stockfish implementation, you need to add one or modify this approach
const chessEngine = {
  calculateBestMove: (fen, options) => {
    // Simulate engine calculation
    return new Promise(resolve => {
      setTimeout(() => {
        // Very simplified approach - in a real implementation, 
        // this would call the actual engine API
        if (openingBook[fen]) {
          const moves = openingBook[fen];
          resolve(moves[Math.floor(Math.random() * moves.length)]);
        } else {
          // For demo, return a valid move (would be replaced by actual engine)
          resolve('e4'); // Dummy response
        }
      }, options.timeLimit);
    });
  }
};

// Optimize the AI move calculation function - export it so it can be used
export const getAIMove = (fen, difficulty) => {
  // First check the opening book
  if (openingBook[fen] && !isEndgame(fen)) {
    const bookMoves = openingBook[fen];
    const randomIndex = Math.floor(Math.random() * bookMoves.length);
    return bookMoves[randomIndex];
  }
  
  // Set appropriate thinking times based on difficulty and game phase
  let thinkingTime = 1000; // Default 1 second
  let searchDepth = 1;
  
  switch(difficulty) {
    case 'easy':
      thinkingTime = isEndgame(fen) ? 2000 : 500;
      searchDepth = isEndgame(fen) ? 8 : 5;
      break;
    case 'medium':
      thinkingTime = isEndgame(fen) ? 3000 : 1000;
      searchDepth = isEndgame(fen) ? 12 : 8;
      break;
    case 'hard':
      thinkingTime = isEndgame(fen) ? 5000 : 2000;
      searchDepth = isEndgame(fen) ? 16 : 12;
      break;
    default:
      thinkingTime = 1000;
      searchDepth = 8;
      break;
  }
  
  // Provide visual feedback that AI is thinking
  updateThinkingStatus(true);
  
  // Call the chess engine with optimized parameters
  return chessEngine.calculateBestMove(fen, {
    depth: searchDepth,
    timeLimit: thinkingTime,
    // Add early exit if an obvious move is found
    earlyExit: !isEndgame(fen)
  })
  .then(move => {
    updateThinkingStatus(false);
    return move;
  });
};

// Helper function to determine if position is in endgame
function isEndgame(fen) {
  // Count the number of pieces
  const piecesCount = (fen.split(' ')[0].match(/[pnbrqkPNBRQK]/g) || []).length;
  // Endgame typically has fewer than 10 pieces
  return piecesCount <= 10;
}

// Update the UI to show thinking status
function updateThinkingStatus(isThinking) {
  // If you have a thinking indicator element, update it here
  const thinkingIndicator = document.querySelector('.thinking-indicator');
  if (thinkingIndicator) {
    thinkingIndicator.style.opacity = isThinking ? '1' : '0.5';
  }
}

// Make sure to use getAIMove in your code where needed
// For example:
export const makeAIMove = (chess, difficulty) => {
  const fen = chess.fen();
  return getAIMove(fen, difficulty).then(move => {
    // Make the move on the board
    return move;
  });
};
