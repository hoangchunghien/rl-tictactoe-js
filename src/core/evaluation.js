import { max } from 'lodash';
import { initGame, move } from './game';

export const PLAYFIRST = 'X';
export const PLAYLAST = 'O';

export const evaluate = ({agent, againstAgent, playType=PLAYLAST, episodes=1000}) => {
    const firstPlayer = playType == PLAYFIRST ? agent : againstAgent;
    const lastPlayer = playType == PLAYLAST ? agent : againstAgent;

    const results = {win: 0, draw: 0, lose: 0, total: episodes}
    for (var i = 0; i < episodes; i++) {
        let state = initGame();
        firstPlayer.newEpisode();
        lastPlayer.newEpisode();

        for (var j = 0; j < 100; j++) {
            let probs = firstPlayer.policy(state);
            let action = probs.indexOf(max(probs));
            state = move(state, action);
            if (!state.gameover) {
                probs = lastPlayer.policy(state);
                action = probs.indexOf(max(probs));
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
}
