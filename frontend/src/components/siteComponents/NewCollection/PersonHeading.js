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
        <li key={id}>
          <Row className="mt-2 py-0">
            <Col xs="8" className="px-1 my-auto">
              <div className="m-0 py-1 px-2" style={{ backgroundColor: "#DDD"}}>{htmlText}</div>
            </Col>
            <Col className="my-auto">
              <button
                type="button"
                className="btn btn-success"
                style={{ backgroundColor: "#E9573F", width: "90px"}}
                onClick={this.onRemovePerson}
              >
                Remove
              </button>
            </Col>
          </Row>
        </li>
      </React.Fragment>
    );
  }
}

export default PersonHeading;
