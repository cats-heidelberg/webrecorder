import React from 'react';
import { connect } from 'react-redux';

import { showModal } from 'store/modules/userLogin';
import { load } from 'store/modules/tempUser';

import { TempUsageUI } from 'components/siteComponents';


const mapStateToProps = ({ app }) => {
  return {
    tempUser: app.getIn(['tempUser', 'user'])
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    hideModal: () => dispatch(showModal(false)),
    loadUsage: u => dispatch(load(u))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TempUsageUI);
