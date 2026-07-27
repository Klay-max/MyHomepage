import { useEffect, useRef } from 'react';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  websiteName: string;
  onEdit: () => void;
  onDelete: () => void;
  onOpen: () => void;
  onClose: () => void;
}

export function ContextMenu({ x, y, websiteName, onEdit, onDelete, onOpen, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [onClose]);

  const adjustedX = Math.min(x, window.innerWidth - 180);
  const adjustedY = Math.min(y, window.innerHeight - 140);

  const items = [
    { icon: <ExternalLink className="w-4 h-4" />, label: '在新标签页打开', action: onOpen },
    { icon: <Pencil className="w-4 h-4" />, label: '编辑', action: onEdit },
    { icon: <Trash2 className="w-4 h-4" />, label: '删除', action: onDelete, danger: true },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-[200] w-44 py-1.5 rounded-xl bg-surface border border-line-light shadow-xl animate-scale-in"
      style={{ left: adjustedX, top: adjustedY }}
    >
      <div className="px-3 py-1.5 text-xs font-medium text-ink-tertiary truncate border-b border-line-light">
        {websiteName}
      </div>
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => { item.action(); onClose(); }}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
            item.danger
              ? 'text-danger hover:bg-danger-soft'
              : 'text-ink hover:bg-surface-hover'
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}
