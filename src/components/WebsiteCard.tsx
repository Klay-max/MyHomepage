import { useState, useRef, useCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Trash2, Globe, GripVertical, Pencil } from 'lucide-react';
import type { Website } from '../types';
import { getFaviconSources, formatUrl, getIconSizeClass } from '../utils';
import { useStore } from '../store';
import { ConfirmDialog } from './ConfirmDialog';

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

  const mouseStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasDragged = useRef(false);

  const faviconSources = getFaviconSources(website.url);
  const currentFavicon = faviconSources[faviconIndex] || '';

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: website.id,
    data: { type: 'website', website },
  });

  const handleIconError = () => {
    if (faviconIndex < faviconSources.length - 1) {
      setFaviconIndex((prev) => prev + 1);
    } else {
      setIconError(true);
    }
  };

  const handleSaveEdit = () => {
    const trimmedName = editName.trim();
    if (trimmedName && editUrl.trim()) {
      updateWebsite(website.id, { name: trimmedName, url: editUrl.trim() });
      setIsEditing(false);
    }
  };

  const iconSizeClass = getIconSizeClass(settings.iconSize);

  // In free layout: track mouse down/up to distinguish click from drag
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    mouseStart.current = { x: e.clientX, y: e.clientY };
    hasDragged.current = false;
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (isEditing) return;
    if (hasDragged.current) return;

    const dx = Math.abs(e.clientX - mouseStart.current.x);
    const dy = Math.abs(e.clientY - mouseStart.current.y);
    if (dx < 3 && dy < 3) {
      // It was a click, not a drag
      window.open(website.url, '_blank');
    }
  }, [website.url, isEditing]);

  // Grid mode click handler
  const handleGridClick = (e: React.MouseEvent) => {
    if (isEditing) return;
    if ((e.target as HTMLElement).closest('[data-no-open]')) return;
    window.open(website.url, '_blank');
  };

  // Track drag via dnd-kit's isDragging
  if (isDragging) {
    hasDragged.current = true;
  }

  // Build style based on layout mode
  const style: React.CSSProperties = isFreeLayout
    ? {
        position: 'absolute',
        left: `${website.x ?? 0}px`,
        top: `${website.y ?? 0}px`,
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
        zIndex: isDragging ? 100 : 1,
        opacity: isDragging ? 0.4 : 1,
        transition: isDragging ? 'none' : 'transform 0.15s ease',
      }
    : {
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
        zIndex: isDragging ? 100 : 1,
        opacity: isDragging ? 0.4 : 1,
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
        <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="网站名称"
            className="w-full px-3 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400"
            autoFocus
          />
          <input
            type="text"
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
            placeholder="网址"
            className="w-full px-3 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400"
          />
          <div className="flex gap-2 w-full">
            <button
              onClick={handleSaveEdit}
              className="flex-1 py-2 text-sm font-medium rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              保存
            </button>
            <button
              onClick={() => { setIsEditing(false); setEditName(website.name); setEditUrl(website.url); }}
              className="flex-1 py-2 text-sm rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== CARD CONTENT (shared between modes) =====
  const cardContent = (
    <>
      <div className={`${iconSizeClass} rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center overflow-hidden`}>
        {!iconError && currentFavicon ? (
          <img
            src={currentFavicon}
            alt={website.name}
            className="w-full h-full object-contain p-2"
            onError={handleIconError}
          />
        ) : (
          <Globe className="w-1/2 h-1/2 text-gray-400" />
        )}
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[100px]">
          {website.name}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[100px] mt-0.5">
          {formatUrl(website.url)}
        </p>
      </div>
    </>
  );

  // Action buttons (edit + delete)
  const actionButtons = (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsEditing(true);
          setEditName(website.name);
          setEditUrl(website.url);
        }}
        className="absolute -top-2 right-5 w-6 h-6 rounded-full bg-gray-600 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-sm hover:bg-gray-700 cursor-pointer"
        title="编辑"
        data-no-open
      >
        <Pencil className="w-3 h-3" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setShowDeleteConfirm(true);
        }}
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-sm hover:bg-red-600 cursor-pointer"
        data-no-open
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </>
  );

  // ===== FREE LAYOUT MODE: entire card is draggable =====
  if (isFreeLayout) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="group"
      >
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="删除网站"
          message={`确定要删除「${website.name}」吗？此操作不可撤销。`}
          onConfirm={() => { deleteWebsite(website.id); setShowDeleteConfirm(false); }}
          onCancel={() => setShowDeleteConfirm(false)}
        />

        {/* Grip handle — visual indicator only */}
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          data-no-open
        >
          <div className="w-8 h-4 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center shadow-sm">
            <GripVertical className="w-3 h-3 text-gray-500 dark:text-gray-300" />
          </div>
        </div>

        {/* Draggable card body — listeners go here in free mode */}
        <div
          {...listeners}
          {...attributes}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg transition-all duration-300 cursor-grab active:cursor-grabbing select-none touch-none"
          style={{ touchAction: 'none' }}
        >
          {cardContent}
        </div>

        {actionButtons}
      </div>
    );
  }

  // ===== GRID LAYOUT MODE: grip handle is the drag target =====
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative"
    >
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="删除网站"
        message={`确定要删除「${website.name}」吗？此操作不可撤销。`}
        onConfirm={() => { deleteWebsite(website.id); setShowDeleteConfirm(false); }}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Drag handle — only for grid mode */}
      <div
        {...listeners}
        {...attributes}
        className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        title="拖拽移动"
        data-no-open
      >
        <div className="w-8 h-4 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center shadow-sm">
          <GripVertical className="w-3 h-3 text-gray-500 dark:text-gray-300" />
        </div>
      </div>

      {/* Card button */}
      <button
        onClick={handleGridClick}
        className="w-full flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg transition-all duration-300 cursor-pointer"
      >
        {cardContent}
      </button>

      {actionButtons}
    </div>
  );
}
