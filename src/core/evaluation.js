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
  const firstPlayer = playType == PLAYFIRST ? agent : againstAgent;
  const lastPlayer = playType == PLAYLAST ? agent : againstAgent;

  const results = { win: 0, draw: 0, lose: 0, total: episodes };
  for (var i = 0; i < episodes; i++) {
    let state = initGame();
    firstPlayer.newEpisode();
    lastPlayer.newEpisode();

    for (var j = 0; j < 100; j++) {
      let probs = firstPlayer.policy(state);
      let maxProb = max(probs);
      probs = map(probs, (it, index) => ({ index, prob: it }));
      let action = select(filter(probs, (it) => it.prob == maxProb));
      action = action.index;
      state = move(state, action);

      if (!state.gameover) {
        probs = lastPlayer.policy(state);
        maxProb = max(probs);
        probs = map(probs, (it, index) => ({ index, prob: it }));
        action = select(filter(probs, (it) => it.prob == maxProb));
        action = action.index;
        state = move(state, action);
      }

      if (state.gameover) {
        break;
      }
    }

    if (state.winner) {
      if (state.winner == playType) {
        results.win += 1;
      } else {
        results.lose += 1;
      }
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
  const result = { win: 0, lose: 0, draw: 0, total: episodes };
  for (let i = 1; i <= episodes; i++) {
    let state = initGame();
    agent.newEpisode();
    againstAgent.newEpisode();
    
    for (let j = 0; j <= 100; j++) {
      const { turn } = state;
      let player = null;
      if (turn === playType) {
        player = agent;
      } else {
        player = againstAgent;
      }
      let probs = player.policy(state);
      let action = !state.gameover ? select(range(probs.length), probs) : -1;
      player.observe(state, action);
      player.learn();

      if (!state.gameover) {
        state = move(state, action);
      }
    }

    if (state.winner) {
      if (state.winner == playType) {
        result.win += 1;
      } else {
        result.lose += 1;
      }
    } else {
      result.draw += 1;
    }
  }
  return result;
};
