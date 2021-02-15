import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';

import BoxEventsSchema from 'store/schemas/Boxes/Events';
import { CREATE } from '@misakey/ui/constants/boxes/events';

import EventBoxInformationPreview from 'components/smart/Box/Event/Information/Preview';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(1),
    alignSelf: 'center',
  },
  e2eeIntro: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius * 2,
    alignSelf: 'center',
    padding: theme.spacing(0.5, 1),
    margin: theme.spacing(0, 3, 1, 3),
  },
}));

const BoxInformationEvent = ({
  event,
  isFromCurrentUser,
  preview,
  t,
}) => {
  const classes = useStyles();
  const { sender, type, content } = useMemo(() => event, [event]);
  const { displayName } = useMemo(() => sender, [sender]);

  const displayE2eeIntro = useMemo(() => type === CREATE, [type]);

  const author = useMemo(
    () => (isFromCurrentUser ? 'you' : 'they'),
    [isFromCurrentUser],
  );

  const text = useMemo(
    () => t(`boxes:read.events.information.${type}.${author}`, { displayName, ...content }),
    [author, content, displayName, t, type],
  );

  if (preview) {
    return (
      <EventBoxInformationPreview
        displayName={displayName}
        isFromCurrentUser={isFromCurrentUser}
        content={content}
        sender={sender}
        type={type}
      />
    );
  }

  return (
    <>
      <Typography variant="caption" color="textSecondary" className={classes.root}>
        {text}
      </Typography>
      {displayE2eeIntro && (
        <Typography
          className={classes.e2eeIntro}
          variant="caption"
          color="primary"
          align="center"
        >
          {t('boxes:read.events.e2eeIntro')}
        </Typography>
      )}
    </>
  );
};

BoxInformationEvent.propTypes = {
  event: PropTypes.shape(BoxEventsSchema.propTypes).isRequired,
  isFromCurrentUser: PropTypes.bool,
  t: PropTypes.func.isRequired,
  preview: PropTypes.bool,
};

BoxInformationEvent.defaultProps = {
  preview: false,
  isFromCurrentUser: false,
};

export default withTranslation('boxes')(BoxInformationEvent);
