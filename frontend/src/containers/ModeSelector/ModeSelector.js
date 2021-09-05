import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";

import { ModeSelectorUI } from "components/controls";

const mapStateToProps = ({ app }) => {
  return {
    activeBrowser: app.getIn(["remoteBrowsers", "activeBrowser"]),
    auth: app.get("auth"),
    timestamp: app.getIn(["controls", "timestamp"]),
    collection: app.get("collection"),
    reviewing: app.getIn(["collection", "reviewing"]),
    url: app.getIn(["controls", "url"]),
  };
};

export default withRouter(connect(mapStateToProps)(ModeSelectorUI));
