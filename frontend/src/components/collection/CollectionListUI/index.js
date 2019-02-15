import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { fromJS } from 'immutable';
import { Button, Col, Row } from 'react-bootstrap';

import { stopPropagation } from 'helpers/utils';

import HttpStatus from 'components/HttpStatus';
import InlineEditor from 'components/InlineEditor';
import RedirectWithStatus from 'components/RedirectWithStatus';
import WYSIWYG from 'components/WYSIWYG';
import { NewCollection } from 'components/siteComponents';
import { Upload } from 'containers';
import { LinkIcon, UploadIcon, UserIcon } from 'components/icons';

import CollectionItem from './CollectionItem';
import './style.scss';


class CollectionListUI extends Component {
  static contextTypes = {
    isAnon: PropTypes.bool
  };

  static propTypes = {
    auth: PropTypes.object,
    collections: PropTypes.object,
    createNewCollection: PropTypes.func,
    edited: PropTypes.bool,
    editCollection: PropTypes.func,
    editUser: PropTypes.func,
    orderedCollections: PropTypes.object,
    match: PropTypes.object,
    history: PropTypes.object,
    user: PropTypes.object
  };

  static defaultProps = fromJS({
    collections: []
  });

  constructor(props) {
    super(props);

    this.state = {
      showModal: false
    };
  }

  createCollection = (collTitle, isPublic) => {
    const { createNewCollection, match: { params: { user } } } = this.props;
    createNewCollection(user, collTitle, isPublic);
  }

  editName = (full_name) => {
    const { editUser, match: { params: { user } } } = this.props;
    editUser(user, { full_name });
  }

  editURL = (display_url) => {
    const { editUser, match: { params: { user } } } = this.props;
    editUser(user, { display_url });
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
    const { auth, collections, editCollection, history, orderedCollections, match: { params }, user } = this.props;
    const { showModal } = this.state;
    const userParam = params.user;
    const displayName = user.get('full_name') || userParam;
    const canAdmin = auth.getIn(['user', 'username']) === userParam;

    const userLink = user.get('display_url') && (!user.get('display_url').match(/^[a-zA-Z]+:\/\//) ? `http://${user.get('display_url')}` : user.get('display_url'));


    if (collections.get('error')) {
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
            {
              collections && collections.get('loaded') &&
                <ul className="list-group collection-list">
                  {
                    orderedCollections.map((coll) => {
                      return (
                        <CollectionItem
                          key={coll.get('id')}
                          canAdmin={canAdmin}
                          collection={coll}
                          editCollection={editCollection}
                          history={history} />
                      );
                    })
                  }
                </ul>
            }
      </React.Fragment>
    );
  }
}


export default CollectionListUI;
