import React, { useMemo, useCallback, useEffect, forwardRef } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { useScreenDrawerContext } from 'components/smart/Screen/Drawer';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

import { getProfile as getProfileBuilder } from '@misakey/core/api/helpers/builder/identities';
import isEmpty from '@misakey/core/helpers/isEmpty';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getCode } from '@misakey/core/helpers/apiError';
import { notFound } from '@misakey/core/api/constants/errorTypes';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';

import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AvatarDetailed from '@misakey/ui/Avatar/Detailed';
import AvatarDetailedSkeleton from '@misakey/ui/Avatar/Detailed/Skeleton';
import AppBarStatic from '@misakey/ui/AppBar/Static';
import CardIdentityHeader from '@misakey/react/auth/components/Card/Identity/Header';
import CardList from '@misakey/ui/Card/List';
import Card from '@material-ui/core/Card';
import CardOnboardDiscover from 'components/dumb/Card/Onboard/Discover';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import ButtonConnect from 'components/dumb/Button/Connect';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import ButtonContactMailto from '@misakey/ui/Button/Contact/Mailto';
import Subtitle from '@misakey/ui/Typography/Subtitle';

import ToggleDrawerButton from 'components/smart/Screen/Drawer/AppBar/ToggleButton';
import withDialogContact from 'components/smart/Dialog/Boxes/Contact/with';
import routes from 'routes';


// CONSTANTS
const { isAuthenticated: IS_AUTHENTICATED_SELECTOR } = authSelectors;
const ButtonContact = withDialogContact(Button);

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatarDetailedRoot: {
    margin: theme.spacing(1, 1),
    padding: theme.spacing(1, 0),
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  listItemTextBreak: {
    overflowWrap: 'break-word',
  },
  listItemContainer: {
    width: '100%',
  },
  listItemIcon: {
    textTransform: 'uppercase',
    width: '7rem',
    [theme.breakpoints.only('xs')]: {
      width: '4rem',
    },
  },
  actionIcon: {
    width: 40,
    verticalAlign: 'middle',
  },
  cardActionArea: {
    borderRadius: theme.shape.borderRadius,
    userSelect: 'text',
  },
}));

// COMPONENTS
const IdentityPublicReadOnly = forwardRef(({ t }, ref) => {
  const classes = useStyles();
  const history = useHistory();
  const handleHttpErrors = useHandleHttpErrors();

  const { id } = useParams();
  const { setIsDrawerForceClosed } = useScreenDrawerContext();

  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);

  const getProfile = useCallback(
    () => getProfileBuilder({ identityId: id, isAuthenticated }),
    [id, isAuthenticated],
  );

  const onError = useCallback(
    (e) => {
      const code = getCode(e);
      handleHttpErrors(e);
      if (code === notFound) {
        history.push(routes._);
      }
    },
    [handleHttpErrors, history],
  );

  const { isFetching, data } = useFetchEffect(
    getProfile, undefined, { onError },
  );

  const {
    identifierValue,
    identifierKind,
    displayName,
    avatarUrl,
    contactable,
  } = useSafeDestr(data);

  const privateIdentifiervalue = useMemo(
    () => isEmpty(identifierValue),
    [identifierValue],
  );

  const primaryTypographyProps = useMemo(
    () => (privateIdentifiervalue ? { color: 'primary' } : {}),
    [privateIdentifiervalue],
  );

  const title = useMemo(
    () => t('account:public.other.title', { displayName }),
    [t, displayName],
  );

  const dialogContactProps = useMemo(
    () => ({
      targetUser: { identityId: id, profile: data },
    }),
    [data, id],
  );

  useUpdateDocHead(title);

  useEffect(
    () => {
      setIsDrawerForceClosed(!isAuthenticated);
    },
    [setIsDrawerForceClosed, isAuthenticated],
  );

  return (
    <>
      <AppBarStatic>
        <ToggleDrawerButton />
        <BoxFlexFill />
        {!isAuthenticated && (
          <>
            <ButtonConnect
              authProps={{ misakeyCallbackHints: { shouldCreateAccount: true } }}
              text={t('common:createAccount')}
            />
            <Box ml={2}>
              <ButtonConnect
                standing={BUTTON_STANDINGS.TEXT}
              />
            </Box>
          </>
        )}
      </AppBarStatic>
      <Container ref={ref} className={classes.container} maxWidth="sm">
        <Card elevation={0} component={Box} display="flex" flexDirection="column" alignItems="center">
          {isFetching ? (
            <AvatarDetailedSkeleton />
          ) : (
            <AvatarDetailed
              classes={{
                root: classes.avatarDetailedRoot,
              }}
              text={displayName}
              image={avatarUrl}
              title={displayName}
              subtitle={identifierValue}
            />
          )}
          {contactable && (
            <ButtonContact
              standing={BUTTON_STANDINGS.MAIN}
              text={t('common:contact')}
              dialogProps={dialogContactProps}
            />
          )}
          {!contactable && (
            privateIdentifiervalue ? (
              <Subtitle>{t('account:public.private', { displayName })}</Subtitle>
            ) : (
              <ButtonContactMailto email={identifierValue} />
            )
          )}
        </Card>
        <CardIdentityHeader>{t('account:sections.myIdentifiers.title')}</CardIdentityHeader>
        <CardList>
          <ListItem
            divider
            classes={{ container: classes.listItemContainer }}
          >
            <ListItemIcon className={classes.listItemIcon}>
              {/* @FIXME fallback for backend bugged empty kind */}
              <Typography>{t(`fields:${identifierKind || 'email'}.label`)}</Typography>
            </ListItemIcon>
            <ListItemText
              primary={identifierValue || t('account:public.confirmed')}
              primaryTypographyProps={primaryTypographyProps}
            />
          </ListItem>
        </CardList>
        {!isAuthenticated && (
          <CardOnboardDiscover />
        )}
      </Container>
    </>
  );
});

IdentityPublicReadOnly.propTypes = {
  // withTranslation
  t: PropTypes.func.isRequired,
};

IdentityPublicReadOnly.defaultProps = {
};

export default withTranslation(['fields', 'account', 'onboard', 'common'], { withRef: true })(IdentityPublicReadOnly);
