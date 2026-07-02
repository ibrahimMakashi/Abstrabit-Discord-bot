import { Stack, Typography } from '@mui/material';

const EmptyState = ({ title, description }) => (
  <Stack spacing={1.5} alignItems="center" justifyContent="center" sx={{ py: 6 }}>
    <Typography variant="h6">{title}</Typography>
    <Typography color="text.secondary">{description}</Typography>
  </Stack>
);

export default EmptyState;
