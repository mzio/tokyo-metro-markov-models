import React from "react";
import { select, selectAll } from "d3-selection";
import "d3-selection-multi";
import { geoMercator, geoPath } from "d3-geo";
import { json } from "d3-fetch";
import { sum } from "d3-array";
import { easePoly } from "d3-ease";
import { transition } from "d3-transition";

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

    // if (this.props.buttonText === "Start") {
    //   selectAll("circles.dot").interrupt();
    // }
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
            "stroke-opacity": 0.075,
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
      } catch (e) {}
    }

    function loadParticles(svg, data, line) {
      const linkTotal = sum(data, function(d) {
        return d.value;
      });

      const paths = self.paths[line];

      var selectedPaths = [];
      try {
        var number = Math.max(Math.floor(linkTotal / 40), 1);
      } catch (e) {
        console.log(e);
      }

      for (let i = 0; i < number; i++) {
        // Pick initial station path
        var path = paths[Math.floor(Math.random() * paths.length)];
        selectedPaths.push({ ix: i, path: path, opacity: 1 });
      }

      var nextStates = {};

      var circles = svg
        .selectAll("circle.dot")
        .data(selectedPaths)
        .enter()
        .append("circle")
        .classed("dot", true)
        .attr("r", 2)
        .styles({
          fill: path.color,
          "fill-opacity": 1,
          stroke: path.color,
          "stroke-width": 6,
          "stroke-opacity": 0.3,
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
        // .style("filter", "url(#glow)")
        .each(function(d) {
          nextStates[d.ix] = [
            d.path.end[0],
            d.path.end[1],
            d.path.target,
            d.opacity,
            1 // future opacity
          ];
        });

      // Taken from Nadieh Bremer's super cool D3 glow thing (https://www.visualcinnamon.com/2016/06/glow-filter-d3-visualization.html)
      // Container for the gradients
      var defs = svg.append("defs");

      // Filter for the outside glow
      var filter = defs.append("filter").attr("id", "glow");
      filter
        .append("feGaussianBlur")
        .attr("stdDeviation", "3.5")
        .attr("result", "coloredBlur");
      var feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "coloredBlur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");

      //   // Apply to your element(s)
      //   selectAll(".dot").style("filter", "url(#glow)");

      function moveParticles() {
        circles
          .transition()
          .duration(0)
          .styles({
            "fill-opacity": function(d) {
              return nextStates[d.ix][3];
            },
            "stroke-opacity": function(d) {
              return nextStates[d.ix][3] - 0.7;
            }
          })
          .transition()
          .ease(easePoly)
          .duration(360)
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
            var futureOpacity = nextStates[d.ix][4];
            if (targetPaths.length > 0) {
              const path =
                targetPaths[Math.floor(Math.random() * targetPaths.length)];
              if (futureOpacity === 1) {
                nextStates[d.ix] = [
                  path.end[0],
                  path.end[1],
                  path.target,
                  1,
                  1
                ];
              } else {
                nextStates[d.ix] = [
                  path.end[0],
                  path.end[1],
                  path.target,
                  0,
                  1
                ];
              }
            } else {
              var path = paths[Math.floor(Math.random() * paths.length)];
              //   console.log(path);
              nextStates[d.ix] = [path.end[0], path.end[1], path.target, 0, 0];
            }
          });
      }

      self.timer = setInterval(moveParticles, 360);
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
