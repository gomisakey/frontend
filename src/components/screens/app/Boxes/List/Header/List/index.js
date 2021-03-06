import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { ADMIN, AGENT } from '@misakey/ui/constants/organizations/roles';
import { TOOLBAR_MIN_HEIGHT } from '@misakey/ui/constants/sizes';
import { selectors as orgSelectors } from 'store/reducers/identity/organizations';

import isSelfOrg from 'helpers/isSelfOrg';
import noop from '@misakey/core/helpers/noop';

import useOrgId from '@misakey/react/auth/hooks/useOrgId';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import { useSelector } from 'react-redux';

import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import AppBarStatic from '@misakey/ui/AppBar/Static';
import IconButtonAppBar from '@misakey/ui/IconButton/AppBar';
import withDialogCreate from 'components/smart/Dialog/Boxes/Create/with';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import IconButtonDrawerBoxes from 'components/smart/IconButton/Drawer/Boxes';

import AddIcon from '@material-ui/icons/Add';

// CONSTANTS
const { makeDenormalizeOrganization } = orgSelectors;

const TOOLBAR_PROPS = {
  minHeight: `${TOOLBAR_MIN_HEIGHT}px !important`,
};

// COMPONENTS
const IconButtonCreate = withDialogCreate(
  IconButtonAppBar,
);

function ListHeader({ t }) {
  const orgId = useOrgId();
  const selfOrgSelected = useMemo(
    () => isSelfOrg(orgId),
    [orgId],
  );
  const denormalizeOrganizationSelector = useMemo(
    () => (selfOrgSelected ? noop : makeDenormalizeOrganization()),
    [selfOrgSelected],
  );
  const organization = useSelector((state) => denormalizeOrganizationSelector(state, orgId));
  const { currentIdentityRole } = useSafeDestr(organization);

  const canCreateOnOrg = useMemo(
    () => currentIdentityRole === ADMIN || currentIdentityRole === AGENT,
    [currentIdentityRole],
  );

  return (
    <AppBarStatic
      color="primary"
      toolbarProps={TOOLBAR_PROPS}
    >
      <IconButtonDrawerBoxes color="background" />
      <Subtitle gutterBottom={false} color="background">{t('boxes:documentTitle')}</Subtitle>
      <BoxFlexFill />
      {(selfOrgSelected || canCreateOnOrg) && (
        <IconButtonCreate
          aria-label={t('boxes:list.empty.create')}
          edge="end"
          color="background"
        >
          <AddIcon />
        </IconButtonCreate>
      )}
    </AppBarStatic>
  );
}

ListHeader.propTypes = {
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'boxes'])(ListHeader);
