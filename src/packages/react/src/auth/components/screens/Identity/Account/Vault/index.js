import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import IdentitySchema from '@misakey/react/auth/store/schemas/Identity';
import authRoutes from '@misakey/react/auth/routes';

import isNil from '@misakey/core/helpers/isNil';

import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';

import ScreenAction from '@misakey/ui/Screen/Action';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Title from '@misakey/ui/Typography/Title';
import CardDownloadBackupKey from '@misakey/react/auth/components/Card/BackupKey/Download';
import ListBordered from '@misakey/ui/List/Bordered';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

// COMPONENTS
const AccountVault = ({ t, identity, isFetching }) => {
  const { id } = useParams();

  const isLoading = useMemo(
    () => isFetching || isNil(identity),
    [identity, isFetching],
  );

  const accountHome = useGeneratePathKeepingSearchAndHash(authRoutes.identities._, { id });

  const navigationProps = useMemo(
    () => ({
      homePath: accountHome,
    }),
    [accountHome],
  );

  return (
    <ScreenAction
      title={t('account:vault.title')}
      navigationProps={navigationProps}
      isLoading={isLoading}
    >
      <Container maxWidth="md">
        <Typography color="textSecondary">{t('account:vault.info.general')}</Typography>
        <Box my={3}>
          <Title>{t('account:vault.info.myKeyTitle')}</Title>
          <Typography color="textSecondary">{t('account:vault.info.exportInfo')}</Typography>
          <Box my={1}>
            <CardDownloadBackupKey />
          </Box>
          <Box my={1}>
            <ListBordered disablePadding>
              <ListItem disabled>
                <ListItemText
                  primary={t('account:vault.importButton.info')}
                  primaryTypographyProps={{ color: 'textPrimary' }}
                  secondary={t('common:wip')}
                />
              </ListItem>
            </ListBordered>
          </Box>
        </Box>
      </Container>
    </ScreenAction>
  );
};

AccountVault.propTypes = {
  identity: PropTypes.shape(IdentitySchema.propTypes),
  isFetching: PropTypes.bool,

  // withTranslation
  t: PropTypes.func.isRequired,
};

AccountVault.defaultProps = {
  identity: null,
  isFetching: false,
};

export default withTranslation(['common', 'account'])(AccountVault);
