import React, { Component} from 'react';
import {Route,Switch,Redirect} from 'react-router-dom';
import store from '../store';
import Production from './production';
import Demanda from './demand';


class ContentPage extends Component {
  constructor(){
    super();
    this.state = {
      path: "/",
      component: null
    };

    store.subscribe(()=>{
      this.setState({
          path : store.getState().path,
          component: store.getState().component
        });
    });
  }
  render(){
    return (
      <div>
      <Switch>
        <Route  path="/production" component={Production} />
        <Route  path="/demand" component={Demanda} />
        <Redirect path="*" to="/" />
      </Switch>

      </div>
    );
  }
}

export default ContentPage;
