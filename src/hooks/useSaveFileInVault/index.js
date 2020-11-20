
import React, { useCallback, useMemo } from 'react';
import routes from 'routes';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { createSavedFile } from '@misakey/helpers/builder/vault';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';
import { encryptFileMetadataForVault } from '@misakey/crypto/vault';
import ensureVaultKeyExists from '@misakey/crypto/store/actions/ensureVaultKeyExists';
import { addSavedFile } from 'store/reducers/savedFiles';
import errorTypes from '@misakey/ui/constants/errorTypes';
import SnackbarActionSee from 'components/dumb/Snackbar/Action/See';

const { conflict } = errorTypes;

export default () => {
  const identityId = useSelector(authSelectors.identityId);
  const dispatch = useDispatch();

  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('components');

  const seeAction = useMemo(
    () => <SnackbarActionSee to={routes.documents.vault} />,
    [],
  );

  const saveInVault = useCallback(async (vaultKey, fileMetadata, encryptedFileId) => {
    try {
      const {
        encryptedMetadata,
        keyFingerprint,
      } = encryptFileMetadataForVault(fileMetadata, vaultKey);
      const response = await createSavedFile({
        encryptedFileId,
        encryptedMetadata,
        keyFingerprint,
        identityId,
      });
      dispatch(addSavedFile(identityId, response));
      enqueueSnackbar(t('components:saveInVault.success'), { variant: 'success', action: seeAction });
    } catch (err) {
      if (err.code === conflict) {
        enqueueSnackbar(t('components:saveInVault.error.conflict'), { variant: 'info', action: seeAction });
      } else {
        enqueueSnackbar(t('components:saveInVault.error.default'), { variant: 'error' });
      }
    }
  }, [dispatch, enqueueSnackbar, identityId, seeAction, t]);

  return useCallback(async (fileMetadata, encryptedFileId) => {
    const vaultKey = await Promise.resolve(dispatch(ensureVaultKeyExists()));
    return saveInVault(vaultKey, fileMetadata, encryptedFileId);
  }, [dispatch, saveInVault]);
};
