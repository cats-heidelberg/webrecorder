import React from "react";
import { asyncConnect } from "redux-connect";
import { batchActions } from "redux-batched-actions";

import { saveDelay, appHost } from "config";

import { addUserCollection, incrementCollCount } from "store/modules/auth";
import {
  load as loadCollections,
  createCollection,
  create_collection_with_Warc,
  setSort,
  sortCollections,
} from "store/modules/collections";

import {
  editCollectionDispatch,
  injectRealUrlDispatch,
  editCollectionDispatchWARC,
  completeRecordingDispatch,
  resetEditReview,
  reviewDataToRevis,
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

import CollectionListUI from "components/collection/CollectionListUI";

const preloadCollections = [
  {
    promise: ({
      match: {
        params: { user },
      },
      store: { dispatch },
    }) => {
      return dispatch(resetEditReview());
    },
  },
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
    activeCollection: app.getIn(["auth", "activeCollection"]),
    auth: app.get("auth"),
    collections: app.get("collections"),
    edited: app.getIn(["user", "edited"]),
    orderedCollections: app.getIn(["collections", "loaded"])
      ? sortCollsByAlpha(app)
      : null,
    numCollections: app.getIn(["user", "num_collections"]),
    timestamp: app.getIn(["controls", "timestamp"]),
    sortBy: app.getIn(["collections", "sortBy"]),
    reviewing: app.getIn(["collections", "reviewing"]),
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
      emailOfRightsholder,
      selectedGroupName,
      projektcode,
      publishYear,
      pubTitleOriginal,
      personHeadingText,
      subjectHeadingText,
      listID,
      ticketState,
      isCollLoaded,
      recordingUrl,
      recordingTimestamp,
      doi
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
          emailOfRightsholder,
          selectedGroupName,
          projektcode,
          publishYear,
          pubTitleOriginal,
          personHeadingText,
          subjectHeadingText,
          listID,
          ticketState,
          isCollLoaded,
          recordingUrl,
          recordingTimestamp,
          doi
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
              .then(({ url }) => {
                console.log(url.substring(url.indexOf("record/") + 7), title);
                history.push(url.replace(appHost, ""));
              })
              .catch((err) => console.log("error", err));
          },
          (err) => console.log(err)
        )
        .catch((err) => console.log(err));
    },
    _duplicateCollection: (user, title) => {
      dispatch(create_collection_with_Warc(user, title))
        .then((res) => {
          if (res.hasOwnProperty("collection")) {
            dispatch(
              batchActions([
                incrementCollCount(1),
                addUserCollection(res.collection),
              ])
            );
            history.push(`/${user}`);
          }
          //return res;
        })

        .catch((err) => console.log(err));
    },
    createNewCollectionBrowseWarc_old: (
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
      emailOfRightsholder,
      selectedGroupName,
      projektcode,
      publishYear,
      pubTitleOriginal,
      personHeadingText,
      subjectHeadingText,
      listID,
      ticketState,
      isCollLoaded,
      recordingUrl,
      recordingTimestamp,
      doi
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
          emailOfRightsholder,
          selectedGroupName,
          projektcode,
          publishYear,
          pubTitleOriginal,
          personHeadingText,
          subjectHeadingText,
          listID,
          ticketState,
          isCollLoaded,
          recordingUrl,
          recordingTimestamp,
          doi
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
          }
        })
        .catch((err) => console.log("errorwhilecreating" + err));
    },
    editCollection: (
      user,
      collID,
      title,
      doi,
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
      emailOfRightsholder,
      selectedGroupName,
      projektcode,
      publishYear,
      pubTitleOriginal,
      personHeadingText,
      subjectHeadingText,
      listID,
      url
    ) => {
      dispatch(
        editCollectionDispatch(
          user,
          collID,
          title,
          doi,
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
          emailOfRightsholder,
          selectedGroupName,
          projektcode,
          publishYear,
          pubTitleOriginal,
          personHeadingText,
          subjectHeadingText,
          listID,
          url
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
    createNewCollectionBrowseWarc: (
      user,
      collID,
      title,
      doi,
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
      emailOfRightsholder,
      selectedGroupName,
      projektcode,
      publishYear,
      pubTitleOriginal,
      personHeadingText,
      subjectHeadingText,
      listID,
      url
    ) => {
      dispatch(
        editCollectionDispatchWARC(
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
          emailOfRightsholder,
          selectedGroupName,
          projektcode,
          publishYear,
          pubTitleOriginal,
          personHeadingText,
          subjectHeadingText,
          listID,
          url
        )
      ).then((res) => {
          console.log("before pushing url after adding warc"+url);
          const _untidyURL = res.url;
          const cleanUrl = addTrailingSlash(fixMalformedUrls(_untidyURL));

          // data to create new recording
          history.push(`/${user}/${collID}/0000000000000000/${cleanUrl}`);
        })
        .then(dispatch(incrementCollCount(1)))
        .catch((err) => console.log("error", err));
    },
    completeRecording: (
      user,
      collID,
      ticketState = "pending",
      projektcode = ""
    ) => {
      dispatch(
        completeRecordingDispatch(user, collID, ticketState, projektcode)
      ).then((res) => {
        console.log("sendingToRevis");
        dispatch(reviewDataToRevis(user, collID, res.collection.doi));
      });
      setTimeout(() => {
        history.push(`/${user}`);
      }, 100);
    },
    editUser: (user, data) => {
      dispatch(editUser(user, data))
        .then((res) => setTimeout(() => dispatch(resetEditState()), saveDelay))
        .then(() => dispatch(loadUser(user, false)));
    },
    sortCollections: (sortBy, collections) => {
      return new Promise((resolve) => {
        dispatch(setSort(sortBy));
        resolve();
      })
        .then(() => {
          dispatch(sortCollections(collections));
        })
        .catch((error) => {
          console.log(error);
        });
    },
  };
};

export default asyncConnect(
  preloadCollections,
  mapStateToProps,
  mapDispatchToProps
)(CollectionListUI);
