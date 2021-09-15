import React, { Component } from "react";
import Node from "../components/Node/Node";
import {
  dijkstra,
  getNodesInShortestPathOrder,
} from "../algorithms/dijkstra2";
import { aStar } from "../algorithms/aStar";
import { depthFirstSearch } from "../algorithms/depthFirst";
import { breadthFirstSearch } from "../algorithms/breadthFirst";
import { mazeAlgorithm } from "../algorithms/mazeGeneratorOLD";
import DropdownMenu from "../components/DropdownMenu/DropdownMenu.jsx";
import "./PathfindingVisualizer.css";

const NUMROWS = 31;
const NUMCOLS = 60;

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
        row: 14,
        col: 19
      },
      finishNode: {
        row: 14,
        col: 40
      },
      blockTypeToBePlaced: "Wall",
      algorithm: "Dijkstra",
      draggingStartNode: false,
      draggingFinishNode: false,
      algorithmAlreadyVisualized: false,
    };
    this.visualizeAlgorithm = this.visualizeAlgorithm.bind(this);
    this.clearGrid = this.clearGrid.bind(this);
    this.clearVisitedNodes = this.clearVisitedNodes.bind(this);
    this.saveWallsAndWeights = this.saveWallsAndWeights.bind(this);
    this.placeWallsAndWeights = this.placeWallsAndWeights.bind(this);
    this.handleChooseAlgorithm = this.handleChooseAlgorithm.bind(this);
    this.handleChooseBlockType = this.handleChooseBlockType.bind(this);
    this.fillGridWithWalls = this.fillGridWithWalls.bind(this);
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
    if(this.state.draggingStartNode && 
       grid[row][col].isWall === false &&
       grid[row][col].isFinish === false) {
      const previousStartNode = this.state.startNode;
      const newNode = grid[row][col];
      const newNodeElement = document.getElementById(`node-${newNode.row}-${newNode.col}`);
      const previousRow = previousStartNode.row;
      const previousCol = previousStartNode.col;
      const previousNodeElement = document.getElementById(`node-${previousRow}-${previousCol}`);

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
        if (this.state.algorithmAlreadyVisualized) {
          previousNodeElement.className = `node node-visited-no-animation`;
          this.visualizeNoAnimation();
        }
        else this.clearStartAndFinishDuplicates();
        newNodeElement.className = `node node-start`;
        
      }, 0);
    }
    else if (this.state.draggingFinishNode && grid[row][col].isWall === false) {
      const previousFinishNode = this.state.finishNode;
      const newNode = grid[row][col];
      const newNodeElement = document.getElementById(`node-${newNode.row}-${newNode.col}`);
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
        if (this.state.algorithmAlreadyVisualized) this.visualizeNoAnimation();
        this.clearStartAndFinishDuplicates();
        newNodeElement.className = `node node-finish`
      }, 0);
    }
    else if (!this.state.draggingFinishNode && !this.state.draggingStartNode) {
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

  animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder) {
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
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        const currentNodeElement = document.getElementById(`node-${node.row}-${node.col}`);
        currentNodeElement.className = node.weight===1
          ? `node node-visited`
          : `node node-visited node-weight-${node.weight}`;
      }, 10 * i);
    }
  }

  algorithmNoAnimation(visitedNodesInOrder, nodesInShortestPathOrder) {
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

  /**
   * Called when the "Visualize Algorithm" button on the UI is clicked.
   */
  visualizeAlgorithm() {
    const blockCoordinatesAndType = this.saveWallsAndWeights();
    setTimeout(() => {
    this.clearVisitedNodes()
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
    const algorithm = this.state.algorithm;
    var visitedNodesInOrder = [];
    setTimeout(() => {
      if (algorithm === "Dijkstra") visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
      else if (algorithm === "A Star") visitedNodesInOrder = aStar(grid, startNode, finishNode);
      else if (algorithm === "Breadth First") visitedNodesInOrder = breadthFirstSearch(grid, startNode, finishNode);
      else if(algorithm === "Depth First") visitedNodesInOrder = depthFirstSearch(grid, startNode);
      const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
      this.setState({
      algorithmAlreadyVisualized: true,
      disableButtonsAndGridWhileAnimating: true});
      this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder)
    }, 0);
  }

  /**
   * Called in handleMouseEnter() when the either endpoint is dragged and an algorithm has already been visualized
   * Utilized when dragging endpoints on the grid to quickly update the pathFinding algorithm 
   * visualization without re-animating the algorithm
   */
  visualizeNoAnimation(){
    setTimeout(() => {
      this.resetNodeProperties();
      }, 0);
      setTimeout(() => {
        const { grid } = this.state;  
      const startNodeRow = this.state.startNode.row;
      const startNodeCol = this.state.startNode.col;
      const finishNodeRow = this.state.finishNode.row;
      const finishNodeCol = this.state.finishNode.col;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      var visitedNodesInOrder = null;
      const algorithm = this.state.algorithm;
      this.clearVisitedNodes();
      if (algorithm === "Dijkstra") visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
      else if (algorithm === "A Star") visitedNodesInOrder = aStar(grid, startNode, finishNode);
      else if (algorithm === "Breadth First") visitedNodesInOrder = breadthFirstSearch(grid, startNode, finishNode);
      else if(algorithm === "Depth First") visitedNodesInOrder = depthFirstSearch(grid, startNode);
      const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
      this.algorithmNoAnimation(visitedNodesInOrder, nodesInShortestPathOrder);
    }, 0);
  }

  /**
   * Utilized in visualizeAlgorithm() to maintain walls when repeating animation
   * @return {Array[Array[int][int][int]]} [[row, col]][weight]
   */
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

  /**
   * Utilized in visualizeAlgorithm() to maintain walls and weights in conjunction with 
   * saveWallsAndWeights() after clearGrid() is called. 
   * @param {Array[Array[int][int]][int]} blockCoordinatesAndType 
   */
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

  /**
   * Clears only visited nodes that become unvisited when an endpoint is dragged.
   * Utilized in visualizeNoAnimation() for its improved rendering efficiency
   * over clearGrid()
   */
  clearVisitedNodes(){
    const { grid } = this.state;
    for (let row = 0; row < NUMROWS; row++) {
      for (let col = 0; col < NUMCOLS; col++) {
        const currentNode = grid[row][col];
        const currentNodeElement = document.getElementById(
          `node-${row}-${col}`
        );
        const className = currentNodeElement.className;
        const startNode = this.state.startNode;
        if (className === `node node-start` && (row !== startNode.row || col !== startNode.col)){
          currentNodeElement.className = `node`;
        }

        if (currentNode.isVisited){
          currentNode.isVisited = false;
          if (currentNode.weight > 1 && !(currentNode.isStart || currentNode.isFinish)){
            currentNodeElement.className = currentNodeElement.className + `node-weight-${currentNode.weight}`;
          }
        }
        else {
          if (className === `node node-finish` &&
              row !== this.state.finishNode.row &&
              col !== this.state.finishNode.col){
                currentNodeElement.className = `node`;
              }
          if (className === `node node-visited-no-animation node-weight-${currentNode.weight}`) {
            currentNodeElement.className = `node node-weight-${currentNode.weight}`;
          }
          if (className !== `node node-start` &&
              className !== `node node-finish` &&
              className !== `node node-wall` &&
              className !== `node node-weight-${currentNode.weight}` &&
              className !== `node node-visited node-weight-${currentNode.weight}`&&
              className !== `node node-visited-no-animation node-weight-${currentNode.weight}`) {
              currentNodeElement.className = `node`;
            }
          }
      }
    }
    this.setState({
      grid: grid,
    });
  }

  /**
   * Used in visualizeNoAlgorithm() to allow dijkstra's algorithm to run with the 
   * new start and end nodes.
   */
  resetNodeProperties(){
    const { grid } = this.state;
    for (let row = 0; row < NUMROWS; row++) {
      for (let col = 0; col < NUMCOLS; col++) {
        const currentNode = grid[row][col];
        currentNode.isVisited = false;
        currentNode.previousNode = null;
      }
    }
  }
  
  /**
   * Used in handleMouseEnter(), removes duplicate start/end nodes
   * that appear when dragging the endpoints to quickly on empty grid.
     */
  clearStartAndFinishDuplicates(){
    for (let row = 0; row < NUMROWS; row++) {
      for (let col = 0; col < NUMCOLS; col++) {
        const currentNodeElement = document.getElementById(
          `node-${row}-${col}`
        );
        const startNode = this.state.startNode;
        const finishNode = this.state.finishNode;
        const className = currentNodeElement.className;
        if (className === `node node-start` &&
            (row !== startNode.row || col !== startNode.col )) {
              currentNodeElement.className = `node`;
        }
        if (className === `node node-finish` &&
        (row !== finishNode.row || col !== finishNode.col )) {
          currentNodeElement.className = `node`;
        }
      }
    }
  }

  /**
   * Used in visualizeAlgorithm dijkstra() with animation and Clear Grid button on the UI.
   */
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
      algorithmAlreadyVisualized: false,
    });

  }

  fillGridWithWalls() {
    setTimeout(() => {
    this.clearGrid();
      }, 0);
    setTimeout(() => {
    const { grid } = this.state;
    this.setState({disableButtonsAndGridWhileAnimating: true});
    const visitedWallInOrder = mazeAlgorithm(grid, grid[1][0]);
    this.placeFillerWalls(visitedWallInOrder);
    }, 0);
  }

  placeFillerWalls(visitedWallsInOrder) { 
    for (let i = 0; i < visitedWallsInOrder.length; i++) {
      setTimeout(() => {
      const currentNode = visitedWallsInOrder[i];
      const currentNodeElement = document.getElementById(
        `node-${currentNode.row}-${currentNode.col}`
      );
      currentNodeElement.className = `node node-wall`;
      }, i * 40);
    }
    setTimeout(() => {
      this.setState({disableButtonsAndGridWhileAnimating: false});
    }, 40 * visitedWallsInOrder.length);
  }
  /**
   * Utilized to create unaltered Nodes during the creation of the grid in getEmptyGrid() and
   * during the clearing of the grid in clearGrid().
   * @param {int} col 
   * @param {int} row 
   * @returns {Node}
   */
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

  /**
   * Construct a default grid object with unaltered Nodes.
   * @returns {grid}
   */
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
          <button onClick={this.visualizeAlgorithm} disabled={this.state.disableButtonsAndGridWhileAnimating}>Visualize Algorithm</button>
          <button onClick={this.clearGrid} disabled={this.state.disableButtonsAndGridWhileAnimating}>Clear Grid</button>
          <DropdownMenu 
            key={1}
            handler={this.handleChooseAlgorithm} 
            listItems={algorithmDropdownList} 
            defaultTitle={defaultDropdownTitles[0]}
            extraClassName={"algorithms"}
          />
          <DropdownMenu
            key={2}
            handler={this.handleChooseBlockType} 
            listItems={blockDropdownList} 
            defaultTitle={defaultDropdownTitles[1]}            
            extraClassName={"blocks"}

          />
          <button onClick={this.fillGridWithWalls} disabled={this.state.disableButtonsAndGridWhileAnimating}>Fill Grid</button>
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
    weight: weight,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};
