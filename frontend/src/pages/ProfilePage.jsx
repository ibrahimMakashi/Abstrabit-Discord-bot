import { useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { useForm } from 'react-hook-form';
import PageHeader from '../components/PageHeader';
import GlassCard from '../components/GlassCard';
import FormTextField from '../components/FormTextField';
import UserAvatar from '../components/UserAvatar';
import { pastels } from '../constants/colors';
import { useAuth } from '../hooks/useAuth';
import { useSnackbar } from '../hooks/useSnackbar';
import { formatDateTime } from '../utils/formatters';
import { profileSchema } from '../utils/validators';
import { deleteProfileAvatar, updateProfile, uploadProfileAvatar } from '../api/profile';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { showSnackbar } = useSnackbar();
  const fileInputRef = useRef(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const form = useForm({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name || '',
    },
  });

  const handleProfileSave = form.handleSubmit(async (values) => {
    try {
      const response = await updateProfile(values);
      updateUser(response.data);
      showSnackbar('Profile updated successfully.', 'success');
    } catch (error) {
      showSnackbar(error.message || 'Failed to update profile', 'error');
    }
  });

  const handleAvatarSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showSnackbar('Use a JPEG, PNG, or WebP image.', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showSnackbar('Image must be 2MB or smaller.', 'error');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setAvatarLoading(true);

    try {
      const response = await uploadProfileAvatar(file);
      updateUser(response.data);
      showSnackbar('Profile photo updated.', 'success');
    } catch (error) {
      showSnackbar(error.message || 'Failed to upload photo', 'error');
    } finally {
      URL.revokeObjectURL(localPreview);
      setPreviewUrl(null);
      setAvatarLoading(false);
    }
  };

  const handleAvatarRemove = async () => {
    setAvatarLoading(true);

    try {
      const response = await deleteProfileAvatar();
      updateUser(response.data);
      showSnackbar('Profile photo removed.', 'success');
    } catch (error) {
      showSnackbar(error.message || 'Failed to remove photo', 'error');
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <Stack spacing={2.5}>
      <PageHeader title="Profile" description="Update your display name and profile photo." />

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 5 }}>
          <GlassCard tone={pastels.mint}>
            <Stack spacing={2} alignItems="center">
              <Box sx={{ position: 'relative' }}>
                {previewUrl ? (
                  <Box
                    component="img"
                    src={previewUrl}
                    alt="Preview"
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #FFFFFF',
                      boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
                    }}
                  />
                ) : (
                  <UserAvatar user={user} size={120} />
                )}
                <IconButton
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarLoading}
                  sx={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    bgcolor: 'background.paper',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                  }}
                >
                  <PhotoCameraRoundedIcon fontSize="small" />
                </IconButton>
              </Box>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={handleAvatarSelect}
              />

              <Stack spacing={0.5} alignItems="center">
                <Typography variant="subtitle1">{user?.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1}>
                <Button variant="contained" size="small" onClick={() => fileInputRef.current?.click()} disabled={avatarLoading}>
                  Upload Photo
                </Button>
                {user?.hasAvatar ? (
                  <Button
                    variant="text"
                    size="small"
                    color="error"
                    startIcon={<DeleteOutlineRoundedIcon />}
                    onClick={handleAvatarRemove}
                    disabled={avatarLoading}
                  >
                    Remove
                  </Button>
                ) : null}
              </Stack>
            </Stack>
          </GlassCard>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <GlassCard tone={pastels.lavender}>
            <Stack spacing={2.5} component="form" onSubmit={handleProfileSave}>
              <Typography variant="h6">Account details</Typography>
              <FormTextField control={form.control} name="name" label="Display Name" />
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body2">{user?.email}</Typography>
              </Stack>
              <Divider />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Role
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {user?.role}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Last Login
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {formatDateTime(user?.lastLoginAt)}
                  </Typography>
                </Grid>
              </Grid>
              <Box>
                <Button type="submit" variant="contained" disabled={form.formState.isSubmitting}>
                  Save Changes
                </Button>
              </Box>
            </Stack>
          </GlassCard>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ProfilePage;
