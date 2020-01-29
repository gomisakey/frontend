import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from 'helpers/omit/translationProps';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import ApplicationImg from 'components/dumb/Application/Img';
import Typography from '@material-ui/core/Typography';

// HOOKS
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  toolbar: {
    justifyContent: 'space-between',
  },
  appBlock: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  appImg: {
    borderRadius: 5,
  },
  appName: {
    marginLeft: theme.spacing(2),
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  mainDomain: {
    marginRight: theme.spacing(1),
  },
  ratingIcon: {
    color: theme.palette.primary.main,
  },
}));

const ApplicationAvatarSso = ({ sso, t, className, typographyProps, ...rest }) => {
  const classes = useStyles();

  const { clientName, logoUri } = useMemo(
    () => sso || {},
    [sso],
  );

  const alt = useMemo(
    () => t('common:brand', { brand: clientName }),
    [clientName, t],
  );

  return (
    <Box className={clsx(className, classes.appBlock)} {...omitTranslationProps(rest)}>
      <ApplicationImg
        classes={{ root: classes.appImg }}
        src={logoUri}
        applicationName={clientName}
        alt={alt}
      />
      <div className={classes.appName}>
        <Typography noWrap color="textSecondary" {...typographyProps}>
          {clientName}
        </Typography>
      </div>

    </Box>
  );
};

ApplicationAvatarSso.propTypes = {
  className: PropTypes.string,
  sso: PropTypes.shape({
    clientName: PropTypes.string.isRequired,
    logoUri: PropTypes.string.isRequired,
  }),
  t: PropTypes.func.isRequired,
  typographyProps: PropTypes.object,
};

ApplicationAvatarSso.defaultProps = {
  className: '',
  sso: null,
  typographyProps: {},
};

export default withTranslation('common')(ApplicationAvatarSso);