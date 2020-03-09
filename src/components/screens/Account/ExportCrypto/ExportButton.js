import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import CardSimpleText from 'components/dumb/Card/Simple/Text';
import { BUTTON_STANDINGS } from 'components/dumb/Button';

import exportCrypto from '@misakey/crypto/store/actions/exportCrypto';

import { usePasswordPrompt } from 'components/screens/Citizen/Application/Info/Vault/PasswordPrompt';

const ExportButton = ({ t }) => {
  const fileNamePrefix = t('account__new:exportCrypto.exportButton.fileName');

  const openPasswordPrompt = usePasswordPrompt();
  const dispatch = useDispatch();

  const onClick = useCallback(
    () => dispatch(exportCrypto(fileNamePrefix, openPasswordPrompt)),
    [dispatch, fileNamePrefix, openPasswordPrompt],
  );

  return (
    <CardSimpleText
      text={t('account__new:exportCrypto.exportButton.info')}
      button={{
        standing: BUTTON_STANDINGS.TEXT,
        text: t('common__new:download'),
        onClick,
      }}
    />
  );
};

ExportButton.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation(['account__new', 'common__new'])(ExportButton);