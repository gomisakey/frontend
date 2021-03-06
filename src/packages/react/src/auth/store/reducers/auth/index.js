import PropTypes from 'prop-types';

import createResetOnSignOutReducer from '@misakey/react/auth/store/reducers/helpers/createResetOnSignOutReducer';
import { createSelector } from 'reselect';
import IdentitySchema from '@misakey/react/auth/store/schemas/Identity';

import merge from '@misakey/core/helpers/merge';
import isNil from '@misakey/core/helpers/isNil';
import prop from '@misakey/core/helpers/prop';

import {
  AUTH_RESET,
  LOAD_USER_INFO,
  SET_EXPIRES_AT,
  UPDATE_IDENTITY,
  SET_IS_AUTHENTICATED,
  CLEAR_IDENTITY,
} from '../../actions/auth';

// CONSTANTS
export const PROP_TYPES = {
  authenticatedAt: PropTypes.string,
  accountId: PropTypes.string,
  isAuthenticated: PropTypes.bool,
  identityId: PropTypes.string,
  identity: PropTypes.shape(
    IdentitySchema.propTypes, // eslint-disable-line react/forbid-foreign-prop-types
  ),
  expiresAt: PropTypes.string,
  acr: PropTypes.number,
  scope: PropTypes.string,
};

// INITIAL_STATE
export const INITIAL_STATE = {
  authenticatedAt: null,
  accountId: null,
  isAuthenticated: false,
  identityId: null,
  identity: null,
  expiresAt: null,
  acr: null,
  scope: null,
};

// HELPERS
const mergeIdentity = (state, identity) => (isNil(identity)
  ? (state.identity)
  : merge({}, (state.identity || {}), identity)
);

const syncIdentity = (state, { identityId }) => {
  if (isNil(identityId) || isNil(state.identity)) { return state.identity; }

  const { id: currentIdentityId } = state.identity;

  const identityHasChanged = currentIdentityId !== identityId;

  if (identityHasChanged) { return null; }
  return state.identity;
};

function resetCredentials() {
  return INITIAL_STATE;
}

function updateIdentity(state, { identity }) {
  return {
    ...state,
    identity: mergeIdentity(state, identity),
  };
}

function clearIdentity(state) {
  return {
    ...state,
    identity: INITIAL_STATE.identity,
  };
}

function loadUserInfo(state, { accountId, identityId, acr, scope }) {
  const nextIdentity = syncIdentity(state, { identityId });

  const newState = {
    ...state,
    accountId,
    identityId,
    acr,
    scope,
    identity: nextIdentity,
  };

  return {
    ...newState,
    isAuthenticated: !isNil(newState.expiresAt) && !isNil(newState.identityId),
  };
}

function setIsAuthenticated(state, { isAuthenticated }) {
  return {
    ...state,
    isAuthenticated,
  };
}

function setExpiresAt(state, { expiresAt }) {
  return {
    ...state,
    expiresAt,
    isAuthenticated: !isNil(expiresAt) && !isNil(state.identityId),
  };
}

// SELECTORS
const getState = ({ auth }) => auth;

const identitySelector = createSelector(
  getState,
  prop('identity'),
);

export const getCurrentUserSelector = identitySelector;

export const selectors = {
  expiresAt: createSelector(
    getState,
    prop('expiresAt'),
  ),
  identity: identitySelector,
  accountId: createSelector(
    identitySelector,
    prop('accountId'),
  ),
  hasCrypto: createSelector(
    identitySelector,
    prop('hasCrypto'),
  ),
  identifierValue: createSelector(
    identitySelector,
    prop('identifierValue'),
  ),
  identityId: createSelector(
    getState,
    prop('identityId'),
  ),
  isAuthenticated: createSelector(
    getState,
    prop('isAuthenticated'),
  ),
  acr: createSelector(
    getState,
    prop('acr'),
  ),
};

// REDUCER
export default createResetOnSignOutReducer(INITIAL_STATE, {
  [AUTH_RESET]: resetCredentials,
  [LOAD_USER_INFO]: loadUserInfo,
  [UPDATE_IDENTITY]: updateIdentity,
  [CLEAR_IDENTITY]: clearIdentity,
  [SET_IS_AUTHENTICATED]: setIsAuthenticated,
  [SET_EXPIRES_AT]: setExpiresAt,
});
