import React from "react";
import { asyncConnect } from "redux-connect";
import { batchActions } from "redux-batched-actions";

import { saveDelay, appHost } from "config";

import { addUserCollection, incrementCollCount } from "store/modules/auth";
import {
  load as loadCollections,
  loadReviewList,
} from "store/modules/collections";

import {
  editCollectionDispatch,
  completeRecordingDispatch,
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
      dispatch(loadUser(user, false)).then((result) => {
        if (result["user"]["role"] === "admin")
          return dispatch(loadReviewList(user));
      });
    },
  },
  {
    promise: ({ match: { params }, store: { dispatch } }) => {
      const { user } = params;

      return dispatch(loadUser(user, false));
    },
  },
];

const mapStateToProps = ({ app }) => {
  return {
    activeBrowser: app.getIn(["remoteBrowsers", "activeBrowser"]),
    auth: app.get("auth"),
    collections: app.get("collections"),
    edited: app.getIn(["user", "edited"]),
    orderedCollections: app.getIn(["collections", "loaded"])
      ? sortCollsByAlpha(app)
      : null,
    timestamp: app.getIn(["controls", "timestamp"]),
    user: app.get("user"),
  };
};

const mapDispatchToProps = (dispatch, { history }) => {
  return {
    completeReview: (user, collID, ticketState = "denied") => {
      dispatch(completeReviewDispatch(user, collID, ticketState));
    },
  };
};

export default asyncConnect(
  preloadCollections,
  mapStateToProps,
  mapDispatchToProps
)(ReviewUI);
