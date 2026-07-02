import { alpha, Box, IconButton, Stack, Typography } from '@mui/material';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import StatusChip from './StatusChip';
import { brand } from '../constants/colors';

const ActivityCard = ({ title, subtitle, meta, tone = '#D8F3E9', status }) => (
  <Box
    sx={{
      bgcolor: tone,
      borderRadius: '28px',
      p: 2.25,
      minHeight: 132,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: '0 12px 36px rgba(45, 107, 87, 0.08)',
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {subtitle}
        </Typography>
      </Box>
      <IconButton
        size="small"
        sx={{
          bgcolor: alpha(brand.primary, 0.1),
          color: brand.primary,
          width: 34,
          height: 34,
          flexShrink: 0,
        }}
      >
        <ArrowOutwardRoundedIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Stack>

    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
      <Typography variant="caption" color="text.secondary">
        {meta}
      </Typography>
      {status ? <StatusChip status={status} /> : null}
    </Stack>
  </Box>
);

export default ActivityCard;
