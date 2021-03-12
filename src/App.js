import { useState } from 'react';

import Game from './components/Game';
import { boardToString, checkGameover, initGame, move } from './core/game';
import { RandomAgent, SarsaAgent } from './core/agent';
import { select } from 'weighted';
import { range, max } from 'lodash';

import './App.css';

const randomAgent = new RandomAgent();
const sarsaAgent = new SarsaAgent();
window.sarsaAgent = sarsaAgent;


function App() {
  const [game, setGame] = useState(initGame())
  const [episode, setEpisode] = useState(1000);
  const [t, setT] = useState(0); 
  const [isTraining, setIsTraining] = useState(false);

  const onMove = (location) => {
    const tempState = move(game, location);

    if (tempState.gameover) {
      setGame(tempState);
      return;
    }

    const probs = sarsaAgent.policy(tempState);
    console.log("Q")
    console.log(sarsaAgent.Q[boardToString(tempState.board)]);
    console.log("A")
    console.log(probs);
    const agentMove = probs.indexOf(max(probs))
    const nextState = move(tempState, agentMove)

    setGame(nextState);
  }

  const training = (agent) => {
    setIsTraining(true);

    for (let i = 1; i <= episode; i++) {
      setT(i);

      let state = initGame();

      // Random agent move first
      let probs = randomAgent.policy(state);
      let action = select(range(probs.length), probs);
      state = move(state, action);

      // Training agent take one action
      probs = agent.policy(state);
      action = select(range(probs.length), probs);
      
      // Training
      let done = false;
      for (let j = 0; j <= 100; j++) {
        const tmpState = move(state, action);
        done = checkGameover(state.board);
        if (done) break;

        probs = randomAgent.policy(tmpState);
        const randomAction = select(range(probs.length), probs);
        const nextState = move(tmpState, randomAction);

        let nextAction = -1;
        if (!nextState.gameover) {
          probs = agent.policy(nextState);
          nextAction = select(range(probs.length), probs);
        }

        agent.learn(state, action, nextState, nextAction);

        done = checkGameover(nextState.board);
        
        if (done) {
          break;
        }

        state = nextState;
        action = nextAction;
      }
    }

    setIsTraining(false);
  }

  return (
    <div className="App">
      <div className="training">
        <div>Training Episodes ({t}/{episode})</div>
        <div><input value={episode} type="number" onChange={(e) => setEpisode(e.target.value)} /></div>
        <div>
          <button onClick={() => training(sarsaAgent)} disabled={isTraining}>Training</button>
        </div>
      </div>
      <Game {...game} onMove={onMove} />
      <div>
        <button onClick={() => setGame(initGame())}>Reset Game</button>
      </div>
    </div>
  );
}

export default App;
