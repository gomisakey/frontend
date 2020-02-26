import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';

import isFunction from '@misakey/helpers/isFunction';
import omit from '@misakey/helpers/omit';

import ButtonConnectSimple from 'components/dumb/Button/Connect/Simple';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';

// HOOKS
const useStyles = makeStyles(() => ({
  dialogActionsRoot: {
    justifyContent: 'space-between',
  },
}));

// COMPONENTS
const DialogConnect = ({ open, onClose, t, buttonConnectProps, ...rest }) => {
  const classes = useStyles();

  const onCancel = useCallback(
    () => {
      if (isFunction(onClose)) { onClose(); }
    },
    [onClose],
  );

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      {...omit(rest, ['tReady'])}
    >
      <DialogTitle>{t('components__new:dialogConnect.title')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t('components__new:dialogConnect.subtitle')}</DialogContentText>
      </DialogContent>
      <DialogActions classes={{ root: classes.dialogActionsRoot }}>
        <Button onClick={onCancel} color="primary">
          {t('common__new:cancel')}
        </Button>
        <ButtonConnectSimple {...buttonConnectProps} buttonProps={{ variant: 'contained' }}>
          {t('common__new:signIn')}
        </ButtonConnectSimple>
      </DialogActions>
    </Dialog>
  );
};

DialogConnect.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  buttonConnectProps: PropTypes.object,
};

DialogConnect.defaultProps = {
  onClose: null,
  buttonConnectProps: {},
};

export default withTranslation('common__new', 'components__new')(DialogConnect);
