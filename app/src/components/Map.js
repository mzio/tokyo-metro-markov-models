import React from "react";
import mapboxgl from "mapbox-gl";
import D3 from "./D3";

export default class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        container: "map",
        style: this.props.style,
        center: this.props.center,
        zoom: this.props.zoom
      },
      rendered: false
    };
  }

  componentDidMount() {
    // var map = new mapboxgl.Map(this.state.viewport);
    // this.container = map.getCanvasContainer();
    this.map = new mapboxgl.Map(this.state.viewport);
    this.setState({ rendered: true });
  }

  render() {
    if (this.state.rendered) {
      return (
        <div>
          <div id="map" />
          <D3
            map={this.map}
            line={this.props.line}
            hour={this.props.hour}
            buttonText={this.props.startButtonText}
          />
        </div>
      );
    } else {
      return <div id="map" />;
    }
  }
}
