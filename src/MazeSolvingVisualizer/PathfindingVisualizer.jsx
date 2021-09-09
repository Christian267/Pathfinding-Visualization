import React, { Component } from "react";
import Node from "../components/Node/Node";
import {
  dijkstra,
  getNodesInShortestPathOrder,
} from "../algorithms/dijkstra2";
import Dropdown from "../components/Dropdown/Dropdown.jsx"
import "./PathfindingVisualizer.css";

const NUMROWS = 20;
const NUMCOLS = 50;

export default class PathFindingVisualizer extends Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.state = {
      grid: [],
      mouseIsPressed: false,
      disableButtonsAndGridWhileAnimating: false,
      holdingEndNode: false,
      startNode: {
        row: 10,
        col: 14
      },
      finishNode: {
        row: 10,
        col: 35
      },
      blockTypeToBePlaced: "Wall",
      algorithm: "Dijkstra",
      draggingStartNode: false,
      draggingFinishNode: false,
    };
    this.visualizeDijkstra = this.visualizeDijkstra.bind(this);
    this.clearGrid = this.clearGrid.bind(this);
    this.clearVisitedNodes = this.clearVisitedNodes.bind(this);
    this.saveWallsAndWeights = this.saveWallsAndWeights.bind(this);
    this.placeWallsAndWeights = this.placeWallsAndWeights.bind(this);
    this.handleChooseAlgorithm = this.handleChooseAlgorithm.bind(this);
    this.handleChooseBlockType = this.handleChooseBlockType.bind(this);
  }

  componentDidMount() {
    const grid = this.getEmptyGrid();
    this.setState((state) => ({
      grid: grid,
    }));
  }

  handleChooseAlgorithm(algorithm) {
    this.setState({
      algorithm: algorithm,
    });
  }

  handleChooseBlockType(blockType) {
    this.setState ({
      blockTypeToBePlaced: blockType,
    });
  }

  handleMouseDown(row, col) {
    const gridIsDisabled = this.state.disableButtonsAndGridWhileAnimating;
    if (gridIsDisabled) return;
    const startNode = this.state.startNode;
    const finishNode = this.state.finishNode;
    if (row === startNode.row && col === startNode.col) {
      this.setState({
        draggingStartNode: true,
        mouseIsPressed: true,
      });
    }
    else if (row === finishNode.row && col === finishNode.col){
      this.setState({
        draggingFinishNode: true,
        mouseIsPressed: true,
      });
    }
    else {
      const blockType = this.state.blockTypeToBePlaced
      if (blockType === "Wall"){
        const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
        this.setState({ 
          grid: newGrid, 
          mouseIsPressed: true });    
      }
      else if (blockType === "Weight") {
        const newGrid = getNewGridWithWeightToggled(this.state.grid, row, col, 0);
        this.setState({ 
          grid: newGrid, 
          mouseIsPressed: true });
        }
      }
  }
  handleMouseEnter(row, col) {
    const { grid } = this.state;
    const gridIsDisabled = this.state.disableButtonsAndGridWhileAnimating;
    if (gridIsDisabled) return;
    if(this.state.draggingStartNode) {
      const previousStartNode = this.state.startNode;
      const previousRow = previousStartNode.row;
      const previousCol = previousStartNode.col;
      grid[previousRow][previousCol].isStart = false;
      grid[row][col].isStart = true;
      setTimeout(() => {
        this.setState({
          grid: grid,
          startNode:{
            row: row,
            col: col,
          },
        })
      }, 0);
      setTimeout(() => {
        this.visualizeDijkstraNoAnimation();
      }, 0);
    }
    else if (this.state.draggingFinishNode) {
      const previousFinishNode = this.state.finishNode;
      const previousRow = previousFinishNode.row;
      const previousCol = previousFinishNode.col;
      grid[previousRow][previousCol].isFinish = false;
      grid[row][col].isFinish = true;
      setTimeout(() => {
        this.setState({
          grid: grid,
          finishNode:{
            row: row,
            col: col,
          },
        })
      }, 0);
      setTimeout(() => {
        this.visualizeDijkstraNoAnimation();
      }, 0);
    }
    else{
      if (!this.state.mouseIsPressed) return;
      const blockType = this.state.blockTypeToBePlaced;
      if (blockType === "Wall"){
        const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
        this.setState({ grid: newGrid,});
      }
      else if (blockType === "Weight") {
        const newGrid = getNewGridWithWeightToggled(this.state.grid, row, col, 0);
        this.setState({ grid: newGrid,});
      }
    }
  }

  handleMouseUp() {
    this.setState({ 
      mouseIsPressed: false,
      draggingStartNode: false,
      draggingFinishNode: false,
    });
  }

  animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
    const lastVisitedNode = visitedNodesInOrder.at(-1);
    const finishNode = this.state.finishNode;
    var loopLength = visitedNodesInOrder.length;
    if (lastVisitedNode.row === finishNode.row && lastVisitedNode.col === finishNode.col){
      loopLength--;
    }
    for (let i = 1; i <= loopLength; i++) {
      if (i === loopLength) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 15 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        const currentNodeElement = document.getElementById(`node-${node.row}-${node.col}`);
        currentNodeElement.className = node.weight===1
          ? `node node-visited`
          : `node node-visited node-weight-${node.weight}`;
      }, 15 * i);
    }
  }

  dijkstraNoAnimation(visitedNodesInOrder, nodesInShortestPathOrder) {
    const lastVisitedNode = visitedNodesInOrder.at(-1);
    const finishNode = this.state.finishNode;
    var loopLength = visitedNodesInOrder.length;
    if (lastVisitedNode.row === finishNode.row && lastVisitedNode.col === finishNode.col){
      loopLength--;
    }
    for (let i = 1; i <= loopLength; i++) {
      if (i === loopLength) {
        this.shortestPathNoAnimation(nodesInShortestPathOrder);
        return;
      }
      const node = visitedNodesInOrder[i];
      const currentNodeElement = document.getElementById(`node-${node.row}-${node.col}`);
      const nodeClassName = currentNodeElement.className;
      if(nodeClassName === `node node-visited` || 
         nodeClassName === `node node-visited node-weight ${node.weight}` ||
         nodeClassName === `node node-visited-no-animation`||
         nodeClassName === `node node-visited-no-animation node-weight-${node.weight}`) {
        continue;
      }
        currentNodeElement.className = node.weight===1
        ? `node node-visited-no-animation`
        : `node node-visited-no-animation node-weight-${node.weight}`;
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
      }, 15 * i);
    }
    setTimeout(() => {
      this.setState({disableButtonsAndGridWhileAnimating: false})
    }, 15 * nodesInShortestPathOrder.length);
  }

  shortestPathNoAnimation(nodesInShortestPathOrder) {
    for (let i = 1; i <= nodesInShortestPathOrder.length-2; i++) {
      const node = nodesInShortestPathOrder[i];
      const currentNodeElement = document.getElementById(
        `node-${node.row}-${node.col}`);
      currentNodeElement.className = node.weight===1
        ? `node node-shortest-path-no-animation`
        : `node node-shortest-path-no-animation node-weight-${node.weight}`;
  }
  }

  visualizeDijkstra() {
      const blockCoordinatesAndType = this.saveWallsAndWeights();
      setTimeout(() => {
        this.clearGrid()
        this.placeWallsAndWeights(blockCoordinatesAndType)
      }, 0);
    const { grid } = this.state;
    const startNodeRow = this.state.startNode.row;
    const startNodeCol = this.state.startNode.col;
    const finishNodeRow = this.state.finishNode.row;
    const finishNodeCol = this.state.finishNode.col;
    const startNode = grid[startNodeRow][startNodeCol]
    const finishNode = grid[finishNodeRow][finishNodeCol];
    setTimeout(() => {
      const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
      const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
      // this.setState({disableButtonsAndGridWhileAnimating: true});
      this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder)
    }, 0);
  }
    
  visualizeDijkstraNoAnimation(){
    setTimeout(() => {
      this.clearVisitedNodes()
      }, 0);
    setTimeout(() => {
      const { grid } = this.state;
      const startNodeRow = this.state.startNode.row;
      const startNodeCol = this.state.startNode.col;
      const finishNodeRow = this.state.finishNode.row;
      const finishNodeCol = this.state.finishNode.col;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
      const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode); // this is where the program freezes
      this.dijkstraNoAnimation(visitedNodesInOrder, nodesInShortestPathOrder)
    }, 0);
  }
  //saveWall() is used in visualizeDijkstra() to maintain walls when repeating animation
  saveWallsAndWeights() {
    var blockCoordinatesAndType = [];
    const { grid } = this.state;
    for (let row = 0; row < NUMROWS; row++) {
      for (let col = 0; col < NUMCOLS; col++) {
        if ((row === this.state.startNode.row && col === this.state.startNode.col) ||
        (row === this.state.finishNode.row && col === this.state.finishNode.col)){
            continue;
            }
        const currentNode = grid[row][col];
        if (currentNode.isWall) {
          blockCoordinatesAndType.push([row, col, 0]);
        }
        else if (currentNode.weight > 1){
          blockCoordinatesAndType.push([row, col, currentNode.weight]);
        }
      }
    }
    return blockCoordinatesAndType;  //[row, col, isWall]
  }

  placeWallsAndWeights(blockCoordinatesAndType) {
    var { grid } = this.state;
    for (let i = 0; i < blockCoordinatesAndType.length; i++) {
      const row = blockCoordinatesAndType[i][0];
      const col = blockCoordinatesAndType[i][1];
      const currentNode = grid[row][col];
      const currentNodeElement = document.getElementById(`node-${row}-${col}`);
      if (blockCoordinatesAndType[i][2] === 0){
        grid = getNewGridWithWallToggled(grid, row, col);
        currentNode.isWall = true; 
        currentNodeElement.className = `node node-wall`;
      }
      else {
        const weight = blockCoordinatesAndType[i][2];
        grid = getNewGridWithWeightToggled(grid, row, col, weight);
        currentNode.weight = weight;
        currentNodeElement.className = `node node-weight-${weight}`;
    
      }
    }
    this.setState({grid: grid})
  }

  clearVisitedNodes(){
    const { grid } = this.state;
    for (let row = 0; row < NUMROWS; row++) {
      for (let col = 0; col < NUMCOLS; col++) {
        const currentNode = grid[row][col];
        const currentNodeElement = document.getElementById(
          `node-${row}-${col}`
        );
        const className = currentNodeElement.className;
        if (currentNode.isVisited){
          currentNode.isVisited = false;
          currentNode.previousNode = null;
        }
        else {
          if (className === `node node-finish` &&
              row !== this.state.finishNode.row &&
              col !== this.state.finishNode.col){
                currentNodeElement.className = `node`;
              }
          if (className !== `node node-finish` &&
              className !== `node node-start` &&
              className !== `node node-wall` &&
              className !== `node node-weight-${currentNode.weight}` &&
              className !== `node node-visited node-weight-${currentNode.weight}`) {

              currentNodeElement.className = `node`;
              }
        }
        // if (className !== `node node-visited` &&
        //     className !== `node node-visited-no-animation` &&
        //     className !== `node node-shortest-path` &&
        //     className !== `node node-shortest-path-no-animation` &&
        //     className !== `node node-start` &&
        //     className !== `node node-finish` &&
        //     className !== `node node-wall` &&
        //     className !== `node node-weight-${currentNode.weight}`) {
        //   currentNodeElement.className = `node`;
        // }
      }
    }
    this.setState({
      grid: grid,
    });
  }

  clearGrid() {
    const grid = this.getEmptyGrid();
    for (let row = 0; row < NUMROWS; row++) {
      for (let col = 0; col < NUMCOLS; col++) {
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

    this.setState({
      grid: grid,
    });
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
    for (let row = 0; row < NUMROWS; row++) {
      const currentRow = [];
      for (let col = 0; col < NUMCOLS; col++) {
        currentRow.push(this.createNode(col, row));
      }
      grid.push(currentRow);
    }
    return grid;
  }

  
  render() {
    const { grid, mouseIsPressed } = this.state;
    const algorithmDropdownList = ["Dijkstra", "A Star", "Breadth First", "Depth First"];
    const blockDropdownList = ["Wall", "Weight"];
    const defaultDropdownTitles = ["Choose Algorithm", "Block Type"]
    return (
      <><div className="buttons">
          <button onClick={this.visualizeDijkstra} disabled={this.state.disableButtonsAndGridWhileAnimating}>Visual Algorithm</button>
          <button onClick={this.clearGrid} disabled={this.state.disableButtonsAndGridWhileAnimating}>Clear Grid</button>
          <Dropdown 
            key={1}
            handler={this.handleChooseAlgorithm} 
            listItems={algorithmDropdownList} 
            defaultTitle={defaultDropdownTitles[0]}
          />
          <Dropdown 
            key={2}
            handler={this.handleChooseBlockType} 
            listItems={blockDropdownList} 
            defaultTitle={defaultDropdownTitles[1]}
          />
          <button>{this.state.algorithm}</button>
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

const getNewGridWithWeightToggled = (grid, row, col, newWeight) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  var weight = node.weight + 1;
  if (node.weight === 4){
    weight = 1;
  }
  else if (newWeight > 0) {
    weight = newWeight;
  }
  const newNode = {
    ...node,
    isVisited: false,
    weight: weight,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};
