import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import SFBusMap from './sf-map.js';
import BusService from './bus-service.js';
import StyledComponent from 'styled-components';

const Title = StyledComponent.div`
  display:inline-block;
  padding:10px;
  position:fixed;
  top:0px;
  left:0px;
  color:black;
  background-color:rgba(255,255,255,0.9);
  border-bottom-right-radius: 8px;
`;

class App extends Component {
    constructor(){
        super();
        this.state = {
          status: "Starting up...",
          routes: [],
          buses: [],
          ready: false,
        }
        this.refreshRate = 15000;
        this.map = new SFBusMap();
        this.busService = new BusService()
    }

    refreshCycle = (func, t) => {
      setTimeout(()=>{
        func();
        this.refreshCycle(func, t);
      }, t);
    }

    componentDidMount(){
      this.setState({status: "Intializing map..."});
        Promise.all([
            this.busService.getRoutes(),
            this.map.init()
        ])
        .then(([lines,]) => {
          this.setState({status: "Getting bus locations..."});
          this.setState({routes: lines});
          return this.busService.getBusLocations(lines.map(obj => obj.$.tag));
        })
        .then(buses => {
            this.setState({status: "Adding buses to map...", buses});
            //this.map.updatebuses(buses);
        }).then(()=>{
          this.setState({status: "Ready.", ready: true});
          this.refreshCycle(()=>{
            this.busService.getBusLocations(this.state.routes.map(obj => obj.$.tag)).then(buses =>{
              //this.map.updatebuses(buses);
              this.setState({buses});
            });
          },this.refreshRate);
        });
    }
  render() {
    //filter needs to be more efficient.
    if (this.state.ready){
        console.log(this.state.routes.map(route => route.$.tag));
        console.log(this.state.buses.filter(bus => !!bus && this.state.routes.map(route => route.$.tag).indexOf(bus.$.routeTag) !== -1));
        this.map.updatebuses(this.state.buses.filter(bus => !!bus && this.state.routes.map(route => route.$.tag).indexOf(bus.$.routeTag) !== -1));
    }
    return (
      <Title>
        <h1>Live buses of San Francisco</h1>
        <a href="https://github.com/matlin/SF-Live-Bus-Map"><h3>
          <img src="https://cdn0.iconfinder.com/data/icons/octicons/1024/mark-github-256.png" width="25px" height="25px" />
            Matthew Linkous
        </h3></a>
        <h5>Status: <strong style={{color:"darkred"}}>{this.state.status}</strong></h5>
        <h5>Todos:</h5>
        <ul>
          <del><li>loading status</li></del>
          <li>toggling bus lines via state</li>
          <li>composing components more safely</li>
          <li>adding tooltips to buses and roads</li>
          <li>removing dead code and clean up repo</li>
        </ul>
      </Title>
    );
  }
}

export default App;
