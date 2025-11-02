import { Alert, AlertTitle, Snackbar } from '@mui/material';

/**
 * Componente reutilizable para mostrar mensajes de alerta
 * Soporta auto-hide y diferentes severidades
 */
function AlertMessage({ open, onClose, severity = 'info', title, message, autoHideDuration = 6000 }) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%', minWidth: '300px' }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Snackbar>
  );
}

export default AlertMessage;
