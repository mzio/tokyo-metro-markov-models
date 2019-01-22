import React from "react";
import { select, selectAll } from "d3-selection";
import "d3-selection-multi";
import { geoMercator, geoPath } from "d3-geo";
import { json } from "d3-fetch";
import { queue } from "d3-queue";
import { extent, sum } from "d3-array";
import { easePoly } from "d3-ease";
import { transition } from "d3-transition";
import { scaleLinear } from "d3-scale";
import { timer } from "d3-timer";

export default class D3 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      line: this.props.line,
      hour: this.props.hour,
      links: [],
      nodes: [],
      loaded: false
    };
    this.updateNodes = this.updateNodes.bind(this);
    this.updateLinks = this.updateLinks.bind(this);

    this.getD3 = this.getD3.bind(this);
  }

  componentDidMount() {
    this.container = this.props.map.getCanvasContainer();
    this.paths = {};
    this.updateNodes();
    this.updateLinks();
  }

  // Want to do component did update with previous props, if the hour changed, launch queue with different things, just load the new data
  componentDidUpdate(prevProps) {
    // this.svg.selectAll("circle.dot").remove();
    // this.loadD3();
    if (prevProps.line !== this.props.line) {
      selectAll("svg").remove();
      this.updateNodes();
      this.updateLinks();
    }
    if (prevProps.hour !== this.props.hour) {
      selectAll("svg").remove();
      console.log(this.props.hour);
      this.updateLinks();
      this.updateNodes();
    }
  }

  getD3() {
    var map = this.props.map;
    var bbox = document.body.getBoundingClientRect();
    var center = map.getCenter();
    var zoom = map.getZoom();
    var scale = ((512 * 0.5) / Math.PI) * Math.pow(2, zoom);
    var d3projection = geoMercator()
      .center([center.lng, center.lat])
      .translate([bbox.width / 2, bbox.height / 2])
      .scale(scale);
    return d3projection;
  }

  updateNodes() {
    this.d3Projection = this.getD3();
    var path = geoPath();

    path.projection(this.d3Projection);

    var self = this;

    function loadNodes(container, data) {
      const svg = select(container).append("svg");
      const dots = svg.selectAll("circle.dot").data(data);
      dots.exit().remove();
      dots
        .enter()
        .append("circle")
        .classed("dot", true)
        .attr("r", 7)
        .styles({
          fill: function(d) {
            return d.line_color;
          },
          "fill-opacity": 0,
          stroke: "#004d60",
          "stroke-width": 0,
          "z-index": 1000
        })
        .attrs({
          cx: function(d) {
            return self.d3Projection([d.longitude, d.latitude])[0];
          },
          cy: function(d) {
            return self.d3Projection([d.longitude, d.latitude])[1];
          }
        });
    }

    json("/lines_nodes.json").then(function(data) {
      self.setState({ nodes: data });
      if (self.props.line !== "all") {
        loadNodes(self.container, data[self.props.line]);
      } else {
        for (var lineName in data) {
          loadNodes(self.container, data[lineName]);
        }
      }
    });
  }

  updateLinks() {
    this.d3Projection = this.getD3();
    var path = geoPath();

    path.projection(this.d3Projection);

    var self = this;

    function loadLinks(svg, data, line) {
      const classLine = line.replace(/\s+/g, "");
      try {
        const links = svg
          .append("g")
          .selectAll(".link_" + classLine)
          .data(data);
        links
          .enter()
          .append("path")
          .attr("class", "link_" + classLine)
          .styles({
            stroke: function(d) {
              return d.color;
            },
            "stroke-width": 5,
            "stroke-opacity": 0,
            "z-index": 1000
          })
          .attr("d", function(d) {
            try {
              var source = self.state.nodes[line].find(o => {
                return o.name === d.source;
              });
              var target = self.state.nodes[line].find(o => {
                return o.name === d.target;
              });

              var x0 = self.d3Projection([
                  source.longitude,
                  source.latitude
                ])[0],
                y0 = self.d3Projection([source.longitude, source.latitude])[1],
                x1 = self.d3Projection([target.longitude, target.latitude])[0],
                y1 = self.d3Projection([target.longitude, target.latitude])[1];
            } catch (e) {}
            let val = d.value;
            if (val < 10) {
              val = 20;
            }
            for (let i = 0; i < val; i++) {
              self.paths[line].push({
                source: d.source,
                target: d.target,
                start: [x0, y0],
                end: [x1, y1],
                color: d.color
              });
            }

            return "M" + x0 + "," + y0 + "L" + x1 + "," + y1;
          });
      } catch (e) {
        // console.log(e);
        // console.log(self.state.nodes);
        // console.log(line);
      }
    }

    function loadParticles(svg, data, line) {
      const classLine = line.replace(/\s+/g, "");

      const linkTotal = sum(data, function(d) {
        return d.value;
      });

      const paths = self.paths[line];

      var selectedPaths = [];
      try {
        var number = Math.max(Math.floor(linkTotal / 10), 1);
      } catch (e) {
        console.log(e);
      }

      for (let i = 0; i < number; i++) {
        // Pick initial station path

        var path = paths[Math.floor(Math.random() * paths.length)];
        selectedPaths.push({ ix: i, path: path });
      }

      var nextStates = {};

      var circles = svg
        .selectAll("circle.dot")
        .data(selectedPaths)
        .enter()
        .append("circle")
        .classed("dot", true)
        .attr("r", 5)
        .styles({
          fill: path.color,
          "fill-opacity": 0.5,
          stroke: "#004d60",
          "stroke-width": 1,
          "stroke-opacity": 0.5,
          "z-index": 1000
        })
        .attrs({
          cx: function(d) {
            return d.path.start[0];
          },
          cy: function(d) {
            return d.path.start[1];
          }
        })
        .each(function(d) {
          nextStates[d.ix] = [d.path.end[0], d.path.end[1], d.path.target];
        });

      function moveParticles() {
        circles
          .transition()
          .ease(easePoly)
          .duration(250)
          .attr("cx", function(d) {
            return nextStates[d.ix][0];
          })
          .attr("cy", function(d) {
            return nextStates[d.ix][1];
          })
          .each(function(d) {
            const targetPaths = self.paths[line].filter(o => {
              return o.source === nextStates[d.ix][2];
            });
            if (targetPaths.length > 0) {
              const path =
                targetPaths[Math.floor(Math.random() * targetPaths.length)];
              nextStates[d.ix] = [path.end[0], path.end[1], path.target];
            }
          });
      }
      setInterval(moveParticles, 250);
    }
    json("/lines_links.json").then(function(data) {
      console.log("data_loaded");
      var line_links = data[self.props.hour];
      if (self.props.line !== "all") {
        loadLinks(self.container, line_links[self.props.line], self.props.line);
      } else {
        for (var lineName in line_links) {
          var svg = select(self.container).append("svg");
          self.paths[lineName] = [];
          loadLinks(svg, line_links[lineName], lineName);
          if (self.paths[lineName].length > 0) {
            loadParticles(svg, line_links[lineName], lineName);
          }
        }
      }
    });
  }

  render() {
    return <div />;
  }
}
