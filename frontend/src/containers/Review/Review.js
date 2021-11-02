import React from "react";
import { asyncConnect } from "redux-connect";
import { batchActions } from "redux-batched-actions";

import { saveDelay, appHost } from "config";

import { addUserCollection, incrementCollCount } from "store/modules/auth";
import {
  load as loadCollections,
  loadReviewList,
  setSort,
  sortCollectionsReview,
} from "store/modules/collections";

import {
  editCollectionDispatch,
  completeRecordingDispatch,
  completeReviewDispatch,
  pushWarcToServerDispatch,
  reviewCollection,
  sendMetaDispatch,
  shareToDat,
} from "store/modules/collection";
import {
  load as loadUser,
  edit as editUser,
  resetEditState,
} from "store/modules/user";
import { sortCollsByAlpha } from "store/selectors";

import { addTrailingSlash, apiFetch, fixMalformedUrls } from "helpers/utils";

import ReviewUI from "components/collection/ReviewUI";

const preloadCollections = [
  {
    promise: ({
      match: {
        params: { user },
      },
      store: { dispatch },
    }) => {
      return dispatch(loadReviewList());
    },
  },
  {
    promise: ({
      match: {
        params: { user },
      },
      store: { dispatch },
    }) => {
      return dispatch(reviewCollection());
    },
  },
];

const mapStateToProps = ({ app }) => {
  return {
    activeBrowser: app.getIn(["remoteBrowsers", "activeBrowser"]),
    auth: app.get("auth"),
    collections: app.get("collections"),
    edited: app.getIn(["user", "edited"]),
    sortBy: app.getIn(["collections", "sortBy"]),
    orderedCollections: app.getIn(["collections", "loaded"])
      ? sortCollsByAlpha(app)
      : null,
    timestamp: app.getIn(["controls", "timestamp"]),
    user: app.get("user"),
  };
};

const mapDispatchToProps = (dispatch, { history }) => {
  return {
    completeReview: (user, collID, ticketState = "denied", doi, url) => {
      dispatch(completeRecordingDispatch(user, collID, ticketState, ""))
        .then(() => {
          console.log("completeRecordingDispatchfinished");
          dispatch(completeReviewDispatch(user, collID, doi));
        }).then(() => { console.log("imcompleteReviewDispatch"); ticketState=="completed" ?
          dispatch(pushWarcToServerDispatch(user, collID, doi, url)) : {};
        })
        .catch((error) => {
          console.log(error);
        });
      setTimeout(() => {
        history.push(`/${user}/review`);
      }, 100);
    },
    getCollectionsReview: (collections, sortBy) => {
      dispatch(loadReviewList()).then(() => {
        //mussdochnicht umsortiert werden dispatch(sortCollectionsReview(collections));
      });
    },
    Reviewed: (user, collID, ticketState = "approved") => {
      dispatch(completeRecordingDispatch(user, collID, ticketState, "")).catch(
        (error) => {
          console.log(error);
        }
      );
      setTimeout(() => {
        history.push(`/${user}/review`);
      }, 100);
    },
  };
};

export default asyncConnect(
  preloadCollections,
  mapStateToProps,
  mapDispatchToProps
)(ReviewUI);
