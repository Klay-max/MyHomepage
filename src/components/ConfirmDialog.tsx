import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = '删除',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onConfirm, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm dark:bg-black/50"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm bg-surface rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="px-6 pt-7 pb-5 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-danger-soft flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-danger" />
          </div>
          <h3 className="text-lg font-semibold text-ink tracking-tight">{title}</h3>
          <p className="mt-2 text-sm text-ink-secondary leading-relaxed">{message}</p>
        </div>
        <div className="flex border-t border-line-light">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 text-sm font-medium text-ink-secondary hover:bg-surface-hover transition-colors rounded-bl-3xl"
            autoFocus
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3.5 text-sm font-medium text-danger hover:bg-danger-soft transition-colors border-l border-line-light rounded-br-3xl"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
