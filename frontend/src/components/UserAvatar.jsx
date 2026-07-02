import { Avatar } from '@mui/material';
import { useMemo } from 'react';
import { brand } from '../constants/colors';
import { getAvatarUrl } from '../utils/avatar';

const UserAvatar = ({ user, size = 40, sx }) => {
  const src = useMemo(() => getAvatarUrl(user), [user]);
  const initials = user?.name?.charAt(0)?.toUpperCase() || 'A';

  return (
    <Avatar
      src={src || undefined}
      alt={user?.name || 'User'}
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        fontWeight: 800,
        bgcolor: brand.primaryLight,
        color: brand.white,
        border: `3px solid ${brand.white}`,
        boxShadow: '0 8px 24px rgba(45, 107, 87, 0.18)',
        ...sx,
      }}
    >
      {initials}
    </Avatar>
  );
};

export default UserAvatar;
