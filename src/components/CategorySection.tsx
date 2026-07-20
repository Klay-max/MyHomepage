import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useStore } from '../store';
import { WebsiteCard } from './WebsiteCard';
import { AddWebsiteModal } from './AddWebsiteModal';
import type { Category } from '../types';
import { getDensityGapClass } from '../utils';

interface CategorySectionProps {
  category: Category;
}

export function CategorySection({ category }: CategorySectionProps) {
  const { websites, settings, reorderWebsites, deleteCategory, updateCategory } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);

  const categoryWebsites = websites
    .filter((w) => w.categoryId === category.id)
    .sort((a, b) => a.order - b.order);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categoryWebsites.findIndex((w) => w.id === active.id);
      const newIndex = categoryWebsites.findIndex((w) => w.id === over.id);
      reorderWebsites(category.id, oldIndex, newIndex);
    }
  };

  const handleSaveEdit = () => {
    if (editName.trim()) {
      updateCategory(category.id, editName.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="mb-8">
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
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900"
              autoFocus
            />
          </div>
        ) : (
          <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
        )}
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="编辑分类"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm('确定要删除这个分类吗？其中的网站也会被删除。')) {
                deleteCategory(category.id);
              }
            }}
            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="删除分类"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            title="添加网站"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Websites Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categoryWebsites.map((w) => w.id)}
          strategy={rectSortingStrategy}
        >
          <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 ${getDensityGapClass(settings.density)}`}>
            {categoryWebsites.map((website) => (
              <WebsiteCard key={website.id} website={website} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Empty State */}
      {categoryWebsites.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-400">暂无网站</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-2 text-sm text-gray-600 hover:text-gray-900 underline"
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
  );
}
