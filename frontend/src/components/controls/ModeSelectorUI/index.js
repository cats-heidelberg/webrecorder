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
    } = this.props;
    const username = auth.getIn(["user", "username"]);
    const ownername = collection.get("owner");
    const isOwner = username === ownername;
    if (!isOwner || collection.get("reviewing")) {
      //this.props.history.push('/');
      this.props.history.push(`/${user}/review`);
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
      .then((res) => res.json())
      .then(({ url }) => history.push(url.replace(config.appHost, "")))
      .catch((err) => console.log("error", err));
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
      .then((res) => res.json())
      .then(({ url }) => history.push(url.replace(config.appHost, "")))
      .catch((err) => console.log("error", err));
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
    const { collection, auth } = this.props;
    const { open } = this.state;
    let modeMessage;
    let modeMarkup;

    const username = auth.getIn(["user", "username"]);
    const ownername = collection.get("owner");
    const isOwner = username === ownername;
    const isReplay = currMode.indexOf("replay") !== -1;
    const isRecord = currMode === "record";
    const isExtract = currMode.indexOf("extract") !== -1;
    const isPatch = currMode === "patch";
    const isLive = currMode === "live";
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
        <button
          onClick={this.onStop}
          className="btn btn-default wr-mode-message content-action"
          aria-label={`Finish ${modeMessage} session`}
          type="button"
        >
          <span className="btn-content">
            <span className="glyphicon glyphicon-stop" />{" "}
            <span className="hidden-xs">Stop</span>
          </span>
        </button>
        {currMode == "replay" ? (
          <button
            onClick={this.onPatch}
            disabled={
              isRecord ||
              isLive ||
              (collection.get("ticketState") !== "pending" &&
                collection.get("reviewing")) ||
              (collection.get("ticketState") !== "open" &&
                !collection.get("reviewing"))
            }
            className="btn btn-default wr-mode-message content-action"
            title={
              isRecord
                ? "Only available from replay after finishing a recording"
                : (collection.get("ticketState") !== "open" &&
                    !collection.get("reviewing")) ||
                  (collection.get("ticketState") !== "pending" &&
                    collection.get("reviewing"))
                ? "Not possible since Collection is in Review"
                : "Record elements that are not yet in the collection"
            }
            type="button"
          >
            <span className="btn-content">
              <PatchIcon />{" "}
              <span className="hidden-xs">
                {isPatch
                  ? "Currently Patching"
                  : (collection.get("ticketState") !== "open" &&
                      !collection.get("reviewing")) ||
                    (collection.get("ticketState") !== "pending" &&
                      collection.get("reviewing"))
                  ? "already in review"
                  : "Add more Content"}
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
            disabled={
              isRecord ||
              isLive ||
              (collection.get("ticketState") !== "pending" &&
                collection.get("reviewing")) ||
              (collection.get("ticketState") !== "open" &&
                !collection.get("reviewing"))
            }
            className="btn btn-default wr-mode-message content-action"
            title={
              isRecord
                ? "Only available from replay after finishing a recording"
                : (collection.get("ticketState") !== "open" &&
                    !collection.get("reviewing")) ||
                  (collection.get("ticketState") !== "pending" &&
                    collection.get("reviewing"))
                ? "Not possible since Collection is in Review"
                : "Record elements that are not yet in the collection"
            }
            type="button"
          >
            <span className="btn-content">
              <PatchIcon />{" "}
              <span className="hidden-xs">
                {isPatch
                  ? "Currently Patching"
                  : (collection.get("ticketState") !== "open" &&
                      !collection.get("reviewing")) ||
                    (collection.get("ticketState") !== "pending" &&
                      collection.get("reviewing"))
                  ? "already in review"
                  : "Add more Content"}
              </span>
            </span>
          </button>
        )}
      </React.Fragment>
    );
  }
}

export default ModeSelectorUI;
