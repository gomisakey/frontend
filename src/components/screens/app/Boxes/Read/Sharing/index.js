import React, { useCallback, useMemo, useState, useEffect } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import BoxesSchema from 'store/schemas/Boxes';
import routes from 'routes';
import { ACCESS_RM, ACCESS_BULK } from '@misakey/ui/constants/boxes/events';
import { LIMITED_RESTRICTION_TYPES } from '@misakey/ui/constants/boxes/accesses';
import { EMAIL_DOMAIN, IDENTIFIER } from '@misakey/ui/constants/accessTypes';
import { PUBLIC } from '@misakey/ui/constants/accessModes';
import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';
import { updateAccessesEvents } from 'store/reducers/box';
import { APPBAR_HEIGHT } from '@misakey/ui/constants/sizes';

import { getUpdatedAccesses } from 'helpers/accesses';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import partition from '@misakey/helpers/partition';
import differenceWith from '@misakey/helpers/differenceWith';
import { senderMatchesIdentifierValue, senderMatchesIdentityId, sendersMatch } from 'helpers/sender';
import { createBulkBoxEventBuilder } from '@misakey/helpers/builder/boxes';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useBoxShareMetadata from 'hooks/useBoxShareMetadata';
import useBoxAccessesEffect from 'hooks/useBoxAccesses/effect';
import useBoxAccessesCallback from 'hooks/useBoxAccesses/callback';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useBoxReadContext } from 'components/smart/Context/Boxes/BoxRead';
import useXsMediaQuery from '@misakey/hooks/useXsMediaQuery';

import { Link } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListBordered from '@misakey/ui/List/Bordered';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ElevationScroll from 'components/dumb/ElevationScroll';
import IconButtonAppBar from '@misakey/ui/IconButton/AppBar';
import Box from '@material-ui/core/Box';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import Avatar from '@material-ui/core/Avatar';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import AppBarDrawer from 'components/smart/Screen/Drawer/AppBar';
import ListItemUserWhitelisted from '@misakey/ui/ListItem/User/Whitelisted';
import ListItemUserWhitelistedSkeleton from '@misakey/ui/ListItem/User/Whitelisted/Skeleton';
import ListItemUserMember from '@misakey/ui/ListItem/User/Member';
import ListItemDomainWhitelisted from '@misakey/ui/ListItem/Domain/Whitelisted';
import Accordion from '@misakey/ui/Accordion';
import AccordionSummary from '@misakey/ui/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ShareBoxForm from 'components/screens/app/Boxes/Read/Sharing/Form';
import ShareBoxFormSkeleton from 'components/screens/app/Boxes/Read/Sharing/Form/Skeleton';
import ListItemShareBoxLink from 'components/smart/ListItem/BoxLink/Share';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import BoxMessageWhitelist from '@misakey/ui/Box/Message/Whitelist';

import ArrowBack from '@material-ui/icons/ArrowBack';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// CONSTANTS
const CONTENT_SPACING = 2;
const { identityId: IDENTITY_ID_SELECTOR } = authSelectors;

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatar: {
    marginRight: theme.spacing(1),
  },
  listItemText: {
    margin: 0,
  },
  content: {
    padding: theme.spacing(0, CONTENT_SPACING, CONTENT_SPACING),
    [theme.breakpoints.only('xs')]: {
      padding: theme.spacing(CONTENT_SPACING, 0, 0, 0),
    },
    boxSizing: 'border-box',
    maxHeight: `calc(100% - ${APPBAR_HEIGHT}px)`,
    overflow: 'auto',
  },
}));

// COMPONENTS
function BoxSharing({ box, t }) {
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const isXs = useXsMediaQuery();

  // useRef seems buggy with ElevationScroll
  const [contentRef, setContentRef] = useState();
  const [domainExpanded, setDomainExpanded] = useState(false);

  const { id: boxId, accesses, members, creator, accessMode } = useSafeDestr(box);
  const { id: creatorId, displayName, avatarUrl, identifierValue } = useSafeDestr(creator);

  const meIdentityId = useSelector(IDENTITY_ID_SELECTOR);
  const dispatch = useDispatch();

  /* FETCH ACCESSES */
  const { isFetching, isCurrentUserOwner } = useBoxAccessesEffect(box);
  const {
    wrappedFetch: getBoxAccesses,
    isFetching: isFetchingAccesses,
  } = useBoxAccessesCallback(box);

  const goBack = useGeneratePathKeepingSearchAndHash(routes.boxes.read._, { id: boxId });

  const whitelist = useMemo(
    () => {
      const restrictions = (accesses || []).map(({ id, content }) => ({ id, ...content }));
      return restrictions
        .filter(({ restrictionType }) => LIMITED_RESTRICTION_TYPES
          .includes(restrictionType));
    },
    [accesses],
  );

  const [whitelistDomains, whitelistUsers] = useMemo(
    () => partition(whitelist, ({ restrictionType }) => restrictionType === EMAIL_DOMAIN),
    [whitelist],
  );

  const membersNotInWhitelist = useMemo(
    () => {
      const membersWithoutCreator = (members || [])
        .filter((member) => !sendersMatch(member, creator));
      return differenceWith(
        membersWithoutCreator,
        whitelistUsers,
        (member, { value }) => senderMatchesIdentifierValue(member, value),
      );
    },
    [members, whitelistUsers, creator],
  );

  const { secretKey: boxSecretKey } = useBoxReadContext();

  const {
    invitationURL,
    boxKeyShare,
  } = useBoxShareMetadata(boxId);

  const onToggleAccordion = useCallback(
    () => setDomainExpanded((prevDomainExpanded) => !prevDomainExpanded),
    [setDomainExpanded],
  );

  const onRemove = useCallback(
    async (event, referrerId) => {
      // if whitelist is going to be emptied, remove all accesses
      const events = whitelist.length > 1
        ? [{
          type: ACCESS_RM,
          referrerId,
        }]
        : accesses.map(({ id }) => ({
          type: ACCESS_RM,
          referrerId: id,
        }));
      const bulkEventsPayload = {
        batchType: ACCESS_BULK,
        events,
      };
      try {
        const response = await createBulkBoxEventBuilder(boxId, bulkEventsPayload);
        const newAccesses = getUpdatedAccesses(accesses, response);
        await dispatch(updateAccessesEvents(boxId, newAccesses));
        enqueueSnackbar(t('boxes:read.share.update.success'), { variant: 'success' });
      } catch (err) {
        enqueueSnackbar(t('boxes:read.share.update.error'), { variant: 'warning' });
      }
    },
    [accesses, dispatch, boxId, whitelist, enqueueSnackbar, t],
  );

  useEffect(
    () => {
      if (isCurrentUserOwner
        && !isEmpty(membersNotInWhitelist) && !isFetchingAccesses && !isFetching
      ) {
        getBoxAccesses();
      }
    },
    [isCurrentUserOwner, membersNotInWhitelist, getBoxAccesses, isFetchingAccesses, isFetching],
  );

  useEffect(
    () => {
      if (accessMode !== PUBLIC) {
        setDomainExpanded(true);
      }
    },
    [accessMode, setDomainExpanded],
  );

  return (
    <>
      <ElevationScroll target={contentRef}>
        <AppBarDrawer position="static" disableOffset>
          <IconButtonAppBar
            aria-label={t('common:goBack')}
            edge="start"
            component={Link}
            to={goBack}
          >
            <ArrowBack />
          </IconButtonAppBar>
          <BoxFlexFill />
          <Button
            text={t('common:done')}
            component={Link}
            to={goBack}
            standing={BUTTON_STANDINGS.MAIN}
          />

        </AppBarDrawer>
      </ElevationScroll>
      <Box ref={(ref) => setContentRef(ref)} className={classes.content}>
        <List disablePadding>
          <ListItem disabled={!isCurrentUserOwner}>
            <ListItemAvatar>
              <Avatar className={classes.avatar}><PersonAddIcon fontSize="small" /></Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={t('boxes:read.share.accesses.title')}
              primaryTypographyProps={{ variant: 'h6', color: 'textPrimary' }}
              className={classes.listItemText}
            />
          </ListItem>
          {(isFetching || (isNil(accesses) && isCurrentUserOwner)) ? (
            <ShareBoxFormSkeleton>
              <Box my={2}>
                <ListBordered disablePadding>
                  <ListItemUserWhitelistedSkeleton />
                </ListBordered>
              </Box>
              <ListItemShareBoxLink
                box={box}
                isOwner={isCurrentUserOwner}
              />
            </ShareBoxFormSkeleton>
          ) : (
            <ShareBoxForm
              accesses={accesses}
              members={members}
              boxId={boxId}
              creator={creator}
              invitationURL={invitationURL}
              isCurrentUserOwner={isCurrentUserOwner}
              boxKeyShare={boxKeyShare}
              boxSecretKey={boxSecretKey}
              accessMode={accessMode}
            >
              <Box my={1}>
                <ListBordered x={!isXs} dense disablePadding>
                  <Accordion
                    defaultExpanded
                    elevation={0}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                    >
                      <Subtitle>{t(`boxes:read.share.accesses.${IDENTIFIER}`)}</Subtitle>
                    </AccordionSummary>
                    <AccordionDetails>
                      <ListItemUserWhitelisted
                        key={creatorId}
                        isMe={senderMatchesIdentityId(creator, meIdentityId)}
                        isOwner
                        isMember
                        id={creatorId}
                        displayName={displayName}
                        avatarUrl={avatarUrl}
                        identifier={identifierValue}
                      />
                      {!isCurrentUserOwner && membersNotInWhitelist.map((member) => (
                        <ListItemUserWhitelisted
                          key={member.id}
                          isMe={senderMatchesIdentityId(member, meIdentityId)}
                          isMember
                          id={member.id}
                          displayName={member.displayName}
                          avatarUrl={member.avatarUrl}
                          identifier={member.identifierValue}
                        />
                      ))}
                      {whitelistUsers.map((
                        { restrictionType, value, id, ...rest },
                      ) => (
                        <ListItemUserMember
                          component={ListItemUserWhitelisted}
                          skeleton={ListItemUserWhitelistedSkeleton}
                          key={id}
                          id={id}
                          identifier={value}
                          members={members}
                          onRemove={onRemove}
                          {...rest}
                        />
                      ))}
                    </AccordionDetails>
                  </Accordion>
                  <Accordion
                    expanded={domainExpanded}
                    onChange={onToggleAccordion}
                    elevation={0}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      classes={{ root: classes.accordionSummaryRoot }}
                    >
                      <Subtitle>{t(`boxes:read.share.accesses.${EMAIL_DOMAIN}`)}</Subtitle>
                    </AccordionSummary>
                    <AccordionDetails>
                      {whitelistDomains.map((
                        { restrictionType, value, id, ...rest },
                      ) => (
                        <ListItemDomainWhitelisted
                          id={id}
                          key={id}
                          identifier={value}
                          {...rest}
                          onRemove={onRemove}
                        />
                      ))}
                    </AccordionDetails>
                  </Accordion>
                </ListBordered>
                <BoxMessageWhitelist
                  my={1}
                  whitelist={whitelist}
                  type="warning"
                  text={t('boxes:read.share.accesses.requiredWarning')}
                  border={false}
                  square={isXs}
                />
              </Box>
              <ListItemShareBoxLink
                box={box}
                isOwner={isCurrentUserOwner}
              />
            </ShareBoxForm>
          )}
        </List>

      </Box>
    </>
  );
}

BoxSharing.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation(['boxes', 'common'])(BoxSharing);
