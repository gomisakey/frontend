import React, { useMemo, createContext, useContext } from 'react';
import PropTypes from 'prop-types';

import STATUSES, { ALL } from 'constants/app/boxes/statuses';

import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import usePaginateBoxesByStatusRefresh from 'hooks/usePaginateBoxesByStatus/refresh';

// CONTEXT
export const BoxesContext = createContext({
  activeStatus: ALL,
  search: null,
  refresh: null,
  addItem: null,
});

// HOOKS
export const useBoxesContext = () => useContext(BoxesContext);

// COMPONENTS
const BoxesContextProvider = ({ activeStatus, children }) => {
  const locationSearchParams = useLocationSearchParams();
  const { search } = useMemo(() => locationSearchParams, [locationSearchParams]);

  const { refresh, addItem } = usePaginateBoxesByStatusRefresh(activeStatus, search);

  const contextValue = useMemo(
    () => ({
      activeStatus,
      search,
      refresh,
      addItem,
    }),
    [activeStatus, search, refresh, addItem],
  );

  return (
    <BoxesContext.Provider value={contextValue}>
      {children}
    </BoxesContext.Provider>
  );
};
BoxesContextProvider.propTypes = {
  activeStatus: PropTypes.oneOf(STATUSES),
  children: PropTypes.node,
};

BoxesContextProvider.defaultProps = {
  activeStatus: ALL,
  children: null,
};

export default BoxesContextProvider;