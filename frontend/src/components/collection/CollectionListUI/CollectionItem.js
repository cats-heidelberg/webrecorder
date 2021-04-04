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

import { EditMetadata } from "components/siteComponents";
import { DeleteCollection } from "containers";
import { TrashIcon, PlusIcon, LockIcon } from "components/icons";

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
    completeRec(collID, "pending");
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
                ? "#fabebe"
                : collection.get("ticketState") === "pending"
                ? "#ececec"
                : collection.get("ticketState") === "completed"
                ? "#c3e5aa"
                : "#FFF",
          }}
        >
          {"" !== headline && (
            <h2
              style={{
                display: "flex",
                flexGrow: 1,
                justifyContent: "center",
                alignItems: "center",
                lineHeight: "40px",
              }}
            >
              {headline.toUpperCase()}
            </h2>
          )}
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
                  {collection.get("ticketState") === "open" ? (
                    <Button className="rounded" onClick={this.newSession}>
                      Review and Edit
                    </Button>
                  ) : (
                    <Button className="rounded" onClick={this.newSession}>
                      Review
                    </Button>
                  )}

                  {collection.get("ticketState") === "open" && (
                    <Button
                      className="rounded new-session"
                      onClick={this.closeModal}
                    >
                      <span> Edit Metadata</span>
                    </Button>
                  )}
                  <Button
                    className="rounded new-session"
                    onClick={this.duplicateAction}
                  >
                    <span>
                      {" "}
                      <Collection /> Duplicate Collection{" "}
                    </span>
                  </Button>
                  <Button
                    className="rounded new-session"
                    onClick={this.downloadAction}
                  >
                    <span>
                      {" "}
                      <DownloadIcon /> {__DESKTOP__
                        ? "Export"
                        : "Download"}{" "}
                      Collection{" "}
                    </span>
                  </Button>
                  {collection.get("ticketState") === "open" && (
                    <Button
                      className="rounded new-session"
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
                            End recording archive?{" "}
                            <a href="https://datproject.org/" target="_blank">
                              Learn more
                            </a>
                          </p>
                          <Button
                            className="rounded new-session"
                            onClick={this.sendArchive}
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
              {canAdmin && collection.get("ticketState") === "pending" && (
                <React.Fragment>
                  <p>
                    Your recording is getting reviewed by the library team.
                    <br />
                    Please keep track of this message since we will update it.
                    <br />
                    once the review process has been completed.
                    <br />
                    Thank you for your patience and for chosing openDachs.
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
                    information has been sent by mail to you.
                    <br />
                    After reading the instructions, please review archive and
                    complete it so we can review.
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
                    A DOI has been created.
                    <br />
                    <h4 style={{ color: "black" }}>
                      {collection.get("doi") !== undefined &&
                      collection.get("doi") !== null
                        ? collection.get("doi")
                        : "there is a problem with the DOI please contact an OpenDachs admin"}
                    </h4>
                    <br />
                    Thank you for your patience and for chosing openDachs.
                    <br />
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
            >
              {canAdmin && (
                <React.Fragment>
                  <DeleteCollection collection={collection}>
                    <TrashIcon />
                    <Tooltip placement="top" className="in" id="tooltip-top">
                      DELETE
                    </Tooltip>
                  </DeleteCollection>
                </React.Fragment>
              )}
            </Col>
            <EditMetadata
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
