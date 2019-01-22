import React, { Component } from "react";
// import logo from "./logo.svg";
import "./App.css";

// import D3 from "./components/D3-old";
import mapboxgl from "mapbox-gl";

import Navigation from "./components/Navigation";
import Map from "./components/Map";

require("dotenv").config();

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_PUBLIC_KEY;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: "00:00",
      line: "all",
      startButtonText: "Start",
      seconds: 0
    };
    this.handleLineSelect = this.handleLineSelect.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.handleTimeSelect = this.handleTimeSelect.bind(this);
  }

  handleLineSelect(e) {
    this.setState({ line: e.target.value });
  }

  handleTimeSelect(e) {
    const hourStr = e.target.value.substring(0, 2);
    let hourInt = parseInt(hourStr, 10);
    let secondsInt = hourInt * 3600;
    this.setState({ seconds: secondsInt });
    var date = new Date(null);
    date.setSeconds(secondsInt);
    console.log(secondsInt);
    var timeString = date.toISOString().substr(11, 5);
    this.setState({ time: timeString });
  }

  handleStart(e) {
    var self = this;
    function updateSecs() {
      if (self.state.seconds >= 86399) {
        self.setState({ seconds: 0 });
      } else {
        self.setState({ seconds: (self.state.seconds += 10) });
      }
      var date = new Date(null);
      date.setSeconds(self.state.seconds);
      var timeString = date.toISOString().substr(11, 5);
      self.setState({ time: timeString });
    }
    // this.setState({ start: !this.state.start });
    if (this.state.startButtonText === "Start") {
      this.setState({ startButtonText: "Pause" });
      this.timer = setInterval(updateSecs, 1);
    } else {
      this.setState({ startButtonText: "Start" });
      clearInterval(this.timer);
    }
  }

  render() {
    let mapboxProps = {
      style: "mapbox://styles/mapbox/dark-v9",
      center: [139.7586, 35.6909],
      zoom: 11.5,
      line: this.state.line,
      hour: parseInt(this.state.time.substring(0, 2), 10)
    };
    return (
      <div>
        <div id="map" />
        {/* <D3 line={this.state.line} /> */}
        <Map {...mapboxProps} />
        {/* <div id="map" /> */}
        <Navigation
          handleChange={this.handleLineSelect}
          handleStartClick={this.handleStart}
          handleTimeClick={this.handleTimeSelect}
          time={this.state.time}
          buttonText={this.state.startButtonText}
        />
      </div>
    );
  }
}

export default App;
