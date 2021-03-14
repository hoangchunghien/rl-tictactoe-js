import { range, max, sample, pullAt, clone } from "lodash";
import { getValidMoves, boardToString, calculateReward, O, X } from "./game";

export class RandomAgent {
  constructor({ player = X }) {
    this.player = player;
  }

  policy = (game) => {
    const { board } = game;
    const validMoves = getValidMoves(board);
    let A = range(0, 9, 0.0);
    for (let i = 0; i < validMoves.length; i++) {
      const a = validMoves[i];
      A[a] = 1.0 / validMoves.length;
    }
    return A;
  };

  newEpisode = () => {};
  observe = () => {};
  learn = () => {};
}

export class MorteCarloAgent {
  constructor({ epsilon = 0.1, discount = 0.9, player = O }) {
    this.epsilon = epsilon;
    this.discount = discount;
    this.episode = [];
    this.player = player;

    this.Q = new Proxy(
      {},
      {
        get: (target, name) => {
          if (!(name in target)) {
            target[name] = range(0, 9, 0.0);
          }
          return target[name];
        },
      }
    );

    this.returnSums = new Proxy(
      {},
      {
        get: (target, name) => {
          if (!(name in target)) {
            target[name] = range(0, 9, 0.0);
          }
          return target[name];
        },
      }
    );

    this.returnCounts = new Proxy(
      {},
      {
        get: (target, name) => {
          if (!(name in target)) {
            target[name] = range(0, 9, 0.0);
          }
          return target[name];
        },
      }
    );
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
  };

  learn = () => {
    const memory = this.episode;

    if (memory.length > 0 && memory[memory.length - 1][0].gameover) {
      for (let i = 0; i < memory.length - 1; i++) {
        const record = memory[i];

        const state = record[0];
        const action = record[1];

        let G = 0;
        let discount = this.discount;
        const stateString = boardToString(state.board);

        for (let j = i + 1; j < memory.length; j++) {
          const nextRecord = memory[j];
          const nextState = nextRecord[0];
          const reward = calculateReward(nextState, this.player);
          G += reward * discount;
          discount = discount * this.discount;
        }
        this.returnSums[stateString][action] += G;
        this.returnCounts[stateString][action] += 1.0;
        this.Q[stateString][action] =
          this.returnSums[stateString][action] /
          this.returnCounts[stateString][action];
        
      }
    }
  };

  observe = (state, action) => {
    this.episode.push([state, action]);
  };

  newEpisode = () => {
    this.episode = [];
  };
}

export class SarsaAgent {
  constructor({ epsilon = 0.1, discount = 0.9, alpha = 0.01, player = O }) {
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
      },
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
  };

  learn = () => {
    const memory = this.episode;
    if (memory.length >= 2) {
      const record1 = memory[memory.length - 2];
      const record2 = memory[memory.length - 1];
      const state = record1[0];
      const action = record1[1];
      const nextState = record2[0];
      const nextAction = record2[1];

      const reward = calculateReward(nextState, this.player);
      const stateString = boardToString(state.board);
      const nextStateString = boardToString(nextState.board);
      const nextStateValue = nextState.gameover
        ? 0
        : this.Q[nextStateString][nextAction];
      const tdTarget = reward + this.discount * nextStateValue;
      const tdDelta = tdTarget - this.Q[stateString][action];
      this.Q[stateString][action] += this.alpha * tdDelta;
    }
  };

  observe = (state, action) => {
    this.episode.push([state, action]);
  };

  newEpisode = () => {
    this.episode = [];
  };
}


export class QLearningAgent {
  constructor({ epsilon = 0.1, discount = 0.9, alpha = 0.01, player = O }) {
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
      },
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
  };

  learn = () => {
    const memory = this.episode;
    if (memory.length >= 2) {
      const record1 = memory[memory.length - 2];
      const record2 = memory[memory.length - 1];
      const state = record1[0];
      const action = record1[1];
      const nextState = record2[0];
      
      const reward = calculateReward(nextState, this.player);
      const stateString = boardToString(state.board);
      const nextStateString = boardToString(nextState.board);
      const nextStateValue = nextState.gameover
        ? 0
        : max(this.Q[nextStateString]);
      const tdTarget = reward + this.discount * nextStateValue;
      const tdDelta = tdTarget - this.Q[stateString][action];
      this.Q[stateString][action] += this.alpha * tdDelta;
    }
  };

  observe = (state, action) => {
    this.episode.push([state, action]);
  };

  newEpisode = () => {
    this.episode = [];
  };
}
