import { fromJS } from "immutable";
import config from "config";

const COLLS_LOAD = "wr/colls/LOAD";
const COLLS_LOAD_SUCCESS = "wr/colls/LOAD_SUCCESS";
const COLLS_LOAD_FAIL = "wr/colls/LOAD_FAIL";

const REVIEW_COLLS_LOAD = "wr/colls/REVIEW_LOAD";
const REVIEW_COLLS_LOAD_SUCCESS = "wr/colls/REVIEW_LOAD_SUCCESS";
const REVIEW_COLLS_LOAD_FAIL = "wr/colls/REVIEW_LOAD_FAIL";

const CREATE_COLL = "wr/coll/CREATE_COLL";
const CREATE_COLL_SUCCESS = "wr/coll/CREATE_COLL_SUCCESS";
const CREATE_COLL_FAIL = "wr/coll/CREATE_COLL_FAIL";

const initialState = fromJS({
  loading: false,
  loaded: false,
  error: null,
  creatingCollection: false,
  accessed: null,
});

export default function collections(state = initialState, action = {}) {
  switch (action.type) {
    case COLLS_LOAD:
      return state.set("loading", true);
    case COLLS_LOAD_SUCCESS:
      return state.merge({
        loading: false,
        loaded: true,
        accessed: action.accessed,
        error: null,

        user: fromJS(action.result.user),
        collections: fromJS(action.result.collections),
      });
    case COLLS_LOAD_FAIL:
      return state.merge({
        loading: false,
        loaded: false,
        error: action.error,
      });

    case CREATE_COLL:
      console.log("coll create");
      return state.merge({
        creatingCollection: true,
        error: null,
      });
    case CREATE_COLL_SUCCESS:
      console.log("coll success");
      return state.merge({
        newCollection: action.result.collection.id,
        creatingCollection: false,
        error: null,
        // nullify collections cache
        accessed: null,
      });
    case CREATE_COLL_FAIL:
      return state.set("error", action.error.error);

    default:
      return state;
  }
}

export function isLoaded({ app }) {
  return app.get("collections") && app.getIn(["collections", "loaded"]);
}

export function createCollection(
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
  recordingTimestamp,
  makePublic = false
) {
  return {
    types: [CREATE_COLL, CREATE_COLL_SUCCESS, CREATE_COLL_FAIL],
    promise: (client) =>
      client.post(`${config.apiPath}/collections`, {
        params: { user },
        data: {
          title,
          url,
          public: makePublic,
          public_index: true,
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
          recordingTimestamp,
        },
      }),
  };
}

export function load(user) {
  return {
    types: [COLLS_LOAD, COLLS_LOAD_SUCCESS, COLLS_LOAD_FAIL],
    accessed: Date.now(),
    promise: (client) =>
      client.get(`${config.apiPath}/collections`, {
        params: {
          user,
          include_pages: false,
          include_recordings: false,
          include_lists: false,
        },
      }),
  };
}
export function loadReviewList(user) {
  return {
    types: [
      REVIEW_COLLS_LOAD,
      REVIEW_COLLS_LOAD_SUCCESS,
      REVIEW_COLLS_LOAD_FAIL,
    ],
    accessed: Date.now(),
    promise: (client) =>
      client.get(`${config.apiPath}/review`, {
        params: {
          user,
          include_pages: false,
          include_recordings: false,
          include_lists: false,
        },
      }),
  };
}
export function loadall(admin) {
  return {
    types: [COLLS_LOAD, COLLS_LOAD_SUCCESS, COLLS_LOAD_FAIL],
    accessed: Date.now(),
    promise: (client) =>
      client.get(`${config.apiPath}/all_collections`, {
        params: {
          admin,
          include_pages: false,
          include_recordings: false,
          include_lists: false,
        },
      }),
  };
}
