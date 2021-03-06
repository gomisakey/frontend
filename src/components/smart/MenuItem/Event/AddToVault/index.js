import React, { forwardRef, useMemo } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import ContextMenuItem from '@misakey/ui/Menu/ContextMenu/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import AddToVaultIcon from '@misakey/ui/Icon/AddToVault';
import { useSetPasswordContext } from '@misakey/react/auth/components/Dialog/Password/Create/Context';

// COMPONENTS
const MenuItemAddFileToVault = forwardRef(({
  t, onSave, isSaved, disabled, component: Component,
}, ref) => {
  const { withPasswordOnClick } = useSetPasswordContext();
  const onClick = useMemo(() => withPasswordOnClick(onSave), [onSave, withPasswordOnClick]);

  return (
    <Component ref={ref} onClick={onClick} disabled={disabled || isSaved}>
      <ListItemIcon>
        <AddToVaultIcon isSaved={isSaved} />
      </ListItemIcon>
      <ListItemText primary={isSaved ? t('common:savedInVault') : t('common:addToVault')} />
    </Component>
  );
});

MenuItemAddFileToVault.propTypes = {
  component: PropTypes.elementType,
  // withTranslation
  t: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  isSaved: PropTypes.bool,
};

MenuItemAddFileToVault.defaultProps = {
  component: ContextMenuItem,
  disabled: false,
  isSaved: false,
};

export default withTranslation('common', { withRef: true })(MenuItemAddFileToVault);
