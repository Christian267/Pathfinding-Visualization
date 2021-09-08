import React, { Component } from "react";

import "./Dropdown.css";

export default class Dropdown extends Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.state = {
      menuText: this.props.defaultTitle,
    };
 
  }
  
  changeMenuText(algorithm) {
    this.setState({menuText: algorithm});
  }

  handlerAndMenuText(algorithm) {
    this.changeMenuText(algorithm);
    this.props.handler(algorithm);
  }


  render() {
      var items = this.props.listItems.map((item, index) =>
      <a 
      key={index} 
      onClick={() => this.handlerAndMenuText(item)}
      ref={this.ref}
      href="/#"
      >
        {item}
      </a>);
      return (
        <div className='dropdown'>
            <button id="algorithmMenu" className="algorithmMenu">{this.state.menuText}</button>
            <div className="dropdownContent">
              {items}
            </div>
        </div>
      );
  }
}