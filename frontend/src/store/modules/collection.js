import { apiPath } from "config";
import { fromJS } from "immutable";

const BK_COUNT = "wr/coll/BK_COUNT";
const BK_COUNT_SUCCESS = "wr/coll/BK_COUNT_SUCCESS";
const BK_COUNT_FAIL = "wr/coll/BK_COUNT_FAIL";

const COLL_LOAD = "wr/coll/COLL_LOAD";
const COLL_LOAD_SUCCESS = "wr/coll/COLL_LOAD_SUCCESS";
const COLL_LOAD_FAIL = "wr/coll/COLL_LOAD_FAIL";

const COLL_RECORDINGCOMPLETE = "wr/coll/COLL_RECORDINGCOMPLETE";
const COLL_RECORDINGCOMPLETE_SUCCESS = "wr/coll/COLL_RECORDINGCOMPLETE_SUCCESS";
const COLL_RECORDINGCOMPLETE_FAIL = "wr/coll/COLL_RECORDINGCOMPLETE_FAIL";

const COLL_REVIEWCOMPLETE = "wr/coll/COLL_REVIEWCOMPLETE";
const COLL_REVIEWCOMPLETE_SUCCESS = "wr/coll/COLL_REVIEWCOMPLETE_SUCCESS";
const COLL_REVIEWCOMPLETE_FAIL = "wr/coll/COLL_REVIEWCOMPLETE_FAIL";

const COLL_EDIT = "wr/coll/COLL_EDIT";
const COLL_EDIT_SUCCESS = "wr/coll/COLL_EDIT_SUCCESS";
const COLL_EDIT_FAIL = "wr/coll/COLL_EDIT_FAIL";
const RESET_EDIT_STATE = "wr/coll/RESET_EDIT_STATE";

const REVIEW_EDIT = "wr/coll/REVIEW_EDIT";
const REVIEW_EDIT_SUCCESS = "wr/coll/REVIEW_EDIT_SUCCESS";
const REVIEW_EDIT_FAIL = "wr/coll/REVIEW_EDIT_FAIL";
const RESET_REVIEW_EDIT_STATE = "wr/coll/RESET_REVIEW_EDIT_STATE";

const COLL_STATUSCHANGE = "wr/coll/COLL_STATUSCHANGE";
const COLL_STATUSCHANGE_SUCCESS = "wr/coll/COLL_STATUSCHANGE_SUCCESS";
const COLL_STATUSCHANGE_FAIL = "wr/coll/COLL_STATUSCHANGE_FAIL";
const RESET_STATUSCHANGE_STATE = "wr/coll/RESET_STATUSCHANGE_STATE";

const COLL_SET_PUBLIC = "wr/coll/SET_PUBLIC";
const COLL_SET_PUBLIC_SUCCESS = "wr/coll/SET_PUBLIC_SUCCESS";
const COLL_SET_PUBLIC_FAIL = "wr/coll/SET_PUBLIC_FAIL";

const DAT_SHARE = "wr/coll/DAT_SHARE";
const DAT_SHARE_SUCCESS = "wr/coll/DAT_SHARE_SUCCESS";
const DAT_SHARE_FAIL = "wr/coll/DAT_SHARE_FAIL";
const DAT_UNSHARE = "wr/coll/DAT_UNSHARE";
const DAT_UNSHARE_SUCCESS = "wr/coll/DAT_UNSHARE_SUCCESS";
const DAT_UNSHARE_FAIL = "wr/coll/DAT_UNSHARE_FAIL";

const COLL_DELETE = "wr/coll/COLL_DELETE";
const COLL_DELETE_SUCCESS = "wr/coll/COLL_DELETE_SUCCESS";
const COLL_DELETE_FAIL = "wr/coll/COLL_DELETE_FAIL";

const LISTS_LOAD = "wr/coll/LISTS_LOAD";
const LISTS_LOAD_SUCCESS = "wr/coll/LISTS_LOAD_SUCCESS";
const LISTS_LOAD_FAIL = "wr/coll/LISTS_LOAD_FAIL";

const LISTS_REORDER = "wr/coll/LISTS_REORDER";
const LISTS_REORDER_SUCCESS = "wr/coll/LISTS_REORDER_SUCCESS";
const LISTS_REORDER_FAIL = "wr/coll/LISTS_REORDER_FAIL";

const META_CREATE = "wr/coll/META_CREATE";
const META_CREATE_SUCCESS = "wr/coll/META_CREATE_SUCCESS";
const META_CREATE_FAIL = "wr/coll/META_CREATE_FAIL";

const REVIEW_CREATE = "wr/coll/REVIEW_CREATE_COUNT";
const REVIEW_CREATE_SUCCESS = "wr/coll/REVIEW_CREATE_COUNT_SUCCESS";
const REVIEW_CREATE_FAIL = "wr/coll/REVIEW_CREATE_COUNT_FAIL";

const initialState = fromJS({
  editing: false,
  reviewing: false,
  datProcessing: false,
  datError: null,
  edited: false,
  editError: null,
  error: null,
  loading: false,
  loaded: false,
});

export default function collection(state = initialState, action = {}) {
  switch (action.type) {
    case BK_COUNT_SUCCESS: {
      const idx = state
        .get("lists")
        .findIndex((l) => l.get("id") === action.list);
      return state.setIn(
        ["lists", idx, "total_bookmarks"],
        action.result.list.total_bookmarks
      );
    }
    case COLL_DELETE:
      return state.merge({
        edited: false,
        editing: true,
        editError: null,
      });
    case COLL_DELETE_SUCCESS:
      return state.merge({
        edited: true,
        editing: false,
      });
    case COLL_DELETE_FAIL:
      return state.merge({
        edited: false,
        editing: false,
        editError: action.error.error,
      });
    case COLL_STATUSCHANGE:
      return state.merge({
        edited: false,
        editing: true,
        editError: null,
      });
    case COLL_STATUSCHANGE_SUCCESS:
      return state.merge({
        edited: true,
        editing: false,
      });
    case COLL_STATUSCHANGE_FAIL:
      return state.merge({
        edited: false,
        editing: false,
        editError: action.error.error,
      });
    case COLL_EDIT:
      return state.set("editing", true);

    case REVIEW_EDIT:
      console.log(state.get("reviewing") + "review true");
      return state.set("reviewing", true);

    case COLL_LOAD:
      return state.set("loading", true);
    case COLL_EDIT_SUCCESS:
    case REVIEW_EDIT_SUCCESS:
    case COLL_LOAD_SUCCESS: {
      const {
        collection: {
          collTitle,
          collYear,
          copTitle,
          created_at,
          creatorList,
          dat_updated_at,
          dat_key,
          dat_share,
          desc,
          duration,
          featured_list,
          id,
          listID,
          lists,
          noteToDachs,
          owner,
          pages,
          persName,
          personHeadingText,
          personHeaderList,
          public_index,
          publisherOriginal,
          publisher,
          publishYear,
          pubTitleOriginal,
          recordings,
          selectedGroupName,
          projektcode,
          size,
          slug,
          slug_matched,
          subjectHeadingText,
          subjectHeaderList,
          surName,
          timespan,
          title,
          ticketState,
          updated_at,
          usermail,
          url,
        },
      } = action.result;

      const pgs = {};
      if (pages) {
        pages.forEach((pg) => {
          pgs[pg.id] = pg;
        });
      }

      let editState = {};
      if (action.type === COLL_EDIT_SUCCESS) {
        editState = {
          editing: false,
          edited: true,
          editError: null,
          slug_matched: true,
        };
      }

      return state.merge({
        loading: false,
        loaded: true,
        accessed: action.accessed,
        error: null,
        pages: fromJS(pgs),
        created_at,
        dat_updated_at,
        dat_key,
        dat_share,
        desc,
        duration,
        id,
        featured_list,
        public: action.result.collection.public,
        public_index,
        lists: fromJS(lists),
        owner,
        recordings: fromJS(recordings),
        size,
        slug,
        slug_matched,
        ticketState,
        timespan,
        title,
        updated_at,

        ...editState,
      });
    }
    case COLL_LOAD_FAIL:
      return state.merge({
        loading: false,
        loaded: false,
        error: action.error,
      });
    case COLL_SET_PUBLIC_SUCCESS:
      return state.set("public", action.result.is_public);

    case DAT_SHARE:
      return state.set("datProcessing", true);
    case DAT_SHARE_SUCCESS:
      return state.merge({
        datProcessing: false,
        ...action.result,
      });
    case DAT_SHARE_FAIL:
      return state.merge({
        datProcessing: false,
        datError: action.error,
      });
    case DAT_UNSHARE:
      return state.set("datProcessing", true);
    case DAT_UNSHARE_SUCCESS:
      return state.merge({
        datProcessing: false,
        dat_share: false,
      });
    case LISTS_LOAD_SUCCESS:
      return state.merge({
        lists: fromJS(action.result.lists),
      });
    case LISTS_REORDER_SUCCESS:
      return state.set(
        "lists",
        state.get("lists").sort((a, b) => {
          const aidx = action.order.indexOf(a.get("id"));
          const bidx = action.order.indexOf(b.get("id"));

          if (aidx < bidx) return -1;
          if (aidx > bidx) return 1;
          return 0;
        })
      );
    case COLL_EDIT_FAIL:
      return state.merge({
        editError: action.error.error,
      });
    case RESET_EDIT_STATE:
      return state.set("edited", false);

    case RESET_REVIEW_EDIT_STATE:
      console.log(state.get("reviewing") + "reset");
      return state.set("reviewing", false);

    case LISTS_LOAD_FAIL:
    case LISTS_LOAD:
    case COLL_SET_PUBLIC:
    case COLL_SET_PUBLIC_FAIL:
    default:
      return state;
  }
}

export function deleteCollection(user, coll) {
  return {
    types: [COLL_DELETE, COLL_DELETE_SUCCESS, COLL_DELETE_FAIL],
    promise: (client) =>
      client.del(`${apiPath}/collection/${coll}`, {
        params: { user },
      }),
  };
}
export function completeRecordingDispatch(user, collID, ticketState) {
  return {
    types: [COLL_EDIT, COLL_EDIT_SUCCESS, COLL_EDIT_FAIL],
    promise: (client) =>
      client.post(`${apiPath}/collection/${collID}`, {
        params: { user },
        data: {
          ticketState,
        },
      }),
  };
}

export function completeReviewDispatch(user, collID) {
  return {
    types: [
      COLL_REVIEWCOMPLETE,
      COLL_REVIEWCOMPLETE_SUCCESS,
      COLL_REVIEWCOMPLETE_FAIL,
    ],
    promise: (client) =>
      client.del(`${apiPath}/review`, {
        params: { user, collID },
      }),
  };
}

export function editCollectionRecording(
  user,
  collID,
  isCollLoaded = false,
  recordingUrl,
  recordingTimestamp
) {
  return {
    types: [COLL_EDIT, COLL_EDIT_SUCCESS, COLL_EDIT_FAIL],
    promise: (client) =>
      client.post(`${apiPath}/collection/${collID}`, {
        params: { user },
        data: {
          isCollLoaded,
          recordingUrl,
          recordingTimestamp,
        },
      }),
  };
}

export function reviewDataToRevis(user, collID) {
  return {
    types: [REVIEW_CREATE, REVIEW_CREATE_SUCCESS, REVIEW_CREATE_FAIL],
    promise: (client) =>
      client.post(`${apiPath}/review`, {
        params: { user, collID },
      }),
  };
}
export function sendMetaDispatch(user, collID) {
  return {
    types: [META_CREATE, META_CREATE_SUCCESS, META_CREATE_FAIL],
    promise: (client) =>
      client.post(`${apiPath}/collection/${collID}/sendMeta`, {
        params: { user },
        data: {
          collID,
        },
      }),
  };
}
export function editCollectionDispatch(
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
  projektcode,
  publishYear,
  pubTitleOriginal,
  personHeadingText,
  subjectHeadingText,
  listID
) {
  return {
    types: [COLL_EDIT, COLL_EDIT_SUCCESS, COLL_EDIT_FAIL],
    promise: (client) =>
      client.post(`${apiPath}/collection/${collID}`, {
        params: { user },
        data: {
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
          projektcode,
          publishYear,
          pubTitleOriginal,
          personHeadingText,
          subjectHeadingText,
          listID,
        },
      }),
  };
}
export function editCollectionDispatchWARC(
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
  projektcode,
  publishYear,
  pubTitleOriginal,
  personHeadingText,
  subjectHeadingText,
  listID,
  url
) {
  return {
    types: [COLL_EDIT, COLL_EDIT_SUCCESS, COLL_EDIT_FAIL],
    promise: (client) =>
      client.post(`${apiPath}/collection/${collID}`, {
        params: { user },
        data: {
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
          projektcode,
          publishYear,
          pubTitleOriginal,
          personHeadingText,
          subjectHeadingText,
          listID,
          url,
        },
      }),
  };
}

export function getBookmarkCount(user, coll, list) {
  return {
    types: [BK_COUNT, BK_COUNT_SUCCESS, BK_COUNT_FAIL],
    list,
    promise: (client) =>
      client.get(`${apiPath}/list/${list}`, {
        params: {
          user,
          coll: decodeURIComponent(coll),
          include_bookmarks: "none",
        },
      }),
  };
}

export function isLoaded({ app }) {
  return (
    app.get("collection") &&
    app.getIn(["collection", "loaded"]) &&
    Date.now() - app.getIn(["collection", "accessed"]) < 15 * 60 * 1000
  );
}

export function load(user, coll, host = "") {
  return {
    types: [COLL_LOAD, COLL_LOAD_SUCCESS, COLL_LOAD_FAIL],
    accessed: Date.now(),
    promise: (client) =>
      client.get(`${host}${apiPath}/collection/${coll}`, {
        params: { user },
      }),
  };
}

/**
 * withBookmarks accepts `first` or `all` for `include_bookmarks` query prop
 */
export function loadLists(user, coll, withBookmarks = "first", host = "") {
  return {
    types: [LISTS_LOAD, LISTS_LOAD_SUCCESS, LISTS_LOAD_FAIL],
    promise: (client) =>
      client.get(`${host}${apiPath}/lists`, {
        params: {
          user,
          coll: decodeURIComponent(coll),
          include_bookmarks: withBookmarks,
        },
      }),
  };
}

export function resetEditState() {
  return { type: RESET_EDIT_STATE };
}

export function resetEditReview() {
  return { type: RESET_REVIEW_EDIT_STATE };
}
export function reviewCollection() {
  return {
    type: REVIEW_EDIT,
  };
}
export function shareToDat(user, coll) {
  return {
    types: [DAT_SHARE, DAT_SHARE_SUCCESS, DAT_SHARE_FAIL],
    promise: (client) =>
      client.post(`${apiPath}/collection/${coll}/dat/share`, {
        params: { user },
      }),
  };
}

export function sortLists(user, coll, order) {
  return {
    types: [LISTS_REORDER, LISTS_REORDER_SUCCESS, LISTS_REORDER_FAIL],
    order,
    promise: (client) =>
      client.post(`${apiPath}/lists/reorder`, {
        params: { user, coll: decodeURIComponent(coll) },
        data: {
          order,
        },
      }),
  };
}

export function unshareFromDat(user, coll) {
  return {
    types: [DAT_UNSHARE, DAT_UNSHARE_SUCCESS, DAT_UNSHARE_FAIL],
    promise: (client) =>
      client.post(`${apiPath}/collection/${coll}/dat/unshare`, {
        params: { user },
      }),
  };
}
