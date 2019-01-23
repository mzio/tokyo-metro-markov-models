import React from "react";
import { Navbar, Nav, Form, Button, Modal } from "react-bootstrap";

export default class Navigation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      line: "all",
      buttonText: "Start",
      showAbout: false
    };
    this.handleLineSelect = this.handleLineSelect.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleShow = this.handleShow.bind(this);
  }

  handleLineSelect(e) {
    console.log(e.target.value);
    this.setState({ line: e.target.value });
    console.log(this.state);
  }

  handleClose() {
    this.setState({ showAbout: false });
  }

  handleShow() {
    this.setState({ showAbout: true });
  }

  render() {
    return (
      <>
        <Modal
          size="lg"
          show={this.state.showAbout}
          onHide={this.handleClose}
          backdropClassName="modalBackdrop"
        >
          <Modal.Header closeButton>
            <Modal.Title>About</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              A little side project to display Tokyo Metro travel averaged over
              a single day. Visualization is generated through a client-side
              simulation determined by the hour, using markov chains calculated
              from data on Foursquare check-ins from 2012 to 2013. To run,
              select an hour or hit start, which will auto-reload the simulation
              at every hour.
            </p>
            <p>
              See <a href="#">[here]</a> for more info. Briefly, Foursquare
              check-in data was filtered for subway stations and
              cross-referenced with station geocoordinates belonging to the
              Tokyo Metro and Toei Subway subway system lines. From only knowing
              check-in data, directionality was inferred with transition
              matrices for each line based on the ratio of station to overall
              line check-ins. To try to capture possible changes in distribution
              over the day, matrices were constructed for each hour.
            </p>
            <p>
              Final note: as part of a side project creation thing this is
              mostly untested on mobile or any browser other than Chrome. Feel
              free to report any bugs at the link below.
            </p>
            <p>Creds:</p>
            <ul>
              <li>
                <a href="https://www.kaggle.com/chetanism/foursquare-nyc-and-tokyo-checkin-dataset/version/2#dataset_TSMC2014_TKY.csv">
                  [Tokyo Foursquare Check-in Data]
                </a>
              </li>
              <li>
                <a href="https://www.npmjs.com/package/japan-train-data">
                  [Japan Train Geocoordinate Data 🚉 🚉 🚉]
                </a>
              </li>
            </ul>
            <p>
              Code available on{" "}
              <a href="https://github.com/mzio/tokyo-metro-map/tree/master/app">
                [Github]
              </a>
              .
            </p>
            <p>
              See more projects / get contact info to report bugs{" "}
              <a href="https://michaelzhang.xyz/">[here]</a>.
            </p>
          </Modal.Body>
        </Modal>
        <Navbar bg="dark" expand="lg" variant="dark">
          <Nav href="#" className="navElement">
            <h3>Tokyo Metro Markov Models</h3>
          </Nav>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Form inline className="navElement">
              {/* <Form.Label className="formInlineLabel">Select Line:</Form.Label>
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
          </Form.Control> */}
              <Form.Label className="formInlineLabel">
                Hit start or select a time here:
              </Form.Label>
              <Form.Control as="select" onChange={this.props.handleTimeClick}>
                <option>00:00</option>
                <option>01:00</option>
                <option>02:00</option>
                <option>03:00</option>
                <option>04:00</option>
                <option>05:00</option>
                <option>06:00</option>
                <option>07:00</option>
                <option>08:00</option>
                <option>09:00</option>
                <option>10:00</option>
                <option>11:00</option>
                <option>12:00</option>
                <option>13:00</option>
                <option>14:00</option>
                <option>15:00</option>
                <option>16:00</option>
                <option>17:00</option>
                <option>18:00</option>
                <option>19:00</option>
                <option>20:00</option>
                <option>21:00</option>
                <option>22:00</option>
                <option>23:00</option>
              </Form.Control>
              <Button
                variant="outline-light"
                className="navElement"
                onClick={this.props.handleStartClick}
              >
                {this.props.buttonText}
              </Button>
              <Form.Label className="formInlineLabel">
                Time: {this.props.time}
              </Form.Label>
              <Form.Label className="formInlineLabel">
                <a href="#" onClick={this.handleShow}>
                  [Click here for about / intro]
                </a>
              </Form.Label>
            </Form>
          </Navbar.Collapse>
        </Navbar>
      </>
    );
  }
}
