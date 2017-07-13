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
  text-align:center;
  color:white;
`;

class App extends Component {
    constructor(){
        super();
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

        Promise.all([
            this.busService.getRoutes(),
            this.map.init()
        ])
        .then(([lines,]) => {
          this.setState({lines});
          return this.busService.getBusLocations(lines.map(obj => obj.$.tag));
        })
        .then(busses => {
            this.map.updateBusses(busses);
        }).then(()=>{
          this.refreshCycle(()=>{
            this.busService.getBusLocations(this.state.lines.map(obj => obj.$.tag)).then(busses =>{
              this.map.updateBusses(busses)
            });
          },3000);
        });
    }
    //http://webservices.nextbus.com/service/publicXMLFeed?command=vehicleLocations&a=sf-muni&r=N&t=0
    //http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=sf-muni
  render() {
    return (
      <Title>
        <h1>Live Busses of San Francisco</h1>
        <h3>Created by Matthew Linkous</h3>
        <h5><a href="https://github.com/matlin/SF-Live-Bus-Map">Fork me on Github</a></h5>
      </Title>
    );
  }
}

export default App;
