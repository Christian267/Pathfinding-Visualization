import React, { Component } from "react";
import Node from "./Node/Node";
import {
  dijkstra,
  getNodesInShortestPathOrder,
  clearNodes,
} from "../algorithms/dijkstra";

import "./MazeSolvingVisualizer.css";

const START_NODE_ROW = 10;
const START_NODE_COL = 15;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 35;

export default class MazeSolvingVisualizer extends Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.clearGridButtonRef= React.createRef();
    this.state = {
      grid: [],
      mouseIsPressed: false,
      disableButtonsWhileAnimating: false,
    };
    this.visualizeDijkstra = this.visualizeDijkstra.bind(this);
    this.clearGrid = this.clearGrid.bind(this);
    this.saveWalls = this.saveWalls.bind(this);
    this.placeWalls = this.placeWalls.bind(this);
  }

  componentDidMount() {
    const grid = getInitialGrid();
    this.setState((state) => ({
      grid: grid,
    }));
  }

  handleMouseDown(row, col) {
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({ grid: newGrid, mouseIsPressed: true });
  }
  handleMouseEnter(row, col) {
    if (!this.state.mouseIsPressed) return;
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({ grid: newGrid });
  }

  handleMouseUp() {
    this.setState({ mouseIsPressed: false });
  }

  animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
    const { grid } = this.state;
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 20 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-visited";
      }, 20 * i);
    }
  }

  animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        document.getElementById(
          `node-${node.row}-${node.col}`
        ).className = `node node-shortest-path`;
      }, 50 * i);
    }
    setTimeout(() => {
      this.setState({disableButtonsWhileAnimating: false})
    }, 50 * nodesInShortestPathOrder.length);
  }

  visualizeDijkstra() {
    const wallCoordinates = this.saveWalls();
    this.clearGrid();
    this.placeWalls(wallCoordinates);
    const { grid } = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    this.setState({disableButtonsWhileAnimating: true});
    this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
  }


  //saveWall() is used in visualizeDijkstra() to maintain walls when repeating animation
  saveWalls() {
    var wallCoordinates = [];
    const { grid } = this.state;
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 50; col++) {
        const currentNode = grid[row][col];
        if (currentNode.isWall) {
          wallCoordinates.push([row, col]);
        }
      }
    }
    return wallCoordinates;
  }

  placeWalls(wallCoordinates) {
    const { grid } = this.state;
    for (let i = 0; i < wallCoordinates.length; i++) {
      const row = wallCoordinates[i][0];
      const col = wallCoordinates[i][1];
      getNewGridWithWallToggled(grid, row, col);
      const newGrid = getNewGridWithWallToggled(grid, row, col);
      this.setState((state) => ({
        grid: grid,
      }));
      /* 
      const currentNode = grid[row][col];
      currentNode.isWall = true; */
      const currentNodeElement = document.getElementById(`node-${row}-${col}`);
      currentNodeElement.className = `node ${"node-wall"}`;
    }
  }

  clearGrid() {
    const grid = getInitialGrid();
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 50; col++) {
        const currentNode = createNode(col, row);
        const currentNodeElement = document.getElementById(
          `node-${row}-${col}`
        );
        const extraClassName = currentNode.isFinish
          ? "node-finish"
          : currentNode.isStart
          ? "node-start"
          : currentNode.isWall
          ? "node-wall"
          : "node";
        currentNodeElement.className = `node ${extraClassName}`;
      }
    }

    this.setState((state) => ({
      grid: grid,
    }));
  }

  render() {
    const { grid, mouseIsPressed } = this.state;

    return (
      <><div className="buttons">
          <button onClick={this.visualizeDijkstra} disabled={this.state.disableButtonsWhileAnimating}>Visual Algorithm</button>
          <button onClick={this.clearGrid} disabled={this.state.disableButtonsWhileAnimating}>Clear Grid</button>
          <div className='dropdown'>
            <button id="algorithmMenu" className="algorithmMenu">Choose Algorithm</button>
            <div className="dropdownContent">
              <a value="">Dijkstra</a>
              <a value="">A Star</a>
              <a value="">Breadth First</a>
              <a value="">Depth First</a>
            </div>
          </div>
        </div>
        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx}>
                {row.map((node, nodeIdx) => {
                  const { row, col, isFinish, isStart, isWall } = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      row={row}
                      isFinish={isFinish}
                      isStart={isStart}
                      isWall={isWall}
                      mouseIsPressed={mouseIsPressed}
                      onMouseDown={this.handleMouseDown.bind(this, row, col)}
                      onMouseEnter={this.handleMouseEnter.bind(this, row, col)}
                      onMouseUp={this.handleMouseUp.bind(this)}
                      ref={this.ref}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </>
    );
  }
}

const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < 20; row++) {
    const currentRow = [];
    for (let col = 0; col < 50; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row) => {
  return {
    col,
    row,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isVisited: false,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};
