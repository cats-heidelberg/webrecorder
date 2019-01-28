import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';

import { homepageAnnouncement, supportEmail } from 'config';

import { showModal } from 'redux/modules/userLogin';

import { HomepageAnnouncement, HomepageMessage } from 'components/siteComponents';
import { StandaloneRecorder } from 'containers';

import './style.scss';


class Home extends Component {

  static propTypes = {
    auth: PropTypes.object,
    collections: PropTypes.array,
    showModalCB: PropTypes.func,
  };

  shouldComponentUpdate(nextProps) {
    if (this.props.auth.get('loading')) {
      return false;
    }

    return true;
  }

  render() {
    const { auth, showModalCB } = this.props;
    const user = auth.get('user');

    return (
      <React.Fragment>
        <Helmet>
          <title>Homepage</title>
        </Helmet>
        <div className="row top-buffer main-logo">
          <h1>Webrecorder</h1>
        </div>
        <div className="row tagline">
          <h4 className="text-center">Collect & Revisit the Web</h4>
        </div>
        {
          user.get('anon') && user.get('num_collections') > 0 &&
            <HomepageMessage
              auth={auth}
              showModal={showModalCB} />
        }
        <div className="row top-buffer-lg bottom-buffer-lg">
          <StandaloneRecorder />
        </div>
        {
          homepageAnnouncement &&
            <HomepageAnnouncement />
        }
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({ app }) => {
  return {
    auth: app.get('auth')
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    showModalCB: b => dispatch(showModal(b))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
