import React, { PureComponent } from 'react';

import { asyncConnect } from 'redux-connect';

import { loadCollections } from 'store/modules/auth';
import { showModal } from 'store/modules/userLogin';
import { load, login } from 'store/modules/auth';

import { HomeUI } from 'components/siteComponents';


const initalData = [
  {
    promise: ({ store: { dispatch, getState } }) => {
      const { app } = getState();
      if (!app.getIn(['auth', 'user', 'anon'])) {
        return dispatch(loadCollections(app.getIn(['auth', 'user', 'username'])));
      }
    }
  }
];

const mapStateToProps = ({ app }) => {
  return {
    anonCTA: app.getIn(['userLogin', 'anonCTA']),
    auth: app.get('auth'),
    next: app.getIn(['userLogin', 'next']),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loginFn: data => dispatch(login(data)),
    showModalCB: (b = true) => dispatch(showModal(b))
  };
};

export default asyncConnect(
  initalData,
  mapStateToProps,
  mapDispatchToProps
)(HomeUI);
