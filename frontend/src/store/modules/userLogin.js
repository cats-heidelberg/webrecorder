import { fromJS } from 'immutable';

const ASSIGN_NEXT = 'wr/userLogin/ASSIGN_NEXT';
const SHOW_MODAL = 'wr/userLogin/SHOW_MODAL';

const initialState = fromJS({
  anonCTA: false,
  next: null,
  open: false
});

// reducer checks for the action.type (= its name) and executes what the action means to do
export default function userLogin(state = initialState, action = {}) {
  switch (action.type) {
    case ASSIGN_NEXT:
      return state.set('next', action.next);
    case SHOW_MODAL:
      return state.merge({
        anonCTA: action.cta,
        next: action.next,
        open: action.bool
      });
    default:
      return state;
  }
}

// action
export function assignNext(next) {
  return {
    type: ASSIGN_NEXT,
    next
  };
}

// action: returns type (which is its name)
export function showModal(bool, cta = false, next = null) {
  return {
    type: SHOW_MODAL,
    bool,
    cta,
    next
  };
}
