import createReducer from '@misakey/store/reducers/helpers/createReducer';
import { SIGN_OUT } from '@misakey/auth/store/actions/auth';


export default function createAuthReducer(initialState, handlers, scope) {
  const reducer = createReducer(initialState, handlers, scope);
  return function authReducer(state, action) {
    if (action.type === SIGN_OUT) {
      return initialState;
    }
    return reducer(state, action);
  };
}

export const wrapReducerWithAuth = (initialState, createFn) => {
  const reducer = createFn(initialState);
  return (state, action) => {
    if (action.type === SIGN_OUT) {
      return initialState;
    }
    return reducer(state, action);
  };
};