/* eslint-disable no-nested-ternary */
/* eslint-disable nonblock-statement-body-position */
/* eslint-disable indent */
import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import config from "config";

import { apiFetch, remoteBrowserMod } from "helpers/utils";

import OutsideClick from "components/OutsideClick";
import { PatchIcon, SnapshotIcon } from "components/icons";
import { Blinker, SizeCounter } from "containers";

import "./style.scss";

class ModeSelectorUI extends PureComponent {
  static contextTypes = {
    currMode: PropTypes.string,
  };

  static propTypes = {
    activeBrowser: PropTypes.string,
    match: PropTypes.object,
    timestamp: PropTypes.string,
    reviewing: PropTypes.bool,
    url: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };
  }

  onStop = (evt) => {
    evt.preventDefault();

    const {
      match: {
        params: { coll, rec, user },
      },
      collection,
      auth,
      reviewing
    } = this.props;
    const username = auth.getIn(["user", "username"]);
    const ownername = collection.get("owner");
    const isOwner = username === ownername;
    if (reviewing) {
      //this.props.history.push('/');
      // this.props.history.push(`/${user}/review`);
      window.close();
    } else if (this.context.currMode === "live") {
      //this.props.history.push('/');
      this.props.history.push(`/${user}`);
    } else if (this.context.currMode.indexOf("replay") !== -1) {
      //window.location.href = `/${user}/${coll}/index`;
      //this.props.history.push(`/${user}/${coll}/manage`);
      this.props.history.push(`/${user}`);
    } else {
      //window.location.href = `/${user}/${coll}/index?query=session:${rec}`;
      //this.props.history.push(`/${user}/${coll}/manage?query=session:${rec}`);
      this.props.history.push(`/${user}`);
    }
  };

  onReplay = () => {
    const {
      activeBrowser,
      match: {
        params: { coll, user },
      },
      timestamp,
      url,
    } = this.props;

    //window.location.href = `/${user}/${coll}/${remoteBrowserMod(activeBrowser, timestamp, '/')}${url}`;
    this.props.history.push(
      `/${user}/${coll}/${remoteBrowserMod(
        activeBrowser,
        timestamp,
        "/"
      )}${url}`
    );
  };

  onPatch = () => {
    if (this.context.currMode === "record") return;
    console.log(this.props.collection.get("ticketState"));
    if (
      this.props.collection.get("ticketState") !== "open" &&
      !this.props.collection.get("reviewing")
    )
      return;
    if (
      this.props.collection.get("ticketState") !== "pending" &&
      this.props.collection.get("reviewing")
    )
      return;
    const {
      activeBrowser,
      history,
      match: {
        params: { coll },
      },
      timestamp,
      url,
    } = this.props;

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
        return res.json();
      })
      .then(({ url }) => history.push(url.replace(config.appHost, "")))
      .catch((err) => {
        console.log("error", err);
      });
  };

  onRecord = () => {
    if (this.context.currMode === "record") return;

    const {
      activeBrowser,
      history,
      match: {
        params: { coll },
      },
      url,
    } = this.props;
    const data = {
      url,
      coll,
      mode: "record",
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
        history.push(url.replace(config.appHost, ""));
      })
      .catch((err) => {
        console.log("error", err);
      });
  };

  onStaticCopy = () => {};

  blinkIt = () => {
    if (!document.querySelector(".Blink").classList.contains("off")) {
      document.querySelector(".Blink").classList.add("off");
    } else {
      document.querySelector(".Blink").classList.remove("off");
    }
  };

  blinkAnimation = () => {
    setInterval(this.blinkIt, this.flickerTime);
  };

  close = () => {
    if (this.state.open) {
      this.setState({ open: false });
    }
  };

  toggle = () => {
    this.setState({ open: !this.state.open });
  };

  render() {
    const { currMode } = this.context;
    const { collection, auth, reviewing } = this.props;
    const { open } = this.state;
    let modeMessage;
    let modeMarkup;
    console.log(reviewing);
    const username = auth.getIn(["user", "username"]);
    const ownername = collection.get("owner");
    const isOwner = username === ownername;
    const isReplay = currMode.indexOf("replay") !== -1;
    const isRecord = currMode === "record";
    const isExtract = currMode.indexOf("extract") !== -1;
    const isPatch = currMode === "patch";
    const isLive = currMode === "live";
    const isAdmin = auth.getIn(['user', 'role']) === 'admin';
    const isWrite = ["extract", "extract_only", "patch", "record"].includes(
      currMode
    );

    switch (currMode) {
      case "live":
        modeMessage = "Previewing";
        modeMarkup = (
          <span className="btn-content">
            <span className="preview-mode" aria-label="Preview icon" />
            <span className="hidden-xs">{modeMessage}</span>
          </span>
        );
        break;
      case "record":
        modeMessage = "Capturing";
        modeMarkup = (
          <span className="btn-content">
            <Blinker /> <span className="hidden-xs">{modeMessage}</span>
          </span>
        );
        break;
      case "replay":
      case "replay-coll":
        modeMessage = "Browsing";
        modeMarkup = (
          <span className="btn-content">
            <span
              className="glyphicon glyphicon-play-circle"
              aria-hidden="true"
            />{" "}
            <span className="hidden-xs">{modeMessage}</span>
          </span>
        );
        break;
      case "patch":
        modeMessage = "Patching";
        modeMarkup = (
          <span className="btn-content">
            <PatchIcon /> <span className="hidden-xs">{modeMessage}</span>
          </span>
        );
        break;
      case "extract":
      case "extract_only":
        modeMessage = "Extracting";
        modeMarkup = (
          <span className="btn-content">
            <Blinker /> <span className="hidden-xs">{modeMessage}</span>
          </span>
        );
        break;
      default:
        break;
    }

    const modeSelectorClasses = classNames("wr-mode-selector", "btn-group", {
      open,
    });
    const isLiveMsg = isLive ? "Start Capturing" : "Capture this URL again";

    return (
      <React.Fragment>
        {isRecord ? <button
                      onClick={this.onStop}
                      className="btn btn-default wr-mode-message content-action"
                      aria-label={`Finish ${modeMessage} session`}
                      title="You are recording all the pages you viewed in this session. Click here to finish this recording session and return to the collection list. You can still add more content later."
                      type="button"
                    >
                      <div className="btn-content" style={{ display: "flex", alignItems: "center" }}>
                        <svg width="10" height="10"><rect x="0" y="0" width="10" height="10" fill="#b81d12" /></svg>
                        <span style={{ display: "inline-block", textAlign: "left", paddingLeft: "10px" }}>
                          Stop <br/> Recording
                        </span>
                      </div>
                    </button>
                  : <button
                      onClick={this.onStop}
                      className="btn btn-default wr-mode-message content-action"
                      aria-label={`Finish ${modeMessage} session`}
                      title="Finish this reviewing session and return to the collection list."
                      type="button"
                    >
                      <span style={{ display: "inline-block", textAlign: "left", paddingLeft: "10px" }}>
                        Conclude <br/> Review
                      </span>
                    </button>}

        {currMode == "replay-coll" ? (
          <button
            onClick={this.onPatch}
            disabled={
              (collection.get("reviewing") && collection.get("ticketState") == "completed") ||
              (!collection.get("reviewing") && collection.get("ticketState") != "open")
            }
            className="btn btn-default wr-mode-message content-action"
            title={
              collection.get("reviewing") || collection.get("ticketState") == "open"
                ? "Record elements that are not yet in the collection."
                : "You cannot patch as the collection is already scheduled for review."
            }
            type="button"
            style={{width: "220px"}}
          >
            <span className="btn-content">
              <PatchIcon />{" "}
              <span className="hidden-xs" style={{width: "100px"}}>
                {collection.get("reviewing") || collection.get("ticketState") == "open"
                  ? "Add more content"
                  : "Already in review"}
              </span>
            </span>
          </button>
        ) : currMode == "patch" ? (
          <button
            onClick={this.onReplay}
            className="btn btn-default wr-mode-message content-action"
            aria-label={`Finish ${modeMessage} session`}
            type="button"
          >
            <span className="btn-content">
              <span
                className="glyphicon glyphicon-play-circle wr-mode-icon"
                aria-hidden="true"
              />{" "}
              {isReplay ? "Currently Browsing" : "Browse this URL"}
            </span>
          </button>
        ) : (
          <button
            onClick={this.onPatch}
            disabled="true"
            className="btn btn-default wr-mode-message content-action"
            title="Patching is available after finishing a recording and before submitting it for review."
            type="button"
            style={{width: "220px"}}
          >
            <span className="btn-content">
              <PatchIcon />{" "}
              <span className="hidden-xs">
                Add more content
              </span>
            </span>
          </button>
        )}
      {/*<button onClick={() => { console.log(this.context.currMode); console.log("reviewing: " + this.props.collection.get("reviewing")) }}>bla</button>*/}
      </React.Fragment>
    );
  }
}

export default ModeSelectorUI;
