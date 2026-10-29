import { useEffect, useRef } from 'react';

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm(): void;
  onClose(): void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  busy = false,
  onConfirm,
  onClose,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [busy, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-5"
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h2 id="confirm-title" className="m-0 font-display text-lg font-bold">
          {title}
        </h2>
        <p className="m-0 mt-2 text-sm text-ink/70 break-words">{message}</p>
        <div className="mt-5 flex justify-end gap-2.5">
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={onClose}>
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            className="btn btn-danger"
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
