import React from 'react';
import Square from './Square';
import { pad, chunk, map, take } from 'lodash';

import './Board.css'

const Board = ({ value = pad('', 9, ' ') }) => (
  <div className="board">
    {map(chunk(take(value, 9), 3), row => (
      <div className="row">
        {map(row, cell => (
          <Square value={cell} />
        ))}
      </div>
    ))}
  </div>
)

export default Board;
