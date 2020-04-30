import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import classNames from 'classnames';
import { fromJS } from 'immutable';
import { Button, Col, Row } from 'react-bootstrap';

import { apiFetch, stopPropagation } from 'helpers/utils';
import { appHost } from 'config';

import { StandaloneRecorder } from 'containers';

import HttpStatus from 'components/HttpStatus';
import InlineEditor from 'components/InlineEditor';
import RedirectWithStatus from 'components/RedirectWithStatus';
import WYSIWYG from 'components/WYSIWYG';
import { NewCollection } from 'components/siteComponents';
import { Upload } from 'containers';
import { LinkIcon, UploadIcon } from 'components/icons';

import CollectionItem from './CollectionItem';
import './style.scss';


class CollectionListUI extends Component {
  static contextTypes = {
    isAnon: PropTypes.bool
  };

  static propTypes = {
    activeBrowser: PropTypes.string,
    auth: PropTypes.object,
    completeRecording: PropTypes.func,
    collections: PropTypes.object,
    createNewCollection: PropTypes.func,
    editCollection: PropTypes.func,
    edited: PropTypes.bool,
    editUser: PropTypes.func,
    onPatch: PropTypes.func,
    match: PropTypes.object,
    orderedCollections: PropTypes.object,
    match: PropTypes.object,
    history: PropTypes.object,
    timestamp: PropTypes.string,
    user: PropTypes.object
  };

  static defaultProps = fromJS({
    collections: []
  });

  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      showModalFinish: false
    };
  }

  createCollection = (pubTitle, url, isPublic,creatorList,subjectHeaderList,personHeaderList, noteToDachs,publisher,collTitle,publisherOriginal,collYear,copTitle,surName,persName,usermail,selectedGroupName,publishYear, pubTitleOriginal, personHeadingText, subjectHeadingText, listID, ticketState="open", isCollLoaded=true, recordingUrl="", recordingTimestamp="") => {
    const { createNewCollection, match: { params: { user } } } = this.props;
    createNewCollection(user, pubTitle, url, isPublic,creatorList,subjectHeaderList,personHeaderList, noteToDachs,publisher,collTitle,publisherOriginal,collYear,copTitle,surName,persName,usermail,selectedGroupName,publishYear, pubTitleOriginal, personHeadingText, subjectHeadingText, listID, ticketState, isCollLoaded, recordingUrl, recordingTimestamp);
  }
  editColl = (collID, title,creatorList,subjectHeaderList,personHeaderList, noteToDachs,publisher,collTitle,publisherOriginal,collYear,copTitle,surName,persName,usermail,selectedGroupName,publishYear, pubTitleOriginal, personHeadingText, subjectHeadingText, listID) => {
    const { editCollection, match: { params: { user } } } = this.props;
    editCollection(user, collID, title,creatorList,subjectHeaderList,personHeaderList, noteToDachs,publisher,collTitle,publisherOriginal,collYear,copTitle,surName,persName,usermail,selectedGroupName,publishYear, pubTitleOriginal, personHeadingText, subjectHeadingText, listID);
  }
  completeRec = (collID, ticketState="pending") => {
    const { completeRecording, match: { params: { user } } } = this.props;
    completeRecording(user, collID, ticketState);
  }
  editName = (full_name) => {
    const { editUser, match: { params: { user } } } = this.props;
    editUser(user, { full_name });
  }

  editURL = (display_url) => {
    const { editUser, match: { params: { user } } } = this.props;
    editUser(user, { display_url });
  }

  onPatch = (coll, url) => {

    const { activeBrowser, history, timestamp } = this.props;

    // data to create new recording
    const data = {
      url,
      coll,
      timestamp,
      mode: 'patch'
    };

    // add remote browser
    if (activeBrowser) {
      data.browser = activeBrowser;
    }

    // generate recording url
    apiFetch('/new', data, { method: 'POST' })
      .then(res => res.json())
      .then(({ url }) => { history.push(url.replace(appHost, '')); })
      .catch(err => console.log('error', err));
  }

  toggle = () => {
    this.setState({ showModal: !this.state.showModal });
  }



  close = () => {
    this.setState({ showModal: false });
  }

  updateUser = (description) => {
    const { editUser, match: { params: { user } } } = this.props;
    editUser(user, { desc: description });
  }

  render() {
    const { isAnon } = this.context;
    const { auth, collections, history, orderedCollections, match: { params }, user } = this.props;
    const { showModal, showModalFinish } = this.state;
    const userParam = params.user;
    const displayName = user.get('full_name') || userParam;
    const canAdmin = auth.getIn(['user', 'username']) === userParam;

    const userLink = user.get('display_url') && (!user.get('display_url').match(/^[a-zA-Z]+:\/\//) ? `http://${user.get('display_url')}` : user.get('display_url'));


    if (collections.get('error') && !collections.get('creatingCollection')) {
      return (
        <HttpStatus>
          {collections.getIn(['error', 'error_message'])}
        </HttpStatus>
      );
    }

    if (collections.get('loaded') && isAnon && canAdmin) {
      return <RedirectWithStatus to={`/${auth.getIn(['user', 'username'])}/temp/manage`} status={301} />;
    }

    return (
      <React.Fragment>
        <Helmet>
          <title>{`${displayName}'s Collections`}</title>
        </Helmet>
        <Row>
          <Col xs={15} sm={__DESKTOP__ ? 10 : 9} smOffset={__DESKTOP__ ? 1 : 0} className="wr-coll-meta">
            {/*
              canAdmin &&
                <Row className="collection-start-form">
                  <Col className="start-form" xs={12}>
                    <h4>New Capture</h4>
                    <StandaloneRecorder />
                  </Col>
                </Row>
            */}
            {
              !isAnon && canAdmin &&
                <Row>
                  <Col xs={15} className={classNames('collections-index-nav', { desktop: __DESKTOP__ })}>
                    { __DESKTOP__ && <h4>My Collections</h4> }
                    <Button onClick={this.toggle} className="rounded">
                      <span className="glyphicon glyphicon-plus glyphicon-button" /> New Download
                    </Button>
                  </Col>
                </Row>
            }
            {
              collections && collections.get('loaded') &&
                <Row>
                  <ul className="list-group collection-list">
                    {
                      orderedCollections.map((coll) => {
                        return (
                          <CollectionItem
                            key={coll.get('id')}
                            canAdmin={canAdmin}
                            collection={coll}
                            collUser={user}
                            editCollection={this.editColl}
                            completeRec={this.completeRec}
                            error={collections.get('error')}
                            history={history}
                            onPatch= {this.onPatch}
                            />
                        );
                      })
                    }
                  </ul>
                </Row>
            }
          </Col>
        </Row>
        <NewCollection
          close={this.close}
          visible={showModal}
          createCollection={this.createCollection}
          creatingCollection={collections.get('creatingCollection')}
          error={collections.get('error')} />
      </React.Fragment>
    );
  }
}


export default CollectionListUI;
