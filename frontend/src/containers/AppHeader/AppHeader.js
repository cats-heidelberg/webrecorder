import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import AppHeaderUI from 'components/siteComponents/AppHeaderUI';


const mapStateToProps = ({ app }) => {
  return {
    authUser: app.getIn(['auth', 'user']),
    canGoBackward: app.getIn(['appSettings', 'canGoBackward']),
    canGoForward: app.getIn(['appSettings', 'canGoForward']),
    is404: app.getIn(['controls', 'is404'])
  };
};

export default withRouter(connect(
  mapStateToProps
)(AppHeaderUI));
