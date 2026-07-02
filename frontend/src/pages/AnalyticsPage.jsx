import { useEffect, useState } from 'react';
import { Grid, Stack, Typography } from '@mui/material';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from 'recharts';
import PageHeader from '../components/PageHeader';
import GlassCard from '../components/GlassCard';
import ErrorState from '../components/ErrorState';
import { pastels } from '../constants/colors';
import { getAnalytics } from '../api/dashboard';

const chartTones = [pastels.mint, pastels.pink, pastels.lavender];

const ChartCard = ({ title, children, tone = pastels.lavender }) => (
  <GlassCard tone={tone} sx={{ height: '100%' }}>
    <Stack spacing={2}>
      <Typography variant="h6">{title}</Typography>
      <div style={{ width: '100%', height: 280, minHeight: 240 }}>{children}</div>
    </Stack>
  </GlassCard>
);

const AnalyticsPage = () => {
  const [state, setState] = useState({ data: null, error: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getAnalytics();
        setState({ data: response.data, error: '' });
      } catch (error) {
        setState({ data: null, error: error.message || 'Unable to load analytics' });
      }
    };

    load();
  }, []);

  if (state.error) {
    return <ErrorState message={state.error} />;
  }

  return (
    <Stack spacing={2.5}>
      <PageHeader title="Analytics" description="Track command volume, report trends, and response performance." />

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ChartCard title="Commands Per Day" tone={chartTones[0]}>
            <ResponsiveContainer>
              <LineChart data={state.data?.series || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,24,39,0.08)" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="commands" stroke="#2D6B57" strokeWidth={3} />
                <Line type="monotone" dataKey="reports" stroke="#3A8570" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ChartCard title="Success vs Failure Rate" tone={chartTones[1]}>
            <ResponsiveContainer>
              <BarChart data={state.data?.series || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,24,39,0.08)" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="successRate" fill="#2D6B57" radius={[8, 8, 0, 0]} />
                <Bar dataKey="failureRate" fill="#C75C5C" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <ChartCard title="Average Response Time" tone={chartTones[2]}>
            <ResponsiveContainer>
              <LineChart data={state.data?.series || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,24,39,0.08)" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="averageResponseTime" stroke="#D4A054" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default AnalyticsPage;
