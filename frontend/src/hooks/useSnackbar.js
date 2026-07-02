import { useContext } from 'react';
import { SnackbarContext } from '../contexts/SnackbarContextObject';

export const useSnackbar = () => useContext(SnackbarContext);
