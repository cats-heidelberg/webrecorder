import React from "react";
import { asyncConnect } from "redux-connect";
import { batchActions } from "redux-batched-actions";

import { saveDelay, appHost } from "config";

import { addUserCollection, incrementCollCount } from "store/modules/auth";
import {
  load as loadCollections,
  createCollection,
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
      return dispatch(loadCollections(user));
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
    createNewCollection: (
      user,
      title,
      url,
      isPublic,
      creatorList,
      subjectHeaderList,
      personHeaderList,
      noteToDachs,
      publisher,
      collTitle,
      publisherOriginal,
      collYear,
      copTitle,
      surName,
      persName,
      usermail,
      selectedGroupName,
      publishYear,
      pubTitleOriginal,
      personHeadingText,
      subjectHeadingText,
      listID,
      ticketState,
      isCollLoaded,
      recordingUrl,
      recordingTimestamp
    ) => {
      dispatch(
        createCollection(
          user,
          title,
          url,
          isPublic,
          creatorList,
          subjectHeaderList,
          personHeaderList,
          noteToDachs,
          publisher,
          collTitle,
          publisherOriginal,
          collYear,
          copTitle,
          surName,
          persName,
          usermail,
          selectedGroupName,
          publishYear,
          pubTitleOriginal,
          personHeadingText,
          subjectHeadingText,
          listID,
          ticketState,
          isCollLoaded,
          recordingUrl,
          recordingTimestamp
        )
      )
        .then((res) => {
          if (res.hasOwnProperty("collection")) {
            dispatch(
              batchActions([
                incrementCollCount(1),
                addUserCollection(res.collection),
              ])
            );
            //history.push(`/${user}/${res.collection.slug}/manage`);
          }
          return res;
        })
        .then(
          (res) => {
            const _untidyURL = res.collection.url;
            const cleanUrl = addTrailingSlash(fixMalformedUrls(_untidyURL));

            // data to create new recording
            const data = {
              mode: "record",
              url: cleanUrl,
              coll: res.collection.id,
            };
            // generate recording url

            apiFetch("/new", data, { method: "POST" })
              .then((res) => res.json())
              .then(({ url }) => history.push(url.replace(appHost, "")))
              .catch((err) => console.log("error", err));
          },
          (err) => console.log(err)
        )
        .catch((err) => console.log(err));
    },
    editCollection: (
      user,
      collID,
      title,
      creatorList,
      subjectHeaderList,
      personHeaderList,
      noteToDachs,
      publisher,
      collTitle,
      publisherOriginal,
      collYear,
      copTitle,
      surName,
      persName,
      usermail,
      selectedGroupName,
      publishYear,
      pubTitleOriginal,
      personHeadingText,
      subjectHeadingText,
      listID
    ) => {
      dispatch(
        editCollectionDispatch(
          user,
          collID,
          title,
          creatorList,
          subjectHeaderList,
          personHeaderList,
          noteToDachs,
          publisher,
          collTitle,
          publisherOriginal,
          collYear,
          copTitle,
          surName,
          persName,
          usermail,
          selectedGroupName,
          publishYear,
          pubTitleOriginal,
          personHeadingText,
          subjectHeadingText,
          listID
        )
      ).then(
        (res) => {
          history.push(`/${user}`);
        },
        (error) => {
          console.log(error);
        }
      );
    },
    completeRecording: (user, collID, ticketState = "pending") => {
      dispatch(completeRecordingDispatch(user, collID, ticketState))
        .then(() => dispatch(shareToDat("zoadmin", collID)))
        .then(() => dispatch(sendMetaDispatch(user, collID)));
    },
    editUser: (user, data) => {
      dispatch(editUser(user, data))
        .then((res) => setTimeout(() => dispatch(resetEditState()), saveDelay))
        .then(() => dispatch(loadUser(user, false)));
    },
  };
};

export default asyncConnect(
  preloadCollections,
  mapStateToProps,
  mapDispatchToProps
)(ReviewUI);
