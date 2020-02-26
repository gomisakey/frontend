import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import useWidth from '@misakey/hooks/useWidth';

import Navigation from 'components/dumb/Navigation';

import './Error.scss';
import ErrorOverlay from '@misakey/ui/Error/Overlay';

/**
 * @param error
 * @param history
 * @param httpStatus
 * @param t
 * @returns {*}
 * @constructor
 */
function ScreenError({ error, history, httpStatus }) {
  const width = useWidth();

  return (
    <section id="ScreenError" className="section">
      {width === 'xs' && <Navigation history={history} />}
      <ErrorOverlay error={error} httpStatus={httpStatus} />
    </section>
  );
}

ScreenError.propTypes = {
  error: PropTypes.string,
  history: PropTypes.shape({ goBack: PropTypes.func.isRequired }).isRequired,
  httpStatus: PropTypes.number,
};

ScreenError.defaultProps = {
  error: null,
  httpStatus: null,
};

export default withRouter(ScreenError);
