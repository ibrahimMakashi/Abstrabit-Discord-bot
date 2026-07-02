import { Stack, Typography } from '@mui/material';

const PageHeader = ({ eyebrow, title, description, action }) => (
  <Stack
    direction={{ xs: 'column', md: 'row' }}
    justifyContent="space-between"
    alignItems={{ xs: 'flex-start', md: 'center' }}
    spacing={2}
  >
    <Stack spacing={0.5}>
      {eyebrow ? (
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.08em' }}>
          {eyebrow.toUpperCase()}
        </Typography>
      ) : null}
      <Typography variant="h4">{title}</Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
          {description}
        </Typography>
      ) : null}
    </Stack>
    {action}
  </Stack>
);

export default PageHeader;
