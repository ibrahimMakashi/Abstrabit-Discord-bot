import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import PageHeader from '../components/PageHeader';
import GlassCard from '../components/GlassCard';
import PastelStatCard from '../components/PastelStatCard';
import ActivityCard from '../components/ActivityCard';
import StatusChip from '../components/StatusChip';
import RealtimeStatusBadge from '../components/RealtimeStatusBadge';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { pastels, brand } from '../constants/colors';
import { getDashboardSummary } from '../api/dashboard';
import { formatDateTime } from '../utils/formatters';
import { useSocket } from '../hooks/useSocket';

const activityTones = [pastels.mint, pastels.pink, pastels.lavender, pastels.sky];
const statTones = [pastels.mint, pastels.yellow, pastels.lavender, pastels.pink];

const DashboardPage = () => {
  const [state, setState] = useState({ data: null, loading: true, error: '' });

  const loadDashboard = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setState((current) => ({ ...current, loading: true, error: '' }));
    }

    try {
      const response = await getDashboardSummary({ bustCache: silent });
      setState({ data: response.data, loading: false, error: '' });
    } catch (error) {
      if (!silent) {
        setState({ data: null, loading: false, error: error.message || 'Failed to load dashboard' });
      }
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleRealtimeUpdate = useCallback(() => {
    loadDashboard({ silent: true });
  }, [loadDashboard]);

  const { isConnected } = useSocket({
    enabled: true,
    onCommandCreated: handleRealtimeUpdate,
    onReportProcessed: handleRealtimeUpdate,
  });

  const stats = useMemo(() => {
    if (!state.data) {
      return [];
    }

    return [
      { title: 'Total Commands', value: state.data.totalCommands },
      { title: "Today's Commands", value: state.data.todaysCommands },
      { title: 'Bot Status', value: state.data.botStatus, status: state.data.botStatus },
      { title: 'Recent Errors', value: state.data.recentErrors.length },
    ];
  }, [state.data]);

  const activityCards = useMemo(() => {
    if (!state.data) {
      return [];
    }

    const reports = state.data.latestReports.slice(0, 2).map((item, index) => ({
      title: '/report',
      subtitle: item.requestContent,
      meta: `${item.username} • ${formatDateTime(item.createdAt)}`,
      status: 'success',
      tone: activityTones[index % activityTones.length],
    }));

    const statuses = state.data.latestStatusCommands.slice(0, 1).map((item, index) => ({
      title: '/status',
      subtitle: item.responseMessage,
      meta: `${item.username} • ${formatDateTime(item.createdAt)}`,
      status: item.status,
      tone: activityTones[(reports.length + index) % activityTones.length],
    }));

    return [...reports, ...statuses];
  }, [state.data]);

  const healthProgress = useMemo(() => {
    if (!state.data) {
      return 0;
    }

    const checks = [
      state.data.botStatus === 'online',
      state.data.mirrorStatus === 'sent' || state.data.mirrorStatus === 'skipped',
      state.data.aiStatus === 'enabled' || state.data.aiStatus === 'success',
    ];

    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [state.data]);

  if (state.loading) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={120} sx={{ borderRadius: 7 }} />
        <Grid container spacing={1.5}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Skeleton variant="rounded" height={118} sx={{ borderRadius: 7 }} />
            </Grid>
          ))}
        </Grid>
      </Stack>
    );
  }

  if (state.error) {
    return <ErrorState message={state.error} />;
  }

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title="Dashboard"
        description="Live overview of commands, activity, and system health. Updates automatically when new slash commands run."
        action={<RealtimeStatusBadge connected={isConnected} />}
      />

      <Grid container spacing={{ xs: 1.5, md: 2 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h5" sx={{ mb: 1.5 }}>
                Your activity today
              </Typography>
              <Grid container spacing={1.5}>
                {activityCards.length ? (
                  activityCards.map((card) => (
                    <Grid key={`${card.title}-${card.meta}`} size={{ xs: 12, md: 6 }}>
                      <ActivityCard {...card} />
                    </Grid>
                  ))
                ) : (
                  <Grid size={{ xs: 12 }}>
                    <GlassCard tone={pastels.mint}>
                      <EmptyState title="No activity yet" description="Slash commands will appear here as colorful activity cards." />
                    </GlassCard>
                  </Grid>
                )}
              </Grid>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ mb: 1.5 }}>
                Command overview
              </Typography>
              <Grid container spacing={1.5}>
                {stats.map((card, index) => (
                  <Grid key={card.title} size={{ xs: 12, sm: 6, lg: 3 }}>
                    <PastelStatCard {...card} tone={statTones[index % statTones.length]} />
                  </Grid>
                ))}
              </Grid>
            </Box>

            <GlassCard tone={pastels.yellow}>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      SYSTEM HEALTH
                    </Typography>
                    <Typography variant="h6">Bot reliability progress</Typography>
                  </Box>
                  <Typography variant="h5">{healthProgress}%</Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={healthProgress}
                  sx={{
                    height: 10,
                    borderRadius: 999,
                    bgcolor: 'rgba(45, 107, 87, 0.08)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 999,
                      bgcolor: brand.primary,
                    },
                  }}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <StatusChip status={state.data.botStatus} />
                  <StatusChip status={state.data.mirrorStatus} />
                  <StatusChip status={state.data.aiStatus} />
                </Stack>
              </Stack>
            </GlassCard>

            <GlassCard>
              <Stack spacing={1.5}>
                <PageHeader
                  title="Recent activity"
                  description="Latest slash command executions — refreshes in real time."
                />
                {state.data.recentActivity.length ? (
                  <Box sx={{ width: '100%', overflowX: 'auto' }}>
                    <Table size="small" sx={{ minWidth: 520 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Command</TableCell>
                        <TableCell>User</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {state.data.recentActivity.map((item) => (
                        <TableRow key={item._id} hover>
                          <TableCell sx={{ fontSize: 13 }}>{formatDateTime(item.createdAt)}</TableCell>
                          <TableCell sx={{ fontSize: 13 }}>{item.commandName}</TableCell>
                          <TableCell sx={{ fontSize: 13 }}>{item.username}</TableCell>
                          <TableCell>
                            <StatusChip status={item.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    </Table>
                  </Box>
                ) : (
                  <EmptyState title="No activity yet" description="New slash commands will stream into this table." />
                )}
              </Stack>
            </GlassCard>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={1.5}>
            <GlassCard tone={pastels.lavender}>
              <Stack spacing={1.5}>
                <Typography variant="h6">System schedule</Typography>
                <Stack spacing={1}>
                  {[
                    { title: 'Bot status', value: state.data.botStatus, tone: pastels.mint },
                    { title: 'Mirror delivery', value: state.data.mirrorStatus, tone: pastels.pink },
                    { title: 'AI enrichment', value: state.data.aiStatus, tone: pastels.sky },
                    { title: 'Connected server', value: state.data.connectedServer, tone: pastels.peach },
                  ].map((item) => (
                    <Box
                      key={item.title}
                      sx={{
                        bgcolor: item.tone,
                        borderRadius: '22px',
                        px: 2,
                        py: 1.5,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ mt: 0.25 }}>
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </GlassCard>

            <GlassCard>
              <Stack spacing={1.5}>
                <Typography variant="h6">Recent errors</Typography>
                {state.data.recentErrors.length ? (
                  <List disablePadding dense>
                    {state.data.recentErrors.map((item) => (
                      <ListItem key={item._id} disablePadding sx={{ py: 0.75 }}>
                        <ListItemText
                          primaryTypographyProps={{ fontSize: 13, fontWeight: 700 }}
                          secondaryTypographyProps={{ fontSize: 12 }}
                          primary={item.errorMessage || item.responseMessage || item.commandName}
                          secondary={formatDateTime(item.createdAt)}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <EmptyState title="No recent errors" description="Failed command executions will appear here." />
                )}
              </Stack>
            </GlassCard>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default DashboardPage;
