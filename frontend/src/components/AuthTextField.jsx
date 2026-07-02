import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { brand } from '../constants/colors';

const authFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 999,
    bgcolor: brand.white,
    transition: 'all 0.2s ease',
    '& fieldset': {
      borderColor: '#DCE8E3',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(45, 107, 87, 0.45)',
    },
    '&.Mui-focused fieldset': {
      borderColor: brand.primary,
      borderWidth: 1.5,
    },
  },
  '& .MuiInputLabel-root': {
    color: brand.textMuted,
    fontWeight: 600,
  },
};

const AuthTextField = ({ control, name, label, type = 'text', InputProps, ...rest }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          fullWidth
          label={label}
          type={isPassword && showPassword ? 'text' : type}
          name={field.name}
          value={field.value ?? ''}
          onChange={field.onChange}
          onBlur={field.onBlur}
          inputRef={field.ref}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message}
          variant="outlined"
          sx={authFieldSx}
          InputProps={{
            ...InputProps,
            ...(isPassword
              ? {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              : {}),
          }}
          {...rest}
        />
      )}
    />
  );
};

export default AuthTextField;
