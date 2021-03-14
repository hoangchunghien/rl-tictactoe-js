import React from 'react';
import Square from './Square';
import { pad, chunk, map, take, range } from 'lodash';

import './Board.css'

const Board = ({
  value = pad('', 9, ' '),
  validMoves = [],
  evaluateBoard = map(range(0, 9), () => null),
  bestAction = null,
  onClick = f => f
}) => {
  return (
    <div className="board">
      {map(chunk(take(value, 9), 3), (row, i) => (
        <div className="row">
          {map(row, (cell, j) => (
            <Square
              value={cell}
              highlight={bestAction == i * 3 + j}
              evaluateScore={evaluateBoard[i * 3 + j]}
              clickable={validMoves.includes(i * 3 + j)}
              onClick={() => onClick(i * 3 + j)} />
          ))}
        </div>
      ))}
    </div>
  )
}

export default Board;
