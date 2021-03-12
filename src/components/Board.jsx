import React from 'react';
import Square from './Square';
import { pad, chunk, map } from 'lodash';

import './Board.css'

const Board = ({ value = pad('', 9, ' ') }) => (
  <div className="board">
    {map(chunk(value, 3), row => (
      <div className="row">
        {map(row, cell => (
          <Square value={cell} />
        ))}
      </div>
    ))}
  </div>
)

export default Board;
