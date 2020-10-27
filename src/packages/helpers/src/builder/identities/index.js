import API from '@misakey/api';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import toFormData from '@misakey/helpers/toFormData';

export const updateIdentity = ({ id, ...payload }) => API
  .use(API.endpoints.identities.update)
  .build({ id }, objectToSnakeCase(payload))
  .send();

export const uploadAvatar = ({ id, avatar }) => API
  .use(API.endpoints.identities.avatar.update)
  .build({ id }, toFormData(avatar))
  .send({ contentType: null });

export const getProfile = ({ identityId, isAuthenticated }) => API
  .use({ ...API.endpoints.identities.profile.read, auth: isAuthenticated })
  .build({ id: identityId })
  .send()
  .then(objectToCamelCase);

export const getProfileConfig = ({ identityId }) => API
  .use(API.endpoints.identities.profile.config.read)
  .build({ id: identityId })
  .send()
  .then(objectToCamelCase);

export const updateProfileConfig = ({ identityId, ...payload }) => API
  .use(API.endpoints.identities.profile.config.update)
  .build({ id: identityId }, objectToSnakeCase(payload))
  .send();

export const listStorageQuota = (id) => API
  .use(API.endpoints.identities.storageQuota.find)
  .build({ id })
  .send()
  .then((response) => response.map(objectToCamelCase));

export const listBoxUsedSpaces = (payload) => API
  .use(API.endpoints.identities.boxUsedSpaces.find)
  .build(null, null, objectToSnakeCase(payload))
  .send()
  .then((response) => response.map(objectToCamelCase));

export const readVaultUsedSpace = (id) => API
  .use(API.endpoints.identities.vaultUsedSpace.read)
  .build({ id })
  .send()
  .then(objectToCamelCase);
