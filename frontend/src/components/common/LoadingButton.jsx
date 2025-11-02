import { Button, CircularProgress } from '@mui/material';

/**
 * Botón con estado de carga
 */
function LoadingButton({ loading, children, disabled, ...props }) {
  return (
    <Button
      {...props}
      disabled={loading || disabled}
      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : props.startIcon}
    >
      {children}
    </Button>
  );
}

export default LoadingButton;
