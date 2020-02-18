import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import BoxAction from 'components/dumb/Box/Action';
import { ROLE_PREFIX_SCOPE } from 'constants/Roles';

import parseJwt from '@misakey/helpers/parseJwt';
import log from '@misakey/helpers/log';
import isNil from '@misakey/helpers/isNil';

import useFetchCallback from '@misakey/hooks/useFetch/callback';

import { withUserManager } from '@misakey/auth/components/OidcProvider';
import { IS_PLUGIN } from 'constants/plugin';

import SplashScreen from 'components/dumb/Screen/Splash';

function RouteCitizen({
  component: Component, componentProps,
  t,
  userScope,
  userEmail,
  userManager,
  isPrivate,
  isAuthenticated,
  ...rest
}) {
  const [loginAsScreen, setLoginAsScreen] = useState(false);
  const signIn = useCallback(
    () => userManager.signinRedirect(!isNil(userEmail) ? { login_hint: userEmail } : {}),
    [userEmail, userManager],
  );

  const onSignInSilentlySuccess = useCallback(
    () => { log('Silent auth as citizen succeed'); },
    [],
  );

  const onSignInSilentlyError = useCallback(
    (err) => {
      log(`Silent auth as citizen failed ${err}`);
      setLoginAsScreen(true);
    },
    [setLoginAsScreen],
  );

  const signinSilent = useCallback(
    () => userManager.signinSilent(),
    [userManager],
  );

  const { isFetching: loginInProgress, wrappedFetch: signInSilently } = useFetchCallback(
    signinSilent,
    { onSuccess: onSignInSilentlySuccess, onError: onSignInSilentlyError },
  );

  const render = (props) => {
    const renderProps = { ...props, ...componentProps };

    if (loginAsScreen) {
      return (
        <BoxAction
          title={t('screens:Citizen.Actions.loginAs.description')}
          actions={[{
            buttonText: t('screens:Citizen.Actions.loginAs.button'),
            onClick: signIn,
          }]}
          {...renderProps}
        />
      );
    }

    if (!IS_PLUGIN && isAuthenticated && userScope.includes(`${ROLE_PREFIX_SCOPE}.`)) {
      if (window.env.AUTH.automaticSilentRenew === false) {
        setLoginAsScreen(true);
        return null;
      }

      if (loginInProgress) {
        return <SplashScreen text={t('screens:Citizen.Actions.loginAs.loading')} />;
      }

      signInSilently();
      return null;
    }

    return <Component {...renderProps} />;
  };

  render.propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        mainDomain: PropTypes.string,
      }),
    }).isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string,
    }).isRequired,
  };

  // @FIXME: copied code from `RoutePrivate` to solve bug https://gitlab.misakey.dev/misakey/frontend/issues/346
  // seems like it was related to nested `withUserManager`
  if (isPrivate) {
    let RouteRender;

    if (isAuthenticated) {
      RouteRender = render;
    } else {
      userManager.signinRedirect();
      RouteRender = null;
    }
    return <Route {...rest} render={RouteRender} />;
  }

  return <Route {...rest} render={render} />;
}

RouteCitizen.propTypes = {
  component: PropTypes.elementType.isRequired,
  componentProps: PropTypes.objectOf(PropTypes.any),
  t: PropTypes.func.isRequired,
  userScope: PropTypes.string,
  userEmail: PropTypes.string,
  userManager: PropTypes.object.isRequired,
  isAuthenticated: PropTypes.bool,
  isPrivate: PropTypes.bool,
};

RouteCitizen.defaultProps = {
  componentProps: {},
  userScope: '',
  userEmail: null,
  isPrivate: false,
  isAuthenticated: false,
};

// CONNECT
const mapStateToProps = (state) => {
  const { sco } = state.auth.id ? parseJwt(state.auth.id) : {};
  const { email } = state.auth.profile || {};
  return { userScope: sco, isAuthenticated: !!state.auth.token, userEmail: email };
};

export default withUserManager(
  withTranslation(['screens', 'auth'])(connect(mapStateToProps, null)(RouteCitizen)),
);
