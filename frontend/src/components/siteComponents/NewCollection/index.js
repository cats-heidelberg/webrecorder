import React, { Component } from "react";
import PropTypes from "prop-types";
import Toggle from "react-toggle";
import { Alert, Form, Row, Col, Container } from 'react-bootstrap';
import { incrementCollCount } from "store/modules/auth";

import { defaultCollectionTitle, apiPath } from "config";
import { apiFormatUrl } from "helpers/utils";
import { WarcIcon, InfoIcon } from "components/icons";

import { collection, upload as uploadErrors } from "helpers/userMessaging";
import PersonHeading from "./PersonHeading";
import AuthorshipItem from "./AuthorshipItem";
import Modal from "components/Modal";

import ReactTooltip from "react-tooltip";

import "./style.scss";

const creatorLegend = ["corporate/institutional name", "personal name"];
const creatorList = [];
const subjectHeaderList = [];
const personHeaderList = [];

class NewCollection extends Component {
  static propTypes = {
    activeCollection: PropTypes.string,
    close: PropTypes.func,
    editCollection: PropTypes.func,
    coll: PropTypes.object,
    createCollection: PropTypes.func,
    creatingCollection: PropTypes.bool,
    createCollectionBrowseWarc: PropTypes.func,
    error: PropTypes.string,
    fromCollection: PropTypes.string,
    showModal: PropTypes.bool,
    visible: PropTypes.bool,
    createOrEdit: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.xhr = null;
    this.interval = null;
    this.fileObj = null;
    this.state = {
      file: "",
      isUploading: false,
      listID: 0,
      urlValid: false,
      emailValid: false,
      isHidden: true,
      publisher: "",
      publisherOriginal: "",
      subjectHeaderList,
      subjectHeadingText: "",
      personHeaderList,
      personHeadingText: "",
      collTitle: "",
      title: "",
      pubTitleOriginal: "",
      collYear: "",
      copTitle: "",
      surName: "",
      status: null,
      persName: "",
      progress: 0,
      usermail: "",
      emailOfRightsholder: "",
      creatorList,
      isPublic: false,
      creatorLegend,
      noteToDachs: "",
      publishYear: "",
      projektcode: "",
      projektcodeValid: false,
      selectedGroupName: "corporate/institutional name",
      url: "",
      ticketState: "open",
      isCollLoaded: true,
      recordingUrl: "",
      recordingTimestamp: "",
      targetColl: props.fromCollection ? "chosen" : "auto",
      doi: "",
    };
  }

  // only if used in "edit metadata" or "view/edit metadata", not in "create new archive"
  componentDidMount() {
    if (this.props.createOrEdit === "edit") {
      const self = this;
      const promise1 = new Promise(function (resolve, reject) {
        console.log(self.props.coll.get("personHeaderList"));
        var didSucceed = JSON.parse(
          self.props.coll.get("personHeaderList").replace(/'/g, '"')
        );
        resolve(didSucceed);
      });
      const promise2 = new Promise(function (resolve, reject) {
        console.log(self.props.coll.get("subjectHeaderList"));
        var didSucceed = JSON.parse(
          self.props.coll.get("subjectHeaderList").replace(/'/g, '"')
        );
        resolve(didSucceed);
      });
      const promise3 = new Promise(function (resolve, reject) {
        console.log(self.props.coll.get("creatorList"));
        var didSucceed = JSON.parse(
          self.props.coll.get("creatorList").replace(/'/g, '"')
        );
        resolve(didSucceed);
      });

      Promise.all([promise1, promise2, promise3])
        .then(function (values) {
          self.setState((state) => {
            return {
              personHeaderList: values[0],
              subjectHeaderList: values[1],
              creatorList: values[2],
            };
          });
        })
        .catch((err) => console.log("There was an error:" + err));

      this.setState((state) => {
        return {
          listID: this.props.coll.get("listID"),
          publisher: this.props.coll.get("publisher"),
          publisherOriginal: this.props.coll.get("publisherOriginal"),
          subjectHeadingText: this.props.coll.get("subjectHeadingText"),
          personHeadingText: this.props.coll.get("personHeadingText"),
          collTitle: this.props.coll.get("collTitle"),
          title: this.props.coll.get("title"),
          doi: this.props.coll.get("doi"),
          pubTitleOriginal: this.props.coll.get("pubTitleOriginal"),
          projektcode: this.props.coll.get("projektcode"),
          collYear: this.props.coll.get("collYear"),
          copTitle: this.props.coll.get("copTitle"),
          noteToDachs: this.props.coll.get("noteToDachs"),
          surName: this.props.coll.get("surName"),
          persName: this.props.coll.get("persName"),
          usermail: this.props.coll.get("usermail"),
          emailOfRightsholder: this.props.coll.get("emailOfRightsholder"),
          publishYear: this.props.coll.get("publishYear"),
          selectedGroupName: "corporate/institutional name",
          url: this.props.coll.get("url"),
          ticketState: this.props.coll.get("ticketState"),
        };
      });
    }
  }

  cancelWarc = () => {
    this.setState((state) => {
      return {
        open: false,
        file: "",
        canCancel: true,
        isUploading: false,
        status: null,
        isIndexing: false,
        progress: 0,
        targetColl: this.props.fromCollection ? "chosen" : "auto",
      };
    });
  };

  checkEmail = () => {
    this.setState({ checkEmail: true });
  };

  close = () => {
    const { close } = this.props;
    if (this.state.isUploading && this.xhr && this.state.canCancel) {
      this.xhr.upload.removeEventListener("progress", this.uploadProgress);
      this.xhr.removeEventListener("load", this.uploadSuccess);
      this.xhr.removeEventListener("loadend", this.uploadComplete);
      this.xhr.abort();
    }
    close();
  };

  filePicker = (evt) => {
    if (evt.target.files.length > 0) {
      this.fileObj = evt.target.files[0]; // eslint-disable-line
      this.setState((state) => {
        return {
          file: this.fileObj.name,
          urlValid: "",
        };
      });
    }
  };

  focusInput = (evt) => {
    this.input.setSelectionRange(0, evt.target.value.length);
  };

  handleInput = (evt) => {
    this.setState({ [evt.target.name]: evt.target.value });
  };
  handleChange = (evt) => {
    if (evt.target.type === "radio") {
      this.setState({ [evt.target.name]: evt.target.value === "yes" });
    } else {
      this.setState({ [evt.target.name]: evt.target.value });
    }
  };

  goToCollections = () => {
    const { auth, history } = this.props;
    history.push(`/${auth.getIn(["user", "username"])}`);
  };

  groupSelect = (evt) => {
    this.setState({ [evt.target.name]: evt.target.value });
    this.setState({ selectedGroupName: evt.target.value });
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
        .then((res) => res.json())
        .then(this.indexResponse);
    }, 75);
  };
  indexingComplete = (user, coll) => {
    const {
      title,
      creatorList,
      noteToDachs,
      subjectHeaderList,
      subjectHeadingText,
      personHeaderList,
      publisher,
      publisherOriginal,
      pubTitleOriginal,
      personHeadingText,
      collTitle,
      collYear,
      copTitle,
      surName,
      persName,
      usermail,
      emailOfRightsholder,
      selectedGroupName,
      projektcode,
      publishYear,
      listID,
      url,
      doi,
    } = this.state;

    this.props.createCollectionBrowseWarc(
      coll,
      title,
      JSON.stringify(creatorList),
      JSON.stringify(subjectHeaderList),
      JSON.stringify(personHeaderList),
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
      listID,
      url,
    );
    this.props.close();
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
  onRemoveItem = (item) => {
    this.setState({
      creatorList: this.state.creatorList.filter((el) => el !== item),
    });
  };
  onRemoveSubject = (item) => {
    this.setState({
      subjectHeaderList: this.state.subjectHeaderList.filter(
        (el) => el !== item
      ),
    });
  };
  onRemovePerson = (item) => {
    this.setState({
      personHeaderList: this.state.personHeaderList.filter((el) => el !== item),
    });
  };
  onAddItem = () => {
    this.setState({ listID: this.state.listID + 1 });
    if (this.state.selectedGroupName === "corporate/institutional name") {
      let tempText = "C/I name: " + this.state.collTitle;
      this.state.copTitle !== ""
        ? (tempText += ", " + this.state.copTitle)
        : null;

      const temp = {
        htmlText: tempText,
        id: this.state.listID,
      };
      this.setState((state) => {
        const creatorList = [...state.creatorList, temp];
        return {
          creatorList,
          collTitle: "",
          copTitle: "",
        };
      });
    } else {
      let tempText = "Person: " + this.state.persName;
      this.state.surName !== ""
        ? (tempText += ", " + this.state.surName)
        : null;
      this.state.collYear !== ""
        ? (tempText += " - " + this.state.collYear)
        : null;
      const temp = {
        htmlText: tempText,
        id: this.state.listID,
        personal_name: this.state.persName,
        surname: this.state.surName,
        coll_year: this.state.collYear,
      };
      this.setState((state) => {
        const creatorList = [...state.creatorList, temp];
        return {
          creatorList,
          persName: "",
          surName: "",
          collYear: "",
        };
      });
    }
  };

  onAddSubject = () => {
    this.setState({ listID: this.state.listID + 1 });

    const temp = {
      htmlText: this.state.subjectHeadingText,
      id: this.state.listID,
    };
    this.setState((state) => {
      const subjectHeaderList = [...state.subjectHeaderList, temp];
      return {
        subjectHeaderList,
        subjectHeadingText: "",
      };
    });
  };
  onAddPerson = () => {
    this.setState({ listID: this.state.listID + 1 });

    const temp = {
      htmlText: this.state.personHeadingText,
      id: this.state.listID,
    };
    this.setState((state) => {
      const personHeaderList = [...state.personHeaderList, temp];
      return {
        personHeaderList,
        personHeadingText: "",
      };
    });
  };

  onClearArray = () => {
    this.setState({ list: [] });
  };
  validateCollYear = () => {
    const { collYear } = this.state;
    const myTest = /[0-9]{4}( - [0-9]{4})?/;
    return myTest.test(collYear);
  };

  validatePublishYear = () => {
    const { publishYear } = this.state;
    const myTest = /[0-9]{4}([0-9]{2})?([0-9]{2})?/;
    return myTest.test(publishYear);
  };
  rebuildTooltip = () => {
    ReactTooltip.rebuild();
  };

  submit = (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
    const {
      file,
      title,
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
      emailOfRightsholder,
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
      targetColl,
    } = this.state;
    const { activeCollection } = this.props;
    if (!file) {
      this.props.createCollection(
        title,
        url,
        isPublic,
        JSON.stringify(creatorList),
        JSON.stringify(subjectHeaderList),
        JSON.stringify(personHeaderList),
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
        listID,
        ticketState,
        isCollLoaded,
        recordingUrl,
        recordingTimestamp,
        ""
      );
    } else {
      this.xhr = new XMLHttpRequest();
      const target = targetColl === "chosen" ? activeCollection : "";
      const url = apiFormatUrl(
        `${apiPath}/upload?force-coll=${title}&filename=${file}`
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

      this.xhr.send(this.fileObj);

      return this.xhr;
    }
  };

  submitChanges = (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
    const {
      title,
      doi,
      creatorList,
      noteToDachs,
      subjectHeaderList,
      subjectHeadingText,
      personHeaderList,
      publisher,
      publisherOriginal,
      pubTitleOriginal,
      personHeadingText,
      collTitle,
      collYear,
      copTitle,
      surName,
      persName,
      usermail,
      emailOfRightsholder,
      selectedGroupName,
      publishYear,
      listID,
    } = this.state;
    const { coll } = this.props;
    this.props.editCollection(
      coll.get("id"),
      title,
      doi,
      JSON.stringify(creatorList),
      JSON.stringify(subjectHeaderList),
      JSON.stringify(personHeaderList),
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
      publishYear,
      pubTitleOriginal,
      personHeadingText,
      subjectHeadingText,
      listID
    );
    this.props.close();
  };

  toggleHidden = (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
    this.setState({
      isHidden: !this.state.isHidden,
    });
  };
  triggerFile = () => {
    this.fileField.click();
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

  validateEmail = () => {
    const { emailValid, usermail } = this.state;
    /*if (checkEmail && ( email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) === null)) {
      return 'error';
    }
    return null;*/
    const myTest = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[]|\\[])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[]|\\[])+)\])/;
    if (myTest.test(usermail) === true && !emailValid) {
      this.setState({ emailValid: true });
    } else if (myTest.test(usermail) === false && emailValid) {
      this.setState({ emailValid: false });
    }
  };

  ValidateProjektcode = () => {
    const { projektcodeValid, projektcode } = this.state;
    /*if (checkEmail && ( email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) === null)) {
      return 'error';
    }
    return null;*/
    const myTest = /^[A-Za-z0-9 ]{1,8}$/;
    if (myTest.test(projektcode) === true && !projektcodeValid) {
      this.setState({ projektcodeValid: true });
    } else if (myTest.test(projektcode) === false && projektcodeValid) {
      this.setState({ projektcodeValid: false });
    }
  };

  validateURL = () => {
    const { url, urlValid } = this.state;
    ///^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/
    //const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const myTest = /((([A-Za-z]{3,9}(:|.)(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/i;
    //this.setState({ urlValid: myTest.test(url) });
    if (myTest.test(url) === true && !urlValid) {
      this.setState({ urlValid: true });
    } else if (myTest.test(url) === false && urlValid) {
      this.setState({ urlValid: false });
    }
    /*
  //if (url===null || url==='') { return null; }

    var valid = url.match(/^(http[s]?:\/\/|www\.|[a-z0-9]+)([a-z0-9]+[a-z0-9\-])+\.[a-zA-Z]{2,3}$/i);
    if (valid===true) {
      return true;
    } else {
      return true;
    }*/
  };
  validateAuthorship = () => {
    const {
      collTitle,
      copTitle,
      persName,
      surName,
      collYear,
      creatorList,
    } = this.state;

    if (this.state.selectedGroupName == "corporate/institutional name") {
      if (!collTitle || creatorList.length == 0) {
        return "error";
      }
    } else {
      if (!surName || creatorList.length == 0) {
        return "error";
      }
    }

    return null;
  };

  validateTitle = () => {
    const { title } = this.state;
    if (!title) {
      return "error";
    }
    return null;
  };
  validatePublisher = () => {
    const { publisher } = this.state;
    if (!publisher) {
      return "error";
    }
    return null;
  };

  titleValidation = () => {
    return this.props.error ? "error" : null;
  };

  togglePublic = (evt) => {
    this.setState({ isPublic: !this.state.isPublic });
  };

  render() {
    const { creatingCollection, error, visible } = this.props;
    const {
      collTitle,
      collYear,
      emailValid,
      file,
      surName,
      copTitle,
      isHidden,
      isPublic,
      isUploading,
      noteToDachs,
      title,
      publisherOriginal,
      publishYear,
      usermail,
      emailOfRightsholder,
      persName,
      progress,
      pubTitleOriginal,
      publisher,
      selectedGroupName,
      projektcode,
      projektcodeValid,
      subjectHeadingText,
      personHeadingText,
      creatorLegend,
      status,
      url,
      urlValid,
      creatorList,
    } = this.state;

    const text =
      this.props.createOrEdit === "create" ? `Fields marked with asterisk (*) are required. You can still edit them after creating a collection.` : ``
    if (visible) {
      this.rebuildTooltip();
    }
    return (
      <React.Fragment>
        <Modal closeCb={this.close} header={text} visible={visible}>
          <form
            onSubmit={this.submit}
            id="create-coll"
            className="form-horizontal"
          >
            {error && (
              <Alert variant="danger">
                {collection[error] || "Error encountered"}
              </Alert>
            )}
            {!__DESKTOP__ && (
              <Container>
                <Row>
                  <Form.Group id="fieldset" style={{"width": "100%"}}>
                    <label data-tip data-for="email-info" className="mb-1">
                      <InfoIcon />
                    </label>
                    <ReactTooltip id="email-info" place="top" effect="solid">
                      Any further information regarding your OpenDACHS request will be sent to this e-mail address.
                    </ReactTooltip>
                    <div
                      style={{
                        marginRight: "4px",
                        display: "inline",
                        float: "left",
                        color: emailValid ? "black" : "red",
                      }}
                    >
                      *Your e-mail address:
                    </div>

                    <Form.Control
                      style={{
                        border: emailValid
                          ? "1px solid black"
                          : "1px solid #ff1a1a",
                      }}
                      aria-label="email"
                      randomPropName={this.validateEmail()}
                      name="usermail"
                      placeholder="Please enter a valid e-mail address you have access to"
                      autoFocus
                      required
                      disabled={this.props.createOrEdit === "edit" && this.state.ticketState !== "open"}
                      value={usermail}
                      onChange={this.handleChange}
                      onBlur={this.checkEmail}
                    />
                  </Form.Group>
                </Row>

                <Row>
                  <Form.Group id="fieldset" style={{"width": "100%"}}>
                    <label data-tip data-for="url-info" className="mb-1">
                      <InfoIcon />
                    </label>
                    <ReactTooltip id="url-info" place="top" effect="solid">
                      URL of the web resource.
                    </ReactTooltip>
                    <div
                      style={{
                        marginRight: "4px",
                        display: "inline",
                        float: "left",
                        color: urlValid ? "black" : "red",
                      }}
                    >
                      *URL (URL of recorded page if WARC is provided):
                    </div>
                    <Form.Control
                      aria-label="url"
                      style={{
                        border: urlValid
                          ? "1px solid black"
                          : "1px solid #ff1a1a",
                      }}
                      randomPropName={this.validateURL()}
                      name="url"
                      disabled={this.props.createOrEdit === "edit"}
                      placeholder="Please enter a valid webpage url"
                      value={url}
                      onChange={this.handleInput}
                    />
                    <div>
                      <button
                        onClick={this.toggleHidden}
                        disabled={this.props.createOrEdit === "edit"}
                      >
                        <WarcIcon /> I already have a .warc file to upload
                      </button>
                      {!isHidden && (
                        <div>
                          <label htmlFor="upload-file">
                            <WarcIcon />
                            WARC/ARC file to upload:{" "}
                          </label>

                          <div className="input-group">
                            <input
                              type="text"
                              id="upload-file"
                              value={file}
                              name="upload-file-text"
                              className="form-control"
                              placeholder="Select a web archive file"
                              readOnly
                              onClick={this.triggerFile}
                              style={{ backgroundColor: "white" }}
                            />

                            <button
                              aria-label="pick file..."
                              type="button"
                              class="btn btn-success"
                              onClick={this.triggerFile}
                            >
                              Pick file …
                            </button>

                            <input
                              type="file"
                              onChange={this.filePicker}
                              ref={(obj99) => {
                                this.fileField = obj99;
                              }}
                              name="uploadFile"
                              style={{ display: "none" }}
                              accept=".gz,.warc,.arc,.har"
                            />
                            <button
                              onClick={this.cancelWarc}
                              disabled={!this.state.canCancel}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </Form.Group>
                </Row>

                <Row>
                  <Form.Group id="fieldset" style={{"width": "100%"}}>
                    <label data-tip data-for="title-info" className="mb-1">
                      <InfoIcon />
                    </label>
                    <ReactTooltip id="title-info" place="top" effect="solid">
                      Name or title of the resource. If resource is in Chinese/Japanese/Korean etc., please put Latin transcription here (Pinyin, Hepburn etc.).
                    </ReactTooltip>
                    <div
                      style={{
                        marginRight: "4px",
                        display: "inline",
                        float: "left",
                        color: title ? "black" : "red",
                      }}
                    >
                      *Title (Latin alphabet):
                    </div>

                    <Form.Control
                      className="mb-2"
                      type="text"
                      randomPropName={this.validateTitle()}
                      placeholder=""
                      inputRef={(obj) => {
                        this.input = obj;
                      }}
                      style={{
                        border: title ? "1px solid black" : "1px solid #ff1a1a",
                      }}
                      id="title"
                      name="title"
                      onFocus={this.focusInput}
                      onChange={this.handleInput}
                      value={title}
                    />
                    <label data-tip data-for="title-orig-info" className="mb-1">
                      <InfoIcon />
                    </label>
                    <ReactTooltip id="title-orig-info" place="top" effect="solid">
                      If applicable: same information in original script, e.g. Chinese, Japanese, Korean script.
                    </ReactTooltip>
                    <div
                      style={{
                        marginRight: "4px",
                        display: "inline",
                        float: "left",
                      }}
                    >
                      Title (original script):
                    </div>

                    <Form.Control
                      className="mb-2"
                      type="text"
                      placeholder="e.g. Chinese, Japanese, Korean script"
                      inputRef={(obj) => {
                        this.input = obj;
                      }}
                      id="pubTitleOriginal"
                      name="pubTitleOriginal"
                      onFocus={this.focusInput}
                      onChange={this.handleInput}
                      value={pubTitleOriginal}
                    />
                    <label data-tip data-for="proj-code-info" className="mb-1">
                      <InfoIcon />
                    </label>
                    <ReactTooltip id="proj-code-info" place="top" effect="solid">
                      Alphanumeric, max. 8 characters, no special characters. Suggestion: Use acronym or significant title word of your publication. Choose wisely, this code is used to group archives under a topic, e.g. all web resources you cited in your publication.
                    </ReactTooltip>
                    <div
                      style={{
                        marginRight: "4px",
                        display: "inline",
                        float: "left",
                        color: projektcodeValid ? "black" : "red",
                      }}
                    >
                      *Project code (to join arcives under a topic):
                    </div>
                    <Form.Control
                      style={{
                        border: projektcodeValid
                          ? "1px solid black"
                          : "1px solid #ff1a1a",
                      }}
                      aria-label="text"
                      randomPropName={this.ValidateProjektcode()}
                      name="projektcode"
                      placeholder="Alphanumeric, max. 8 characters, no special characters"
                      autoFocus
                      disabled={this.props.createOrEdit === "edit" && this.state.ticketState !== "open"}
                      required
                      value={projektcode}
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                  <Form.Group id="fieldset">
                    <label data-tip data-for="authorship-info" className="mb-1">
                      <InfoIcon />
                    </label>
                    <ReactTooltip id="authorship-info" place="top" effect="solid">
                      Person or institution that authored the resource. If resource is in Chinese/Japanese/Korean etc., please put Latin transcription here (Pinyin, Hepburn etc.).
                    </ReactTooltip>
                    <div
                      style={{
                        marginRight: "4px",
                        display: "inline",
                        float: "left",
                        color:
                          selectedGroupName === "corporate/institutional name"
                            ? collTitle || creatorList.length > 0
                              ? "black"
                              : "red"
                            : persName || creatorList.length > 0
                            ? "black"
                            : "red",
                      }}
                    >
                      *Author/creator information (Latin alphabet):
                    </div>
                    <div
                      style={{
                        marginRight: "4px",
                        display: "block",
                        float: "left",
                      }}
                    >
                      Select what kind of author/creator to provide:
                    </div>
                    <Form.Control
                      as="select"
                      inputRef={(ref) => {
                        this.state.groupSelect = ref;
                      }}
                      onChange={this.groupSelect}
                      className="mb-2"
                    >
                      {this.state.creatorLegend.map((group) => (
                        <option
                          key={group}
                          value={group}
                          selected={this.state.selectedGroupName == group}
                        >
                          {group}
                        </option>
                      ))}
                    </Form.Control>

                    {this.state.selectedGroupName ==
                    "corporate/institutional name" ? (
                      <React.Fragment>
                        <Form.Control
                          className="mb-2"
                          type="text"
                          randomPropName={this.validateAuthorship()}
                          placeholder="Enter full name of corporate/institution"
                          inputRef={(obj) => {
                            this.input = obj;
                          }}
                          style={{
                            border:
                              collTitle || creatorList.length > 0
                                ? "1px solid black"
                                : "1px solid #ff1a1a",
                          }}
                          id="collTitle"
                          name="collTitle"
                          onFocus={this.focusInput}
                          onChange={this.handleInput}
                          value={collTitle}
                        />
                        <label data-tip data-for="authorship-orig-info" className="mb-1">
                          <InfoIcon />
                        </label>
                        <ReactTooltip id="authorship-orig-info" place="top" effect="solid">
                          If applicable: same information in original script, e.g. Chinese, Japanese, Korean script.
                        </ReactTooltip>
                        <div
                          style={{
                            marginRight: "4px",
                            display: "inline",
                            float: "left",
                          }}
                        >
                          Author/creator information (orig. script):
                        </div>

                        <Form.Control
                          type="text"
                          placeholder=""
                          inputRef={(obj) => {
                            this.input = obj;
                          }}
                          id="copTitle"
                          name="copTitle"
                          onFocus={this.focusInput}
                          onChange={this.handleInput}
                          value={copTitle}
                        />
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <Form.Control
                          className="mb-2"
                          type="text"
                          randomPropName={this.validateAuthorship()}
                          placeholder="Enter name as 'surname, given name'"
                          inputRef={(obj) => {
                            this.input = obj;
                          }}
                          style={{
                            border:
                              persName || creatorList.length > 0
                                ? "1px solid black"
                                : "1px solid #ff1a1a",
                          }}
                          id="persName"
                          name="persName"
                          onFocus={this.focusInput}
                          onChange={this.handleInput}
                          value={persName}
                        />

                        <label data-tip data-for="authorship-orig-info2" className="mb-1">
                          <InfoIcon />
                        </label>
                        <ReactTooltip id="authorship-orig-info2" place="top" effect="solid">
                          If applicable: same information in original script, e.g. Chinese, Japanese, Korean script.
                        </ReactTooltip>
                        <div
                          style={{
                            marginRight: "4px",
                            display: "inline",
                            float: "left",
                          }}
                        >
                          Author/creator information (orig. script):
                        </div>

                        <Form.Control
                          type="text"
                          placeholder=""
                          inputRef={(obj) => {
                            this.input = obj;
                          }}
                          id="surName"
                          name="surName"
                          onFocus={this.focusInput}
                          onChange={this.handleInput}
                          value={surName}
                        />
                      </React.Fragment>
                    )}

                    <Row>
                      <button
                        type="button"
                        className="btn btn-success mt-2 mx-3"
                        style={{ display: "inline", float: "right", width: "100%"}}
                        onClick={this.onAddItem}
                        disabled={!persName && !collTitle}
                      >
                        Add further author/creator
                      </button>
                    </Row>

                    {this.state.creatorList.length > 0 && (
                      <React.Fragment>
                        {this.state.creatorList.map((item) => (
                          <AuthorshipItem
                            id={item.id}
                            htmlText={item.htmlText}
                            item={item}
                            onRemoveItem={this.onRemoveItem}
                          />
                        ))}
                      </React.Fragment>
                    )}

                  </Form.Group>
                </Row>

                <Row>
                  <Form.Group
                    id="fieldset"
                    randomPropName={this.titleValidation()}
                    style={{"width": "100%"}}
                  >
                    <label data-tip data-for="authorship-orig-info2" className="mb-1">
                      <InfoIcon />
                    </label>
                    <ReactTooltip id="authorship-orig-info2" place="top" effect="solid">
                      The name of the entity that holds, archives, publishes, prints, distributes, releases, issues or produces the resource. This property will be used to formulate the citation. If resource is in Chinese/Japanese/Korean etc., please put Latin transcription here (Pinyin, Hepburn etc.).
                    </ReactTooltip>
                    <div
                      style={{
                        marginRight: "4px",
                        display: "inline",
                        float: "left",
                        color: publisher ? "black" : "red",
                      }}
                    >
                      *Publisher (Latin alphabet):
                    </div>

                    <Form.Control
                      className="mb-2"
                      type="text"
                      placeholder="Enter the name of the publishing entity"
                      randomPropName={this.validatePublisher()}
                      inputRef={(obj) => {
                        this.input = obj;
                      }}
                      style={{
                        border: publisher
                          ? "1px solid black"
                          : "1px solid #ff1a1a",
                      }}
                      id="publisher"
                      name="publisher"
                      onFocus={this.focusInput}
                      onChange={this.handleInput}
                      value={publisher}
                    />
                    <label data-tip data-for="publ-orig-info" className="mb-1">
                      <InfoIcon />
                    </label>
                    <ReactTooltip id="publ-orig-info" place="top" effect="solid">
                      If applicable: same information in original script, e.g. Chinese, Japanese, Korean script.
                    </ReactTooltip>
                    <div
                      style={{
                        marginRight: "4px",
                        display: "inline",
                        float: "left",
                      }}
                    >
                      Publisher (orig. script):
                    </div>

                    <Form.Control
                      className="mb-2"
                      type="text"
                      placeholder="e.g. Chinese, Japanese, Korean script"
                      inputRef={(obj) => {
                        this.input = obj;
                      }}
                      id="publisherOriginal"
                      name="publisherOriginal"
                      onFocus={this.focusInput}
                      onChange={this.handleInput}
                      value={publisherOriginal}
                    />
                    <label data-tip data-for="date-info" className="mb-1">
                      <InfoIcon />
                    </label>
                    <ReactTooltip id="date-info" place="top" effect="solid">
                      Date at which the resource was made publicly available.
                    </ReactTooltip>
                    <div
                      style={{
                        marginRight: "4px",
                        display: "inline",
                        float: "left",
                      }}
                    >
                      Publication date:
                    </div>

                    <Form.Control
                      type="text"
                      placeholder="YYYY-MM-DD"
                      randomPropName={this.validatePublishYear()}
                      inputRef={(obj) => {
                        this.input = obj;
                      }}
                      id="publishYear"
                      name="publishYear"
                      onFocus={this.focusInput}
                      onChange={this.handleInput}
                      value={publishYear}
                    />
                  </Form.Group>
                </Row>

                <Row>
                  <Form.Group id="fieldset" style={{"width": "100%"}}>
                    <label data-tip data-for="email-rightsholder-info" className="mb-1">
                      <InfoIcon />
                    </label>
                    <ReactTooltip id="email-rightsholder-info" place="top" effect="solid">
                      E-mail address of the rightsholder. The e-mail address is usually found at the end of the webpage, e.g. under "copyright information", "contact", "about" etc.
                    </ReactTooltip>
                    <div
                      style={{
                        marginRight: "4px",
                        display: "inline",
                        float: "left",
                      }}
                    >
                      E-mail of rightsholder:
                    </div>

                    <Form.Control
                      aria-label="email"
                      name="emailOfRightsholder"
                      placeholder=""
                      autoFocus
                      value={emailOfRightsholder}
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                </Row>

                <Row>
                  <Form.Group id="fieldset" style={{"width": "100%"}}>
                    <Row className="mx-0">
                      <Col xs={9} className="pl-0 pr-2">
                        <label data-tip data-for="subj-info" className="mb-1">
                          <InfoIcon />
                        </label>
                        <ReactTooltip id="subj-info" place="top" effect="solid">
                          Subject headings help to describe and categorize the web resource. The headings should conform to a list drawn from the Library of Congress, see 'LoC list'.
                        </ReactTooltip>
                        <div
                          style={{
                            marginRight: "4px",
                            display: "inline",
                            float: "left",
                          }}
                        >
                          Subject headings (in English; <a href="http://id.loc.gov/authorities/subjects.html" target="_blank">LoC list</a>):
                        </div>


                        <Form.Control
                          type="text"
                          placeholder="Enter a subject and click 'Add subject'"
                          inputRef={(obj) => {
                            this.input = obj;
                          }}
                          id="subjectHeadingText"
                          name="subjectHeadingText"
                          onFocus={this.focusInput}
                          onChange={this.handleInput}
                          value={subjectHeadingText}
                        />

                      </Col>
                      <Col className="mt-auto px-0">
                        <button
                          type="button"
                          class="btn btn-success"
                          onClick={this.onAddSubject}
                          disabled={!subjectHeadingText}
                          style={{ width: "100%"}}
                        >
                          Add subject
                        </button>
                      </Col>
                    </Row>
                    {this.state.subjectHeaderList.length > 0 && (
                      <React.Fragment>
                        {this.state.subjectHeaderList.map((item) => (
                          <PersonHeading
                            id={item.id}
                            htmlText={item.htmlText}
                            item={item}
                            onRemovePerson={this.onRemoveSubject}
                          />
                        ))}
                      </React.Fragment>
                    )}
                  </Form.Group>
                  <Form.Group id="fieldset" style={{"width": "100%"}}>
                    <Row className="mx-0">
                      <Col xs={9} className="pl-0 pr-2">
                        <label data-tip data-for="person-info" className="mb-1">
                          <InfoIcon />
                        </label>
                        <ReactTooltip id="person-info" place="top" effect="solid">
                          Person headings are persons the web resource focuses on (e.g. a website ABOUT Shakespeare).
                        </ReactTooltip>
                        <div
                          style={{
                            marginRight: "4px",
                            display: "inline",
                            float: "left",
                          }}
                        >
                          Person headings:
                        </div>

                        <Form.Control
                          type="text"
                          placeholder="Enter a name and click 'Add person'"
                          inputRef={(obj) => {
                            this.input = obj;
                          }}
                          id="personHeadingText"
                          name="personHeadingText"
                          onFocus={this.focusInput}
                          onChange={this.handleInput}
                          value={personHeadingText}
                        />
                      </Col>
                      <Col className="mt-auto px-0">
                        <button
                          type="button"
                          class="btn btn-success"
                          onClick={this.onAddPerson}
                          disabled={!personHeadingText}
                          style={{ width: "100%" }}
                        >
                          Add person
                        </button>

                      </Col>
                    </Row>
                    {this.state.personHeaderList.length > 0 && (
                      <React.Fragment>
                        {this.state.personHeaderList.map((item) => (
                          <PersonHeading
                            id={item.id}
                            htmlText={item.htmlText}
                            item={item}
                            onRemovePerson={this.onRemovePerson}
                          />
                        ))}
                      </React.Fragment>
                    )}
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group id="fieldset" style={{"width": "100%"}}>
                    <label data-tip data-for="note-to-dachs-info" className="mb-1">
                      <InfoIcon />
                    </label>
                    <ReactTooltip id="note-to-dachs-info" place="top" effect="solid">
                      If you have comments for the DACHS team you can post them here.
                    </ReactTooltip>
                    <div
                      style={{
                        marginRight: "4px",
                        display: "inline",
                        float: "left",
                      }}
                    >
                      Note to DACHS team:
                    </div>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder=""
                      inputRef={(obj) => {
                        this.input = obj;
                      }}
                      id="noteToDachs"
                      name="noteToDachs"
                      onFocus={this.focusInput}
                      onChange={this.handleInput}
                      value={noteToDachs}
                    />
                  </Form.Group>
                </Row>

                {isUploading && (
                  <React.Fragment>
                    <div className="wr-progress-bar">
                      <div
                        className="progress"
                        style={{ width: `${progress || 0}%` }}
                      />
                      <div className="progress-readout">{`${
                        progress || 0
                      }%`}</div>
                    </div>
                    {status && <p>{status}</p>}
                  </React.Fragment>
                )}
              </Container>
            )}
            <button
              className="btn btn-lg btn-primary btn-block"
              onClick={this.props.createOrEdit === "create" ? this.submit : this.submitChanges}
              disabled={
                !emailValid ||
                !urlValid ||
                !projektcodeValid ||
                !title ||
                !publisher ||
                (creatingCollection && !error) ||
                (selectedGroupName === "corporate/institutional name"
                  ? !(collTitle || creatorList.length > 0)
                  : !(persName || creatorList.length > 0))
              }
              type="button"
            >
              {this.props.createOrEdit === "create" ? "Create" : "Save changes"}
            </button>
          </form>
        </Modal>
        <ReactTooltip
          className="extraClass"
          delayHide={100}
          effect="solid"
          type="info"
        />
      </React.Fragment>
    );
  }
}

export default NewCollection;
