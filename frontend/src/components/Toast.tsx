interface ToastProps {
  message: string;
  variant?: 'success' | 'error';
  onClose?: () => void;
}

export function Toast({ message, variant = 'success', onClose }: ToastProps) {
  return (
    <div className={`toast toast--${variant}`} role="status" aria-live="polite">
      <span className="toast__icon" aria-hidden>
        {variant === 'error' ? '✕' : '✓'}
      </span>
      <span className="toast__text">{message}</span>
      {onClose && (
        <button type="button" className="toast__close" onClick={onClose} aria-label="Закрыть">
          ×
        </button>
      )}
    </div>
  );
}
