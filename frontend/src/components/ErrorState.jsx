import { Alert } from '@mui/material';

const ErrorState = ({ message = 'Something went wrong.' }) => <Alert severity="error">{message}</Alert>;

export default ErrorState;
