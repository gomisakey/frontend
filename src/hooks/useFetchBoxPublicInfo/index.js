

import { useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import { notFound } from '@misakey/ui/constants/errorTypes';

import { getCode } from '@misakey/helpers/apiError';
import isEmpty from '@misakey/helpers/isEmpty';
import isFunction from '@misakey/helpers/isFunction';
import { getBoxPublicBuilder } from '@misakey/api/helpers/builder/boxes';
import { computeInvitationHash } from '@misakey/crypto/box/keySplitting';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import { InvalidHash } from '@misakey/crypto/Errors/classes';


// HOOKS
export default (id, onSuccess) => {
  const { hash } = useLocation();
  const invitationKeyShare = useMemo(() => (isEmpty(hash) ? null : hash.substr(1)), [hash]);
  const handleHttpErrors = useHandleHttpErrors();

  const getBoxPublicInfo = useCallback(
    (invitationShareHash) => getBoxPublicBuilder({ id, invitationShareHash })
      .then((response) => {
        if (isFunction(onSuccess)) {
          return onSuccess(response);
        }
        return Promise.resolve(response);
      })
      .catch((e) => {
        const errorCode = getCode(e);
        // in case of not found error, it is already handled by useHandleBoxKeyShare
        if (errorCode === notFound) {
          throw new InvalidHash();
        }
        handleHttpErrors(e);
      }),
    [handleHttpErrors, id, onSuccess],
  );

  return useCallback(
    () => {
      try {
        const invitationShareHash = computeInvitationHash(invitationKeyShare);
        return getBoxPublicInfo(invitationShareHash);
      } catch (e) {
        return Promise.reject(new InvalidHash());
      }
    },
    [invitationKeyShare, getBoxPublicInfo],
  );
};
