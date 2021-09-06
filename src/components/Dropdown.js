import React, { Component } from "react";

import "./Dropdown.css";

export default class Dropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
      return (
        <div className='dropdown'>
            <button id="algorithmMenu" className="algorithmMenu">Choose Algorithm</button>
            <div className="dropdownContent">
                <a value="">Dijkstra</a>
                <a value="">A Star</a>
                <a value="">Breadth First</a>
                <a value="">Depth First</a>
            </div>
        </div>
      )
  }
}