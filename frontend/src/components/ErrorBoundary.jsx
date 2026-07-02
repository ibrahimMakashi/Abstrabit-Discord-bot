import { Component } from 'react';
import { Alert, AlertTitle, Box, Button, Stack } from '@mui/material';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2 }}>
          <Stack maxWidth={520}>
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => window.location.reload()}>
                  Reload
                </Button>
              }
            >
              <AlertTitle>Dashboard crashed</AlertTitle>
              An unexpected client error occurred.
            </Alert>
          </Stack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
