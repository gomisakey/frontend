import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';

import { IS_PLUGIN } from 'constants/plugin';
import routes from 'routes';
import ApplicationSchema from 'store/schemas/Application';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';

import withApplication from 'components/smart/withApplication';
import RoutePrivate from '@misakey/auth/components/Route/Private';
import ApplicationNone from 'components/screens/Citizen/Application/None';
import ApplicationInfo from 'components/screens/Citizen/Application/Info';
import MyFeedback from 'components/screens/Citizen/Application/MyFeedback';
import ApplicationContact from 'components/screens/Citizen/Application/Contact';


// CONSTANTS
const PAGES_ROSES_ENDPOINT = {
  method: 'GET',
  path: '/applications/:mainDomain',
};

// COMPONENTS
function Application({ entity, error, isFetching, mainDomain, match }) {
  const application = useMemo(
    () => ((isFetching || isNil(entity)) ? { mainDomain, isUnknown: true } : entity),
    [mainDomain, entity, isFetching],
  );

  const state = useMemo(
    () => ({
      error,
      isLoading: !IS_PLUGIN && isFetching && isEmpty(entity),
    }),
    [error, isFetching, entity],
  );


  const screenProps = useMemo(
    () => ({
      state,
    }),
    [state],
  );


  const infoProps = useMemo(
    () => ({
      screenProps: {
        ...screenProps,
        appBarProps: { elevationScroll: false },
      },
      entity: application,
    }),
    [screenProps, application],
  );

  return (
    <Switch>
      <RoutePrivate
        path={routes.citizen.application.contact._}
        component={ApplicationContact}
        componentProps={{
          entity: application,
          error,
          isFetching,
          mainDomain,
          screenProps,
        }}
      />
      <RoutePrivate
        path={routes.citizen.application.myFeedback}
        component={MyFeedback}
        componentProps={{
          application,
          screenProps,
        }}
      />

      <Route
        path={routes.citizen.application._}
        render={(routerProps) => (
          <ApplicationInfo
            {...infoProps}
            {...routerProps}
          />
        )}
      />
      <Route
        exact
        path={match.path}
        render={(routerProps) => (
          <ApplicationNone
            screenProps={screenProps}
            {...routerProps}
          />
        )}
      />
    </Switch>
  );
}

Application.propTypes = {
  // withApplication
  entity: PropTypes.shape(ApplicationSchema.propTypes),
  error: PropTypes.object,
  isFetching: PropTypes.bool,
  mainDomain: PropTypes.string.isRequired,
  // ROUTER
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
};

Application.defaultProps = {
  entity: null,
  error: null,
  isFetching: true,
};

export default withApplication(Application, {
  endpoint: PAGES_ROSES_ENDPOINT,
  paramMapper: (props) => [props],
  getSpecificShouldFetch: (entity) => {
    const { avgRating, isUnknown } = entity || {};
    return isNil(avgRating) && isUnknown !== true;
  },
});
