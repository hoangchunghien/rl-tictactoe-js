import { useState } from "react";
import { Row, Col, Card, InputNumber, Button, Table } from "antd";

import Game from "./components/Game";
import { boardToString, checkGameover, initGame, move, X, O } from "./core/game";
import { evaluate, PLAYLAST } from "./core/evaluation";
import { RandomAgent, SarsaAgent } from "./core/agent";
import { select } from "weighted";
import { range, max, map } from "lodash";

import "./App.css";

const randomAgent = new RandomAgent();
const sarsaAgent = new SarsaAgent();
window.sarsaAgent = sarsaAgent;

function App() {
  const [game, setGame] = useState(initGame());
  const [episode, setEpisode] = useState(1000);
  const [evaluateEpisode, setEvaluateEpisode] = useState(1000);

  const [t, setT] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingResults, setTraningResults] = useState([]);
  const [evaluateResults, setEvaluateResults] = useState([]);

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
    const result = { win: 0, lose: 0, draw: 0, total: episode }
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

        state = nextState;
        action = nextAction;
        if (done) {
          break;
        }
      }

      if (state.winner) {
        if (state.winner == O) {
          result.win += 1;
        } else {
          result.lose += 1;
        }
      } else {
        result.draw += 1;
      }
    }

    setTraningResults([result, ...trainingResults]);

    setIsTraining(false);
  };

  const evaluateAgent = (agent) => {
    const result = evaluate({ agent, againstAgent: randomAgent, playType: PLAYLAST, episodes: evaluateEpisode });
    setEvaluateResults([result, ...evaluateResults]);
  }

  return (
    <div className="App">
      <Row justify="center" align="stretch" gutter={[16, 16]}>
        <Col>
          <Card style={{ width: 360, height: "100%" }} title="SETTINGS">
            <Row>
              <Col><div className="status">Player <b style={{border: "solid 1px", padding: "3px"}}>X</b></div></Col>
              <Col></Col>
            </Row>

            <Row>
              <Col><div className="status">Player <b style={{border: "solid 1px", padding: "3px"}}>O</b></div></Col>
            </Row>
          </Card>
        </Col>
        <Col>
          <Card style={{ width: 360 }}>
            <Row justify="center" align="middle" gutter={[16, 16]}>
              <Col>
                <Game {...game} onMove={onMove} />
              </Col>
            </Row>

            <Row
              justify="center"
              align="middle"
              gutter={[16, 16]}
              style={{ height: 60 }}
            >
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
          </Card>
        </Col>
      </Row>

      <Row justify="center" align="stretch" gutter={[16, 16]} style={{marginTop: "16px"}}>
        <Col>
          <Card title="TRAINING" style={{ width: 360 }}>
            <Row justify="center" align="middle" gutter={[8, 8]}>
              <Col>Episodes</Col>
              <Col>
                <div>
                  <InputNumber
                    value={episode}
                    type="number"
                    onChange={(e) => setEpisode(e)}
                  />
                </div>
              </Col>
              <Col>
                <div>
                  <Button
                    type="primary"
                    onClick={() => training(sarsaAgent)}
                    disabled={isTraining}
                  >
                    Simulate
                  </Button>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col>
                <Table
                  columns={[
                    { title: "#", dataIndex: "index", key: "index" },
                    { title: "Win", dataIndex: "win", key: "win" },
                    { title: "Lose", dataIndex: "lose", key: "lose" },
                    { title: "Draw", dataIndex: "draw", key: "draw" },
                    { title: "Total", dataIndex: "total", key: "total"},
                  ]}
                  dataSource={map(trainingResults, (it, index) => ({...it, index}))}
                  pagination={{pageSize: 3}}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col>
          <Card title="EVALUATE" style={{ width: 360 }}>
            <Row justify="center" align="middle" gutter={[8, 8]}>
              <Col>Episodes</Col>
              <Col>
                <div>
                  <InputNumber
                    value={evaluateEpisode}
                    type="number"
                    onChange={(e) => setEvaluateEpisode(e)}
                  />
                </div>
              </Col>
              <Col>
                <div>
                  <Button
                    type="primary"
                    onClick={() => evaluateAgent(sarsaAgent)}
                  >
                    Evaluate
                  </Button>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col>
                <Table
                  columns={[
                    { title: "#", dataIndex: "index", key: "index" },
                    { title: "Win", dataIndex: "win", key: "win" },
                    { title: "Lose", dataIndex: "lose", key: "lose" },
                    { title: "Draw", dataIndex: "draw", key: "draw" },
                    { title: "Total", dataIndex: "total", key: "total"},
                  ]}
                  dataSource={map(evaluateResults, (it, index) => ({...it, index}))}
                  pagination={{pageSize: 3, hideOnSinglePage: true, showLessItems: true}}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default App;
