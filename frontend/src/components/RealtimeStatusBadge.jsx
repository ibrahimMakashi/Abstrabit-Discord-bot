import { Chip, Tooltip } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import { brand } from '../constants/colors';

const RealtimeStatusBadge = ({ connected }) => (
  <Tooltip title={connected ? 'Live updates are active' : 'Connecting to live updates…'}>
    <Chip
      size="small"
      icon={
        connected ? (
          <CheckCircleRoundedIcon sx={{ fontSize: '18px !important' }} />
        ) : (
          <SyncRoundedIcon sx={{ fontSize: '18px !important' }} />
        )
      }
      label={connected ? 'Real-time' : 'Connecting…'}
      sx={{
        fontWeight: 700,
        bgcolor: connected ? 'rgba(45, 107, 87, 0.12)' : 'rgba(107, 114, 128, 0.12)',
        color: connected ? brand.primary : brand.textMuted,
        border: '1px solid',
        borderColor: connected ? 'rgba(45, 107, 87, 0.28)' : 'rgba(107, 114, 128, 0.2)',
        '& .MuiChip-icon': {
          color: connected ? '#22C55E' : brand.textMuted,
        },
      }}
    />
  </Tooltip>
);

export default RealtimeStatusBadge;
