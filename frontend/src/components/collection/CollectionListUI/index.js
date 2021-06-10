/* eslint-disable array-callback-return */
/* eslint-disable indent */
/* eslint-disable no-unused-expressions */

import React, { Component, useState } from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import classNames from "classnames";
import { fromJS } from "immutable";
import { Button, Col, Dropdown, MenuItem, Row } from "react-bootstrap";

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
    _duplicateCollection: PropTypes.func,
    createNewCollectionBrowseWarc: PropTypes.func,
    editCollection: PropTypes.func,
    edited: PropTypes.bool,
    editUser: PropTypes.func,
    onPatch: PropTypes.func,
    numCollections: PropTypes.number,
    orderedCollections: PropTypes.object,
    match: PropTypes.object,
    history: PropTypes.object,
    sortBy: PropTypes.object,
    sortCollections: PropTypes.func,
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
      _collectionsSorted: null,
      _sortBy: ["sorted by state"],
      sortByActive: "sorted by state",
      isUploading: false,
      numCollections: 0,
      showModal: false,
      showModalFinish: false,
      progress: 0,
      role: "admin",
      status: "ready...",
      targetUrl: "",
      targetID: "",
      targetObj: null,
    };
  }

  componentDidMount() {
    const { sortCollections, sortBy, collections } = this.props;
    const { _sortBy, _collectionsSorted } = this.state;

    this.updateSort();
    //  sortCollections(_sortBy, collections.get("collections"));
  }

  updateSort = () => {
    const { sortCollections, sortBy, collections } = this.props;
    const { _sortBy } = this.state;

    const soLangsamEy = ["sorted by state"];
    var promise = new Promise((resolve, reject) => {
      collections.get("collections").map((coll) => {
        if (
          coll.get("projektcode") !== undefined &&
          coll.get("projektcode") !== "" &&
          !_sortBy.includes(coll.get("projektcode"))
        ) {
          soLangsamEy.push(coll.get("projektcode"));
        } else {
          console.log(coll.get("title") + "projektcode undefined");
        }
      });

      resolve(true);
    });
    promise.then((bool) => {
      this.setState({
        _sortBy: soLangsamEy,
      });
    });
  };

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
    projektcode,
    publishYear,
    pubTitleOriginal,
    personHeadingText,
    subjectHeadingText,
    listID,
    ticketState = "open",
    isCollLoaded = true,
    recordingUrl = "",
    recordingTimestamp = "",
    doi = ""
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
      projektcode,
      publishYear,
      pubTitleOriginal,
      personHeadingText,
      subjectHeadingText,
      listID,
      ticketState,
      isCollLoaded,
      recordingUrl,
      recordingTimestamp,
      doi
    );
  };

  duplicateCollection = (title) => {
    const {
      _duplicateCollection,
      match: {
        params: { user },
      },
    } = this.props;
    _duplicateCollection(user, title);
  };

  warcIndexing = () => {
    const { targetObj } = this.state;
    const { activeCollection } = this.props;
    this.xhr = new XMLHttpRequest();
    const target = activeCollection;
    const url = apiFormatUrl(
      `${apiPath}/upload?force-coll=${target}&filename=${targetObj}`
    );

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
      status: "Error Encountered",
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

  uploadSuccess = (evt) => {
    this.setState({ progress: 50 });
  };

  indexing = (data) => {
    this.setState({ canCancel: false, status: "Indexing..." });

    const url = apiFormatUrl(
      `${apiPath}/upload/${data.upload_id}?user=${data.user}`
    );

    this.interval = setInterval(() => {
      fetch(url, {
        headers: new Headers({ "x-requested-with": "XMLHttpRequest" }),
      })
        .then((res) => {
          res.json();
        })
        .then(this.indexResponse);
    }, 75);
  };

  indexingComplete = (user, coll) => {
    const { targetID, targetUrl } = this.state;
    const { config } = this.props;
    const cleanUrl = targetUrl;

    // data to create new recording
    const data = {
      coll: targetID,
      mode: "replay",
      url: cleanUrl,
    };

    // generate recording url
    apiFetch("/new", data, { method: "POST" })
      .then((res) => {
        res.json();
      })
      .then(({ url }) => {
        this.props.history.push(url.replace(config.appHost, ""));
      })
      .catch((err) => {
        console.log("error", err);
      });
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
    projektcode,
    publishYear,
    pubTitleOriginal,
    personHeadingText,
    subjectHeadingText,
    listID,
    ticketState = "open",
    isCollLoaded = true,
    recordingUrl = "",
    recordingTimestamp = "",
    file,
    doi
  ) => {
    const {
      createNewCollectionBrowseWarc,
      match: {
        params: { user },
      },
    } = this.props;
    this.setState({ targetObj: file, targetID: collTitle, targetUrl: url });

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
      projektcode,
      publishYear,
      pubTitleOriginal,
      personHeadingText,
      subjectHeadingText,
      listID,
      ticketState,
      isCollLoaded,
      recordingUrl,
      recordingTimestamp,
      doi
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
    projektcode,
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
      projektcode,
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
    projektcode,
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
      projektcode,
      publishYear,
      pubTitleOriginal,
      personHeadingText,
      subjectHeadingText,
      listID,
      url
    );
  };

  completeRec = (collID, ticketState = "pending", projektcode = "") => {
    const {
      completeRecording,
      match: {
        params: { user },
      },
    } = this.props;
    completeRecording(user, collID, ticketState, projektcode);
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
      .then((res) => {
        res.json();
      })
      .then(({ url }) => {
        history.push(url.replace(appHost, ""));
      })
      .catch((err) => {
        console.log("error", err);
      });
  };

  toggle = () => {
    this.setState({ showModal: !this.state.showModal });
  };

  reOrder = (evt) => {
    this.setState({ sortByActive: this.state._sortBy[evt] });
    const { _collectionsSorted, _sortBy } = this.state;
    const { collections } = this.props;
    const temp = [{}];
    const code = _sortBy[evt];

    var promise = new Promise((resolve, reject) => {
      // call resolve if the method succeeds

      collections.get("collections").map((element) => {
        try {
          if (element.get("projektcode") == code) temp.unshift(element);
        } catch (e) {
          console.log(e);
        }
        try {
          if (element.get("projektcode") != code) temp.push(element);
        } catch (e) {
          console.log(e);
        }
      });
      resolve(temp);
    });
    promise.then((temp) => {
      this.setState({ _collectionsSorted: fromJS(temp) });
    });

    /*const {
      collections,
      match: {
        params: { user },
      },
      orderedCollections,
      sortCollections,
      sortBy,
    } = this.props;
    const { _sortBy } = this.state;
    let sort = "";
    let sortDirection = "";
    switch (evt) {
      case "1":
        sort = "created_at";
        sortDirection = "DESC";
        break;
      case "2":
        sort = "created_at";
        sortDirection = "ASC";
        break;
      case "3":
        sort = "title";
        sortDirection = "DESC";
        break;
      case "4":
        sort = "title";
        sortDirection = "ASC";
        break;
      default:
        sort = "created_at";
        sortDirection = "DESC";
    }
    const prevSort = _sortBy ? _sortBy.get("sort") : "";
    const prevDir = _sortBy ? _sortBy.get("dir") : "";

    if (prevSort !== sort || prevDir !== sortDirection) {
      sortCollections(
        fromJS({ sort: sort, dir: sortDirection }),
        collections.get("collections")
      );
    }
    */
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
    let headlinelast = "";
    let headline = "";
    const {
      auth,
      collections,
      history,
      orderedCollections,
      match: { params },
      user,
    } = this.props;
    const {
      _collectionsSorted,
      showModal,
      showModalFinish,
      progress,
      status,
      isUploading,
      _sortBy,
      sortByActive,
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
          <Col className="mx-auto col-sm-10 col-lg-8">
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
              <Row className="mt-5 align-items-end">
                <Col
                  xs={15}
                  className={classNames("collections-index-nav m-0 p-0", {
                    desktop: __DESKTOP__,
                  })}
                >
                  {__DESKTOP__ && <h4>My Collections</h4>}
                  <Button
                    onClick={this.toggle}
                    className="rounded"
                  >
                    <span className="glyphicon glyphicon-plus glyphicon-button" />{" "}
                    + create new archive
                  </Button>
                  {/* Update Sort by*/}
                  {/* Update Sort by*/}
                </Col>
                <Col className="admin-section update-role p-0" style={{ textAlign: "right" }}>
                  <div className="sort-list m-2">Sort list:</div>
                  <Dropdown id="roleDropdown" onSelect={this.reOrder} className="sort-list">
                    <Dropdown.Toggle>
                      {_sortBy ? sortByActive : "Sorting unavailable"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {_sortBy.map((sort, index) => (
                        <MenuItem key={sort} eventKey={index}>
                          {sort}
                        </MenuItem>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>
              </Row>
            )}
            {collections && collections.get("loaded") && (
              <Row className="mb-5">
                <ul className="collection-list mt-3 pl-0">
                  {(() => {
                    switch (sortByActive) {
                      case "sorted by state":
                        return collections.get("collections").map((coll) => {
                          const temp =
                            coll.get("ticketState") !== headline &&
                            coll.get("ticketState") !== headlinelast
                              ? coll.get("ticketState")
                              : headline !== headlinelast &&
                                coll.get("ticketState") !== headline &&
                                coll.get("ticketState") === headlinelast
                              ? coll.get("ticketState")
                              : "";
                          coll.get("ticketState") !== headline
                            ? (headline = coll.get("ticketState"))
                            : headline !== headlinelast
                            ? (headlinelast = headline)
                            : null;

                          return (
                            <CollectionItem
                              key={coll.get("id")}
                              canAdmin={canAdmin}
                              collection={coll}
                              collUser={user}
                              duplicateCollection={this.duplicateCollection}
                              editCollection={this.editColl}
                              completeRec={this.completeRec}
                              error={collections.get("error")}
                              history={history}
                              onPatch={this.onPatch}
                              headline={temp}
                              ticketState={coll.get("ticketState")}
                            />
                          );
                        });

                      default:
                        return _collectionsSorted !== null
                          ? _collectionsSorted.map((coll, index) => {
                              let temp = "";
                              if (
                                coll.get("id") &&
                                coll.get("id") !== null &&
                                typeof coll.get("id") !== "undefined"
                              ) {
                                try {
                                  if (
                                    coll.get("projektcode") &&
                                    coll.get("projektcode") !== null &&
                                    typeof coll.get("projektcode") !==
                                      "undefined"
                                  ) {
                                    temp =
                                      coll.get("projektcode") !== headline &&
                                      coll.get("projektcode") !== headlinelast
                                        ? coll.get("projektcode")
                                        : headline !== headlinelast &&
                                          coll.get("projektcode") !==
                                            headline &&
                                          coll.get("projektcode") ===
                                            headlinelast
                                        ? coll.get("projektcode")
                                        : "";
                                    coll.get("projektcode") !== headline
                                      ? (headline = coll.get("projektcode"))
                                      : headline !== headlinelast
                                      ? (headlinelast = headline)
                                      : null;
                                  }
                                } catch (e) {
                                  console.log(e);
                                }
                                return (
                                  <CollectionItem
                                    key={coll.get("id")}
                                    canAdmin={canAdmin}
                                    collection={coll}
                                    collUser={user}
                                    duplicateCollection={
                                      this.duplicateCollection
                                    }
                                    editCollection={this.editColl}
                                    completeRec={this.completeRec}
                                    error={collections.get("error")}
                                    history={history}
                                    onPatch={this.onPatch}
                                    headline={temp}
                                    ticketState={coll.get("ticketState")}
                                  />
                                );
                              } else {
                                return <div />;
                              }
                            })
                          : null;
                    }
                  })()}
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
