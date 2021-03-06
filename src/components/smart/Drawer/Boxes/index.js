import React, { useMemo, useCallback } from 'react';

import { useHistory, useLocation } from 'react-router-dom';

import {
  TMP_DRAWER_BOXES_VALUE,
  TMP_DRAWER_QUERY_PARAMS,
  SIDE_QUERY_PARAM,
  TEMP_DRAWER_MOBILE_WIDTH,
  TEMP_DRAWER_DESKTOP_WIDTH,
  SIDES,
  HIDE_DRAWER_MAP,
} from '@misakey/ui/constants/drawers';

import getNextSearch from '@misakey/core/helpers/getNextSearch';
import isIOS from '@misakey/core/helpers/isIOS';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useDrawerLayout from '@misakey/hooks/useDrawerLayout';

import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import DrawerBoxesContent from 'components/smart/Drawer/Boxes/Content';

// HOOKS
const useStyles = makeStyles(() => ({
  drawerPaper: ({ drawerWidth }) => ({
    width: drawerWidth,
  }),
}));

// COMPONENTS
const DrawerBoxes = (props) => {
  const { replace } = useHistory();
  const { pathname, search, hash } = useLocation();

  const { isSmDown, tmpDrawerSearch, side } = useDrawerLayout();

  const sideOrDefault = useMemo(
    () => side || SIDES.LEFT,
    [side],
  );

  const swipeableProps = useMemo(
    () => (isIOS() ? {
      disableDiscovery: true,
    } : {
      disableBackdropTransition: true,
    }),
    [],
  );

  const drawerWidth = useMemo(
    () => (isSmDown ? TEMP_DRAWER_MOBILE_WIDTH : TEMP_DRAWER_DESKTOP_WIDTH),
    [isSmDown],
  );
  const classes = useStyles({ drawerWidth });

  const isTmpDrawerOpen = useMemo(
    () => tmpDrawerSearch === TMP_DRAWER_BOXES_VALUE, [tmpDrawerSearch],
  );

  const hideDrawerTo = useMemo(
    () => ({
      pathname,
      hash,
      search: getNextSearch(search, new Map(HIDE_DRAWER_MAP)),
    }),
    [hash, pathname, search],
  );

  const showDrawerTo = useMemo(
    () => ({
      pathname,
      hash,
      search: getNextSearch(search, new Map([
        [TMP_DRAWER_QUERY_PARAMS, TMP_DRAWER_BOXES_VALUE],
      ])),
    }),
    [hash, pathname, search],
  );

  const exitedTo = useMemo(
    () => ({
      pathname,
      hash,
      search: getNextSearch(search, new Map([
        [SIDE_QUERY_PARAM, undefined],
      ])),
    }),
    [hash, pathname, search],
  );

  const onClose = useCallback(
    () => replace(hideDrawerTo),
    [hideDrawerTo, replace],
  );

  const onOpen = useCallback(
    () => replace(showDrawerTo),
    [replace, showDrawerTo],
  );

  const onExited = useCallback(
    () => replace(exitedTo),
    [exitedTo, replace],
  );

  const SlideProps = useMemo(
    () => ({ onExited }),
    [onExited],
  );

  return (
    <SwipeableDrawer
      variant="temporary"
      anchor={sideOrDefault}
      open={isTmpDrawerOpen}
      onClose={onClose}
      onOpen={onOpen}
      SlideProps={SlideProps}
      classes={{ paper: classes.drawerPaper }}
      {...swipeableProps}
      {...props}
    >
      <DrawerBoxesContent
        backTo={hideDrawerTo}
        hideDrawerMap={HIDE_DRAWER_MAP}
      />
    </SwipeableDrawer>
  );
};

export default DrawerBoxes;
