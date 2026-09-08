import './Toast.css';

export interface ToastProps {
  message: string | null;
}

export default function Toast({ message }: ToastProps) {
  return (
    <div className={`toast${message ? ' is-on' : ''}`} role="status" aria-live="polite">
      <span className="toast-dot" aria-hidden="true" />
      {message ?? ''}
    </div>
  );
}
