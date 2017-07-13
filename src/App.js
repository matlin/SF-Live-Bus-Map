import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import SFBusMap from './sf-map.js';
import BusService from './bus-service.js';

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
            this.busService.getBusLocations(['N', 'L']),
            this.map.init()
        ]).then(([busses,]) => {
            this.map.updateBusses(busses);
        }).then(()=>{
          this.refreshCycle(()=>{
            this.busService.getBusLocations(['N', 'L']).then(busses =>{
              this.map.updateBusses(busses)
            });
          },3000);
        });
    }
    //http://webservices.nextbus.com/service/publicXMLFeed?command=vehicleLocations&a=sf-muni&r=N&t=0
    //http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=sf-muni
  render() {
    return (
      <div></div>
    );
  }
}

export default App;
