import { useCallback } from 'react';

import { onResetSsoIdentity } from '@misakey/react/auth/store/actions/sso';

import authRoutes from '@misakey/react/auth/routes';

import { useDispatch } from 'react-redux';

import { useHistory } from 'react-router-dom';

// HOOKS
export const useClearUser = () => {
  const dispatch = useDispatch();
  const { push } = useHistory();

  return useCallback(
    () => Promise.resolve(dispatch(onResetSsoIdentity()))
      .then(() => {
        push(authRoutes.signIn._);
      }),
    [dispatch, push],
  );
};
