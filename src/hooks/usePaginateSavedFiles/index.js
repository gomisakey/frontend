
import { useMemo, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { actionCreators, selectors } from 'store/reducers/files/saved/pagination';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

import pickAll from '@misakey/core/helpers/pickAll';
import isNil from '@misakey/core/helpers/isNil';
import { makeOffsetLimitFromRange, makeRangeFromOffsetLimit } from '@misakey/core/helpers/offsetLimitRange';
import { getSavedFilesBuilder, countSavedFilesBuilder } from '@misakey/core/api/helpers/builder/vault';
import objectToCamelCase from '@misakey/core/helpers/objectToCamelCase';
import getMissingIndexes from '@misakey/core/helpers/getMissingIndexes';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import { receiveSavedFiles } from 'store/reducers/files/saved';

// CONSTANTS
const { receivePaginatedItemCount } = actionCreators;
const { makeGetByPagination, makeGetItemCount } = selectors;

// HOOKS
/**
 * @returns {{byPagination: Object, itemCount: Number, loadMoreItems: Function}}
 * where:
 * - byPagination is a map of paginated elements
 * - itemCount is the total number of elements
 * - loadMoreItems is a function to call to ask for more items
 */
export default () => {
  const handleHttpErrors = useHandleHttpErrors();
  const identityId = useSelector(authSelectors.identityId);

  const dispatch = useDispatch();

  // SELECTORS
  const getByPaginationSelector = useMemo(
    () => makeGetByPagination(),
    [],
  );

  const getItemCountSelector = useMemo(
    () => makeGetItemCount(),
    [],
  );

  // SELECTORS hooks with memoization layer
  const byPagination = useSelector((state) => getByPaginationSelector(state, identityId));
  const itemCount = useSelector((state) => getItemCountSelector(state, identityId));
  // ---

  const dispatchReceived = useCallback(
    (data, { offset, limit }) => {
      dispatch(receiveSavedFiles(data, identityId, offset, limit));
    },
    [dispatch, identityId],
  );

  // API data fetching:
  const getCount = useCallback(
    () => countSavedFilesBuilder({ identityId }),
    [identityId],
  );

  // get files events
  const get = useCallback(
    (pagination) => getSavedFilesBuilder({ identityId, ...pagination })
      .then((response) => dispatchReceived(response.map(objectToCamelCase), pagination)),
    [dispatchReceived, identityId],
  );

  // called by react-window lists
  // decides whenever API calls are needed
  const loadMoreItems = useCallback(
    (pagination) => {
      const askedPagination = makeRangeFromOffsetLimit(pagination);
      const pickedIndexes = pickAll(askedPagination, byPagination);
      const paginatedIds = Object.values(pickedIndexes)
        .filter((pickedIndex) => !isNil(pickedIndex));
      // when asked data is already in store
      if (askedPagination.length === paginatedIds.length) {
        return Promise.resolve();
      }
      const missingIndexes = getMissingIndexes(pickedIndexes).map(((index) => parseInt(index, 10)));
      // call API
      return get(makeOffsetLimitFromRange(missingIndexes));
    },
    [byPagination, get],
  );

  // update itemCount whenever it is nil
  const shouldFetch = useMemo(
    () => isNil(itemCount),
    [itemCount],
  );

  const onSuccess = useCallback(
    (result) => dispatch(receivePaginatedItemCount(identityId, result)),
    [dispatch, identityId],
  );

  useEffect(
    () => {
      if (shouldFetch) {
        getCount()
          .then(onSuccess)
          .catch(handleHttpErrors);
      }
    },
    [getCount, handleHttpErrors, onSuccess, shouldFetch],
  );

  // extra memoization layer because of object format
  return useMemo(
    () => ({
      byPagination,
      itemCount,
      loadMoreItems,
    }),
    [byPagination, itemCount, loadMoreItems],
  );
};
