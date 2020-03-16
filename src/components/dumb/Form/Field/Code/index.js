import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import clsx from 'clsx';

import omit from '@misakey/helpers/omit';
import isNaN from '@misakey/helpers/isNaN';
import trim from '@misakey/helpers/trim';
import isEmpty from '@misakey/helpers/isEmpty';
import repeat from '@misakey/helpers/repeat';

import makeStyles from '@material-ui/core/styles/makeStyles';

import TextField from '@material-ui/core/TextField';
import withErrors from '../withErrors';

// CONSTANTS
// copied padding of outlined input
const LETTER_WIDTH = '1rem';
const LETTER_SPACING = '2rem';

const XS_LETTER_SPACING = '1.5rem';

const UNDERLINE_CHAR = '_';

// HELPERS
const repeatUnderline = (length) => repeat(UNDERLINE_CHAR, length);

// HOOKS
const useStyles = makeStyles((theme) => ({
  textFieldRoot: ({ length }) => ({
    width: `calc(${length} * (${LETTER_WIDTH} + ${LETTER_SPACING}) + ${LETTER_SPACING} + .5rem)`,
    [theme.breakpoints.only('xs')]: {
      width: `calc(${length} * (${LETTER_WIDTH} + ${XS_LETTER_SPACING}) + ${XS_LETTER_SPACING} + .5rem)`,
    },
  }),
  formHelperTextRoot: {
    alignSelf: 'flex-start',
  },
  inputInput: {
    boxSizing: 'border-box',
    height: 'auto',
    // removes padding right, bottom padding to insert ::before element instead
    padding: theme.spacing(2, 0, 0, 1.5),
    // arbitrary choice of typography
    ...theme.typography.h5,
    // @FIXME use a more fancy font? We simply need a monospaced font
    // Roboto Mono has issues with monospace
    fontFamily: 'monospace',
    letterSpacing: LETTER_SPACING,
    width: '100%',
    [theme.breakpoints.only('xs')]: {
      letterSpacing: XS_LETTER_SPACING,
    },
  },
  inputRoot: {
    display: 'flex',
    flexDirection: 'column-reverse',
    alignItems: 'flex-start',
    paddingLeft: LETTER_SPACING,
    [theme.breakpoints.only('xs')]: {
      paddingLeft: XS_LETTER_SPACING,
    },
    '&::before': {
      content: ({ content }) => `'${content}'`,
      // arbitrary choice of typography
      ...theme.typography.h5,
      fontFamily: 'monospace',
      padding: theme.spacing(0, 1.5),
      letterSpacing: LETTER_SPACING,
      [theme.breakpoints.only('xs')]: {
        letterSpacing: XS_LETTER_SPACING,
      },
      // forcing lineHeight 0 for display purpose
      lineHeight: 0,
      // height comes from padding of outlined input
      height: '18.5px',
      // extra margin to make the text caret visible inside input even when full
      marginRight: '0.25rem',
    },
  },
}));

// COMPONENTS
const FieldCode = ({
  className, displayError, errorKeys, field, form: { setFieldValue, setFieldTouched },
  helperText, label, inputProps,
  t, length,
  ...rest
}) => {
  const content = useMemo(
    () => repeatUnderline(length),
    [length],
  );
  const classes = useStyles({ length, content });

  const { name } = field;
  const defaultLabel = useMemo(() => t(`fields:${name}.label`), [t, name]);

  const onChange = useCallback(
    (event) => {
      const { value } = event.target;
      // trim space characters
      const trimmedValue = trim(value);
      // keep only changes if number | empty text
      if (!isNaN(Number(trimmedValue)) || isEmpty(trimmedValue)) {
        setFieldValue(name, trimmedValue);
        setFieldTouched(name, true, false);
      }
    },
    [name, setFieldTouched, setFieldValue],
  );

  return (
    <TextField
      margin="normal"
      variant="outlined"
      label={label || defaultLabel}
      className={clsx(className, classes.textFieldRoot)}
      inputProps={{
        type: 'text',
        maxLength: length,
        pattern: '[0-9]*',
        inputMode: 'numeric',
        autoComplete: 'off',
        'data-matomo-ignore': true,
        ...inputProps,
      }}
      // eslint-disable-next-line react/jsx-no-duplicate-props
      InputProps={{
        classes: {
          input: classes.inputInput,
          root: classes.inputRoot,
        },
        onChange,
      }}
      FormHelperTextProps={{
        classes: {
          root: classes.formHelperTextRoot,
        },
      }}
      {...field}
      {...omit(rest, ['i18n', 'tReady', 'prefix'])}
      error={displayError}
      helperText={displayError ? t(errorKeys) : helperText}
    />
  );
};

FieldCode.propTypes = {
  className: PropTypes.string,
  displayError: PropTypes.bool.isRequired,
  errorKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  field: PropTypes.shape({ name: PropTypes.string.isRequired }).isRequired,
  form: PropTypes.shape({
    setFieldTouched: PropTypes.func.isRequired,
    setFieldValue: PropTypes.func.isRequired,
  }).isRequired,
  label: PropTypes.string,
  helperText: PropTypes.string,
  length: PropTypes.number,
  inputProps: PropTypes.object,
  t: PropTypes.func.isRequired,
};

FieldCode.defaultProps = {
  className: '',
  label: null,
  helperText: '',
  length: 6,
  inputProps: {},
};

export default withTranslation('fields')(withErrors(FieldCode));
