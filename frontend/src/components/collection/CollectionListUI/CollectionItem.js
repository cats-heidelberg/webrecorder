/* eslint-disable indent */
import React, { Component } from "react";
import PropTypes from "prop-types";
import removeMd from "remove-markdown";
import classNames from "classnames";
import { Link } from "react-router-dom";
import { Button, Col, Row, Tooltip } from "react-bootstrap";
import { CheckIcon, Collection } from "components/icons";
import config from "config";
import { DownloadIcon } from "components/icons";
import { buildDate, getCollectionLink, truncate } from "helpers/utils";

import SizeFormat from "components/SizeFormat";
import Modal from "components/Modal";

import { NewCollection } from "components/siteComponents";
import { DeleteCollection } from "containers";
import { TrashIcon, PlusIcon, LockIcon, NextIcon } from "components/icons";

class CollectionItem extends Component {
  static propTypes = {
    canAdmin: PropTypes.bool,
    addToList: PropTypes.func,
    collId: PropTypes.string,
    error: PropTypes.string,
    collUser: PropTypes.string,
    completeRec: PropTypes.func,
    id: PropTypes.string,
    isOver: PropTypes.bool,
    headline: PropTypes.string,
    collection: PropTypes.object,
    duplicateCollection: PropTypes.func,
    editCollection: PropTypes.func,
    onPatch: PropTypes.func,
    selected: PropTypes.bool,
    history: PropTypes.string,
    ticketState: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.state = {
      showModalFinish: false,
      open: false,
      ticketState: this.props.ticketState,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.ticketState !== this.props.ticketState ||
      prevState.ticketState !== this.state.ticketState
    ) {
      this.setState({ ticketState: this.state.ticketState });
    }
  }

  toggle = () => {
    this.setState({ open: !this.state.open });
  };

  sendArchive = () => {
    console.log("im send Archive collectionItem");
    const { collection, completeRec } = this.props;
    const collID = collection.get("id");
    const projektcode = collection.get("projektcode");
    completeRec(collID, "pending", projektcode);
    this.setState({ ticketState: "pending" });
  };

  close = () => {
    this.setState({ open: false });
  };

  closeModal = () => {
    this.setState({ showModalFinish: !this.state.showModalFinish });
  };

  downloadAction = (evt) => {
    const { collection } = this.props;
    console.log(getCollectionLink(collection));
    window.location.href = `${config.appHost}/${getCollectionLink(
      collection
    )}/$download`;
  };

  duplicateAction = () => {
    const { collection } = this.props;
    this.props.duplicateCollection(collection.get("title"));
  };

  editCollectiontemp = (
    collID,
    title,
    creatorList,
    subjectHeaderList,
    personHeaderList,
    noteToDachs,
    publisher,
    collTitle,
    publisherOriginal,
    collYear,
    copTitle,
    surName,
    persName,
    usermail,
    emailOfRightsholder,
    selectedGroupName,
    projektcode,
    publishYear,
    pubTitleOriginal,
    personHeadingText,
    subjectHeadingText,
    listID
  ) => {
    this.props.editCollection(
      collID,
      title,
      creatorList,
      subjectHeaderList,
      personHeaderList,
      noteToDachs,
      publisher,
      collTitle,
      publisherOriginal,
      collYear,
      copTitle,
      surName,
      persName,
      usermail,
      emailOfRightsholder,
      selectedGroupName,
      projektcode,
      publishYear,
      pubTitleOriginal,
      personHeadingText,
      subjectHeadingText,
      listID
    );
  };

  newSession = () => {
    //  const { collection } = this.props;

    //this.props.onPatch(collection.get('id'),collection.get('url'));
    const { collection, history, collUser } = this.props;
    history.push(
      `/${collUser.get("username")}/${collection.get("id")}/${collection.get(
        "recordingTimestamp"
      )}/${collection.get("recordingUrl")}`
    );
  };

  openReplay = () => {
    const { collection } = this.props;
    const win = window.open(
      `https://projects.zo.uni-heidelberg.de/webarchive/lp/${collection.get("doi")}.html`,
      "_blank");
    win.focus();
  }

  sendForReview = () => {};

  render() {
    const { canAdmin, collection, error, headline } = this.props;
    const { showModalFinish, open } = this.state;
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
              collection.get("ticketState") === "denied"
                ? "#edc7c7"
                : collection.get("ticketState") === "pending"
                ? "#e5e5e5"
                : collection.get("ticketState") === "completed"
                ? "#dcf0c9"
                : collection.get("ticketState") === "approved"
                ? "#e5e5e5"
                : "#fff",
              borderBottom: "3px solid #ccc",
          }}
        >
          {headline !== "" && (
            <h2
              style={{
                display: "flex",
                flexGrow: 1,
                justifyContent: "center",
                alignItems: "center",
                lineHeight: "60px",
              }}
            >
              {headline.toUpperCase()}
            </h2>
          )}
          <Row className="m-0 mt-3">
            <Col className="p-0 col-12">
              <h3>{collection.get("title")}</h3>
              <p className="collection-list-description mb-2">
                {truncate(
                  removeMd(collection.get("desc"), { useImgAltText: false }),
                  3,
                  new RegExp(/([.!?])/)
                )}
              </p>
              {canAdmin && (
                <React.Fragment>
                  {collection.get("ticketState") === "open" ? (
                    <Button className="collection-options" onClick={this.newSession}>
                      <span>Review and edit</span>
                    </Button>
                  ) : collection.get("ticketState") === "completed" ? (
                    <Button className="collection-options" onClick={this.openReplay}>
                      <span>View</span>
                    </Button>
                  ) : (
                    <Button className="collection-options" onClick={this.newSession}>
                      <span>Review</span>
                    </Button>
                  )}


                  {collection.get("ticketState") === "open" && (
                  <React.Fragment>
                    <NextIcon />
                    <Button
                      className="collection-options new-session"
                      onClick={this.closeModal}
                    >
                      <span> Edit metadata</span>
                    </Button>
                    <NextIcon />
                  </React.Fragment>
                  )}


                  {collection.get("ticketState") === "open" && (
                    <Button
                      className="collection-options new-session"
                      onClick={this.toggle}
                    >
                      <span> Complete</span>
                    </Button>
                  )}
                  {collection.get("ticketState") === "open" && (
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
                            If you submit your archive for DOI creation you
                            won't be able to record more content.
                            <br /> <br />
                            Please confirm you want to end recording this archive.{" "}
                            <a href="https://datproject.org/" target="_blank">
                              Learn more
                            </a>
                          </p>
                          <Button
                            className="col-5"
                            onClick={this.sendArchive}
                          >
                            <span className="mx-3">Confirm</span>
                            <CheckIcon />
                          </Button>
                      </React.Fragment>
                    }
                    </Modal>
                  )}

                  <svg height="40px" width="15px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 40">
                    <line x1="2" y1="8" x2="2" y2="36" stroke-linecap="round" stroke-width="2" stroke="#999" />
                  </svg>

                  <Button
                    className="collection-options new-session"
                    onClick={this.duplicateAction}
                  >
                    <span>
                      {" "}
                      <Collection /> Duplicate {" "}
                    </span>
                  </Button>
                  <Button
                    className="collection-options new-session"
                    onClick={this.downloadAction}
                  >
                    <span>
                      {" "}
                      <DownloadIcon /> {__DESKTOP__
                        ? "Export"
                        : "Download"}{" "}
                      for personal use{" "}
                    </span>
                  </Button>
                </React.Fragment>
              )}
              {canAdmin && collection.get("ticketState") === "pending" && (
                <React.Fragment>
                  <p>
                    Your recording is getting reviewed by the library team.
                    <br />
                    Please keep track of this message since we will update it
                    <br />
                    once the review process has been completed.
                    <br />
                  </p>
                </React.Fragment>
              )}
              {canAdmin && collection.get("ticketState") === "denied" && (
                <React.Fragment>
                  <p>
                    Your recording has been reviewed by the library team.
                    <br />
                    It has content which is not approved.
                    <br />
                    An admin has been assigned and a mail with further
                    information has been sent to you.
                    <br />
                    After reading the instructions, please review the archive and
                    complete it so we can re-check it.
                    <br />
                  </p>
                </React.Fragment>
              )}
              {canAdmin && collection.get("ticketState") === "completed" && (
                <React.Fragment>
                  <p>
                    Your recording has been reviewed by the library team and has
                    been approved.
                    <br />
                    A DOI has been created:
                    <br />
                    <h5 style={{ color: "black", marginBottom: "0", marginTop: "10px"}}>
                      {collection.get("doi") !== undefined &&
                      collection.get("doi") !== null
                        ? collection.get("doi")
                        : "There is a problem with the DOI, please contact an OpenDachs admin."}
                    </h5>
                  </p>
                </React.Fragment>
              )}
            </Col>
              <div className="collection-time">
                Created {buildDate(collection.get("created_at"), false, true)}
              </div>
            <div
              className="collection-delete-action">
              {canAdmin && (
                <React.Fragment>
                  <DeleteCollection collection={collection}>
                    <TrashIcon />
                  </DeleteCollection>
                </React.Fragment>
              )}
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
