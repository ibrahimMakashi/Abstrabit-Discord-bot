import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { useForm, Controller } from 'react-hook-form';
import PageHeader from '../components/PageHeader';
import GlassCard from '../components/GlassCard';
import DiscordServerSetupDialog from '../components/DiscordServerSetupDialog';
import { pastels } from '../constants/colors';
import { useSnackbar } from '../hooks/useSnackbar';
import { getSettings, updateSettings } from '../api/settings';
import { settingsSchema } from '../utils/validators';
import { isDiscordSetupComplete } from '../utils/discordSetup';

const SettingsPage = () => {
  const { showSnackbar } = useSnackbar();
  const [setupOpen, setSetupOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      guildId: '',
      mainChannelId: '',
      mirrorChannelId: '',
      mirrorWebhookUrl: '',
      enableAI: true,
      enableNotifications: true,
      autoReply: true,
      commandConfiguration: {
        reportEnabled: true,
        statusEnabled: true,
      },
    },
  });

  const discordValues = form.watch(['guildId', 'mainChannelId', 'mirrorChannelId', 'mirrorWebhookUrl']);

  const connectionStatus = useMemo(() => {
    const [guildId, mainChannelId, mirrorChannelId, mirrorWebhookUrl] = discordValues;
    const configured = isDiscordSetupComplete({
      guildId,
      mainChannelId,
      mirrorChannelId,
      mirrorWebhookUrl,
    });
    return { configured, guildId, mainChannelId, mirrorChannelId, mirrorWebhookUrl };
  }, [discordValues]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getSettings();
        form.reset({
          ...response.data,
          guildId: response.data.guildId || '',
          mainChannelId: response.data.mainChannelId || '',
          mirrorChannelId: response.data.mirrorChannelId || '',
          mirrorWebhookUrl: response.data.mirrorWebhookUrl || '',
        });
      } catch (error) {
        showSnackbar(error.message || 'Unable to load settings', 'error');
      }
    };

    load();
  }, [form, showSnackbar]);

  const saveSettings = async (values) => {
    await updateSettings(values);
    form.reset(values);
    showSnackbar('Settings saved successfully.', 'success');
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await saveSettings(values);
    } catch (error) {
      showSnackbar(error.message || 'Unable to save settings', 'error');
    }
  });

  const handleSetupComplete = async (discordSetup) => {
    const values = {
      ...form.getValues(),
      ...discordSetup,
    };

    try {
      await saveSettings(values);
    } catch (error) {
      showSnackbar(error.message || 'Unable to save Discord setup', 'error');
      throw error;
    }
  };

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title="Settings"
        description="Connect your Discord server, configure encrypted routing, and control bot behavior."
      />

      <Alert severity="success" icon={<LockRoundedIcon fontSize="inherit" />}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
          End-to-end privacy for your Discord configuration
        </Typography>
        <Typography variant="body2">
          Your server ID, channel IDs, and mirror webhook URL are encrypted before storage. Even
          platform creators and developers cannot view your secrets — only your authenticated admin
          session can decrypt them in this portal.
        </Typography>
      </Alert>

      <GlassCard tone={pastels.mint}>
        <Stack spacing={2.5}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                Discord server connection
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use the guided setup to add the bot and enter each ID one step at a time.
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button
                variant="contained"
                size="large"
                startIcon={<SmartToyRoundedIcon />}
                onClick={() => setSetupOpen(true)}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Add bot to your server
              </Button>
              {connectionStatus.configured ? (
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<SettingsRoundedIcon />}
                  onClick={() => setSetupOpen(true)}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Reconfigure
                </Button>
              ) : null}
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              size="small"
              label={connectionStatus.configured ? 'Server connected' : 'Setup incomplete'}
              color={connectionStatus.configured ? 'success' : 'warning'}
              variant="outlined"
            />
            {connectionStatus.guildId ? (
              <Chip size="small" label={`Server ID: ${connectionStatus.guildId}`} variant="outlined" />
            ) : null}
            {connectionStatus.mainChannelId ? (
              <Chip size="small" label="Main channel configured" variant="outlined" />
            ) : null}
            {connectionStatus.mirrorWebhookUrl ? (
              <Chip size="small" label="Mirror webhook configured" variant="outlined" />
            ) : null}
          </Stack>

          {!connectionStatus.configured ? (
            <Alert severity="info">
              Click <strong>Add bot to your server</strong> to open the step-by-step setup. You will
              invite the bot first, then enter your Server ID, Main Channel ID, Mirror Channel ID, and
              Mirror Webhook URL — each with clear instructions.
            </Alert>
          ) : null}
        </Stack>
      </GlassCard>

      <GlassCard tone={pastels.yellow}>
        <Stack component="form" spacing={3} onSubmit={onSubmit}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Bot behavior
            </Typography>
            <Grid container spacing={2}>
              {[
                ['enableAI', 'Enable AI'],
                ['enableNotifications', 'Enable Notifications'],
                ['autoReply', 'Auto Reply'],
                ['commandConfiguration.reportEnabled', 'Enable /report'],
                ['commandConfiguration.statusEnabled', 'Enable /status'],
              ].map(([name, label]) => (
                <Grid key={name} size={{ xs: 12, md: 6 }}>
                  <Controller
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={Boolean(field.value)}
                            onChange={(event) => field.onChange(event.target.checked)}
                          />
                        }
                        label={label}
                      />
                    )}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>

          <Button type="submit" variant="contained" size="large">
            Save bot behavior
          </Button>
        </Stack>
      </GlassCard>

      <DiscordServerSetupDialog
        open={setupOpen}
        initialValues={{
          guildId: connectionStatus.guildId,
          mainChannelId: connectionStatus.mainChannelId,
          mirrorChannelId: connectionStatus.mirrorChannelId,
          mirrorWebhookUrl: connectionStatus.mirrorWebhookUrl,
        }}
        onClose={() => setSetupOpen(false)}
        onComplete={handleSetupComplete}
      />
    </Stack>
  );
};

export default SettingsPage;
