import React from 'react';
import { asyncConnect } from 'redux-connect';
import { batchActions } from 'redux-batched-actions';

import { saveDelay, appHost } from 'config';

import { addUserCollection, incrementCollCount } from 'store/modules/auth';
import { load as loadCollections, createCollection } from 'store/modules/collections';

import { editCollectionDispatch } from 'store/modules/collection';
import { load as loadUser, edit as editUser, resetEditState } from 'store/modules/user';
import { sortCollsByAlpha } from 'store/selectors';


import { addTrailingSlash, apiFetch, fixMalformedUrls } from 'helpers/utils';

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
    activeBrowser: app.getIn(['remoteBrowsers', 'activeBrowser']),
    auth: app.get('auth'),
    collections: app.get('collections'),
    edited: app.getIn(['user', 'edited']),
    orderedCollections: app.getIn(['collections', 'loaded']) ? sortCollsByAlpha(app) : null,
    timestamp: app.getIn(['controls', 'timestamp']),
    user: app.get('user')
  };
};

const mapDispatchToProps = (dispatch, { history }) => {
  return {
    createNewCollection: (user, title, url, isPublic,creatorList,subjectHeaderList,personHeaderList,publisher,collTitle,pubTitle,collYear,copTitle,surName,persName,usermail,selectedGroupName,publishYear, ticketState, isCollLoaded=true, recordingUrl, recordingTimestamp) => {
      dispatch(createCollection(user, title, url, isPublic,creatorList,subjectHeaderList,personHeaderList,publisher,collTitle,pubTitle,collYear,copTitle,surName,persName,usermail,selectedGroupName,publishYear, ticketState, isCollLoaded, recordingTimestamp))
        .then((res) => {
          if (res.hasOwnProperty('collection')) {
            dispatch(batchActions([
              incrementCollCount(1),
              addUserCollection(res.collection),

            ]));
            //history.push(`/${user}/${res.collection.slug}/manage`);
          }
          return(res);
        }).then((res)=>{

          const _untidyURL = res.collection.url;
          const cleanUrl = addTrailingSlash(fixMalformedUrls(_untidyURL));

          // data to create new recording
          const data = {
            mode: 'record',
            url: cleanUrl,
            coll: res.collection.id,
          };
          // generate recording url
          
          apiFetch('/new', data, { method: 'POST' })
            .then(res => res.json())
            .then(({ url }) => history.push(url.replace(appHost, '')))
            .catch(err => console.log('error', err));
        }, () => {});
    },
    editCollection: (user, collID, title, url,creatorList,subjectHeaderList,personHeaderList,publisher,collTitle,pubTitle,collYear,copTitle,surName,persName,usermail,selectedGroupName,publishYear, isCollLoaded, recordingUrl, recordingTimestamp) => {
      dispatch(editCollectionDispatch(user, collID, title, url,creatorList,subjectHeaderList,personHeaderList,publisher,collTitle,pubTitle,collYear,copTitle,surName,persName,usermail,selectedGroupName,publishYear, isCollLoaded, recordingUrl, recordingTimestamp))
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
