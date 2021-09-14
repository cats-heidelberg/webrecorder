import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { ExtractWidget, PatchWidget, RemoteBrowserSelect } from 'containers';

import { remoteBrowserMod } from 'helpers/utils';

import './style.scss';


class RecordURLBar extends Component {
  static contextTypes = {
    canAdmin: PropTypes.bool,
    currMode: PropTypes.string
  };

  static propTypes = {
    activeBrowser: PropTypes.string,
    activeCollection: PropTypes.object,
    autopilotRunning: PropTypes.bool,
    getFirstURL: PropTypes.func,
    history: PropTypes.object,
    params: PropTypes.object,
    timestamp: PropTypes.string,
    url: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = { urlHasBeenInjected: false, url: props.url || '' };
  }
  getFirstRightURLisaFunction = (url, collId, user) => {
    this.props.getFirstURL(url, collId, user);
  }

  componentWillReceiveProps(nextProps) {
    const { params: { coll, collId}, } = this.props;
    if (nextProps.url !== this.props.url) {
      if (!this.state.urlHasBeenInjected) {
        this.getFirstRightURLisaFunction(nextProps.url, coll);
      }
      this.setState({ urlHasBeenInjected: true, url: nextProps.url });
    }
  }

  handleChange = (evt) => {
    this.setState({
      [evt.target.name]: evt.target.value
    });
  }

  handleSubmit = (evt) => {
    const { currMode } = this.context;
    const { activeBrowser, history, params: { archiveId, coll, collId, extractMode, rec, user }, timestamp } = this.props;
    const { url } = this.state;

    if (evt.key === 'Enter') {
      evt.preventDefault();

      switch(currMode) {
        case 'live':
          history.push(`/${user}/${coll}/live/${url}`);
          break;
        case 'record':
          history.push(`/${user}/${coll}/${rec}/record/${remoteBrowserMod(activeBrowser, null, '/')}${url}`);
          break;
        case 'patch':
          history.push(`/${user}/${coll}/${rec}/patch/${remoteBrowserMod(activeBrowser, timestamp, '/')}${url}`);
          break;
        case 'extract':
          history.push(`/${user}/${coll}/${rec}/${extractMode}:${archiveId}${collId ? `:${collId}` : ''}/${remoteBrowserMod(activeBrowser, timestamp, '/')}${url}`);
          break;
        default:
          break;
      }
    }
  }

  render() {
    const { currMode, canAdmin } = this.context;
    const { activeCollection, autopilotRunning, params } = this.props;
    const { url } = this.state;
    const wedontneednoremoteBrowser = true;
    const wedontneednourl = true;
    const isNew = currMode === 'new';
    const isExtract = currMode.indexOf('extract') !== -1;
    const isPatch = currMode === 'patch';

    return (
      <div className="main-bar">
        <form className={classNames('form-group-recorder-url', { 'start-recording': isNew, 'content-form': !isNew, 'remote-archive': isPatch || isExtract })}>
          <div className="input-group containerized">
            {
              !__DESKTOP__ && canAdmin && !wedontneednoremoteBrowser &&
                <div className="input-group-btn rb-dropdown">
                  {
                    <RemoteBrowserSelect
                      active
                      autopilotRunning={autopilotRunning}
                      params={params} />
                  }
                </div>
            }
            {
              /* {% if not browser %}autofocus{% endif %} */
              <input type="text" active={!wedontneednourl} disabled={autopilotRunning || wedontneednourl} onChange={this.handleChange} onKeyPress={this.handleSubmit} className="url-input-recorder form-control" name="url" value={url} style={{ height: '3.2rem' }} autoFocus required />
            }
            {
              isExtract &&
                <ExtractWidget
                  active
                  toCollection={activeCollection.title} />
            }
            {
              isPatch &&
                <PatchWidget params={params} />
            }
          </div>
        </form>
      </div>
    );
  }
}

export default withRouter(RecordURLBar);
