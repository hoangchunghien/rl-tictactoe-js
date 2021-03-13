import { useState } from "react";
import { Row, Col } from "antd";

import Game from "./components/Game";
import { boardToString, checkGameover, initGame, move } from "./core/game";
import { RandomAgent, SarsaAgent } from "./core/agent";
import { select } from "weighted";
import { range, max } from "lodash";

import "./App.css";

const randomAgent = new RandomAgent();
const sarsaAgent = new SarsaAgent();
window.sarsaAgent = sarsaAgent;

function App() {
  const [game, setGame] = useState(initGame());
  const [episode, setEpisode] = useState(1000);
  const [t, setT] = useState(0);
  const [isTraining, setIsTraining] = useState(false);

  const onMove = (location) => {
    const state = move(game, location);

    const probs = sarsaAgent.policy(state);
    console.log("Q");
    console.log(sarsaAgent.Q[boardToString(state.board)]);
    console.log("A");
    console.log(probs);
    const action = probs.indexOf(max(probs));

    sarsaAgent.observe(state, action);
    const memory = sarsaAgent.episode;
    if (memory.length >= 2) {
      const record1 = memory[memory.length - 2];
      const record2 = memory[memory.length - 1];
      sarsaAgent.learn(record1[0], record1[1], record2[0], record2[1]);
    }

    if (state.gameover) {
      setGame(state);
      return;
    }

    const nextState = move(state, action);
    setGame(nextState);
  };

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
  };

  return (
    <div className="App">
      <Row justify="center" align="middle" gutter={[16, 16]}>
        <Col>
          <Game {...game} onMove={onMove} />
        </Col>
      </Row>

      <Row justify="center" align="middle" gutter={[16, 16]} style={{height: 60}}>
        <Col>
          <div>
            <button
              onClick={() => {
                setGame(initGame());
                sarsaAgent.newEpisode();
              }}
            >
              Reset Game
            </button>
          </div>
        </Col>
      </Row>

      <Row justify="center" align="middle">
        <Col>
          <div>
            Training Episodes ({t}/{episode})
          </div>
        </Col>
      </Row>

      <Row justify="center" align="middle">
        <Col>
          <div>
            <input
              value={episode}
              type="number"
              onChange={(e) => setEpisode(e.target.value)}
            />
          </div>
        </Col>
        <Col>
          <div>
            <button onClick={() => training(sarsaAgent)} disabled={isTraining}>
              Training
            </button>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default App;
