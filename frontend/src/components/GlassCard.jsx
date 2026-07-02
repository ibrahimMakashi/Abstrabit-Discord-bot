import { Card, CardContent } from '@mui/material';
import { brand } from '../constants/colors';

const GlassCard = ({ children, sx, contentSx, tone }) => (
  <Card
    sx={{
      bgcolor: tone || brand.white,
      ...sx,
    }}
  >
    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, ...contentSx }}>{children}</CardContent>
  </Card>
);

export default GlassCard;
