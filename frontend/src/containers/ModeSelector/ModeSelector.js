import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { ModeSelectorUI } from 'components/controls';


const mapStateToProps = ({ app }) => {
  return {
    activeBrowser: app.getIn(['remoteBrowsers', 'activeBrowser']),
    timestamp: app.getIn(['controls', 'timestamp']),
    collection: app.get('collection'),
    url: app.getIn(['controls', 'url'])
  };
};

export default withRouter(connect(
  mapStateToProps
)(ModeSelectorUI));
