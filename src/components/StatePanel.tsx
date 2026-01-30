import React from 'react';

export function StatePanel({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="statePanel" role="status" aria-live="polite">
      <div className="stateTitle">{title}</div>
      <div className="stateMessage">{message}</div>
      {actionLabel && onAction ? (
        <div className="stateActions">
          <button onClick={onAction}>{actionLabel}</button>
        </div>
      ) : null}
    </div>
  );
}

