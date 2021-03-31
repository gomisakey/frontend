import React, { useCallback } from 'react';

import PropTypes from 'prop-types';
import { useDispatch, useSelector, batch } from 'react-redux';

import UploadDialog from 'components/smart/Dialog/Upload';
import workerEncryptFileForVault from '@misakey/crypto/vault/workers/encryptFile/singleton';
import { selectors as cryptoSelectors } from '@misakey/crypto/store/reducers';
import { uploadFileInVaultBuilder } from '@misakey/api/helpers/builder/vault';
import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';
import { addSavedFile } from 'store/reducers/files/saved';

// CONSTANTS
export const BLOBS_FIELD_NAME = 'files';
export const INITIAL_VALUES = { [BLOBS_FIELD_NAME]: [] };
export const INITIAL_STATUS = { [BLOBS_FIELD_NAME]: null };

const {
  getVaultKey,
} = cryptoSelectors;


function VaultUploadDialog({
  initialValues,
  initialStatus,
  open,
  onClose,
}) {
  const dispatch = useDispatch();
  const identityId = useSelector(authSelectors.identityId);
  const vaultKey = useSelector(getVaultKey);

  const onSuccess = useCallback(
    (response) => {
      batch(() => { response.forEach((item) => dispatch(addSavedFile(identityId, item))); });
    },
    [dispatch, identityId],
  );

  const onEncryptBuilder = useCallback(
    async (file) => {
      try {
        return workerEncryptFileForVault(file, vaultKey);
      } catch (err) {
        return Promise.reject();
      }
    },
    [vaultKey],
  );

  const onUploadBuilder = useCallback(
    ({ encryptedMetadata, keyFingerprint, encryptedFile }, onFileProgress) => {
      const formData = new FormData();
      formData.append('encrypted_file', encryptedFile);
      formData.append('encrypted_metadata', encryptedMetadata);
      formData.append('key_fingerprint', keyFingerprint);

      return uploadFileInVaultBuilder(identityId, formData, onFileProgress);
    },
    [identityId],
  );

  return (
    <UploadDialog
      onSuccess={onSuccess}
      onUploadBuilder={onUploadBuilder}
      onEncryptBuilder={onEncryptBuilder}
      initialValues={initialValues}
      initialStatus={initialStatus}
      open={open}
      onClose={onClose}
    />
  );
}

VaultUploadDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  initialValues: PropTypes.object,
  initialStatus: PropTypes.object,
};

VaultUploadDialog.defaultProps = {
  open: false,
  initialValues: INITIAL_VALUES,
  initialStatus: INITIAL_STATUS,
};

export default VaultUploadDialog;
