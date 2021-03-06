import { useCallback, useContext } from 'react';
import { useSelector } from 'react-redux';
import { UserManagerContext } from '@misakey/react/auth/components/OidcProvider/Context';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';
import { useSetPasswordContext } from '../../components/Dialog/Password/Create/Context';

const { isAuthenticated: IS_AUTHENTICATED_SELECTOR } = authSelectors;
const CREATE_ACCOUNT_PARAMS = { misakeyCallbackHints: { shouldCreateAccount: true } };

// HOOKS
export default () => {
  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);

  const { askSigninRedirect } = useContext(UserManagerContext);

  const { onOpenSetPasswordDialog } = useSetPasswordContext();

  return useCallback(
    () => (isAuthenticated
      ? onOpenSetPasswordDialog()
      : askSigninRedirect(CREATE_ACCOUNT_PARAMS)
    ),
    [askSigninRedirect, isAuthenticated, onOpenSetPasswordDialog],
  );
};
