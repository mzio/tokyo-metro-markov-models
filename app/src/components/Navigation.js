import React from "react";
import { Navbar, Nav, Form, Button } from "react-bootstrap";

export default class Navigation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      line: "all",
      buttonText: "Start"
    };
    this.handleLineSelect = this.handleLineSelect.bind(this);
  }

  handleLineSelect(e) {
    console.log(e.target.value);
    this.setState({ line: e.target.value });
    console.log(this.state);
  }

  //   componentDidUpdate() {
  //     if (this.props.startText === "") {
  //       this.setState({ buttonText: "Start" });
  //     } else {
  //       this.setState({ buttonText: "Pause" });
  //     }
  //   }

  render() {
    return (
      <Navbar className="bsNavbar flex-wrap">
        <Nav href="#" className="navElement">
          <h3>Tokyo Metro Markov Chains</h3>
        </Nav>
        <Form inline className="navElement">
          {/* <InputGroup> */}
          <Form.Label className="formInlineLabel">Select Line:</Form.Label>
          <Form.Control as="select" onChange={this.props.handleChange}>
            <option>All</option>
            <option>Toei Asakusa Line</option>
            <option>Toei Mita Line</option>
            <option>Toei Oedo Line</option>
            <option>Toei Shinjuku Line</option>
            <option>Tokyo Metro Chiyoda Line</option>
            <option>Tokyo Metro Fukutoshin Line</option>
            <option>Tokyo Metro Ginza Line</option>
            <option>Tokyo Metro Hanzomon Line</option>
            <option>Tokyo Metro Hibiya Line</option>
            <option>Tokyo Metro Marunouchi Line</option>
            <option>Tokyo Metro Namboku Line</option>
            <option>Tokyo Metro Tozai Line</option>
            <option>Tokyo Metro Yurakucho Line</option>
          </Form.Control>
          <Form.Label className="formInlineLabel">
            Select Start Time:
          </Form.Label>
          <Form.Control as="select" onChange={this.props.handleTimeClick}>
            <option>00:00 (12 am)</option>
            <option>01:00 (1 am)</option>
            <option>02:00 (2 am)</option>
            <option>03:00 (3 am)</option>
            <option>04:00 (4 am)</option>
            <option>05:00 (5 am)</option>
            <option>06:00 (6 am)</option>
            <option>07:00 (7 am)</option>
            <option>08:00 (8 am)</option>
            <option>09:00 (9 am)</option>
            <option>10:00 (10 am)</option>
            <option>11:00 (11 am)</option>
            <option>12:00 (12 pm)</option>
            <option>13:00 (1 pm)</option>
            <option>14:00 (2 pm)</option>
            <option>15:00 (3 pm)</option>
            <option>16:00 (4 pm)</option>
            <option>17:00 (5 pm)</option>
            <option>18:00 (6 pm)</option>
            <option>19:00 (7 pm)</option>
            <option>20:00 (8 pm)</option>
            <option>21:00 (9 pm)</option>
            <option>22:00 (10 pm)</option>
            <option>23:00 (11 pm)</option>
          </Form.Control>
          <Button
            variant="outline-light"
            className="navElement"
            onClick={this.props.handleStartClick}
          >
            {this.props.buttonText}
          </Button>
        </Form>

        <Nav className="navElement">
          <h4>Time: {this.props.time}</h4>
        </Nav>
      </Navbar>
    );
  }
}
