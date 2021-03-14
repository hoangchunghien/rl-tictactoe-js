import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  InputNumber,
  Button,
  Table,
  Select,
  Divider,
  Switch,
} from "antd";

import Game from "./components/Game";
import {
  boardToString,
  checkGameover,
  initGame,
  move,
  X,
  O,
} from "./core/game";
import { evaluate, train, PLAYLAST, PLAYFIRST } from "./core/evaluation";
import { RandomAgent, SarsaAgent } from "./core/agent";
import { select } from "weighted";
import { range, filter, map, max, find } from "lodash";

import "./App.css";

const { Option } = Select;

const randomAgent = new RandomAgent({ player: X });
const sarsaAgent = new SarsaAgent({});
window.sarsaAgent = sarsaAgent;

const player1Agents = [
  { title: "Random Agent", agent: new RandomAgent({ player: X }) },
  { title: "Sarsa Agent", agent: new SarsaAgent({ player: X }) },
];

const player2Agents = [
  { title: "Random Agent", agent: new RandomAgent({ player: O }) },
  { title: "Sarsa Agent", agent: new SarsaAgent({ player: O }) },
];

function App() {
  const [game, setGame] = useState(initGame());
  const [episode, setEpisode] = useState(1000);
  const [evaluateEpisode, setEvaluateEpisode] = useState(1000);

  const [t, setT] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingResults, setTraningResults] = useState([]);
  const [evaluateResults, setEvaluateResults] = useState([]);

  const [player1, setPlayer1] = useState({
    agent: player1Agents[1],
    playmode: false,
  });
  const [player2, setPlayer2] = useState({
    agent: player2Agents[1],
    playmode: true,
  });

  const [evaluateBoard, setEvaluateBoard] = useState(
    map(range(0, 9), () => null)
  );
  const [bestAction, setBestAction] = useState(null);

  useEffect(() => {
    const { turn } = game;
    let currentPlayer = null;
    if (turn === X) {
      currentPlayer = player1;
    } else {
      currentPlayer = player2;
    }

    if (currentPlayer.playmode) {
      const {
        agent: { agent },
      } = currentPlayer;
      let probs = agent.policy(game);
      const maxProb = max(probs);
      probs = map(probs, (it, index) => ({ index, prob: it }));
      let action = select(filter(probs, (it) => it.prob == maxProb));
      action = action.index;

      console.log("Q");
      console.log(agent.Q && agent.Q[boardToString(game.board)]);
      console.log("A");
      console.log(probs);

      agent.observe(game, action);
      agent.learn();

      if (!game.gameover) {
        const state = move(game, action);
        setGame(state);
        setEvaluateBoard(map(range(0, 9), () => null))
      }
    }
  });

  const onMove = (location) => {
    const state = move(game, location);
    setGame(state);
  };

  const training = (agent) => {
    setIsTraining(true);
    const result = train({
      agent: player2.agent.agent,
      againstAgent: player1.agent.agent,
      playType: PLAYLAST,
      episodes: episode,
    });

    setTraningResults([result, ...trainingResults]);

    setIsTraining(false);
  };

  const evaluateAgent = (agent) => {
    const result = evaluate({
      agent,
      againstAgent: randomAgent,
      playType: PLAYLAST,
      episodes: evaluateEpisode,
    });
    setEvaluateResults([result, ...evaluateResults]);
  };

  const evaluateMove = (agent) => {
    let score = agent.policy(game);
    if (agent.Q) {
      score = agent.Q[boardToString(game.board)];
    }
    setEvaluateBoard(score);

    let probs = agent.policy(game);
    const maxProb = max(probs);
    probs = map(probs, (it, index) => ({ index, prob: it }));
    let action = select(filter(probs, (it) => it.prob == maxProb));
    action = action.index;
    setBestAction(action);
  };

  return (
    <div className="App">
      <Row justify="center" align="stretch" gutter={[16, 16]}>
        <Col>
          <Card style={{ width: 420, height: "100%" }} title="SETTINGS">
            <Row gutter={[16, 16]} align="stretch">
              <Col md={8}>
                <div className="status">
                  Player{" "}
                  <b style={{ border: "solid 1px", padding: "1px" }}>X</b>
                </div>
              </Col>
              <Col md={16}>
                <div>
                  <Select
                    defaultValue={player1.agent.title}
                    style={{ minWidth: "100%" }}
                    onChange={(value) =>
                      setPlayer1({
                        ...player1,
                        agent: find(player1Agents, { title: value }),
                      })
                    }
                  >
                    {map(player1Agents, ({ title }, ix) => (
                      <Option key={ix} value={title}>
                        {title}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>
            </Row>

            <Row>
              <Col md={8}></Col>
              <Col md={16}>
                <Row gutter={[8, 8]} justify="space-between">
                  <Col>
                    <Row gutter={8}>
                      <Col>Auto</Col>
                      <Col>
                        <Switch
                          size="small"
                          checked={player1.playmode}
                          onChange={(e) =>
                            setPlayer1({ ...player1, playmode: e })
                          }
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col>
                    <Button
                      size="small"
                      disabled={player1.playmode}
                      onClick={() => evaluateMove(player1.agent.agent)}
                    >
                      Evaluate action
                    </Button>
                  </Col>
                </Row>
                <Row></Row>
              </Col>
            </Row>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col md={8}>
                <div className="status">
                  Player{" "}
                  <b style={{ border: "solid 1px", padding: "1px" }}>O</b>
                </div>
              </Col>

              <Col md={16}>
                <Select
                  defaultValue={player2.agent.title}
                  style={{ minWidth: "100%" }}
                  onChange={(value) =>
                    setPlayer2({
                      ...player2,
                      agent: find(player2Agents, { title: value }),
                    })
                  }
                >
                  {map(player2Agents, ({ title }, ix) => (
                    <Option key={ix} value={title}>
                      {title}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>

            <Row>
              <Col md={8}></Col>
              <Col md={16}>
                <Row gutter={[8, 8]} justify="space-between">
                  <Col>
                    <Row gutter={8}>
                      <Col>Auto</Col>
                      <Col>
                        <Switch
                          size="small"
                          checked={player2.playmode}
                          onChange={(e) =>
                            setPlayer2({ ...player2, playmode: e })
                          }
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col>
                    <Button size="small" disabled={player2.playmode} onClick={() => evaluateMove(player2.agent.agent)}>
                      Evaluate action
                    </Button>
                  </Col>
                </Row>
                <Row></Row>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col>
          <Card style={{ width: 420 }}>
            <Row justify="center" align="middle" gutter={[16, 16]}>
              <Col>
                <Game {...game} onMove={onMove} evaluateBoard={evaluateBoard} bestAction={bestAction} />
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
                      player1.agent.agent.newEpisode();
                      player2.agent.agent.newEpisode();
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

      <Row
        justify="center"
        align="stretch"
        gutter={[16, 16]}
        style={{ marginTop: "16px" }}
      >
        <Col>
          <Card title="TRAINING" style={{ width: 420 }}>
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
                    { title: "Total", dataIndex: "total", key: "total" },
                  ]}
                  dataSource={map(trainingResults, (it, index) => ({
                    ...it,
                    index,
                  }))}
                  pagination={{
                    pageSize: 3,
                    hideOnSinglePage: true,
                    showLessItems: true,
                  }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col>
          <Card title="EVALUATE" style={{ width: 420 }}>
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
                    { title: "Total", dataIndex: "total", key: "total" },
                  ]}
                  dataSource={map(evaluateResults, (it, index) => ({
                    ...it,
                    index,
                  }))}
                  pagination={{
                    pageSize: 3,
                    hideOnSinglePage: true,
                    showLessItems: true,
                  }}
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
