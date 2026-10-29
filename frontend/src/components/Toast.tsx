import { useEffect } from 'react';

export interface ToastMessage {
  type: 'success' | 'error';
  message: string;
}

interface Props {
  toast: ToastMessage;
  onDismiss(): void;
}

export default function Toast({ toast, onDismiss }: Props) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 4000);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div
      role="status"
      className={`fixed bottom-6 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-xl ${
        toast.type === 'error' ? 'bg-rose-700' : 'bg-ink'
      }`}
    >
      <span>{toast.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="cursor-pointer border-none bg-transparent p-0 text-base leading-none text-white/70 hover:text-white"
      >
        ×
      </button>
    </div>
  );
}
