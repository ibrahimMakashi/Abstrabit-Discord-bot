import { Controller } from 'react-hook-form';
import { TextField } from '@mui/material';

const FormTextField = ({ control, name, label, type = 'text', ...rest }) => (
  <Controller
    control={control}
    name={name}
    render={({ field, fieldState }) => (
      <TextField
        fullWidth
        label={label}
        type={type}
        name={field.name}
        value={field.value ?? ''}
        onChange={field.onChange}
        onBlur={field.onBlur}
        inputRef={field.ref}
        error={Boolean(fieldState.error)}
        helperText={fieldState.error?.message}
        variant="outlined"
        {...rest}
      />
    )}
  />
);

export default FormTextField;
