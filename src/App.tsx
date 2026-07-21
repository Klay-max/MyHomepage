import { useState } from 'react';
import { Plus, Settings } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useStore } from './store';
import { SearchBox } from './components/SearchBox';
import { CategorySection } from './components/CategorySection';
import { TodoWidget } from './components/TodoWidget';
import { AddWebsiteModal } from './components/AddWebsiteModal';
import { SettingsPanel } from './components/SettingsPanel';

function App() {
  const { categories, websites, settings, reorderCategories, moveWebsite, addCategory } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Check if dragging a category or a website
    const isCategory = categories.some(c => c.id === active.id);
    const isWebsite = websites.some(w => w.id === active.id);

    if (isCategory) {
      // Reorder categories
      const oldIndex = sortedCategories.findIndex(c => c.id === active.id);
      const newIndex = sortedCategories.findIndex(c => c.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderCategories(oldIndex, newIndex);
      }
    } else if (isWebsite) {
      // Move/reorder website (supports cross-category drag)
      moveWebsite(String(active.id), String(over.id));
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowNewCategory(false);
    }
  };

  // Background class based on settings
  const getBackgroundClass = () => {
    switch (settings.background) {
      case 'white':
        return 'bg-white';
      case 'gray':
        return 'bg-gray-50';
      case 'gradient':
      default:
        return 'bg-gradient-to-br from-gray-50 to-gray-100';
    }
  };

  return (
    <div className={`min-h-screen ${getBackgroundClass()} transition-colors duration-500`}>
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">MyHomepage</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="p-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                title="添加网站"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                title="设置"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Box */}
        {settings.showSearch && (
          <div className="mb-12">
            <SearchBox />
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Categories */}
          <div className="flex-1">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedCategories.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {sortedCategories.map((category) => (
                  <CategorySection key={category.id} category={category} />
                ))}
              </SortableContext>
            </DndContext>

            {/* Add Category Button */}
            {!showNewCategory ? (
              <button
                onClick={() => setShowNewCategory(true)}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                新建分类
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  placeholder="输入分类名称"
                  className="flex-1 px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  autoFocus
                />
                <button
                  onClick={handleAddCategory}
                  className="px-6 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
                >
                  添加
                </button>
                <button
                  onClick={() => {
                    setShowNewCategory(false);
                    setNewCategoryName('');
                  }}
                  className="px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  取消
                </button>
              </div>
            )}
          </div>

          {/* Right: Todo Widget */}
          {settings.showTodo && (
            <div className="lg:w-80">
              <div className="sticky top-24">
                <TodoWidget />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AddWebsiteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
