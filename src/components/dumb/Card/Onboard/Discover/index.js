import React from 'react';

import { useTranslation } from 'react-i18next';

import Card from '@material-ui/core/Card';
import Box from '@material-ui/core/Box';
import BoxAlinea from '@misakey/ui/Box/Alinea';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import Title from '@misakey/ui/Typography/Title';
import Subtitle from '@misakey/ui/Typography/Subtitle';

import useAskToSetPassword from '@misakey/react/auth/hooks/useAskToSetPassword';

// COMPONENTS
const CardOnboardDiscover = () => {
  const { t } = useTranslation('onboard');

  const askToSetPassword = useAskToSetPassword();

  return (
    <Box width="100%" mx={4} my={4}>
      <Card elevation={0}>
        <BoxAlinea>
          <Title color="textPrimary">
            {t('onboard:discoverUs')}
          </Title>
        </BoxAlinea>
        <img width="100%" src="/img/what-is-misakey.png" alt={t('onboard:discoverUs')} />
        <Box my={2}>
          <Button
            text={t('onboard:createFreeAccount')}
            standing={BUTTON_STANDINGS.MAIN}
            onClick={askToSetPassword}
          />
        </Box>
        <BoxAlinea>
          <Title>
            {t('onboard:openSource')}
          </Title>
          <Subtitle>
            {t('onboard:details')}
          </Subtitle>
        </BoxAlinea>
      </Card>
    </Box>
  );
};

export default CardOnboardDiscover;
