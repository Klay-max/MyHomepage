import { useState, useEffect, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, Edit2, GripVertical, ChevronDown } from 'lucide-react';
import { useStore } from '../store';
import { WebsiteCard } from './WebsiteCard';
import { GRID_SIZE_X, GRID_SIZE_Y } from '../utils';
import { AddWebsiteModal } from './AddWebsiteModal';
import { ConfirmDialog } from './ConfirmDialog';
import type { Category } from '../types';

const FREE_CANVAS_MIN_HEIGHT = 360;

interface CategorySectionProps {
  category: Category;
  isFreeLayout: boolean;
}

function SortableCategory({ category, children }: { category: Category; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-0 -ml-7 h-full flex items-center cursor-grab active:cursor-grabbing opacity-0 hover:opacity-100 transition-opacity z-10"
      >
        <GripVertical className="w-4 h-4 text-ink-tertiary" />
      </div>
      {children}
    </div>
  );
}

export function CategorySection({ category, isFreeLayout }: CategorySectionProps) {
  const { websites, deleteCategory, updateCategory, updateWebsitePosition, collapsedCategories, toggleCategoryCollapse } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isOver, setIsOver] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const isCollapsed = collapsedCategories.includes(category.id);

  const categoryWebsites = websites
    .filter((w) => w.categoryId === category.id)
    .sort((a, b) => a.order - b.order);

  const freeCanvasHeight = isFreeLayout
    ? Math.max(
        FREE_CANVAS_MIN_HEIGHT,
        ...categoryWebsites.map((website) => ((website.gridRow ?? 0) * 110) + 116)
      )
    : undefined;

  const droppableId = `droppable-cat-${category.id}`;
  const { setNodeRef: setDroppableRef, isOver: isDroppableOver } = useDroppable({
    id: droppableId,
  });

  useEffect(() => {
    setIsOver(isDroppableOver);
  }, [isDroppableOver]);

  const handleSaveEdit = () => {
    if (editName.trim()) {
      updateCategory(category.id, editName.trim());
      setIsEditing(false);
    }
  };

  // Initialize grid positions for websites without coordinates
  useEffect(() => {
    if (!isFreeLayout) return;
    const unpositioned = categoryWebsites.filter(
      (w) => w.gridCol === undefined || w.gridRow === undefined
    );
    if (unpositioned.length === 0) return;
    // Use 5 columns to match the default layout (fits beside todo widget)
    unpositioned.forEach((website) => {
      const idx = categoryWebsites.indexOf(website);
      const col = idx % 5;
      const row = Math.floor(idx / 5);
      updateWebsitePosition(website.id, col, row);
    });
  }, [isFreeLayout, categoryWebsites.length, isCollapsed]);

  return (
    <SortableCategory category={category}>
      <div
        ref={(node) => {
          (sectionRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          setDroppableRef(node);
        }}
        className={`mb-12 ${isFreeLayout ? 'relative min-h-[180px]' : ''}`}
      >
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="删除分类"
          message={`确定要删除「${category.name}」分类吗？其中的所有网站也会被删除。`}
          onConfirm={() => { deleteCategory(category.id); setShowDeleteConfirm(false); }}
          onCancel={() => setShowDeleteConfirm(false)}
        />

        {/* Category Header */}
        <div className="flex items-center justify-between mb-5 px-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleCategoryCollapse(category.id)}
              className="p-1 rounded-md hover:bg-surface-hover transition-colors"
              title={isCollapsed ? '展开' : '折叠'}
            >
              <ChevronDown className={`w-4 h-4 text-ink-tertiary transition-transform duration-300 ${isCollapsed ? '-rotate-90' : ''}`} />
            </button>
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSaveEdit}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                className="px-3 py-1.5 rounded-lg bg-surface border border-line text-[15px] font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                autoFocus
              />
            ) : (
              <h2 className="text-[15px] font-semibold text-ink tracking-tight">
                {category.name}
              </h2>
            )}
            <span className="text-xs text-ink-tertiary font-medium ml-0.5 tabular-nums">
              {categoryWebsites.length}
            </span>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg text-ink-tertiary hover:text-ink hover:bg-surface-hover transition-all"
              title="编辑分类"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-lg text-ink-tertiary hover:text-danger hover:bg-danger-soft transition-all"
              title="删除分类"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="p-1.5 rounded-lg text-ink-tertiary hover:text-ink hover:bg-surface-hover transition-all"
              title="添加网站"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Websites area — collapsible */}
        <div className={`overflow-hidden transition-[max-height,opacity] duration-400 ease-out ${
          isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[3000px] opacity-100'
        }`}>
          {isFreeLayout ? (
            <div
              data-category-canvas={category.id}
              className={`relative rounded-2xl border-2 border-dashed transition-all min-h-[100px] ${
                isOver
                  ? 'border-accent/60 bg-accent-soft/20 shadow-[inset_0_0_40px_rgba(0,113,227,0.04)]'
                  : 'border-line-light dark:border-line bg-canvas/40'
              }`}
              style={{
                minHeight: freeCanvasHeight,
                backgroundImage: isOver ? 'none' : `
                  radial-gradient(circle, var(--color-line-light) 1px, transparent 1px)
                `.trim(),
                backgroundSize: `${GRID_SIZE_X}px ${GRID_SIZE_Y}px`,
                backgroundPosition: '0 0',
              }}
            >
              {categoryWebsites.map((website) => (
                <WebsiteCard
                  key={website.id}
                  website={website}
                  isFreeLayout={true}
                />
              ))}

              {/* Empty state */}
              {categoryWebsites.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-sm text-ink-tertiary">
                    {isOver ? '松开放入此分类' : '拖拽网站到此处，或点击 + 添加'}
                  </p>
                </div>
              )}

              {/* Drop indicator */}
              {isOver && categoryWebsites.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="px-4 py-2 rounded-full bg-accent text-white text-sm font-medium shadow-lg">
                    松开放入此分类
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Grid mode */
            <div
              className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 p-2 rounded-2xl transition-all ${
                isOver ? 'bg-accent-soft/30 ring-2 ring-accent/30' : ''
              }`}
            >
              {categoryWebsites.map((website) => (
                <WebsiteCard
                  key={website.id}
                  website={website}
                  isFreeLayout={false}
                />
              ))}

              {categoryWebsites.length === 0 && (
                <div className="col-span-full py-16 text-center">
                  <p className="text-sm text-ink-tertiary mb-3">暂无网站</p>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="text-sm text-accent hover:text-accent-hover font-medium transition-colors"
                  >
                    添加一个
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <AddWebsiteModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          defaultCategoryId={category.id}
        />
      </div>
    </SortableCategory>
  );
}
