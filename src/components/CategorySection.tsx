import { useState, useEffect, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, Edit2, GripVertical } from 'lucide-react';
import { useStore } from '../store';
import { WebsiteCard } from './WebsiteCard';
import { AddWebsiteModal } from './AddWebsiteModal';
import { ConfirmDialog } from './ConfirmDialog';
import type { Category } from '../types';
import { getDensityGapClass } from '../utils';

interface CategorySectionProps {
  category: Category;
  isFreeLayout: boolean;
}

// Sortable wrapper for category reordering
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-0 -ml-8 h-full flex items-center cursor-grab active:cursor-grabbing opacity-0 hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-5 h-5 text-gray-400" />
      </div>
      {children}
    </div>
  );
}

export function CategorySection({ category, isFreeLayout }: CategorySectionProps) {
  const { websites, settings, deleteCategory, updateCategory, updateWebsitePosition } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isOver, setIsOver] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const categoryWebsites = websites
    .filter((w) => w.categoryId === category.id)
    .sort((a, b) => a.order - b.order);

  // Droppable for receiving dragged websites
  const droppableId = `droppable-cat-${category.id}`;
  const { setNodeRef: setDroppableRef, isOver: isDroppableOver } = useDroppable({
    id: droppableId,
  });

  // Track hover state locally too for visual feedback
  useEffect(() => {
    setIsOver(isDroppableOver);
  }, [isDroppableOver]);

  const handleSaveEdit = () => {
    if (editName.trim()) {
      updateCategory(category.id, editName.trim());
      setIsEditing(false);
    }
  };

  // Initialize website positions in free mode if they don't have x,y
  useEffect(() => {
    if (!isFreeLayout) return;
    categoryWebsites.forEach((website, index) => {
      if (website.x === undefined || website.y === undefined) {
        // Compute default positions in a grid-like pattern
        const col = index % 4;
        const row = Math.floor(index / 4);
        updateWebsitePosition(website.id, col * 130, row * 110);
      }
    });
  }, [isFreeLayout, categoryWebsites.length]);

  const densityGap = getDensityGapClass(settings.density);

  return (
    <SortableCategory category={category}>
      <div
        ref={(node) => {
          (sectionRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          setDroppableRef(node);
        }}
        className={`mb-8 ${isFreeLayout ? 'relative min-h-[200px]' : ''}`}
      >
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="删除分类"
          message={`确定要删除「${category.name}」分类吗？其中的所有网站也会被删除。此操作不可撤销。`}
          onConfirm={() => { deleteCategory(category.id); setShowDeleteConfirm(false); }}
          onCancel={() => setShowDeleteConfirm(false)}
        />

        {/* Category Header */}
        <div className="flex items-center justify-between mb-4">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSaveEdit}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400"
                autoFocus
              />
            </div>
          ) : (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{category.name}</h2>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="编辑分类"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="删除分类"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="添加网站"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Websites area */}
        {isFreeLayout ? (
          <div
            className={`relative rounded-2xl border-2 border-dashed transition-colors min-h-[80px] ${
              isOver
                ? 'border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30'
            }`}
          >
            {categoryWebsites.map((website) => (
              <WebsiteCard
                key={website.id}
                website={website}
                isFreeLayout={true}
              />
            ))}
            {categoryWebsites.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  {isOver ? '松开放入此分类' : '拖拽网站到这里，或点击 + 添加'}
                </p>
              </div>
            )}
            {isOver && categoryWebsites.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-sm font-medium text-blue-500 bg-white/80 dark:bg-gray-900/80 px-3 py-1 rounded-lg">
                  松开放入此分类
                </p>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 ${densityGap} p-2 rounded-2xl transition-colors ${
              isOver
                ? 'bg-blue-50/50 dark:bg-blue-900/10 ring-2 ring-blue-400 dark:ring-blue-500'
                : ''
            }`}
          >
            {categoryWebsites.map((website) => (
              <WebsiteCard
                key={website.id}
                website={website}
                isFreeLayout={false}
              />
            ))}
          </div>
        )}

        {/* Empty state for grid mode */}
        {!isFreeLayout && categoryWebsites.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">暂无网站</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 underline"
            >
              添加一个
            </button>
          </div>
        )}

        {/* Add Website Modal */}
        <AddWebsiteModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          defaultCategoryId={category.id}
        />
      </div>
    </SortableCategory>
  );
}
