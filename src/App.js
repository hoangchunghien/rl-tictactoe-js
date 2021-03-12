import { useState } from 'react';

import Game from './components/Game';
import { initGame, move } from './core/game';

import './App.css';

function App() {
  const [game, setGame] = useState(initGame())

  const onMove = (location) => {
    const nextState = move(game, location);
    setGame(nextState);
  }

  return (
    <div className="App">
      <Game {...game} onMove={onMove} />
    </div>
  );
}

export default App;
