import * as XMLParser from 'xml2js';
//const XMLParser = require('xml2js');

class BusService {
    constructor(agency = "sf-muni"){
        this.agency = agency;
        this.baseUrl = "http://webservices.nextbus.com/service/publicXMLFeed";
        this.url=this.baseUrl + `?a=${this.agency}`;
    }
    //static baseUrl = "http://webservices.nextbus.com/service/publicXMLFeed";

    async getRoutes() {
      const params = {command: "routeList"};
      return this.fetchData(params).then(xmlObj => xmlObj.body.route);
    }

    async getBusLocations(lines = []) {
        return Promise.all(lines.map((line) => this.fetchData({command:"vehicleLocations", t:0, r:line}))).then(lineObjs => {
            //console.log(lineObjs);
            return lineObjs.reduce((acc, curr) => acc.concat(curr.body.vehicle), [])
        }, console.error);
    }

    fetchData(params){
        return fetch(this.parameterize(this.url, params)).then((resp) => {
            if (resp.ok){
                return resp.text();
            }
        }).then(xml => {
            return new Promise((resolve, reject) => {
                XMLParser.parseString(xml, (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                });
            });
        }).then(x => x);
    }

    parameterize(url, params) {
        for (let name in params) {
            if (params[name] != null) {
                url += `&${name}=${encodeURIComponent(params[name])}`;
            }
        }
        return url;
    }
}

export default BusService;
