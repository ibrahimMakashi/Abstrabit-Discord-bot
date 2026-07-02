import { useCallback, useMemo, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { SnackbarContext } from './SnackbarContextObject';

export const SnackbarProvider = ({ children }) => {
  const [state, setState] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const showSnackbar = useCallback((message, severity = 'info') => {
    setState({
      open: true,
      message,
      severity,
    });
  }, []);

  const value = useMemo(() => ({ showSnackbar }), [showSnackbar]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={4000}
        onClose={() => setState((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={state.severity} variant="filled">
          {state.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
