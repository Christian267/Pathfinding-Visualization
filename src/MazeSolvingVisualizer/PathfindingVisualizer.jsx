import React, { Component } from "react";
import Node from "./Node/Node";
import {
  dijkstra,
  getNodesInShortestPathOrder,
} from "../algorithms/dijkstra";
import Dropdown from "../components/Dropdown"
import "./PathfindingVisualizer.css";

export default class PathFindingVisualizer extends Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.state = {
      grid: [],
      mouseIsPressed: false,
      disableButtonsWhileAnimating: false,
      holdingEndNode: false,
      startNode: {
        row: 10,
        col: 14
      },
      finishNode: {
        row: 10,
        col: 35
      },
      blockTypeToBePlaced: "weight"
    };
    this.visualizeDijkstra = this.visualizeDijkstra.bind(this);
    this.clearGrid = this.clearGrid.bind(this);
    this.saveWalls = this.saveWalls.bind(this);
    this.placeWalls = this.placeWalls.bind(this);
  }

  componentDidMount() {
    const grid = this.getEmptyGrid();
    this.setState((state) => ({
      grid: grid,
    }));
  }

  handleMouseDown(row, col) {
    const blockType = this.state.blockTypeToBePlaced
    if (blockType === "wall"){
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({ grid: newGrid, mouseIsPressed: true });    
    }
    else if (blockType === "weight") {
      const newGrid = getNewGridWithWeightToggled(this.state.grid, row, col);
      this.setState({ grid: newGrid });
      }
  }
  handleMouseEnter(row, col) {
    if (!this.state.mouseIsPressed) return;
    const blockType = this.state.blockTypeToBePlaced
    if (blockType === "wall"){
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({ grid: newGrid });
    }
    else if (blockType === "weight") {
      const newGrid = getNewGridWithWeightToggled(this.state.grid, row, col);
      this.setState({ grid: newGrid });
    }
  }

  handleMouseUp() {
    this.setState({ mouseIsPressed: false });
  }

  animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
    const { grid } = this.state;
    for (let i = 1; i <= visitedNodesInOrder.length - 1; i++) {
      if (i === visitedNodesInOrder.length - 1) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 5 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        const weight = node.weight;
        const currentNodeElement = document.getElementById(`node-${node.row}-${node.col}`);
        currentNodeElement.className = node.weight===1
          ? `node node-visited`
          : `node node-visited node-weight-${node.weight}`;
      }, 5 * i);
    }
  }

  animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 1; i < nodesInShortestPathOrder.length-1; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        const currentNodeElement = document.getElementById(
          `node-${node.row}-${node.col}`);
        currentNodeElement.className = node.weight===1
          ? `node node-shortest-path`
          : `node node-shortest-path node-weight-${node.weight}`;
      }, 30 * i);
    }
    setTimeout(() => {
      this.setState({disableButtonsWhileAnimating: false})
    }, 30 * nodesInShortestPathOrder.length);
  }

  visualizeDijkstra() {
    const wallCoordinates = this.saveWalls()
    setTimeout(() => {
      this.clearGrid()
      this.placeWalls(wallCoordinates)
    }, 0);
    const { grid } = this.state;
    const startNodeRow = this.state.startNode.row;
    const startNodeCol = this.state.startNode.col;
    const finishNodeRow = this.state.finishNode.row;
    const finishNodeCol = this.state.finishNode.col;
    const startNode = grid[startNodeRow][startNodeCol]
    const finishNode = grid[finishNodeRow][finishNodeCol];
    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    this.setState({disableButtonsWhileAnimating: true});
    setTimeout(() => {
      this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder)
    }, 0);
  }


  //saveWall() is used in visualizeDijkstra() to maintain walls when repeating animation
  saveWalls() {
    var wallCoordinates = [];
    const { grid } = this.state;
    var count = 0;
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
      const newGrid = getNewGridWithWallToggled(grid, row, col);
      this.setState({grid: newGrid});
      
      const currentNode = grid[row][col];
      currentNode.isWall = true; 
      const currentNodeElement = document.getElementById(`node-${row}-${col}`);
      currentNodeElement.className = `node ${"node-wall"}`;
    }
  }

  clearGrid() {
    const grid = this.getEmptyGrid();
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 50; col++) {
        const currentNode = this.createNode(col, row);
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

  createNode = (col, row) => {
    return {
      col,
      row,
      isStart: row === this.state.startNode.row && col === this.state.startNode.col,
      isFinish: row === this.state.finishNode.row && col === this.state.finishNode.col,
      distance: Infinity,
      weight: 1,
      isVisited: false,
      isWall: false,
      previousNode: null,
    };
  }

  getEmptyGrid = () => {
    const grid = [];
    for (let row = 0; row < 20; row++) {
      const currentRow = [];
      for (let col = 0; col < 50; col++) {
        currentRow.push(this.createNode(col, row));
      }
      grid.push(currentRow);
    }
    return grid;
  }

  render() {
    const { grid, mouseIsPressed } = this.state;

    return (
      <><div className="buttons">
          <button onClick={this.visualizeDijkstra} disabled={this.state.disableButtonsWhileAnimating}>Visual Algorithm</button>
          <button onClick={this.clearGrid} disabled={this.state.disableButtonsWhileAnimating}>Clear Grid</button>
          <Dropdown></Dropdown>
        </div>
        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx}>
                {row.map((node, nodeIdx) => {
                  const { row, col, isFinish, isStart, isWall, weight } = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      row={row}
                      isFinish={isFinish}
                      isStart={isStart}
                      isWall={isWall}
                      weight={weight}
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

const getNewGridWithWeightToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  var weight = node.weight + 1;
  if (node.weight >= 4){
    weight = 4;
  }
  const newNode = {
    ...node,
    isVisited: false,
    weight: weight,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};
