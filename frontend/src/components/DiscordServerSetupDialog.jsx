import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import { brand } from '../constants/colors';
import { getDiscordInvite } from '../api/settings';

const SETUP_STEPS = [
  {
    id: 'invite',
    title: 'Add the bot to your Discord server',
    description: 'First, invite the bot so slash commands like /report and /status work in your server.',
    steps: [
      'Click "Open Discord Invite" below — Discord will open in a new tab.',
      'Choose the server you manage and click Authorize.',
      'Complete any captcha if Discord asks for it.',
      'Come back here and click Next to continue setup.',
    ],
    note: 'You need "Manage Server" permission on the Discord server to add bots.',
    field: null,
  },
  {
    id: 'guildId',
    title: 'Discord Server ID',
    description: 'Link this dashboard account to exactly one Discord server.',
    steps: [
      'Open Discord and go to the server where you added the bot.',
      'Enable Developer Mode: User Settings → Advanced → Developer Mode.',
      'Right-click your server icon in the left sidebar → Copy Server ID.',
      'Alternative: Server Settings → Widget → copy the Server ID shown there.',
    ],
    note: 'Command logs, analytics, and mirroring are scoped to this server only.',
    field: 'guildId',
    label: 'Discord Server ID',
    placeholder: 'e.g. 1522174005468201031',
  },
  {
    id: 'mainChannelId',
    title: 'Main Channel ID',
    description: 'The primary channel where your team uses the bot.',
    steps: [
      'In Discord, open the channel where members run /report and /status.',
      'Right-click the channel name in the channel list.',
      'Click Copy Channel ID and paste it below.',
    ],
    note: 'This is your main bot channel reference on the dashboard.',
    field: 'mainChannelId',
    label: 'Main Channel ID',
    placeholder: 'e.g. 1522177022908956713',
  },
  {
    id: 'mirrorChannelId',
    title: 'Mirror Channel ID',
    description: 'A private channel where report copies should be delivered.',
    steps: [
      'Create or pick a staff-only channel for mirrored reports.',
      'Right-click that channel name → Copy Channel ID.',
      'Paste the ID below — it is stored encrypted for your account only.',
    ],
    note: 'Mirroring is sent via webhook; this ID helps you identify the target channel in the portal.',
    field: 'mirrorChannelId',
    label: 'Mirror Channel ID',
    placeholder: 'e.g. 1522178357817638923',
  },
  {
    id: 'mirrorWebhookUrl',
    title: 'Mirror Webhook URL',
    description: 'Webhook that posts mirrored /report messages into your mirror channel.',
    steps: [
      'Open your mirror channel → Edit Channel → Integrations → Webhooks.',
      'Click New Webhook and name it (for example "Report Mirror").',
      'Confirm the webhook targets your mirror channel.',
      'Click Copy Webhook URL and paste it below.',
    ],
    note: 'When notifications are enabled, /report output is forwarded to this webhook.',
    field: 'mirrorWebhookUrl',
    label: 'Mirror Webhook URL',
    placeholder: 'https://discord.com/api/webhooks/...',
  },
];

const snowflakePattern = /^\d{17,20}$/;
const webhookPattern = /^https:\/\/.+/i;

const validateStepValue = (field, value) => {
  const trimmed = value?.trim() || '';

  if (field === 'mirrorWebhookUrl') {
    if (!trimmed) {
      return 'Mirror webhook URL is required';
    }
    if (!webhookPattern.test(trimmed)) {
      return 'Enter a valid HTTPS webhook URL';
    }
    return '';
  }

  if (!trimmed) {
    return 'This field is required';
  }

  if (!snowflakePattern.test(trimmed)) {
    return 'Enter a valid Discord snowflake ID (17–20 digits)';
  }

  return '';
};

const DiscordServerSetupDialog = ({ open, initialValues, onboarding = false, onClose, onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [values, setValues] = useState({
    guildId: '',
    mainChannelId: '',
    mirrorChannelId: '',
    mirrorWebhookUrl: '',
  });
  const [fieldError, setFieldError] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [saving, setSaving] = useState(false);

  const step = SETUP_STEPS[activeStep];
  const isLastStep = activeStep === SETUP_STEPS.length - 1;
  const progress = ((activeStep + 1) / SETUP_STEPS.length) * 100;

  useEffect(() => {
    if (!open) {
      return;
    }

    setActiveStep(0);
    setFieldError('');
    setValues({
      guildId: initialValues?.guildId || '',
      mainChannelId: initialValues?.mainChannelId || '',
      mirrorChannelId: initialValues?.mirrorChannelId || '',
      mirrorWebhookUrl: initialValues?.mirrorWebhookUrl || '',
    });
  }, [open, initialValues]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const loadInvite = async () => {
      setInviteLoading(true);
      setInviteError('');

      try {
        const response = await getDiscordInvite();
        setInviteUrl(response.data.inviteUrl);
      } catch (error) {
        setInviteError(error.message || 'Unable to load bot invite link');
      } finally {
        setInviteLoading(false);
      }
    };

    loadInvite();
  }, [open]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (fieldError) {
      setFieldError('');
    }
  };

  const handleNext = async () => {
    if (step.field) {
      const error = validateStepValue(step.field, values[step.field]);
      if (error) {
        setFieldError(error);
        return;
      }
    }

    if (isLastStep) {
      setSaving(true);
      try {
        await onComplete(values);
        onClose();
      } catch {
        // Parent shows snackbar; keep dialog open.
      } finally {
        setSaving(false);
      }
      return;
    }

    setActiveStep((current) => current + 1);
    setFieldError('');
  };

  const handleBack = () => {
    setActiveStep((current) => Math.max(0, current - 1));
    setFieldError('');
  };

  const stepLabel = useMemo(() => `Step ${activeStep + 1} of ${SETUP_STEPS.length}`, [activeStep]);
  const dialogTitle = onboarding
    ? 'Connect your Discord server with our bot'
    : 'Connect your Discord server';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <SmartToyRoundedIcon sx={{ color: brand.primary }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {dialogTitle}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {onboarding ? 'Quick setup to unlock your dashboard' : stepLabel}
            </Typography>
          </Box>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ mt: 2, height: 6, borderRadius: 999, bgcolor: 'rgba(45, 107, 87, 0.12)' }}
        />
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          {onboarding ? (
            <Alert severity="info">
              Welcome! Add our bot to your Discord server and complete the steps below to start tracking
              commands, reports, and mirror notifications on your dashboard.
            </Alert>
          ) : null}

          <Alert
            severity="success"
            icon={<LockRoundedIcon fontSize="inherit" />}
            sx={{ alignItems: 'flex-start' }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Your data is fully encrypted
            </Typography>
            <Typography variant="body2">
              Channel IDs and webhook URLs are encrypted with AES-256 before they are saved. Not even
              platform creators or developers can read your stored secrets — only your logged-in admin
              session can decrypt and display them in this portal.
            </Typography>
          </Alert>

          {!onboarding ? (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -1 }}>
              {stepLabel}
            </Typography>
          ) : null}

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              {step.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {step.description}
            </Typography>

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              How to get it
            </Typography>
            <Box component="ol" sx={{ pl: 2.5, my: 0, mb: 2 }}>
              {step.steps.map((instruction) => (
                <Typography key={instruction} component="li" variant="body2" sx={{ mb: 0.75 }}>
                  {instruction}
                </Typography>
              ))}
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: step.field || step.id === 'invite' ? 2 : 0 }}>
              {step.note}
            </Typography>

            {step.id === 'invite' ? (
              <Stack spacing={1.5}>
                {inviteError ? <Alert severity="error">{inviteError}</Alert> : null}
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<OpenInNewRoundedIcon />}
                  disabled={!inviteUrl || inviteLoading}
                  onClick={() => window.open(inviteUrl, '_blank', 'noopener,noreferrer')}
                >
                  Open Discord Invite
                </Button>
                <Typography variant="caption" color="text.secondary">
                  Need help finding IDs later? Enable{' '}
                  <Link
                    href="https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-IDs-and-Server-IDs-"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: brand.primary }}
                  >
                    Developer Mode
                  </Link>{' '}
                  in Discord.
                </Typography>
              </Stack>
            ) : null}

            {step.field ? (
              <TextField
                fullWidth
                name={step.field}
                label={step.label}
                placeholder={step.placeholder}
                value={values[step.field]}
                onChange={handleFieldChange}
                error={Boolean(fieldError)}
                helperText={fieldError}
                variant="outlined"
              />
            ) : null}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          {onboarding ? 'Maybe later' : 'Cancel'}
        </Button>
        {activeStep > 0 ? (
          <Button onClick={handleBack} disabled={saving}>
            Back
          </Button>
        ) : null}
        <Button variant="contained" onClick={handleNext} disabled={saving}>
          {isLastStep ? (saving ? 'Saving…' : 'Finish setup') : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DiscordServerSetupDialog;
