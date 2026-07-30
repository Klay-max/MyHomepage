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
import { ClockWidget } from './components/ClockWidget';
import { AddWebsiteModal } from './components/AddWebsiteModal';
import { SettingsPanel } from './components/SettingsPanel';
import { WebsiteDragPreview } from './components/WebsiteDragPreview';
import { createSnapToGridModifier, GRID_SIZE_X, GRID_SIZE_Y } from './utils';

const getCategoryCanvas = (categoryId: string) =>
  document.querySelector<HTMLElement>(`[data-category-canvas="${categoryId}"]`);

const getCategoryIdAtRect = (rect: { left: number; top: number; width: number; height: number }) => {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const canvases = document.querySelectorAll<HTMLElement>('[data-category-canvas]');

  for (const canvas of canvases) {
    const canvasRect = canvas.getBoundingClientRect();
    if (
      centerX >= canvasRect.left &&
      centerX <= canvasRect.right &&
      centerY >= canvasRect.top &&
      centerY <= canvasRect.bottom
    ) {
      return canvas.dataset.categoryCanvas ?? null;
    }
  }

  return null;
};

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
  const websiteCount = websites.length;
  const categoryCount = categories.length;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require a slightly larger movement before drag starts; prevents
      // accidental drags when the user just means to click.
      activationConstraint: { distance: 10 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const snapModifier = useMemo(
    () => createSnapToGridModifier(GRID_SIZE_X, GRID_SIZE_Y),
    []
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

    // ---- Website drag ----
    if (!isCategory) {
      const website = websites.find(w => w.id === activeIdStr);
      if (!website) return;

      // Category change & grid reorder
      let targetCategoryId = website.categoryId;
      if (over) {
        const overIdStr = String(over.id);

        if (overIdStr.startsWith('droppable-cat-')) {
          targetCategoryId = overIdStr.replace('droppable-cat-', '');
        } else {
          const overWebsite = websites.find(w => w.id === overIdStr);
          if (overWebsite) targetCategoryId = overWebsite.categoryId;
        }

        if (!isFreeLayout) {
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

      if (isFreeLayout) {
        const translatedRect = active.rect.current.translated;
        const rectCategoryId = translatedRect ? getCategoryIdAtRect(translatedRect) : null;
        if (rectCategoryId) targetCategoryId = rectCategoryId;

        const targetCanvas = getCategoryCanvas(targetCategoryId);
        let newCol = website.gridCol ?? 0;
        let newRow = website.gridRow ?? 0;

        if (translatedRect && targetCanvas) {
          const canvasRect = targetCanvas.getBoundingClientRect();
          newCol = Math.max(0, Math.round((translatedRect.left - canvasRect.left) / GRID_SIZE_X));
          newRow = Math.max(0, Math.round((translatedRect.top - canvasRect.top) / GRID_SIZE_Y));
        }

        if (targetCategoryId !== website.categoryId) {
          moveWebsiteToCategory(activeIdStr, targetCategoryId, newCol, newRow);
        } else {
          updateWebsitePosition(activeIdStr, newCol, newRow);
        }
      } else if (targetCategoryId !== website.categoryId) {
        moveWebsiteToCategory(activeIdStr, targetCategoryId);
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
    if (settings.backgroundImage) return '';
    switch (settings.background) {
      case 'white':
        return 'bg-canvas';
      case 'gray':
        return 'bg-canvas';
      case 'gradient':
      default:
        return 'bg-canvas';
    }
  }, [settings.background, settings.backgroundImage]);

  const bgStyle: React.CSSProperties = useMemo(() => {
    if (settings.backgroundImage) {
      return {
        backgroundImage: `url(${settings.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      };
    }
    return {};
  }, [settings.backgroundImage]);

  return (
    <div className={`min-h-screen theme-transition app-chrome ${bgClass}`} style={bgStyle}>
      {settings.backgroundImage && (
        <div className="fixed inset-0 bg-black/40 z-0 pointer-events-none" />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-line-light/60 relative z-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-7 lg:px-10">
          <div className="flex items-center justify-between h-[68px]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-ink text-canvas flex items-center justify-center shadow-sm">
                <Move className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h1 className="text-[15px] sm:text-base font-semibold text-ink leading-tight">MyHomepage</h1>
                <p className="hidden sm:block text-[11px] text-ink-tertiary leading-tight mt-0.5">
                  {websiteCount} sites · {categoryCount} spaces
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <ClockWidget />
              <div className="w-px h-5 bg-line-light mx-1.5" />
              <button
                onClick={toggleLayout}
                className="toolbar-button"
                title={isFreeLayout ? '切换到网格布局' : '切换到自由布局'}
              >
                {isFreeLayout ? <LayoutGrid className="w-[18px] h-[18px]" /> : <Move className="w-[18px] h-[18px]" />}
              </button>
              <button
                onClick={toggleTheme}
                className="toolbar-button"
                title={isDark ? '切换亮色模式' : '切换暗色模式'}
              >
                {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="toolbar-button"
                title="添加网站"
              >
                <Plus className="w-[18px] h-[18px]" />
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="toolbar-button"
                title="设置"
              >
                <Settings className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-7 lg:px-10 py-8 sm:py-10 relative z-10">
        {settings.showSearch && (
          <div className="mb-9 sm:mb-11">
            <div className="max-w-3xl mx-auto">
              <SearchBox />
            </div>
          </div>
        )}

        <div className="flex flex-col xl:flex-row gap-8 lg:gap-10 items-start">
          {/* Left: Categories + Websites */}
          <div className="flex-1 min-w-0 w-full" ref={mainRef}>
            <DndContext
              sensors={sensors}
              collisionDetection={isFreeLayout ? pointerWithin : rectIntersection}
              modifiers={isFreeLayout ? [snapModifier] : undefined}
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
                className="w-full py-4 rounded-2xl border border-dashed border-line text-ink-secondary hover:border-accent hover:text-ink hover:bg-surface/50 transition-all flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
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
                  className="flex-1 px-5 py-3.5 rounded-xl bg-surface border border-line text-ink placeholder-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  autoFocus
                />
                <button
                  onClick={handleAddCategory}
                  className="px-6 py-3.5 rounded-xl bg-accent text-white font-medium hover:bg-accent-hover transition-all"
                >
                  添加
                </button>
                <button
                  onClick={() => {
                    setShowNewCategory(false);
                    setNewCategoryName('');
                  }}
                  className="px-5 py-3.5 rounded-xl text-ink-secondary hover:bg-surface-hover transition-all"
                >
                  取消
                </button>
              </div>
            )}
          </div>

          {/* Right: Todo Widget */}
          {settings.showTodo && (
            <div className="w-full xl:w-80 shrink-0">
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
