import React from "react";
import "./App.css";
import PathfindingVisualizer from "./MazeSolvingVisualizer/PathfindingVisualizer";
import { CSSTransition } from 'react-transition-group';

function App() {
  return (
    <div className="App" id="visualizer">
      <PathfindingVisualizer />
    </div>

  );
}

export default App;
