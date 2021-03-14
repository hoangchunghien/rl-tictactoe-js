import { every } from 'lodash';

export const X = 'X';
export const O = 'O';
export const EMPTY = '-';


export const initGame = () => {
  return {
    turn: X,
    winner: null,
    gameover: false,
    board: [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY]
  }
}


export const move = (game, location) => {
  let { turn, board } = game;

  const validMoves = getValidMoves(board);
  if (!validMoves.includes(location)) {
    return game;
  }

  let nextState = [...board];
  nextState[location] = turn;
  turn = turn === X ? O : X;

  const winner = checkWinner(nextState);
  const gameover = checkGameover(nextState);

  return {
    turn,
    winner,
    gameover,
    board: nextState
  }
}

export const getValidMoves = (board) => {
  let validMoves = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === EMPTY) validMoves.push(i);
  }
  return validMoves;
}

export const checkWinner = (board) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (board[a] !== EMPTY && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

export const checkGameover = (board) => {
  return every(board, it => it !== EMPTY) || !!checkWinner(board);
}

export const boardToString = (board) => {
  return board.join('')
}

export const calculateReward = (game, player) => {
  const { gameover, winner } = game;
  if (!gameover) {
    return 0;
  } else {
    if (!winner) {
      // Reward for a draw game
      return 0;
    } else if (winner === player) {
      // Reward for win
      return 10;
    } else {
      // Reward for lose
      return -10;
    }
  }
}
