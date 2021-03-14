import React from 'react';
import { Row, Col } from 'antd';

import Board from './Board';
import { boardToString, getValidMoves } from '../core/game';

import './Game.css';


const Game = ({ turn, winner, gameover, board, evaluateBoard, bestAction, onMove = f => f }) => {
  const status = `Player: ${turn}`;

  return (
    <div className="game">
      <Row>
        <Col><h1>TICTACTOE</h1></Col>
      </Row>
      {!gameover && (<Row>
        <Col><div className="status">Player: <b style={{border: "solid 1px", padding: "3px"}}>{turn}</b></div></Col>
      </Row>)}

      {gameover && (
        <Row gutter={[16, 16]}>
          <Col><div className="status">GAMEOVER</div></Col>
          {winner ? 
            (<Col><div className="status"><b style={{border: "solid 1px", padding: "3px"}}>{winner}</b> WIN</div></Col>) :
            (<Col><div className="status">DRAW</div></Col>)
          }
        </Row>
      )}

      <Board
        value={boardToString(board)}
        bestAction={bestAction}
        evaluateBoard={evaluateBoard}
        validMoves={!gameover ? getValidMoves(board) : []}
        onClick={(location) => { onMove(location) }}
      />
    </div>
  )
}

export default Game;
