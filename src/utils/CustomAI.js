/**
 * Custom AI implementation for easy and medium difficulty levels only.
 * The hard difficulty should use Stockfish engine instead.
 */
import { gust, move } from '../hex';

/**
 * Opening book with common chess openings
 * Format: { [FEN position]: [array of good moves in UCI format] }
 */
const openingBook = {
  // Starting position
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': [
    { from: 'e2', to: 'e4' }, // King's Pawn Opening
    { from: 'd2', to: 'd4' }, // Queen's Pawn Opening
    { from: 'g1', to: 'f3' }, // Knight Opening
    { from: 'c2', to: 'c4' }  // English Opening
  ],
  // After 1.e4
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1': [
    { from: 'e7', to: 'e5' }, // King's Pawn Game
    { from: 'c7', to: 'c5' }, // Sicilian Defense
    { from: 'e7', to: 'e6' }, // French Defense
    { from: 'c7', to: 'c6' }  // Caro-Kann Defense
  ],
  // After 1.d4
  'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1': [
    { from: 'd7', to: 'd5' }, // Queen's Pawn Game
    { from: 'g8', to: 'f6' }, // Indian Defense
    { from: 'e7', to: 'e6' }, // Queen's Gambit Declined setup
    { from: 'c7', to: 'c5' }  // Benoni Defense
  ],
  // After 1.e4 e5
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2': [
    { from: 'g1', to: 'f3' }, // King's Knight Opening
    { from: 'f2', to: 'f4' }, // King's Gambit
    { from: 'b1', to: 'c3' }  // Vienna Game
  ],
  // After 1.e4 c5 (Sicilian)
  'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2': [
    { from: 'g1', to: 'f3' }, // Open Sicilian setup
    { from: 'b1', to: 'c3' }, // Closed Sicilian setup
    { from: 'c2', to: 'c3' }  // Alapin Sicilian
  ]
  // More positions can be added here
};

/**
 * Custom Chess Engine implementation with improved intelligence
 */
class CustomChessEngine {
  constructor() {
    // Better piece values (standard + positional bonus)
    this.pieceValues = {
      p: 100,   // pawn
      n: 320,   // knight
      b: 330,   // bishop
      r: 500,   // rook
      q: 900,   // queen
      k: 20000  // king
    };
    
    // Keep track of previously seen positions to avoid repetition
    this.seenPositions = new Map();
    
    // Center squares for positional evaluation
    this.centerSquares = ['d4', 'd5', 'e4', 'e5'];
    this.extendedCenterSquares = ['c3', 'c4', 'c5', 'c6', 'd3', 'd6', 'e3', 'e6', 'f3', 'f4', 'f5', 'f6'];
    
    // Development squares for knights and bishops
    this.developmentSquares = {
      n: ['b1', 'g1', 'b8', 'g8'], // Initial knight positions
      b: ['c1', 'f1', 'c8', 'f8']  // Initial bishop positions
    };

    // Track game phase for evaluation adjustments
    this.gamePhase = {
      opening: 0,
      middlegame: 1,
      endgame: 2
    };
  }

  /**
   * Check if a move is in the opening book
   * @param {Object} chess - The chess.js instance
   * @returns {Object|null} A move from the opening book or null
   */
  getBookMove(chess) {
    const fen = chess.fen();
    // Simplify FEN by removing the halfmove and fullmove numbers for broader matching
    const simplifiedFen = fen.split(' ').slice(0, 4).join(' ');
    
    // Check if this position or a similar one is in our opening book
    for (const [bookFen, moves] of Object.entries(openingBook)) {
      if (bookFen.includes(simplifiedFen) || simplifiedFen.includes(bookFen)) {
        // Return a random move from the suggested moves
        return moves[Math.floor(Math.random() * moves.length)];
      }
    }
    
    return null;
  }

  /**
   * Check if a move would hang a piece (give it away for free)
   * @param {Object} chess - The chess.js instance
   * @param {Object} move - The move to evaluate
   * @returns {boolean} True if the move would hang a piece
   */
  wouldHangPiece(chess, move) {
    // Make the move to evaluate
    const moveResult = chess.move(move);
    if (!moveResult) {
      return false;
    }
    
    // Get all attacked squares by the opponent
    const attackedSquares = this.getAttackedSquares(chess);
    
    // Get all our pieces
    const ourPieces = this.getOurPieces(chess);
    
    // Check if any of our pieces are attacked and not defended
    let hanging = false;
    for (const piece of ourPieces) {
      if (attackedSquares.includes(piece.square)) {
        // Check if this piece is defended
        const pieceValue = this.pieceValues[piece.type];
        const attackerValue = this.getLeastValuableAttacker(chess, piece.square);
        
        // If an attacker with lower value can capture our piece, it's hanging
        // Or if the piece is not defended at all
        if (attackerValue === 0 || attackerValue < pieceValue) {
          hanging = true;
          break;
        }
      }
    }
    
    // Undo the move and return result
    chess.undo();
    return hanging;
  }
  
  /**
   * Get all squares attacked by the opponent
   * @param {Object} chess - The chess.js instance
   * @returns {Array} Array of square names
   */
  getAttackedSquares(chess) {
    const attackedSquares = [];
    const opponent = chess.turn(); // Current turn is opponent after our move
    
    // Check all squares on the board for potential attacks
    for (let rank = 1; rank <= 8; rank++) {
      for (let file = 'a'.charCodeAt(0); file <= 'h'.charCodeAt(0); file++) {
        const square = String.fromCharCode(file) + rank;
        
        // See if the square can be attacked by opponent
        const moves = chess.moves({
          square: square,
          verbose: true,
          legal: false // Include illegal moves to see potential attacks
        });
        
        if (moves.some(m => m.flags.includes('c'))) { // Capture flag
          attackedSquares.push(square);
        }
      }
    }
    
    return attackedSquares;
  }
  
  /**
   * Get all our pieces on the board
   * @param {Object} chess - The chess.js instance
   * @returns {Array} Array of piece objects
   */
  getOurPieces(chess) {
    const pieces = [];
    const ourColor = chess.turn() === 'w' ? 'b' : 'w'; // We just moved, so our color is opposite
    
    // Check all squares on the board
    for (let rank = 1; rank <= 8; rank++) {
      for (let file = 'a'.charCodeAt(0); file <= 'h'.charCodeAt(0); file++) {
        const square = String.fromCharCode(file) + rank;
        const piece = chess.get(square);
        
        if (piece && piece.color === ourColor) {
          pieces.push({
            type: piece.type,
            color: piece.color,
            square: square
          });
        }
      }
    }
    
    return pieces;
  }
  
  /**
   * Get the value of the least valuable attacker of a square
   * @param {Object} chess - The chess.js instance
   * @param {string} square - The square to check
   * @returns {number} The value of the least valuable attacker (0 if none)
   */
  getLeastValuableAttacker(chess, square) {
    let leastValue = Number.MAX_SAFE_INTEGER;
    let hasAttacker = false;
    
    const opponent = chess.turn(); // Current turn is opponent after our move
    
    // Look for all possible opponent moves that could capture on this square
    const squares = chess.board();
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = squares[rank][file];
        if (piece && piece.color === opponent) {
          const from = String.fromCharCode(file + 'a'.charCodeAt(0)) + (8 - rank);
          const moves = chess.moves({
            square: from,
            verbose: true
          });
          
          // Check if any move can capture on our target square
          for (const move of moves) {
            if (move.to === square) {
              hasAttacker = true;
              const attackerValue = this.pieceValues[piece.type];
              leastValue = Math.min(leastValue, attackerValue);
            }
          }
        }
      }
    }
    
    return hasAttacker ? leastValue : 0;
  }

  /**
   * Evaluates a move based on various factors
   * @param {Object} chess - The chess.js instance
   * @param {Object} move - The move to evaluate
   * @returns {number} Score for the move
   */
  evaluateMove(chess, move) {
    let score = 0;
    
    // Try the move on the board
    const moveResult = chess.move(move);
    if (!moveResult) {
      chess.undo();
      return -9999; // Invalid move
    }
    
    // Store the current position for repetition check
    const currentFen = chess.fen().split(' ').slice(0, 4).join(' ');
    
    // Apply a penalty for repeated positions
    if (this.seenPositions.has(currentFen)) {
      score -= 50 * this.seenPositions.get(currentFen);
    }
    
    // Update the seen positions counter
    this.seenPositions.set(currentFen, (this.seenPositions.get(currentFen) || 0) + 1);
    
    // 1. Piece capture evaluation - value of captured piece
    if (moveResult.captured) {
      score += this.pieceValues[moveResult.captured] * 10;
      
      // Bonus for favorable exchanges (capturing with less valuable piece)
      const capturingPieceValue = this.pieceValues[moveResult.piece];
      const capturedPieceValue = this.pieceValues[moveResult.captured];
      if (capturingPieceValue < capturedPieceValue) {
        score += (capturedPieceValue - capturingPieceValue);
      }
    }
    
    // 2. Check and mate evaluation
    if (chess.isCheckmate()) {
      score += 10000; // Highest priority
    } else if (chess.isCheck()) {
      score += 50;   // Bonus for checking the opponent
    }
    
    // 3. Promotion evaluation
    if (moveResult.promotion) {
      score += this.pieceValues[moveResult.promotion] * 8;
    }
    
    // 4. Position evaluation
    // Center control bonus
    if (this.centerSquares.includes(moveResult.to)) {
      score += 30;
    } else if (this.extendedCenterSquares.includes(moveResult.to)) {
      score += 15;
    }
    
    // 5. Development bonus for knights and bishops in opening
    if ((moveResult.piece === 'n' || moveResult.piece === 'b') && 
        this.developmentSquares[moveResult.piece].includes(moveResult.from) && 
        chess.history().length < 10) {
      score += 25;
    }
    
    // 6. Castle bonus - encourage castling
    if (moveResult.san === 'O-O' || moveResult.san === 'O-O-O') {
      score += 60;
    }
    
    // 7. Mobility - count possible moves after this move
    const possibleMoves = chess.moves().length;
    score += possibleMoves * 2;
    
    // 8. Avoid moving the same piece repeatedly
    const history = chess.history({ verbose: true });
    if (history.length >= 4) {
      const lastMove = history[history.length - 2];
      const thirdLastMove = history[history.length - 4];
      
      if (lastMove && thirdLastMove && 
          lastMove.piece === moveResult.piece && 
          lastMove.from === moveResult.to &&
          lastMove.to === moveResult.from) {
        score -= 150; // Heavy penalty for moving back and forth
      }
    }
    
    // 9. Encourage pawn advancement in middlegame
    if (moveResult.piece === 'p' && chess.history().length > 10) {
      // Get the rank of the destination square (1-8)
      const rank = parseInt(moveResult.to.charAt(1));
      
      // Bonus increases as pawn advances
      if (chess.turn() === 'w') {
        score += rank * 5; // White pawns advancing
      } else {
        score += (9 - rank) * 5; // Black pawns advancing
      }
    }
    
    // 10. NEW: Piece Safety - Check if opponent can capture any of our pieces
    // First, undo the current move to restore original position
    chess.undo();
    
    // Then check if after making this move, it would hang a piece
    if (this.wouldHangPiece(chess, move)) {
      // Significant penalty for hanging a piece based on its value
      score -= 500; // Base penalty
      
      // Determine which piece is hanging and add extra penalty
      chess.move(move);
      const hanging = this.getOurPieces(chess).find(piece => {
        const attackerValue = this.getLeastValuableAttacker(chess, piece.square);
        return attackerValue > 0 && attackerValue < this.pieceValues[piece.type];
      });
      
      if (hanging) {
        score -= this.pieceValues[hanging.type] * 3; // Additional penalty based on piece value
      }
      
      chess.undo();
    } else {
      // Make the move again to continue evaluation
      chess.move(move);
    }
    
    // 11. NEW: Material retention
    // Check if the move leaves a piece en prise (undefended and attacked)
    const attackedPieces = this.getOurPieces(chess).filter(piece => {
      return this.getLeastValuableAttacker(chess, piece.square) > 0;
    });
    
    for (const piece of attackedPieces) {
      const attackerValue = this.getLeastValuableAttacker(chess, piece.square);
      const pieceValue = this.pieceValues[piece.type];
      
      // Penalty for leaving valuable pieces undefended or poorly defended
      if (attackerValue < pieceValue) {
        score -= (pieceValue - attackerValue) * 2;
      }
    }
    
    // Undo the move and return the score
    chess.undo();
    
    return score;
  }

  /**
   * Calculate the best move for easy difficulty
   * @param {Object} chess - The chess.js instance
   * @returns {Object} The selected move object
   */
  calculateEasyMove(chess) {
    const legalMoves = chess.moves({ verbose: true });
    
    if (legalMoves.length === 0) return null;
    
    // Check opening book (30% chance to use if available)
    if (chess.history().length < 10 && Math.random() < 0.3) {
      const bookMove = this.getBookMove(chess);
      if (bookMove) return bookMove;
    }
    
    // For easy mode, 60% chance to pick a random move
    if (Math.random() < 0.6) {
      // Even in random mode, avoid obviously terrible moves (hanging high-value pieces)
      const nonHangingMoves = legalMoves.filter(move => {
        // Only filter out moves that hang major pieces (queen, rook)
        if (move.piece === 'q' || move.piece === 'r') {
          return !this.wouldHangPiece(chess, move);
        }
        return true;
      });
      
      // If there are non-hanging moves, choose from them, otherwise use all legal moves
      const movesToChooseFrom = nonHangingMoves.length > 0 ? nonHangingMoves : legalMoves;
      const randomIndex = Math.floor(Math.random() * movesToChooseFrom.length);
      return movesToChooseFrom[randomIndex];
    }
    
    // 40% chance to make a somewhat sensible move
    const evaluatedMoves = legalMoves.map(move => ({
      move,
      score: this.evaluateMove(chess, move)
    }));
    
    // Sort by score (descending)
    evaluatedMoves.sort((a, b) => b.score - a.score);
    
    // Pick one of the top 4 moves (or fewer if not enough moves)
    const topIndex = Math.floor(Math.random() * Math.min(4, evaluatedMoves.length));
    return evaluatedMoves[topIndex].move;
  }
  
  /**
   * Calculate the best move for medium difficulty
   * @param {Object} chess - The chess.js instance
   * @returns {Object} The selected move object
   */
  calculateMediumMove(chess) {
    const legalMoves = chess.moves({ verbose: true });
    
    if (legalMoves.length === 0) return null;
    
    // Check opening book (70% chance to use if available)
    if (chess.history().length < 12 && Math.random() < 0.7) {
      const bookMove = this.getBookMove(chess);
      if (bookMove) return bookMove;
    }
    
    // For medium mode, 30% chance to pick a random move, but avoid hanging pieces
    if (Math.random() < 0.3) {
      // Filter out moves that would hang pieces
      const nonHangingMoves = legalMoves.filter(move => {
        return !this.wouldHangPiece(chess, move);
      });
      
      // If there are non-hanging moves, choose from them, otherwise use all legal moves
      const movesToChooseFrom = nonHangingMoves.length > 0 ? nonHangingMoves : legalMoves;
      const randomIndex = Math.floor(Math.random() * movesToChooseFrom.length);
      return movesToChooseFrom[randomIndex];
    }
    
    // 70% chance to make a more intelligent move
    const evaluatedMoves = legalMoves.map(move => ({
      move,
      score: this.evaluateMove(chess, move)
    }));
    
    // Sort by score (descending)
    evaluatedMoves.sort((a, b) => b.score - a.score);
    
    // Pick one of the top 3 moves (or fewer if not enough moves)
    const topIndex = Math.floor(Math.random() * Math.min(3, evaluatedMoves.length));
    return evaluatedMoves[topIndex].move;
  }
  
  /**
   * Calculate the best move based on difficulty
   * @param {Object} chess - The chess.js instance
   * @param {string} difficulty - The difficulty level
   * @returns {Object} The selected move object
   */
  calculateBestMove(chess, difficulty = 'easy') {
    if (difficulty === 'medium') {
      return this.calculateMediumMove(chess);
    }
    
    // Default to easy mode
    return this.calculateEasyMove(chess);
  }
  
  /**
   * Reset the engine state (clear memory of seen positions)
   */
  reset() {
    this.seenPositions.clear();
  }
}

// Create a singleton instance
const customChessEngine = new CustomChessEngine();

/**
 * Execute a move based on the selected difficulty
 * @param {Object} chess - The chess.js instance
 * @param {string} difficulty - The difficulty level ('easy', 'medium', or 'hard')
 * @returns {Object} The selected move object or null if should use Stockfish instead
 */
export const makeCustomAIMove = (chess, difficulty) => {
  // Return null for hard difficulty (will use Stockfish instead)
  if (difficulty === 'hard') {
    return null;
  }
  
  // For medium difficulty, use Stockfish 80% of the time
  if (difficulty === 'medium' && Math.random() < 0.8) {
    return null; // Return null to delegate to Stockfish
  }
  
  // For easy difficulty, use Stockfish 50% of the time
  if (difficulty === 'easy' && Math.random() < 0.5) {
    return null; // Return null to delegate to Stockfish
  }
  
  // Use the custom engine for the remaining cases
  return customChessEngine.calculateBestMove(chess, difficulty);
};

// Export the engine directly for more advanced usage
export { customChessEngine };