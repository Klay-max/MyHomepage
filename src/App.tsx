import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Plus, Settings, Sun, Moon, LayoutGrid, Move } from 'lucide-react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useStore } from './store';
import { SearchBox } from './components/SearchBox';
import { CategorySection } from './components/CategorySection';
import { TodoWidget } from './components/TodoWidget';
import { AddWebsiteModal } from './components/AddWebsiteModal';
import { SettingsPanel } from './components/SettingsPanel';
import { WebsiteDragPreview } from './components/WebsiteDragPreview';

function App() {
  const { categories, settings, websites, reorderCategories, addCategory, updateSettings, updateWebsitePosition, moveWebsiteToCategory, reorderWebsites } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const isFreeLayout = settings.layoutMode === 'free';

  // Theme management
  const isDark = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    if (settings.theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => document.documentElement.classList.toggle('dark', mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [settings.theme]);

  const toggleTheme = useCallback(() => {
    updateSettings({ theme: isDark ? 'light' : 'dark' });
  }, [isDark, updateSettings]);

  const toggleLayout = useCallback(() => {
    updateSettings({ layoutMode: isFreeLayout ? 'grid' : 'free' });
  }, [isFreeLayout, updateSettings]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (e.key === '/' && !isInput) {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('input[type="text"]');
        searchInput?.focus();
        return;
      }

      if (e.key === 'Escape') {
        if (isAddModalOpen) { setIsAddModalOpen(false); return; }
        if (isSettingsOpen) { setIsSettingsOpen(false); return; }
        if (showNewCategory) { setShowNewCategory(false); setNewCategoryName(''); return; }
        return;
      }

      if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen(true);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isAddModalOpen, isSettingsOpen, showNewCategory]);

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Find the active website for drag overlay
  const activeWebsite = activeId ? websites.find(w => w.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    const activeIdStr = String(active.id);
    const isCategory = sortedCategories.some(c => c.id === activeIdStr);

    // ---- Website drag: ALWAYS update position, regardless of "over" ----
    if (!isCategory) {
      const website = websites.find(w => w.id === activeIdStr);
      if (website) {
        const delta = event.delta;
        const newX = (website.x ?? 0) + delta.x;
        const newY = (website.y ?? 0) + delta.y;
        updateWebsitePosition(activeIdStr, newX, newY);

        // Handle category change + grid reorder (only when dropped on a target)
        if (over) {
          const overIdStr = String(over.id);
          let targetCategoryId = website.categoryId;

          if (overIdStr.startsWith('droppable-cat-')) {
            targetCategoryId = overIdStr.replace('droppable-cat-', '');
          } else {
            const overWebsite = websites.find(w => w.id === overIdStr);
            if (overWebsite) {
              targetCategoryId = overWebsite.categoryId;
            }
          }

          if (targetCategoryId !== website.categoryId) {
            moveWebsiteToCategory(activeIdStr, targetCategoryId);
          } else if (!isFreeLayout) {
            // Grid mode: reorder within same category
            const catWebsites = websites
              .filter(w => w.categoryId === targetCategoryId)
              .sort((a, b) => a.order - b.order);
            const activeIdx = catWebsites.findIndex(w => w.id === activeIdStr);
            const overIdx = catWebsites.findIndex(w => w.id === overIdStr);
            if (activeIdx !== -1 && overIdx !== -1 && activeIdx !== overIdx) {
              reorderWebsites(targetCategoryId, activeIdx, overIdx);
            }
          }
        }
      }
      return;
    }

    // ---- Category drag: reorder ----
    if (!over) return;
    const overIdStr = String(over.id);
    const oldIndex = sortedCategories.findIndex(c => c.id === activeIdStr);
    const newIndex = sortedCategories.findIndex(c => c.id === overIdStr);
    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      reorderCategories(oldIndex, newIndex);
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowNewCategory(false);
    }
  };

  const bgClass = useMemo(() => {
    switch (settings.background) {
      case 'white':
        return 'bg-white dark:bg-gray-950';
      case 'gray':
        return 'bg-gray-50 dark:bg-gray-900';
      case 'gradient':
      default:
        return 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900';
    }
  }, [settings.background]);

  // Initialize positions for websites without x,y in free mode
  useEffect(() => {
    if (!isFreeLayout) return;
    // Websites without positions will get computed positions on first render
  }, [isFreeLayout]);

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-500`}>
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">MyHomepage</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLayout}
                className="p-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={isFreeLayout ? '切换到网格布局' : '切换到自由布局'}
              >
                {isFreeLayout ? <LayoutGrid className="w-5 h-5" /> : <Move className="w-5 h-5" />}
              </button>
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={isDark ? '切换亮色模式' : '切换暗色模式'}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="p-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="添加网站"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 transition-colors"
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
        {settings.showSearch && (
          <div className="mb-12">
            <SearchBox />
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Categories + Websites */}
          <div className="flex-1" ref={mainRef}>
            <DndContext
              sensors={sensors}
              collisionDetection={isFreeLayout ? pointerWithin : rectIntersection}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedCategories.map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {sortedCategories.map((category) => (
                  <CategorySection
                    key={category.id}
                    category={category}
                    isFreeLayout={isFreeLayout}
                  />
                ))}
              </SortableContext>

              <DragOverlay dropAnimation={null}>
                {activeWebsite && (
                  <WebsiteDragPreview website={activeWebsite} />
                )}
              </DragOverlay>
            </DndContext>

            {/* Add Category Button */}
            {!showNewCategory ? (
              <button
                onClick={() => setShowNewCategory(true)}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center justify-center gap-2"
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
                  className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400"
                  autoFocus
                />
                <button
                  onClick={handleAddCategory}
                  className="px-6 py-3 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  添加
                </button>
                <button
                  onClick={() => {
                    setShowNewCategory(false);
                    setNewCategoryName('');
                  }}
                  className="px-4 py-3 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
