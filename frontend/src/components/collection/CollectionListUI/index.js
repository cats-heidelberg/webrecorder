import React, { Component, useState } from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import classNames from "classnames";
import { fromJS } from "immutable";
import { Button, Col, Row } from "react-bootstrap";

import { product, apiPath } from "config";
import { apiFormatUrl } from "helpers/utils";
import { apiFetch, stopPropagation } from "helpers/utils";
import { appHost } from "config";

import { StandaloneRecorder } from "containers";

import HttpStatus from "components/HttpStatus";
import InlineEditor from "components/InlineEditor";
import RedirectWithStatus from "components/RedirectWithStatus";
import WYSIWYG from "components/WYSIWYG";
import { NewCollection } from "components/siteComponents";
import { Upload } from "containers";
import { LinkIcon, UploadIcon } from "components/icons";

import CollectionItem from "./CollectionItem";
import "./style.scss";

class CollectionListUI extends Component {
  static contextTypes = {
    isAnon: PropTypes.bool,
  };

  static propTypes = {
    activeBrowser: PropTypes.string,
    activeCollection: PropTypes.object,
    auth: PropTypes.object,
    completeRecording: PropTypes.func,
    collections: PropTypes.object,
    createNewCollection: PropTypes.func,
    createNewCollectionBrowseWarc: PropTypes.func,
    editCollection: PropTypes.func,
    edited: PropTypes.bool,
    editUser: PropTypes.func,
    onPatch: PropTypes.func,
    match: PropTypes.object,
    numCollections: PropTypes.number,
    orderedCollections: PropTypes.object,
    match: PropTypes.object,
    history: PropTypes.object,
    timestamp: PropTypes.string,
    user: PropTypes.object,
  };

  static defaultProps = fromJS({
    collections: [],
  });

  constructor(props) {
    super(props);
    this.xhr = null;
    this.interval = null;
    this.state = {
      canCancel: true,
      isUploading: false,
      numCollections: 0,
      showModal: false,
      showModalFinish: false,
      isUploading: false,
      progress: 0,
      status: "ready...",
      targetUrl: "",
      targetID: "",
      targetObj: null,
    };
  }
  componentDidUpdate(prevProps) {
    console.log(this.props.activeCollection + "PREVPROPSnumCollections");

    if (prevProps.numCollections !== this.props.numCollections) {
      console.log(this.props.numCollections + "THISnumCollections");
      this.setState({ numCollections: this.props.numCollection });
    }
  }

  createCollection = (
    pubTitle,
    url,
    isPublic,
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
    publishYear,
    pubTitleOriginal,
    personHeadingText,
    subjectHeadingText,
    listID,
    ticketState = "open",
    isCollLoaded = true,
    recordingUrl = "",
    recordingTimestamp = ""
  ) => {
    const {
      createNewCollection,
      match: {
        params: { user },
      },
    } = this.props;
    createNewCollection(
      user,
      pubTitle,
      url,
      isPublic,
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
      publishYear,
      pubTitleOriginal,
      personHeadingText,
      subjectHeadingText,
      listID,
      ticketState,
      isCollLoaded,
      recordingUrl,
      recordingTimestamp
    );
  };
  warcIndexing = () => {
    const { targetObj } = this.state;
    const { activeCollection } = this.props;
    this.xhr = new XMLHttpRequest();
    const target = activeCollection;
    const url = apiFormatUrl(
      `${apiPath}/upload?force-coll=${target}&filename=${targetObj}`
    );
    console.log("fileLocation" + url);
    this.xhr.upload.addEventListener("progress", this.uploadProgress);
    this.xhr.addEventListener("load", this.uploadSuccess);
    this.xhr.addEventListener("loadend", this.uploadComplete);

    this.xhr.open("PUT", url, true);
    this.xhr.setRequestHeader("x-requested-with", "XMLHttpRequest");

    this.setState({
      isUploading: true,
      status: "Uploading...",
    });

    this.xhr.send(targetObj);

    return this.xhr;
  };

  uploadComplete = (evt) => {
    if (!this.xhr) {
      return;
    }

    const data = JSON.parse(this.xhr.responseText);

    this.setState({
      canCancel: true,
      status: uploadErrors[data.error] || "Error Encountered",
    });
    this.xhr.upload.removeEventListener("progress", this.uploadProgress);
    this.xhr.removeEventListener("load", this.uploadSuccess);
    this.xhr.removeEventListener("loadend", this.uploadComplete);
    this.xhr.abort();
    if (data && data.upload_id) {
      return this.indexing(data);
    }
  };
  uploadProgress = (evt) => {
    const progress = Math.round((50.0 * evt.loaded) / evt.total);

    if (evt.loaded >= evt.total) {
      this.setState({ canCancel: false, progress });
    } else {
      this.setState({ progress });
    }
  };

  uploadSuccess = (evt) => this.setState({ progress: 50 });

  indexing = (data) => {
    this.setState({ canCancel: false, status: "Indexing..." });

    const url = apiFormatUrl(
      `${apiPath}/upload/${data.upload_id}?user=${data.user}`
    );

    this.interval = setInterval(() => {
      fetch(url, {
        headers: new Headers({ "x-requested-with": "XMLHttpRequest" }),
      })
        .then((res) => res.json())
        .then(this.indexResponse);
    }, 75);
  };
  indexingComplete = (user, coll) => {
    console.log(user);
    console.log(coll);
    const { targetID, targetUrl } = this.state;
    const cleanUrl = addTrailingSlash(fixMalformedUrls(targetUrl));

    // data to create new recording
    const data = {
      coll: targetID,
      mode: "replay",
      url: cleanUrl,
    };

    // generate recording url
    apiFetch("/new", data, { method: "POST" })
      .then((res) => res.json())
      .then(({ url }) =>
        this.props.history.push(url.replace(config.appHost, ""))
      )
      .catch((err) => console.log("error", err));
  };
  indexResponse = (data) => {
    const stateUpdate = {};

    if (data.filename && data.filename !== this.state.file) {
      stateUpdate.file = data.filename;
    }

    if (data.total_files > 1) {
      stateUpdate.status = `Indexing ${data.total_files - data.files} of ${
        data.total_files
      }`;
    }

    if (data.size && data.total_size) {
      stateUpdate.progress =
        50 + Math.round((50 * data.size) / data.total_size);
    }

    // update ui
    if (Object.keys(stateUpdate).length) {
      this.setState(stateUpdate);
    }

    if (data.size >= data.total_size && data.done) {
      clearInterval(this.interval);
      this.indexingComplete(data.user, data.coll);
    }
  };

  createCollectionWarcold = (
    pubTitle,
    url,
    isPublic,
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
    publishYear,
    pubTitleOriginal,
    personHeadingText,
    subjectHeadingText,
    listID,
    ticketState = "open",
    isCollLoaded = true,
    recordingUrl = "",
    recordingTimestamp = "",
    file
  ) => {
    const {
      createNewCollectionBrowseWarc,
      match: {
        params: { user },
      },
    } = this.props;
    this.setState({ targetObj: file, targetID: collTitle, targetUrl: url });
    console.log(this.props.numCollections);
    setTimeout(() => {
      this.warcIndexing();
    }, 3075);
    createNewCollectionBrowseWarc(
      user,
      pubTitle,
      url,
      isPublic,
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
      publishYear,
      pubTitleOriginal,
      personHeadingText,
      subjectHeadingText,
      listID,
      ticketState,
      isCollLoaded,
      recordingUrl,
      recordingTimestamp
    );
  };
  editColl = (
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
    publishYear,
    pubTitleOriginal,
    personHeadingText,
    subjectHeadingText,
    listID
  ) => {
    const {
      editCollection,
      match: {
        params: { user },
      },
    } = this.props;
    editCollection(
      user,
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
      publishYear,
      pubTitleOriginal,
      personHeadingText,
      subjectHeadingText,
      listID
    );
  };
  createCollectionWarc = (
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
    publishYear,
    pubTitleOriginal,
    personHeadingText,
    subjectHeadingText,
    listID,
    url
  ) => {
    const {
      createNewCollectionBrowseWarc,
      match: {
        params: { user },
      },
    } = this.props;
    createNewCollectionBrowseWarc(
      user,
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
      publishYear,
      pubTitleOriginal,
      personHeadingText,
      subjectHeadingText,
      listID,
      url
    );
  };
  completeRec = (collID, ticketState = "pending") => {
    const {
      completeRecording,
      match: {
        params: { user },
      },
    } = this.props;
    completeRecording(user, collID, ticketState);
  };
  editName = (full_name) => {
    const {
      editUser,
      match: {
        params: { user },
      },
    } = this.props;
    editUser(user, { full_name });
  };

  editURL = (display_url) => {
    const {
      editUser,
      match: {
        params: { user },
      },
    } = this.props;
    editUser(user, { display_url });
  };

  onPatch = (coll, url) => {
    const { activeBrowser, history, timestamp } = this.props;

    // data to create new recording
    const data = {
      url,
      coll,
      timestamp,
      mode: "patch",
    };

    // add remote browser
    if (activeBrowser) {
      data.browser = activeBrowser;
    }

    // generate recording url
    apiFetch("/new", data, { method: "POST" })
      .then((res) => res.json())
      .then(({ url }) => {
        history.push(url.replace(appHost, ""));
      })
      .catch((err) => console.log("error", err));
  };

  toggle = () => {
    this.setState({ showModal: !this.state.showModal });
  };

  close = () => {
    this.setState({ showModal: false });
  };

  updateUser = (description) => {
    const {
      editUser,
      match: {
        params: { user },
      },
    } = this.props;
    editUser(user, { desc: description });
  };

  render() {
    const { isAnon } = this.context;
    const {
      auth,
      collections,
      history,
      orderedCollections,
      match: { params },
      user,
    } = this.props;
    const {
      showModal,
      showModalFinish,
      progress,
      status,
      isUploading,
    } = this.state;
    const userParam = params.user;
    const displayName = user.get("full_name") || userParam;
    const canAdmin = auth.getIn(["user", "username"]) === userParam;

    const userLink =
      user.get("display_url") &&
      (!user.get("display_url").match(/^[a-zA-Z]+:\/\//)
        ? `http://${user.get("display_url")}`
        : user.get("display_url"));

    if (collections.get("error") && !collections.get("creatingCollection")) {
      console.log(collections.getIn(["error", "error_message"]));
      return (
        <HttpStatus>{collections.getIn(["error", "error_message"])}</HttpStatus>
      );
    }

    if (collections.get("loaded") && isAnon && canAdmin) {
      return (
        <RedirectWithStatus
          to={`/${auth.getIn(["user", "username"])}/temp/manage`}
          status={301}
        />
      );
    }

    return (
      <React.Fragment>
        <Helmet>
          <title>{`${displayName}'s Collections`}</title>
        </Helmet>
        <Row>
          <Col
            xs={15}
            sm={__DESKTOP__ ? 10 : 9}
            smOffset={__DESKTOP__ ? 2 : 2}
            className="wr-coll-meta"
          >
            {/*
              canAdmin &&
                <Row className="collection-start-form">
                  <Col className="start-form" xs={12}>
                    <h4>New Capture</h4>
                    <StandaloneRecorder />
                  </Col>
                </Row>
            */}
            {!isAnon && canAdmin && (
              <Row>
                <Col
                  xs={15}
                  className={classNames("collections-index-nav", {
                    desktop: __DESKTOP__,
                  })}
                >
                  {__DESKTOP__ && <h4>My Collections</h4>}
                  <Button
                    onClick={this.toggle}
                    className="rounded"
                    style={{ fontSize: "1.6rem" }}
                  >
                    <span className="glyphicon glyphicon-plus glyphicon-button" />{" "}
                    New Download
                  </Button>
                </Col>
              </Row>
            )}
            {collections && collections.get("loaded") && (
              <Row>
                <ul className="list-group collection-list">
                  {orderedCollections.map((coll) => {
                    return (
                      <CollectionItem
                        key={coll.get("id")}
                        canAdmin={canAdmin}
                        collection={coll}
                        collUser={user}
                        editCollection={this.editColl}
                        completeRec={this.completeRec}
                        error={collections.get("error")}
                        history={history}
                        onPatch={this.onPatch}
                      />
                    );
                  })}
                </ul>
              </Row>
            )}
          </Col>
        </Row>
        <NewCollection
          close={this.close}
          visible={showModal}
          createCollection={this.createCollection}
          createCollectionBrowseWarc={this.createCollectionWarc}
          creatingCollection={collections.get("creatingCollection")}
          error={collections.get("error")}
          progressProp={progress}
          statusProp={status}
          isUploadingProp={isUploading}
        />
      </React.Fragment>
    );
  }
}

export default CollectionListUI;
