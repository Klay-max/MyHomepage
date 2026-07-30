import { useState, useRef, useCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Trash2, GripVertical, Pencil } from 'lucide-react';
import type { Website } from '../types';
import { getFaviconSources, getAvatarGradient, formatUrl, gridToPixel } from '../utils';
import { useStore } from '../store';
import { ConfirmDialog } from './ConfirmDialog';
import { ContextMenu } from './ContextMenu';

interface WebsiteCardProps {
  website: Website;
  isFreeLayout: boolean;
}

export function WebsiteCard({ website, isFreeLayout }: WebsiteCardProps) {
  const { settings, deleteWebsite, updateWebsite } = useStore();
  const [iconError, setIconError] = useState(false);
  const [faviconIndex, setFaviconIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(website.name);
  const [editUrl, setEditUrl] = useState(website.url);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);
  const dragHappened = useRef(false);

  const faviconSources = getFaviconSources(website.url);
  const currentFavicon = faviconSources[faviconIndex] || '';

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: website.id,
    data: { type: 'website', website },
  });

  if (isDragging) {
    dragHappened.current = true;
  }

  const handleIconError = () => {
    if (faviconIndex < faviconSources.length - 1) {
      setFaviconIndex((prev) => prev + 1);
    } else {
      setIconError(true);
    }
  };

  const handleIconLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    // Some services return a blank/transparent 16x16 placeholder on failure.
    // Treat tiny images as failures so the letter-avatar fallback is shown.
    if (img.naturalWidth < 16 || img.naturalHeight < 16) {
      handleIconError();
    }
  };

  const handleSaveEdit = () => {
    const trimmedName = editName.trim();
    if (trimmedName && editUrl.trim()) {
      updateWebsite(website.id, { name: trimmedName, url: editUrl.trim() });
      setIsEditing(false);
    }
  };

  const iconSizeMap: Record<string, string> = {
    small: 'w-10 h-10 rounded-[10px]',
    medium: 'w-14 h-14 rounded-[14px]',
    large: 'w-16 h-16 rounded-[16px]',
  };
  const iconSizeClass = iconSizeMap[settings.iconSize] || iconSizeMap.medium;

  // Gradient for letter-avatar fallback
  const avatarGradient = getAvatarGradient(website.name);

  const mergedListeners = {
    ...listeners,
    onPointerDown: (e: React.PointerEvent) => {
      pointerDownPos.current = { x: e.clientX, y: e.clientY };
      dragHappened.current = false;
      const originalHandler = (listeners as Record<string, unknown>)?.onPointerDown;
      if (typeof originalHandler === 'function') {
        originalHandler(e);
      }
    },
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (isEditing) return;
    if (dragHappened.current) {
      dragHappened.current = false;
      pointerDownPos.current = null;
      return;
    }
    if (pointerDownPos.current) {
      const dx = Math.abs(e.clientX - pointerDownPos.current.x);
      const dy = Math.abs(e.clientY - pointerDownPos.current.y);
      if (dx < 8 && dy < 8) {
        window.open(website.url, '_blank');
      }
    }
    pointerDownPos.current = null;
  }, [website.url, isEditing]);

  // Free-mode pixel position
  const pixelPos = gridToPixel(website.gridCol ?? 0, website.gridRow ?? 0);

  const style: React.CSSProperties = isFreeLayout
    ? {
        position: 'absolute',
        left: `${pixelPos.x}px`,
        top: `${pixelPos.y}px`,
        opacity: isDragging ? 0 : 1,
        transition: isDragging ? 'none' : 'opacity 0.2s ease',
      }
    : {
        opacity: isDragging ? 0.3 : 1,
      };

  // ===== EDITING MODE =====
  if (isEditing) {
    return (
      <div style={style} ref={setNodeRef}>
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="删除网站"
          message={`确定要删除「${website.name}」吗？此操作不可撤销。`}
          onConfirm={() => { deleteWebsite(website.id); setShowDeleteConfirm(false); }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
        <div className="w-[116px] flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-surface border border-accent/30 shadow-card-drag">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="名称"
            className="w-full px-3 py-2 text-xs rounded-lg bg-surface-hover border border-line text-ink placeholder-ink-tertiary focus:outline-none focus:ring-1.5 focus:ring-accent"
            autoFocus
          />
          <input
            type="text"
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
            placeholder="网址"
            className="w-full px-3 py-2 text-xs rounded-lg bg-surface-hover border border-line text-ink placeholder-ink-tertiary focus:outline-none focus:ring-1.5 focus:ring-accent"
          />
          <div className="flex gap-1.5 w-full">
            <button
              onClick={handleSaveEdit}
              className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors"
            >
              保存
            </button>
            <button
              onClick={() => { setIsEditing(false); setEditName(website.name); setEditUrl(website.url); }}
              className="flex-1 py-1.5 text-xs rounded-lg bg-surface-hover text-ink-secondary hover:text-ink transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== NORMAL CARD =====
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative z-[1] ${isFreeLayout ? 'hover:z-10' : ''}`}
      onContextMenu={handleRightClick}
    >
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="删除网站"
        message={`确定要删除「${website.name}」吗？此操作不可撤销。`}
        onConfirm={() => { deleteWebsite(website.id); setShowDeleteConfirm(false); }}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Drag grip handle — only in free layout */}
      {isFreeLayout && (
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="px-2.5 py-1 rounded-full bg-surface-elevated border border-line-light shadow-sm flex items-center gap-1">
            <GripVertical className="w-3 h-3 text-ink-tertiary" />
          </div>
        </div>
      )}

      {/* Card body */}
      <div
        {...mergedListeners}
        {...attributes}
        onPointerUp={handlePointerUp}
        className={`w-[116px] flex flex-col items-center gap-2.5 py-4 px-3 rounded-2xl
                   bg-surface border border-line-light
                   hover:border-line
                   hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.04)]
                   dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.5),0_2px_6px_rgba(0,0,0,0.3)]
                   ${isFreeLayout ? 'hover:-translate-y-0.5' : 'hover:scale-[1.04]'}
                   transition-all duration-250 ease-out
                   cursor-grab active:cursor-grabbing select-none`}
        style={{ touchAction: 'none' }}
      >
        {/* Icon — gradient ring + white inner square + favicon, with depth shadow */}
        <div
          className={`${iconSizeClass} flex items-center justify-center overflow-hidden shrink-0 relative
                      ring-1 ring-black/5 dark:ring-white/10
                      shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.18)]`}
          style={{
            background: `linear-gradient(135deg, ${avatarGradient.from}, ${avatarGradient.to})`,
          }}
        >
          {!iconError && currentFavicon ? (
            <>
              {/* White inner square — ensures every favicon renders at consistent visual size */}
              <div className="absolute inset-[6px] bg-white dark:bg-white/95 rounded-[6px] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.06)]" />
              <img
                src={currentFavicon}
                alt={website.name}
                className="w-full h-full object-contain p-[8px] relative z-10"
                onError={handleIconError}
                onLoad={handleIconLoad}
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </>
          ) : (
            <span
              className={`font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)] ${settings.iconSize === 'small' ? 'text-base' : settings.iconSize === 'large' ? 'text-2xl' : 'text-xl'}`}
            >
              {website.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Text */}
        <div className="text-center min-w-0 w-full">
          <p className="text-[13px] font-medium text-ink truncate leading-tight">
            {website.name}
          </p>
          <p className="text-[11px] text-ink-secondary truncate mt-0.5 leading-tight">
            {formatUrl(website.url)}
          </p>
        </div>
      </div>

      {/* Hover action buttons */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsEditing(true);
          setEditName(website.name);
          setEditUrl(website.url);
        }}
        className="absolute -top-1.5 right-5 w-5 h-5 rounded-full bg-ink text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-md hover:scale-110 cursor-pointer z-20"
        title="编辑"
      >
        <Pencil className="w-2.5 h-2.5" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setShowDeleteConfirm(true);
        }}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-danger text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-md hover:scale-110 cursor-pointer z-20"
        title="删除"
      >
        <Trash2 className="w-2.5 h-2.5" />
      </button>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          websiteName={website.name}
          onEdit={() => {
            setIsEditing(true);
            setEditName(website.name);
            setEditUrl(website.url);
          }}
          onDelete={() => setShowDeleteConfirm(true)}
          onOpen={() => window.open(website.url, '_blank')}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
