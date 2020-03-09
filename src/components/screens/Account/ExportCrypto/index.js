import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import ScreenAction from 'components/dumb/Screen/Action';
import Title from 'components/dumb/Typography/Title';

// Export and import buttons need to be provided a password prompt function
import { PasswordPromptProvider } from 'components/screens/Citizen/Application/Info/Vault/PasswordPrompt';

import ExportButton from './ExportButton';
import ImportCard from './ImportCard';

const ExportCrypto = ({ t }) => (
  <PasswordPromptProvider>
    <ScreenAction
      title={t('account__new:exportCrypto.title')}
      hideAppBar
    >
      <Container maxWidth="md">
        <Typography>{t('account__new:exportCrypto.info.general')}</Typography>
        <Box my={3}>
          <Title>{t('account__new:exportCrypto.info.myKeyTitle')}</Title>
          <Typography>{t('account__new:exportCrypto.info.exportInfo')}</Typography>
          <Box my={1}>
            <ExportButton />
          </Box>
        </Box>
        <Box my={3}>
          <Title>{t('account__new:exportCrypto.importKey.title')}</Title>
          <Typography>{t('account__new:exportCrypto.importKey.helperText')}</Typography>
          <Box my={1}>
            <ImportCard />
          </Box>
        </Box>
      </Container>
    </ScreenAction>
  </PasswordPromptProvider>
);

ExportCrypto.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation(['screens'])(ExportCrypto);