import { receiveDatatags, selectors as datatagsSelectors } from 'store/reducers/identity/organizations/datatags';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

import { listDatatags } from '@misakey/core/api/helpers/builder/identities';
import isNil from '@misakey/core/helpers/isNil';

import { useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useFetchEffect from '@misakey/hooks/useFetch/effect';

// CONSTANTS
const { makeDenormalizeDatatags } = datatagsSelectors;
const { identityId: IDENTITY_ID_SELECTOR } = authSelectors;

// HOOKS
export default ({ organizationId }, isReady = true) => {
  const dispatch = useDispatch();
  const handleHttpErrors = useHandleHttpErrors();

  const meIdentityId = useSelector(IDENTITY_ID_SELECTOR);

  const denormalizeDatatagsSelector = useMemo(
    () => makeDenormalizeDatatags(),
    [],
  );

  const datatags = useSelector((state) => denormalizeDatatagsSelector(state, organizationId));

  const shouldFetch = useMemo(
    () => isNil(datatags) && isReady,
    [datatags, isReady],
  );

  const dispatchReceiveDatatags = useCallback(
    (dtts) => Promise.resolve(
      dispatch(receiveDatatags(dtts, { identityId: meIdentityId, organizationId })),
    ),
    [dispatch, meIdentityId, organizationId],
  );

  const getdatatags = useCallback(
    () => listDatatags(meIdentityId, { organizationId })
      .then(dispatchReceiveDatatags)
      .catch(handleHttpErrors),
    [dispatchReceiveDatatags, handleHttpErrors, meIdentityId, organizationId],
  );

  const fetchMetadata = useFetchEffect(
    getdatatags,
    { shouldFetch },
  );

  return useMemo(
    () => ({
      datatags,
      shouldFetch,
      ...fetchMetadata,
    }),
    [datatags, shouldFetch, fetchMetadata],
  );
};
