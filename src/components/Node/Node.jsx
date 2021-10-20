import React, { Component } from "react";

import "./Node.css";

export default class Node extends Component {
  constructor(props) {
    super(props);
    this.state = {
      col: this.props.col,
      isFinish: this.props.isFinish,
      isStart: this.props.isStart,
      isWall: this.props.isWall,
      weight: this.props.weight,
      row: this.props.row,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if(props.isFinish && props.isFinish != state.isFinish || props.isStart || props.isWall || props.weight) {
      return {
        isFinish: props.isFinish,
        isStart: props.isStart,
        isWall: props.isWall,
        weight: props.weight
      }
    }
  }

  render() {
    const {
      col,
      isFinish,
      isStart,
      isWall,
      weight,
      onMouseDown,
      onMouseEnter,
      onMouseUp,
      row,
    } = this.props;
    const extraClassName = this.state.isFinish
      ? "node-finish"
      : this.state.isStart
      ? "node-start"
      : this.state.isWall
      ? "node-wall"
      : this.state.weight === 4
      ? "node-weight-4"
      : this.state.weight === 3
      ? "node-weight-3"
      : this.state.weight === 2
      ? "node-weight-2"
      : "";

    return (
      <div
        id={`node-${row}-${col}`}
        className={`node ${extraClassName}`}
        onMouseDown={() => onMouseDown(row, col)}
        onMouseEnter={() => onMouseEnter(row, col)}
        onMouseUp={() => onMouseUp()}
      />
    );
  }
}
