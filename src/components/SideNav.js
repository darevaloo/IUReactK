import React, { Component} from 'react';
import { Icon } from 'react-icons-kit'

import {menu} from 'react-icons-kit/feather/menu'
import {line_graph} from 'react-icons-kit/ikons/line_graph'
import {hammer} from 'react-icons-kit/icomoon/hammer'
import './sidenav.css'
import {Link} from 'react-router-dom';

import store from '../store';



class SideNav extends Component{
  constructor(props) {
    super(props);
    this.state = {isToggleOn: true};

    // Este enlace es necesario para hacer que `this` funcione en el callback
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(state => ({
      isToggleOn: !state.isToggleOn
    }));
  }

  render(){
    return (
      <nav className="sidebar">
      <button className="button-menu" onClick={this.handleClick}><div className="iconImage"><Icon size={30} icon={menu} /></div>  </button>
      <div>
      <p>
      Actividades
      </p>
      </div>
        <Link to="/production" className="menu-option" ><div className="iconImage"><Icon size={24} icon={hammer} /></div> <div className="textItem">Producción</div></Link>
        <Link to="/demand" className="menu-option" ><div className="iconImage"><Icon size={24} icon={line_graph} /></div> <div className="textItem">Demanda</div></Link>
      </nav>
    );
  }
  goToPage(page){
    store.dispatch({
        type: "CONTENT_PAGE",
        path: page.path,
        component:  page.component
    });
  }
}

export default SideNav;
