import { useCallback, useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../api/settings';
import {
  hasSkippedDiscordSetup,
  isDiscordSetupComplete,
  markDiscordSetupSkipped,
  clearDiscordSetupSkip,
} from '../utils/discordSetup';
import { useAuth } from './useAuth';
import { useSnackbar } from './useSnackbar';

const emptyDiscordValues = () => ({
  guildId: '',
  mainChannelId: '',
  mirrorChannelId: '',
  mirrorWebhookUrl: '',
});

export const useDiscordSetupPrompt = () => {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const [initialValues, setInitialValues] = useState(emptyDiscordValues);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!user) {
      setChecked(false);
      setOpen(false);
      setOnboarding(false);
      return;
    }

    let active = true;

    const checkSetup = async () => {
      try {
        const response = await getSettings();
        if (!active) {
          return;
        }

        const values = {
          guildId: response.data.guildId || '',
          mainChannelId: response.data.mainChannelId || '',
          mirrorChannelId: response.data.mirrorChannelId || '',
          mirrorWebhookUrl: response.data.mirrorWebhookUrl || '',
        };

        setInitialValues(values);

        if (!isDiscordSetupComplete(values) && !hasSkippedDiscordSetup()) {
          setOnboarding(true);
          setOpen(true);
        }
      } catch {
        // Settings remain available from the Settings page.
      } finally {
        if (active) {
          setChecked(true);
        }
      }
    };

    checkSetup();

    return () => {
      active = false;
    };
  }, [user]);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setOnboarding(false);
    markDiscordSetupSkipped();
  }, []);

  const openDialog = useCallback((isOnboarding = false) => {
    setOnboarding(isOnboarding);
    setOpen(true);
  }, []);

  const completeSetup = useCallback(
    async (discordSetup) => {
      const current = await getSettings();
      await updateSettings({
        ...current.data,
        ...discordSetup,
      });
      setInitialValues(discordSetup);
      clearDiscordSetupSkip();
      setOpen(false);
      setOnboarding(false);
      showSnackbar('Discord server connected successfully.', 'success');
    },
    [showSnackbar],
  );

  return {
    open,
    onboarding,
    initialValues,
    checked,
    closeDialog,
    openDialog,
    completeSetup,
  };
};
