import React from 'react';

export function Toast({
  message,
  onDismiss,
}: {
  message: string | null;
  onDismiss: () => void;
}) {
  React.useEffect(() => {
    if (!message) return;
    const id = window.setTimeout(() => onDismiss(), 2200);
    return () => window.clearTimeout(id);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div className="toast" aria-live="polite" aria-atomic="true">
      <span>{message}</span>
      <button className="linkButton" onClick={onDismiss} aria-label="Cerrar notificación">
        Cerrar
      </button>
    </div>
  );
}

