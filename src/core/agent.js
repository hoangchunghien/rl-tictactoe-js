import { range, max, sample, pullAt, clone } from 'lodash';
import { getValidMoves, boardToString, calculateReward, O } from './game';


export class RandomAgent {

  policy = (game) => {
    const { board } = game;
    const validMoves = getValidMoves(board);
    let A = range(0, 9, 0.0);
    for (let i = 0; i < validMoves.length; i++) {
      const a = validMoves[i]
      A[a] = 1.0 / validMoves.length;
    }
    return A
  }

  newEpisode = () => {}
  observe = () => {}
  learn = () => {}
}


export class SarsaAgent {
  constructor(epsilon = 0.1, discount = 0.9, alpha=0.01, player=O) {
    this.epsilon = epsilon;
    this.discount = discount;
    this.alpha = alpha;
    this.player = player;
    this.episode = [];

    this._Q = {};
    this.Q = new Proxy(this._Q, {
      get: (target, name) => {
        if (!(name in target)) {
          target[name] = range(0, 9, 0.0);
        }

        return target[name];
      }
    });
  }

  policy = (game) => {
    const { board } = game;
    const validMoves = getValidMoves(board);
    const boardString = boardToString(board);
    let A = range(0, 9, 0.0);
    const cloned = clone(this.Q[boardString]);
    const pulled = pullAt(cloned, validMoves);
    const bestScore = max(pulled);
    const bestAction = validMoves[pulled.indexOf(bestScore)];
    for (let i = 0; i < validMoves.length; i++) {
      const a = validMoves[i];
      A[a] = this.epsilon / validMoves.length;
    }
    if (validMoves.includes(bestAction)) {
      A[bestAction] += 1.0 - this.epsilon;
    } else {
      const someAction = sample(validMoves);
      A[someAction] += 1.0 - this.epsilon;
    }

    return A;
  }

  learn = (state, action, nextState, nextAction) => {
    const reward = calculateReward(nextState, this.player);
    const stateString = boardToString(state.board);
    const nextStateString = boardToString(nextState.board);
    const nextStateValue = nextState.gameover ? 0 : this.Q[nextStateString][nextAction];
    const tdTarget = reward + this.discount * nextStateValue;
    const tdDelta = tdTarget - this.Q[stateString][action];
    this.Q[stateString][action] += this.alpha * tdDelta;
  }

  observe = (state, action) => {
    this.episode.push([state, action]);
  }

  newEpisode = () => {
    this.episode = [];
  }
}
