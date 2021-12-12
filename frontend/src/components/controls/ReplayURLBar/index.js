import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { remoteBrowserMod } from 'helpers/utils';

import { InfoWidget, RemoteBrowserSelect } from 'containers';

import TimeFormat from 'components/TimeFormat';

import './style.scss';


class ReplayURLBar extends Component {
  static contextTypes = {
    canAdmin: PropTypes.bool,
    currMode: PropTypes.string
  }

  static propTypes = {
    activeBrowser: PropTypes.string,
    bookmarks: PropTypes.object,
    history: PropTypes.object,
    params: PropTypes.object,
    recordingIndex: PropTypes.number,
    timestamp: PropTypes.string,
    url: PropTypes.string
  }

  constructor(props) {
    super(props);

    this.state = { url: props.url };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.url !== this.props.url) {
      this.setState({ url: nextProps.url });
    }
  }

  handleInput = (evt) => {
    evt.preventDefault();
    this.setState({ url: evt.target.value });
  }

  handleSubmit = (evt) => {
    const { activeBrowser, history, params: { user, coll } } = this.props;
    const { url } = this.state;

    if (evt.key === 'Enter') {
      evt.preventDefault();
      history.push(`/${user}/${coll}/${remoteBrowserMod(activeBrowser, null, '/')}${url}`);
    }
  }

  render() {
    const { canAdmin } = this.context;
    const { params, timestamp } = this.props;
    const { url } = this.state;
    const wedontneednourl = true;
    const wedontneednoremoteBrowser = false;
    return (
      <div className="main-bar">
        <form className="form-group-recorder-url">
          <div className="input-group containerized">
            {
              canAdmin && !__DESKTOP__ && !wedontneednoremoteBrowser &&
                <div className="input-group-btn rb-dropdown">
                  <RemoteBrowserSelect
                    active
                    params={params} />
                </div>
            }

            <div className="wr-app-url">
              <input type="text" active={!wedontneednourl} disabled={wedontneednourl} onChange={this.handleInput} onKeyPress={this.handleSubmit} style={{ height: '3.2rem', width: '100%' }} className="form-control dropdown-toggle" name="url" aria-haspopup="true" value={url} autoComplete="off" />
            </div>
            <div className="timestamp p-3">
              <TimeFormat dt={timestamp} />
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default withRouter(ReplayURLBar);
