import React, {Component} from 'react';
import './App.css';
import SideNav from './components/SideNav';
import ContentPage from './components/contentpage';




class App extends Component {

  render(){
    return (
      <div className="App">
        <div className="App-header">
          Kikes
        </div>
        <div className="App-body">
          <div className="App-sidebar">
            <SideNav />
          </div>
          <div className="App-content">

            <ContentPage />



          </div>
        </div>
      </div>
    );
  }
}

export default App;
