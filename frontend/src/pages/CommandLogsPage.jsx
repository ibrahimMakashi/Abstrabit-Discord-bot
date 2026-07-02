import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, MenuItem, Stack, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import GlassCard from '../components/GlassCard';
import StatusChip from '../components/StatusChip';
import CommandLogDetailDialog from '../components/CommandLogDetailDialog';
import RealtimeStatusBadge from '../components/RealtimeStatusBadge';
import { pastels } from '../constants/colors';
import { getCommandLogs } from '../api/commands';
import { formatDateTime, formatDuration } from '../utils/formatters';
import { useRealtimeRefresh } from '../hooks/useRealtimeRefresh';

const CommandLogsPage = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState('');
  const [commandType, setCommandType] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = useState([{ field: 'createdAt', sort: 'desc' }]);
  const [state, setState] = useState({ rows: [], rowCount: 0, loading: true });
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadLogs = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setState((current) => ({ ...current, loading: true }));
      }

      try {
        const response = await getCommandLogs({
          page: paginationModel.page + 1,
          pageSize: paginationModel.pageSize,
          search,
          status,
          commandType,
          sortBy: sortModel[0]?.field || 'createdAt',
          sortOrder: sortModel[0]?.sort || 'desc',
          bustCache: silent,
        });

        setState({
          rows: response.data.items.map((item) => ({ id: item._id, ...item })),
          rowCount: response.data.pagination.total,
          loading: false,
        });
      } catch {
        if (!silent) {
          setState((current) => ({ ...current, loading: false }));
        }
      }
    },
    [commandType, paginationModel.page, paginationModel.pageSize, search, sortModel, status],
  );

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleRealtimeUpdate = useCallback(() => {
    loadLogs({ silent: true });
  }, [loadLogs]);

  const { isConnected } = useRealtimeRefresh({
    enabled: true,
    onRefresh: handleRealtimeUpdate,
  });

  useEffect(() => {
    if (!selectedLog) {
      return;
    }

    const updated = state.rows.find((row) => row.id === selectedLog.id);
    if (updated) {
      setSelectedLog(updated);
    }
  }, [selectedLog, state.rows]);

  const openLogDetails = useCallback((row) => {
    setSelectedLog(row);
    setDetailOpen(true);
  }, []);

  const columns = useMemo(
    () => [
      { field: 'createdAt', headerName: 'Date', flex: 1.4, renderCell: (params) => formatDateTime(params.value) },
      { field: 'commandName', headerName: 'Command', flex: 1 },
      { field: 'username', headerName: 'Username', flex: 1 },
      {
        field: 'status',
        headerName: 'Status',
        flex: 0.8,
        sortable: false,
        renderCell: (params) => <StatusChip status={params.value} />,
      },
      { field: 'responseMessage', headerName: 'Response', flex: 2 },
      { field: 'executionTimeMs', headerName: 'Execution Time', flex: 1, renderCell: (params) => formatDuration(params.value) },
      { field: 'retryCount', headerName: 'Retry Count', flex: 0.8 },
      {
        field: 'actions',
        headerName: 'Actions',
        flex: 0.7,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Button size="small" variant="outlined" onClick={() => openLogDetails(params.row)}>
            View
          </Button>
        ),
      },
    ],
    [openLogDetails],
  );

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title="Command Logs"
        description="Search, sort, and inspect command executions. New logs appear automatically in real time."
        action={<RealtimeStatusBadge connected={isConnected} />}
      />

      <GlassCard tone={pastels.sky}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Search commands"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by command, user, request, or response"
              fullWidth
            />
            <TextField select label="Status" value={status} onChange={(event) => setStatus(event.target.value)} sx={{ minWidth: 180 }}>
              <MenuItem value="">All statuses</MenuItem>
              <MenuItem value="success">Success</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
            </TextField>
            <TextField
              select
              label="Command Type"
              value={commandType}
              onChange={(event) => setCommandType(event.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">All commands</MenuItem>
              <MenuItem value="report">Report</MenuItem>
              <MenuItem value="status">Status</MenuItem>
              <MenuItem value="component">Component</MenuItem>
              <MenuItem value="modal">Modal</MenuItem>
            </TextField>
          </Stack>
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <DataGrid
              autoHeight
              paginationMode="server"
              sortingMode="server"
              rows={state.rows}
              columns={columns}
              loading={state.loading}
              rowCount={state.rowCount}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              sortModel={sortModel}
              onSortModelChange={setSortModel}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              sx={{
                border: 0,
                bgcolor: 'transparent',
                minWidth: 980,
                '& .MuiDataGrid-cell, & .MuiDataGrid-columnHeaders': {
                  borderColor: 'divider',
                },
              }}
            />
          </Box>
        </Stack>
      </GlassCard>

      <CommandLogDetailDialog
        open={detailOpen}
        log={selectedLog}
        onClose={() => {
          setDetailOpen(false);
          setSelectedLog(null);
        }}
      />
    </Stack>
  );
};

export default CommandLogsPage;
