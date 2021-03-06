import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

import isNil from '@misakey/core/helpers/isNil';
import logSentryException from '@misakey/core/helpers/log/sentry/exception';

import API from '@misakey/core/api';
import { HandledError } from '@misakey/core/api/API/errors';

// HOOKS
export default () => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('common');

  return useCallback(
    (error) => {
      if (error instanceof HandledError) {
        logSentryException(error, 'handleHttpErrors', undefined, 'warning');
        return;
      }
      logSentryException(error, 'handleHttpErrors');
      if (!isNil(error.status)) {
        const text = t([`common:httpStatus.error.${API.errors.filter(error.status)}`, 'common:anErrorOccurred']);
        enqueueSnackbar(text, { variant: 'warning' });
      } else {
        throw error;
      }
    },
    [enqueueSnackbar, t],
  );
};
