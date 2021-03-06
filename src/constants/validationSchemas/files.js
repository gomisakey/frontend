import * as Yup from 'yup';
import { MAX_FILE_SIZE } from '@misakey/ui/constants/file/size';
import { required } from '@misakey/core/api/constants/errorTypes';
import isString from '@misakey/core/helpers/isString';
import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';

// CONSTANTS
export const fileUploadValidationSchema = Yup.object().shape({
  files: Yup.array(
    Yup.mixed()
      .test('fileSize', 'size', (file) => isNil(file) || isNil(file.blob) || file.blob.size <= MAX_FILE_SIZE)
      .test('fileExtension', 'extension', (file) => isNil(file) || isNil(file.blob) || (isString(file.blob.name) && file.blob.name.split('.').length > 1))
      .test('fileName', 'name', (file) => isNil(file) || isNil(file.blob) || (isString(file.blob.name) && !isEmpty(file.blob.name.split('.').shift()))),
  ).required(required),
});
