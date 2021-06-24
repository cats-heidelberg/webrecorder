import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, Row, Col } from "react-bootstrap";
class AuthorshipItem extends Component {
  static propTypes = {
    id: PropTypes.string,
    htmlText: PropTypes.string,
    item: PropTypes.object,
    onRemoveItem: PropTypes.func,
  };
  constructor(props) {
    super(props);
  }
  onRemoveItem = () => {
    const { onRemoveItem, item } = this.props;
    onRemoveItem(item);
  };
  render() {
    const { id, htmlText, item } = this.props;

    return (
      <React.Fragment>
        <Row className="mt-2 mx-0 py-0">
          {/*<h5
            style={{
              display: "flex",
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
              lineHeight: "40px",
            }}
          >
            Authorhip information:
          </h5>*/}
          <Col xs="9" className="my-auto pl-2 pr-3">
            <div className="py-1 px-2" style={{ backgroundColor: "#DDD"}}>{htmlText}</div>
          </Col>
          <Col className="m-auto px-0" style={{ textAlign: "right"}}>
            <button
              type="button"
              class="btn btn-success"
              style={{ backgroundColor: "#E9573F", width: "100%", border: "0"}}
              onClick={this.onRemoveItem}
            >
              Remove
            </button>
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}

export default AuthorshipItem;
