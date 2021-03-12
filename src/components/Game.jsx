import React from 'react';

import Board from './Board';
import { boardToString, getValidMoves } from '../core/game';

import './Game.css';


const Game = ({ turn, winner, gameover, board, onMove = f => f }) => {
  const status = `Player: ${turn}`;

  return (
    <div className="game">
      <div className="status">{status}</div>
      {gameover ? <div className="gameover">Gameover</div> : ''}
      {winner ? <div className="winner">Winner: {winner}</div> : ''}
      <Board
        value={boardToString(board)}
        validMoves={getValidMoves(board)}
        onClick={(location) => { onMove(location) }}
      />
    </div>
  )
}

export default Game;
