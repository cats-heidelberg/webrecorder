import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, Row, Col } from "react-bootstrap";
class PersonHeading extends Component {
  static propTypes = {
    id: PropTypes.string,
    htmlText: PropTypes.string,
    item: PropTypes.object,
    onRemovePerson: PropTypes.func,
  };
  constructor(props) {
    super(props);
  }
  onRemovePerson = () => {
    const { onRemovePerson, item } = this.props;
    onRemovePerson(item);
  };
  render() {
    const { id, htmlText, item } = this.props;

    return (
      <React.Fragment>
        <Row className="mt-2 mx-0 py-0">
          <Col xs="9" className="my-auto pl-2 pr-3">
            <div className="py-1 px-2" style={{ backgroundColor: "#DDD"}}>{htmlText}</div>
          </Col>
          <Col className="m-auto px-0" style={{ textAlign: "right"}}>
            <button
              type="button"
              className="btn btn-success"
              style={{ backgroundColor: "#E9573F", width: "100%", border: "0"}}
              onClick={this.onRemovePerson}
            >
              Remove
            </button>
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}

export default PersonHeading;
