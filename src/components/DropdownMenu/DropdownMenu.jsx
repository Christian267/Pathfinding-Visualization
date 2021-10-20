import React, { Component } from "react";
import "./DropdownMenu.css";

export default class DropdownMenu extends Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.state = {
      menuText: this.props.defaultTitle,
      isOpen: false,
      menuHeight: null,
    };
    this.handleOpenMenu = this.handleOpenMenu.bind(this);
  }
  

  changeMenuText(algorithm) {
    this.setState({menuText: algorithm,
    isOpen: false});
  }

  changeAlgorithmAndMenuText(algorithm) {
    this.changeMenuText(algorithm);
    this.props.handler(algorithm);
  }

  handleOpenMenu() {
    this.setState((state) => ({
      isOpen: !state.isOpen,
    }));
  }

  render() {
    var items = this.props.listItems.map((item, index) =>
      <a 
      key={index} 
      onClick={() => this.changeAlgorithmAndMenuText(item)}
      ref={this.ref}
      href="/#"
      >
        {item}
      </a>);
    var dropdownContent = 
    <div id="dropdownContent" className={"dropdownContent " + this.props.extraClassName}>
      {items}
    </div>;
    const extraClassName = this.state.isOpen ?
                             "Open" :
                             "";

    return (
      <><button id="dropdownButton"
        className={"dropdownButton" + extraClassName} 
        onClick={() => this.handleOpenMenu()}
        >
          {this.state.menuText}
        </button>
        {this.state.isOpen && dropdownContent}
      </>
    );
  }
}