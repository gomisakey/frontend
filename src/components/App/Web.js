import React, { lazy } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import routes from 'routes';
import { Route, Switch } from 'react-router-dom';

import Forbidden from 'components/screens/Forbidden';
import Landing from 'components/screens/Landing';
import NotFound from 'components/screens/NotFound';
import Requests from 'components/screens/DPO/Service/Requests/Read';

import Redirect from 'components/dumb/Redirect';
import RedirectAuthCallback from '@misakey/auth/components/Redirect/AuthCallbackWrapper';
import RoutePrivate from '@misakey/auth/components/Route/Private';
import RouteAccessRequest from 'components/smart/Route/AccessRequest';
import SeclevelWarningAlert from 'components/smart/Alert/SeclevelWarning';

// LAZY
const Account = lazy(() => import('components/screens/Account'));
const Admin = lazy(() => import('components/screens/Admin'));
const DPO = lazy(() => import('components/screens/DPO'));
const Citizen = lazy(() => import('components/screens/Citizen'));
const Auth = lazy(() => import('components/screens/Auth'));

// CONSTANTS
const REFERRERS = {
  success: routes._,
  error: routes._,
};

// COMPONENTS
const TRedirectAuthCallback = withTranslation('common__new')(RedirectAuthCallback);

const App = ({ t }) => (
  <>
    <SeclevelWarningAlert />
    <Switch>
      <Route exact path={routes._} component={Landing} />
      {/* LEGALS */}
      <Route
        exact
        path={routes.legals.tos}
        render={(routerProps) => <Redirect to={t('components__new:footer.links.tos.href')} {...routerProps} />}
      />
      <Route
        exact
        path={routes.legals.privacy}
        render={(routerProps) => <Redirect to={t('components__new:footer.links.privacy.href')} {...routerProps} />}
      />
      {/* AUTH and ACCOUNT */}
      <Route path={routes.auth._} component={Auth} />
      <RoutePrivate path={routes.account._} component={Account} />
      <Route
        exact
        path={routes.auth.callback}
        render={(routerProps) => (
          <TRedirectAuthCallback fallbackReferrers={REFERRERS} t={t} {...routerProps} />
        )}
      />

      {/* ERRORS */}
      <Route
        exact
        path={routes.errors.forbidden}
        component={Forbidden}
      />

      {/* WORKSPACES */}
      <Route path={routes.admin._} component={Admin} />
      <Route path={routes.citizen._} component={Citizen} />
      <Route path={routes.dpo._} component={DPO} />

      {/* REQUESTS */}
      <RouteAccessRequest exact path={routes.requests} component={Requests} />

      {/* DEFAULT */}
      <Route component={NotFound} />
    </Switch>
  </>
);

App.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation('components__new')(App);
