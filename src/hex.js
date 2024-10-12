import { Chess } from 'chess.js'; 
import { BehaviorSubject } from 'rxjs';
import React, { useState, useEffect } from 'react';
import Board from './comp/Chessboard'




const k = 'rnb1kbnr/pppp1ppp/8/4p3/5PPq/8/PPPPP2P/RNBQKBNR w KQkq - 1 3'; 
const game = new Chess();

export const gust = new BehaviorSubject();

let previousBoard = game.board(); 


export function move(from, to, promotion) {
  try {
    let tempMove = { from, to };
    
   
    if (promotion) {
      tempMove.promotion = promotion;
    }

    const legalMove = game.move(tempMove); 
    
    if (legalMove) {
      
      setGame();
      
      if (game.isStalemate()) {
        alert("The game is a draw!")
      }
    
      if (game.isInsufficientMaterial()) {
        alert("The game is a draw!")
      }
      
      if (game.isDraw()) {
        alert("The game is a draw!")
      }
      
      if (game.isCheckmate()) {
        
        alert("CHECKMATE")
      } else if (game.inCheck()) {
        console.log("Check!"); 
      }
      if (game.isGameOver()) {
        
        if(window.confirm("GAME OVER! . Do you want to restart?")){
          game.reset();
         setGame();
        }
      }
    }
  } catch (err) {
    console.log("Invalid move"); 
  }
}

function setGame(upcomingPromotion) {
  const newGame = {
    board: game.board(),
    upcomingPromotion
  };
  gust.next(newGame); 
}

export function repGame() {
  setGame();
}

export function handleMove(from, to, promotionPiece) {
  const promotions = game.moves({ verbose: true }).filter(m => m.promotion);

  if (promotions.some(pawn => pawn.from === from && pawn.to === to)) {
    try {
      const promotion = promotions.find(pawn => pawn.from === from && pawn.to === to);
      const upcomingPromotion = { from, to, color: promotion.color };
      setGame(upcomingPromotion);
    } catch (err) {
      console.log("Invalid move");
    }
  }

  try {
    const upcomingPromotion = gust.getValue();
    if (!upcomingPromotion) {
      move(from, to); 
    }
    move(from, to, promotionPiece); 
  } catch (err) {
    console.log("Error during move:", err);
  }
  
}

export function resetGame() {
  game.reset();
  setGame();
 
}


