import { max, filter, map, range } from "lodash";
import { initGame, move, O, X } from "./game";
import { select } from "weighted";

export const PLAYFIRST = X;
export const PLAYLAST = O;

export const evaluate = ({
  agent,
  againstAgent,
  playType = PLAYLAST,
  episodes = 1000,
}) => {
  const results = { X: 0, draw: 0, O: 0, total: episodes };
  for (var i = 0; i < episodes; i++) {
    let state = initGame();
    agent.newEpisode();
    againstAgent.newEpisode();

    for (var j = 0; j < 100; j++) {
      const { turn } = state;
      let player = null;
      if (turn === playType) {
        player = agent;
      } else {
        player = againstAgent;
      }
      let probs = player.policy(state);
      let action = !state.gameover ? select(range(probs.length), probs) : -1;
      if (!state.gameover) {
        state = move(state, action);
      }
    }

    if (state.winner) {
      results[state.winner] += 1;
    } else {
      results.draw += 1;
    }
  }
  return results;
};

export const train = ({
  agent,
  againstAgent,
  playType = PLAYLAST,
  episodes = 1000,
}) => {
  const result = { X: 0, O: 0, draw: 0, total: episodes };
  for (let i = 1; i <= episodes; i++) {
    let state = initGame();
    agent.newEpisode();
    againstAgent.newEpisode();

    for (let j = 0; j <= 100; j++) {
      const { turn } = state;
      let player = null;
      let opponent = null;
      if (turn === playType) {
        player = agent;
        opponent = againstAgent;
      } else {
        player = againstAgent;
        opponent = agent;
      }
      let probs = player.policy(state);
      let action = !state.gameover ? select(range(probs.length), probs) : -1;
      player.observe(state, action);
      player.learn();

      if (!state.gameover) {
        state = move(state, action);
      } else {
        opponent.observe(state, -1);
        opponent.learn();
        break;
      }
    }

    if (state.winner) {
      result[state.winner] += 1;
    } else {
      result.draw += 1;
    }
  }
  return result;
};
