import React from 'react';
import { asyncConnect } from 'redux-connect';
import { batchActions } from 'redux-batched-actions';

import { saveDelay } from 'config';

import { addUserCollection, incrementCollCount } from 'store/modules/auth';
import { load as loadCollections, createCollection } from 'store/modules/collections';

import { editCollectionDispatch } from 'store/modules/collection';
import { load as loadUser, edit as editUser, resetEditState } from 'store/modules/user';
import { sortCollsByAlpha } from 'store/selectors';

import CollectionListUI from 'components/collection/CollectionListUI';


const preloadCollections = [
  {
    promise: ({ match: { params: { user } }, store: { dispatch } }) => {
      return dispatch(loadCollections(user));
    }
  },
  {
    promise: ({ match: { params }, store: { dispatch } }) => {
      const { user } = params;
      return dispatch(loadUser(user, false));
    }
  }
];

const mapStateToProps = ({ app }) => {
  return {
    auth: app.get('auth'),
    collections: app.get('collections'),
    edited: app.getIn(['user', 'edited']),
    orderedCollections: app.getIn(['collections', 'loaded']) ? sortCollsByAlpha(app) : null,
    user: app.get('user')
  };
};

const mapDispatchToProps = (dispatch, { history }) => {
  return {
    createNewCollection: (user, title, url, isPublic,creatorList,subjectHeaderList,personHeaderList,publisher,collTitle,pubTitle,collYear,copTitle,surName,persName,usermail,selectedGroupName,publishYear) => {
      dispatch(createCollection(user, title, url, isPublic,creatorList,subjectHeaderList,personHeaderList,publisher,collTitle,pubTitle,collYear,copTitle,surName,persName,usermail,selectedGroupName,publishYear))
        .then((res) => {
          if (res.hasOwnProperty('collection')) {
            dispatch(batchActions([
              incrementCollCount(1),
              addUserCollection(res.collection)
            ]));
            history.push(`/${user}/${res.collection.slug}/manage`);
          }
        }, () => {});
    },
    editCollection: (user, collID, title, url,creatorList,subjectHeaderList,personHeaderList,publisher,collTitle,pubTitle,collYear,copTitle,surName,persName,usermail,selectedGroupName,publishYear) => {
      dispatch(editCollectionDispatch(user, collID, title, url,creatorList,subjectHeaderList,personHeaderList,publisher,collTitle,pubTitle,collYear,copTitle,surName,persName,usermail,selectedGroupName,publishYear))
        .then((res) => {
          history.push(`/${user}`);
        }, (error) => {console.log(error);});
    },
    editUser: (user, data) => {
      dispatch(editUser(user, data))
        .then(res => setTimeout(() => dispatch(resetEditState()), saveDelay))
        .then(() => dispatch(loadUser(user, false)));
    }

  };
};

export default asyncConnect(
  preloadCollections,
  mapStateToProps,
  mapDispatchToProps
)(CollectionListUI);
