import { Box, Stack, Typography } from '@mui/material';
import StatusChip from './StatusChip';

const PastelStatCard = ({ title, value, status, tone = '#D8F3E9', textColor = '#111827' }) => (
  <Box
    sx={{
      bgcolor: tone,
      borderRadius: '28px',
      p: 2.25,
      minHeight: 118,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: '0 12px 36px rgba(45, 107, 87, 0.08)',
    }}
  >
    <Typography variant="caption" sx={{ color: textColor, opacity: 0.72, fontWeight: 700 }}>
      {title}
    </Typography>
    <Stack spacing={0.75}>
      <Typography variant="h4" sx={{ color: textColor, fontSize: '1.75rem', lineHeight: 1 }}>
        {value}
      </Typography>
      {status ? <StatusChip status={status} /> : null}
    </Stack>
  </Box>
);

export default PastelStatCard;
