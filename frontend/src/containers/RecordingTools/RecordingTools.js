import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { toggleAutopilotSidebar } from 'store/modules/automation';
import { setAutoscroll } from 'store/modules/controls';
import { toggleClipboard } from 'store/modules/toolBin';
import { editCollectionRecording } from 'store/modules/collection';
import { load as loadCollections } from 'store/modules/collections';
import { RecordingToolsUI } from 'components/controls';


const mapStateToProps = ({ app }) => {
  return {
    collections: app,
    activeBrowser: app.getIn(['remoteBrowsers', 'activeBrowser']),
    autopilotInfo: app.getIn(['automation', 'autopilotInfo']),
    auth: app.getIn(['auth', 'user']),
    autopilot: app.getIn(['automation', 'autopilot']),
    reqId: app.getIn(['remoteBrowsers', 'reqId']),
    timestamp: app.getIn(['controls', 'timestamp']),
    url: app.getIn(['controls', 'url']),
    user: app.get('user')
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleClipboard: b => dispatch(toggleClipboard(b)),
    toggleAutoscroll: b => dispatch(setAutoscroll(b)),
    toggleAutopilotSidebar: b => dispatch(toggleAutopilotSidebar(b)),
    loadCollectionDispatch: user => dispatch(loadCollections(user)),
    editCollection: (user, collID, isCollLoaded, recordingUrl, recordingTimestamp) => {
      dispatch(editCollectionRecording(user, collID, isCollLoaded, recordingUrl, recordingTimestamp))

    }
  };
};

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(RecordingToolsUI));
