import React, { Component } from "react";
import PropTypes from "prop-types";
import removeMd from "remove-markdown";
import classNames from "classnames";
import { Link } from "react-router-dom";
import { Button, Col, Row, Tooltip } from "react-bootstrap";
import { CheckIcon } from "components/icons";

import { buildDate, getCollectionLink, truncate } from "helpers/utils";

import SizeFormat from "components/SizeFormat";
import Modal from "components/Modal";

import { ReviewMetadata } from "components/siteComponents";
import { DeleteCollection } from "containers";
import { TrashIcon, PlusIcon, LockIcon } from "components/icons";

class CollectionItem extends Component {
  static propTypes = {
    canAdmin: PropTypes.bool,
    addToList: PropTypes.func,
    collId: PropTypes.string,
    error: PropTypes.string,
    collUser: PropTypes.string,
    completeReview: PropTypes.func,
    id: PropTypes.string,
    isOver: PropTypes.bool,
    collection: PropTypes.object,
    onPatch: PropTypes.func,
    Reviewed: PropTypes.func,
    selected: PropTypes.bool,
    history: PropTypes.string,
  };
  constructor(props) {
    super(props);

    this.state = {
      showModalFinish: false,
      open: false,
      ticketState: "open",
    };
  }

  toggle = () => {
    this.setState({ open: !this.state.open });
  };
  denyArchive = () => {
    const { completeReview, collection } = this.props;
    completeReview(collection.get("owner"), collection.get("id"), "denied");
    this.close();
  };

  close = () => {
    this.setState({ open: false });
  };

  closeModal = () => {
    this.setState({ showModalFinish: !this.state.showModalFinish });
  };

  editCollectiontemp = () => {};

  newSession = () => {
    //  const { collection } = this.props;

    //this.props.onPatch(collection.get('id'),collection.get('url'));
    const { collection, history } = this.props;
    history.push(
      `/${collection.get("owner")}/${collection.get("id")}/${collection.get(
        "recordingTimestamp"
      )}/${collection.get("recordingUrl")}`
    );
  };
  readyApprove = () => {
    const { Reviewed, collection } = this.props;
    Reviewed(collection.get("owner"), collection.get("id"), "approved");
  };
  sendForDOI = () => {
    const { completeReview, collection } = this.props;
    completeReview(collection.get("owner"), collection.get("id"), "completed");
  };

  render() {
    const { canAdmin, collection, error } = this.props;
    const { showModalFinish, open, ticketState } = this.state;
    const descClasses = classNames("left-buffer list-group-item", {
      "has-description": collection.get("desc"),
    });

    return (
      <React.Fragment>
        <li className={descClasses} key={collection.get("id")}>
          <Row>
            <Col sm={15} md={12}>
              <h3>{collection.get("title")}</h3>
              <p className="collection-list-description">
                {truncate(
                  removeMd(collection.get("desc"), { useImgAltText: false }),
                  3,
                  new RegExp(/([.!?])/)
                )}
              </p>
              {canAdmin && (
                <React.Fragment>
                  <Button
                    className="rounded new-session"
                    onClick={this.newSession}
                  >
                    <span> Review </span>
                  </Button>

                  <Button
                    className="rounded new-session"
                    onClick={this.closeModal}
                  >
                    <span> look at Meta data </span>
                  </Button>

                  <Button
                    className="rounded new-session"
                    onClick={this.readyApprove}
                    disabled={collection.get("ticketState") !== "pending"}
                  >
                    <span> Approve </span>
                  </Button>

                  <Button
                    className="rounded new-session"
                    onClick={this.toggle}
                    disabled={collection.get("ticketState") !== "pending"}
                  >
                    <span> Deny</span>
                  </Button>

                  <Button
                    className="rounded new-session"
                    onClick={this.sendForDOI}
                    disabled={collection.get("ticketState") !== "approved"}
                  >
                    <span> Complete </span>
                  </Button>
                  {collection.get("ticketState") === "pending" && (
                    <Modal
                      visible={open}
                      closeCb={this.close}
                      header="To finish recording please confirm."
                      dialogClassName="table-header-modal dat-modal"
                    >
                      {
                        <React.Fragment>
                          <h4>Attention</h4>
                          <p>
                            If you submit this archive as denied user has to
                            start from stratch.
                            <br /> <br />
                            Deny archive?{" "}
                          </p>
                          <Button
                            className="rounded new-session"
                            onClick={this.denyArchive}
                          >
                            <CheckIcon />
                            <span className="hidden-xs">confirm.</span>
                          </Button>
                        </React.Fragment>
                      }
                      <Button onClick={this.close} className="rectangular">
                        Close
                      </Button>
                    </Modal>
                  )}
                </React.Fragment>
              )}
              {canAdmin &&
                (collection.get("ticketState") === "pending" ||
                  ticketState === "pending") && (
                  <React.Fragment>
                    <p>
                      User waiting for review.
                      <br />
                      Approve if no unallowed content and pass content to the
                      DOI generating team.
                      <br />
                      If denied user will be notified and has to start from the
                      beginning.
                    </p>
                  </React.Fragment>
                )}
            </Col>
            <Col className="collection-time" xs={6} md={2}>
              Created {buildDate(collection.get("created_at"), false, true)}
            </Col>
            <Col
              className="collection-delete-action col-xs-offset-7 col-md-offset-0"
              xs={5}
              md={2}
            ></Col>
            <ReviewMetadata
              coll={collection}
              editCollection={this.editCollectiontemp}
              close={this.closeModal}
              visible={showModalFinish}
              error={error}
            />
          </Row>
        </li>
      </React.Fragment>
    );
  }
}

export default CollectionItem;
