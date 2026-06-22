interface LoadingSpinnerProps {
  fullPage?: boolean;
  label?: string;
}

export function LoadingSpinner({ fullPage, label = 'Загрузка…' }: LoadingSpinnerProps) {
  return (
    <div className={`loading ${fullPage ? 'loading--full' : ''}`} role="status">
      <div className="loading__spinner" />
      <span className="loading__label">{label}</span>
    </div>
  );
}
