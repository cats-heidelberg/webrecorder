/* eslint-disable no-nested-ternary */
/* eslint-disable indent */
import React, { Component } from "react";
import PropTypes from "prop-types";
import removeMd from "remove-markdown";
import classNames from "classnames";
import config from "config";
import { DownloadIcon } from "components/icons";
import { Link } from "react-router-dom";
import { Button, Col, Row, Tooltip } from "react-bootstrap";

import { buildDate, getCollectionLink, truncate } from "helpers/utils";

import SizeFormat from "components/SizeFormat";
import Modal from "components/Modal";

import { NewCollection } from "components/siteComponents";
import { DeleteCollection } from "containers";
import { TrashIcon, PlusIcon, LockIcon, CheckIcon, NextIcon } from "components/icons";

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
    reviewCompleted: PropTypes.bool,
    metadataCompleted: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.state = {
      showModalFinish: false,
      modalSessionSave: false,
      open: false,
      openApprove: false,
      openDeny: false,
      doi: "",
      ticketState: "open",
      reviewCompleted: this.props.collection.get("ticketState") === "approved" || this.props.collection.get("ticketState") === "completed",
      metadataCompleted: this.props.collection.get("ticketState") === "approved" || this.props.collection.get("ticketState") === "completed",
    };
  }

  toggle = () => {
    this.setState({ open: !this.state.open });
  };

  toggleDeny = () => {
    this.setState({ openDeny: !this.state.openDeny });
  };

  toggleApprove = () => {
    this.setState({ openApprove: !this.state.openApprove });
  }

  close = () => {
    this.setState({ open: false });
    this.setState({ openDeny: false });
    this.setState({ openApprove: false });
    this.setState({ modalSessionSave: false });
    this.refresh();
  };

  closeModal = () => {
    this.setState({
      metadataCompleted: true,
      showModalFinish: !this.state.showModalFinish,
    });
  };

  downloadAction = (evt) => {
    const { collection } = this.props;
    console.log(getCollectionLink(collection));
    window.location.href = `${config.appHost}/${getCollectionLink(
      collection
    )}/$download`;
  };

  toggleSessionSave = () => {
    this.setState({ modalSessionSave: !this.state.modalSessionSave });
  };

  editCollectiontemp = () => {};

  newSession = () => {
    this.setState({ reviewCompleted: true });
    //  const { collection } = this.props;

    //this.props.onPatch(collection.get('id'),collection.get('url'));
    const { collection, history } = this.props;
    // history.push(
    //   `/${collection.get("owner")}/${collection.get("id")}/${collection.get(
    //     "recordingTimestamp"
    //   )}/${collection.get("recordingUrl")}`
    // );
    // open in new window instead of history.push:
    const win = window.open(
      `/${collection.get("owner")}/${collection.get("id")}/${collection.get("recordingTimestamp")}/${collection.get("recordingUrl")}`,
      'newwindow',
      'fullscreen=yes');
    win.focus();
  };

  refresh = () => {
    window.location.reload();
  };

  readyApprove = () => {
    const { Reviewed, collection } = this.props;
    Reviewed(collection.get("owner"), collection.get("id"), "approved");
  };

  sendForDOI = () => {
    const { completeReview, collection } = this.props;
    completeReview(collection.get("owner"), collection.get("id"), "completed", collection.get("doi"), collection.get("url"));
  };

  denyArchive = () => {
    const { doi } = this.state;
    const { completeReview, collection } = this.props;
    completeReview(collection.get("owner"), collection.get("id"), "denied", "");
  };

  handleInput = (event) => {
    this.setState({ doi: event.target.value });
  };

  render() {
    const { canAdmin, collection, error } = this.props;
    const { modalSessionSave, showModalFinish, open, openApprove, openDeny, ticketState, doi } = this.state;
    const descClasses = classNames("left-buffer list-group-item", {
      "has-description": collection.get("desc"),
    });

    return (
      <React.Fragment>
        <li
          className={descClasses}
          key={collection.get("id")}
          style={{
            backgroundColor:
              collection.get("ticketState") === "pending"
                ? "#FFF"
                : collection.get("ticketState") === "approved"
                ? "#ececec"
                : "#ececec",
              borderBottom: "3px solid #ccc",
          }}
        >
          <Row className="m-0 mt-3">
            <Col className="p-0 col-12">
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
                    className="collection-options new-session"
                    onClick={this.newSession}
                  >
                    <span>Review </span>{this.state.reviewCompleted ? <CheckIcon /> : ""}
                  </Button>
                  {/*
                  <Button
                    className="collection-options new-session"
                    onClick={this.downloadAction}
                  >
                    <span>
                      {" "}
                      <DownloadIcon /> {__DESKTOP__
                        ? "Export"
                        : "Download"}{" "}
                      collection{" "}
                    </span>
                  </Button>
                  */}
                  <Button
                    className="collection-options new-session"
                    onClick={this.closeModal}
                  >
                    <span>View/edit metadata </span>{this.state.metadataCompleted ? <CheckIcon /> : ""}
                  </Button>

                  <NextIcon />

                  <React.Fragment>
                    <Button
                      className="collection-options new-session"
                      onClick={this.toggleApprove}
                      disabled={!(this.state.metadataCompleted && this.state.reviewCompleted)}
                    >
                      <span> Approve </span>
                      {
                        collection.get("ticketState") == "approved" ||
                        collection.get("ticketState") == "completed"
                        ? <CheckIcon /> : ""
                      }
                    </Button>

                    <Button
                      className="collection-options new-session"
                      onClick={this.toggleDeny}
                      disabled={!(this.state.metadataCompleted && this.state.reviewCompleted) || collection.get("ticketState") == "approved"}
                    >
                      <span> Deny</span>
                    </Button>
                  </React.Fragment>

                  <NextIcon />

                  <Button
                    className="collection-options new-session"
                    onClick={this.toggleSessionSave}
                    disabled={collection.get("ticketState") !== "approved"}
                  >
                    <span className="hidden-xs">Complete and add DOI </span>
                  </Button>
                  {collection.get("ticketState") === "approved" && (
                    <Modal
                      visible={modalSessionSave}
                      closeCb={this.close}
                      header="Please confirm DOI generation."
                      dialogClassName="wr-modal"
                    >
                      {
                        <React.Fragment>
                          <h4>Attention</h4>
                          <p>
                            If you submit this archive as completed user or
                            admin won't be able to do further changes.
                            <br />
                            Please take note that this DOI is not editable:
                            <br />
                            <span style={{ color: "black", fontWeight: "bold" }}>{collection.get("doi")}</span>
                            <br /> <br />
                            Create DOI? <br />
                          </p>
                          <Button
                            className="col-5"
                            onClick={this.sendForDOI}
                            disabled={
                              collection.get("ticketState") !== "approved"
                            }
                          >
                            <span className="mx-3">Confirm</span>
                            <CheckIcon />
                          </Button>
                        </React.Fragment>
                      }
                    </Modal>
                  )}

                  {collection.get("ticketState") === "pending" && (
                    <Modal
                      visible={openDeny}
                      closeCb={this.close}
                      header="To deny archive please confirm."
                      dialogClassName="table-header-modal dat-modal"
                    >
                      {
                        <React.Fragment>
                          <h4>Attention</h4>
                          <p>
                            If you mark this archive as denied the user will have to
                            start from stratch.
                            <br /> <br />
                            Deny archive?{" "}
                          </p>
                          <Button
                            className="col-5"
                            onClick={this.denyArchive}
                          >
                            <span className="mx-3">Confirm</span>
                              <CheckIcon />
                          </Button>
                        </React.Fragment>
                      }
                    </Modal>
                  )}
                  {collection.get("ticketState") === "pending" && (
                    <Modal
                      visible={openApprove}
                      closeCb={this.close}
                      header="To approve archive please confirm."
                      dialogClassName="table-header-modal dat-modal"
                    >
                      {
                        <React.Fragment>
                          <h4>Attention</h4>
                          <p>
                            Are you sure you would like to approve this archive?{" "}
                          </p>
                          <Button
                            className="col-5"
                            onClick={this.readyApprove}
                          >
                            <span className="mx-3">Confirm</span>
                              <CheckIcon />
                          </Button>
                        </React.Fragment>
                      }
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
            <div className="collection-time">
              Created {buildDate(collection.get("created_at"), false, true)}
            </div>

            <NewCollection
              coll={collection}
              editCollection={this.editCollectiontemp}
              close={this.closeModal}
              visible={showModalFinish}
              error={error}
              createOrEdit="edit"
            />
          </Row>
        </li>
      </React.Fragment>
    );
  }
}

export default CollectionItem;
