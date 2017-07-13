import * as d3 from "d3";
//import streets from '../public/sfmaps/streets.json';

class SFBusMap {
  constructor(nodeRef) {
    this.nodeRef = nodeRef;
    this.busHeight = 60;
    this.busWidth = 20;
    this.mapLayer = null;
  }

  async init() {
    let layers = {};

    let width = window.outerWidth,
      height = window.outerHeight,
      ogScale = 150000,
      centered;

    console.log(d3);

    // Define color scale
    let color = d3
      .scaleLinear()
      .domain([1, 20])
      .clamp(true)
      .range(["#fff", "#409A99"]);

    this.projection = d3
      .geoMercator()
      .scale(width * height * 0.3)
      .center([-122.437003, 37.770883])
      .translate([width / 2, height / 2]);

    const zoomed = (a, b, node) => {
      const trans = d3.event.transform;
      this.mapLayer.attr("transform", trans);
      this.mapLayer
        .selectAll("image")
        .attr("height", this.busHeight * (1 / trans.k))
        .attr("width", this.busWidth * (1 / trans.k));
    };

    var zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed);

    let path = d3.geoPath().projection(this.projection);

    // Set svg width & height
    let svg = d3.select("svg").attr("width", width).attr("height", height);

    // Add background
    svg
      .append("rect")
      .attr("class", "background")
      .attr("width", width)
      .attr("height", height)
      .on("click", clicked);

    svg.call(zoom);

    let g = svg.append("g");

    let effectLayer = g.append("g").classed("effect-layer", true);

    this.mapLayer = g.append("g").classed("map-layer", true);

    let dummyText = g
      .append("text")
      .classed("dummy-text", true)
      .attr("x", 10)
      .attr("y", 30)
      .style("opacity", 0);

    let bigText = g
      .append("text")
      .classed("big-text", true)
      .attr("x", 20)
      .attr("y", 45);

    // Load map data
    return new Promise((resolve, reject) => {
      d3
        .queue()
        .defer(d3.json, "../sfmaps/neighborhoods.json")
        .defer(d3.json, "../sfmaps/freeways.json")
        .defer(d3.json, "../sfmaps/arteries.json")
        .defer(d3.json, "../sfmaps/streets.json")
        .await((error, neighborhoods, freeways, arteries, streets) => {
          if (error) reject(error);
          let features = [].concat(
            neighborhoods.features,
            freeways.features,
            arteries.features,
            streets.features
          );

          // Update color scale domain based on data
          //color.domain([0, d3.max(features, nameLength)]);

          // Draw each province as a path
          this.mapLayer
            .selectAll("path")
            .data(features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("vector-effect", "non-scaling-stroke")
            .style("stroke", stroke)
            .style("fill", fillFn)
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("click", clicked);
          resolve();
        });
    });
    function stroke(feature) {
      if (feature.properties.STREET) return "#CDCDCD";
      if (feature.properties.neighborho) return "rgb(150, 200, 255)";
      return "#FFF";
    }

    function nameLength() {}

    function fillFn(feature) {
      if (feature.properties.neighborho) return "rgba(150, 200, 255,0.5)";
      return "none";
    }

    function mouseover() {}

    function mouseout() {}

    function clicked() {}
  }

  updateBusses(data) {
    // this.mapLayer
    //   .selectAll("circle")
    //   .data(data)
    //   .enter()
    //   .append("circle")
    //   //.transition()
    //   .attr("transform", d => `rotate(${+d.$.heading})`)
    //   .attr("cx", d => this.projection([+d.$.lon, +d.$.lat])[0])
    //   .attr("cy", d => this.projection([+d.$.lon, +d.$.lat])[1])
    //   .attr("r", 6)
    //   .style("fill", "red");
    const busses = this.mapLayer
      .selectAll("image")
      .data(data,(d) => d.$.id);
    busses.exit().remove();

    busses.transition().duration(500)
    .attr(
      "transform",
      d =>
        `translate(${this.projection([
          +d.$.lon,
          +d.$.lat
        ])[0]}, ${this.projection([+d.$.lon, +d.$.lat])[1]}) rotate(${+d.$
          .heading})`
    )

    busses.enter().append("image")
      .attr("xlink:href", "../bus.png")
      .attr(
        "transform",
        d =>
          `translate(${this.projection([
            +d.$.lon,
            +d.$.lat
          ])[0]}, ${this.projection([+d.$.lon, +d.$.lat])[1]}) rotate(${+d.$
            .heading})`
      )
      //.attr("x", d => this.projection([+d.$.lon, +d.$.lat])[0])
      //.attr("y", d => this.projection([+d.$.lon, +d.$.lat])[1])
      .attr("width", this.busHeight)
      .attr("height", this.busWidth);
  }
}

export default SFBusMap;
