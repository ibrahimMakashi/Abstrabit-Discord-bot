import { Chip } from '@mui/material';
import { toTitleCase } from '../utils/formatters';

const paletteByStatus = {
  success: 'success',
  failed: 'error',
  processing: 'warning',
  pending: 'warning',
  sent: 'success',
  skipped: 'default',
  enabled: 'success',
  disabled: 'default',
  online: 'success',
};

const StatusChip = ({ status }) => <Chip size="small" label={toTitleCase(status)} color={paletteByStatus[status] || 'default'} />;

export default StatusChip;
