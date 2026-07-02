import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import StatusChip from './StatusChip';
import { brand } from '../constants/colors';
import { formatDateTime, formatDuration } from '../utils/formatters';

const DetailItem = ({ label, value, fullWidth = false }) => (
  <Grid size={{ xs: 12, sm: fullWidth ? 12 : 6 }}>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
        color: value ? brand.text : 'text.secondary',
      }}
    >
      {value || '—'}
    </Typography>
  </Grid>
);

const Section = ({ title, children }) => (
  <Box>
    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: brand.primary }}>
      {title}
    </Typography>
    <Grid container spacing={2}>
      {children}
    </Grid>
  </Box>
);

const CommandLogDetailDialog = ({ open, log, onClose }) => {
  if (!log) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Command details
          </Typography>
          <StatusChip status={log.status} />
          {log.mirrorStatus ? <StatusChip status={log.mirrorStatus} /> : null}
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          /{log.commandName} • {formatDateTime(log.createdAt)}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          <Section title="Command overview">
            <DetailItem label="Command" value={`/${log.commandName}`} />
            <DetailItem label="Type" value={log.commandType} />
            <DetailItem label="Status" value={log.status} />
            <DetailItem label="Mirror status" value={log.mirrorStatus} />
            <DetailItem label="Created at" value={formatDateTime(log.createdAt)} />
            <DetailItem label="Updated at" value={formatDateTime(log.updatedAt)} />
          </Section>

          <Divider />

          <Section title="User & Discord">
            <DetailItem label="Username" value={log.username} />
            <DetailItem label="User ID" value={log.userId} />
            <DetailItem label="Server ID" value={log.guildId} />
            <DetailItem label="Channel ID" value={log.channelId} />
            <DetailItem label="Interaction ID" value={log.interactionId} fullWidth />
          </Section>

          <Divider />

          <Section title="Request & response">
            <DetailItem label="Request content" value={log.requestContent} fullWidth />
            <DetailItem label="Response message" value={log.responseMessage} fullWidth />
          </Section>

          {(log.aiSummary || log.aiCategory || log.aiPriority || log.aiError) && (
            <>
              <Divider />
              <Section title="AI enrichment">
                <DetailItem label="Summary" value={log.aiSummary} fullWidth />
                <DetailItem label="Category" value={log.aiCategory} />
                <DetailItem label="Priority" value={log.aiPriority} />
                <DetailItem label="AI error" value={log.aiError} fullWidth />
              </Section>
            </>
          )}

          <Divider />

          <Section title="Execution">
            <DetailItem label="Execution time" value={formatDuration(log.executionTimeMs)} />
            <DetailItem label="Retry count" value={String(log.retryCount ?? 0)} />
            <DetailItem label="Error message" value={log.errorMessage} fullWidth />
          </Section>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommandLogDetailDialog;
