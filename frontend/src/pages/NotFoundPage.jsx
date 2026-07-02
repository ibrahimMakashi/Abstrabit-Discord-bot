import { Box, Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2 }}>
    <Stack spacing={2} alignItems="center">
      <Typography variant="overline" color="primary.main">
        404
      </Typography>
      <Typography variant="h3">Page not found</Typography>
      <Typography color="text.secondary">The route you requested does not exist in the admin dashboard.</Typography>
      <Button component={Link} to="/" variant="contained">
        Return to Dashboard
      </Button>
    </Stack>
  </Box>
);

export default NotFoundPage;
