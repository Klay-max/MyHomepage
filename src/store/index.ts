import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Website, Category, Todo } from '../types';
import { GRID_SIZE_X, GRID_SIZE_Y } from '../utils';

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Default categories
const defaultCategories: Category[] = [
  { id: 'work', name: '工作', order: 0 },
  { id: 'learn', name: '学习', order: 1 },
  { id: 'tools', name: '工具', order: 2 },
  { id: 'entertainment', name: '娱乐', order: 3 },
];

// Default websites
const defaultWebsites: Website[] = [
  { id: '1', name: 'GitHub', url: 'https://github.com', categoryId: 'work', order: 0 },
  { id: '2', name: 'Vercel', url: 'https://vercel.com', categoryId: 'work', order: 1 },
  { id: '3', name: 'DeepSeek', url: 'https://chat.deepseek.com', categoryId: 'tools', order: 0 },
  { id: '4', name: 'Bilibili', url: 'https://www.bilibili.com', categoryId: 'entertainment', order: 0 },
  { id: '5', name: '知乎', url: 'https://www.zhihu.com', categoryId: 'learn', order: 0 },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      websites: defaultWebsites,
      categories: defaultCategories,
      todos: [],
      settings: {
        iconSize: 'medium',
        density: 'comfortable',
        background: 'gradient',
        theme: 'system',
        searchEngine: 'baidu',
        layoutMode: 'free',
        showSearch: true,
        showTodo: true,
      },
      collapsedCategories: [] as string[],
      searchQuery: '',
      searchResults: [],

      // Website actions
      addWebsite: (website) => {
        const websites = get().websites;
        const maxOrder = Math.max(...websites.filter(w => w.categoryId === website.categoryId).map(w => w.order), -1);
        const newWebsite: Website = {
          ...website,
          id: generateId(),
          order: maxOrder + 1,
        };
        set({ websites: [...websites, newWebsite] });
      },

      updateWebsite: (id, updates) => {
        set({
          websites: get().websites.map(w => w.id === id ? { ...w, ...updates } : w),
        });
      },

      deleteWebsite: (id) => {
        set({ websites: get().websites.filter(w => w.id !== id) });
      },

      reorderWebsites: (categoryId, oldIndex, newIndex) => {
        const allWebsites = get().websites;
        const categoryWebsites = allWebsites.filter(w => w.categoryId === categoryId);
        const otherWebsites = allWebsites.filter(w => w.categoryId !== categoryId);
        
        const newCategoryWebsites = [...categoryWebsites];
        const [moved] = newCategoryWebsites.splice(oldIndex, 1);
        newCategoryWebsites.splice(newIndex, 0, moved);
        
        const reordered = newCategoryWebsites.map((w, i) => ({ ...w, order: i }));
        
        set({ websites: [...otherWebsites, ...reordered] });
      },

      moveWebsite: (activeId, overId) => {
        const { websites } = get();
        const active = websites.find(w => w.id === activeId);
        const over = websites.find(w => w.id === overId);
        if (!active || !over || active.id === over.id) return;

        const isSameCategory = active.categoryId === over.categoryId;
        const newCategoryId = over.categoryId;

        const result: Website[] = [];
        const categoryIds = [...new Set(websites.map(w => w.categoryId))];

        for (const catId of categoryIds) {
          if (catId === newCategoryId) {
            if (isSameCategory) {
              const catWebsites = websites
                .filter(w => w.categoryId === catId)
                .sort((a, b) => a.order - b.order);
              const oldIndex = catWebsites.findIndex(w => w.id === activeId);
              const newIndex = catWebsites.findIndex(w => w.id === overId);
              const reordered = [...catWebsites];
              const [moved] = reordered.splice(oldIndex, 1);
              reordered.splice(newIndex, 0, moved);
              result.push(...reordered.map((w, i) => ({ ...w, order: i })));
            } else {
              const catWebsites = websites
                .filter(w => w.categoryId === catId && w.id !== activeId)
                .sort((a, b) => a.order - b.order);
              const insertIndex = catWebsites.findIndex(w => w.id === overId);
              const reordered = [...catWebsites];
              reordered.splice(insertIndex, 0, { ...active, categoryId: newCategoryId });
              result.push(...reordered.map((w, i) => ({ ...w, order: i })));
            }
          } else if (catId === active.categoryId && !isSameCategory) {
            const catWebsites = websites
              .filter(w => w.categoryId === catId && w.id !== activeId)
              .sort((a, b) => a.order - b.order);
            result.push(...catWebsites.map((w, i) => ({ ...w, order: i })));
          } else {
            const catWebsites = websites
              .filter(w => w.categoryId === catId)
              .sort((a, b) => a.order - b.order);
            result.push(...catWebsites);
          }
        }

        set({ websites: result });
      },

      updateWebsitePosition: (id, gridCol, gridRow) => {
        set({
          websites: get().websites.map(w =>
            w.id === id ? { ...w, gridCol, gridRow } : w
          ),
        });
      },

      moveWebsiteToCategory: (id, categoryId, gridCol, gridRow) => {
        const websites = get().websites;
        const targetCategoryWebsites = websites.filter(w => w.categoryId === categoryId);
        const maxOrder = Math.max(...targetCategoryWebsites.map(w => w.order), -1);
        const positionUpdates = gridCol !== undefined && gridRow !== undefined
          ? { gridCol, gridRow }
          : {};
        set({
          websites: websites.map(w => w.id === id
            ? { ...w, categoryId, order: maxOrder + 1, ...positionUpdates }
            : w
          ),
        });
      },

      // Category actions
      addCategory: (name) => {
        const categories = get().categories;
        const maxOrder = Math.max(...categories.map(c => c.order), -1);
        const newCategory: Category = {
          id: generateId(),
          name,
          order: maxOrder + 1,
        };
        set({ categories: [...categories, newCategory] });
        return newCategory.id;
      },

      updateCategory: (id, name) => {
        set({
          categories: get().categories.map(c => c.id === id ? { ...c, name } : c),
        });
      },

      deleteCategory: (id) => {
        const websites = get().websites.filter(w => w.categoryId !== id);
        set({
          categories: get().categories.filter(c => c.id !== id),
          websites,
        });
      },

      reorderCategories: (oldIndex, newIndex) => {
        const categories = [...get().categories];
        const [moved] = categories.splice(oldIndex, 1);
        categories.splice(newIndex, 0, moved);
        set({ categories: categories.map((c, i) => ({ ...c, order: i })) });
      },

      toggleCategoryCollapse: (id) => {
        const collapsed = get().collapsedCategories;
        const newCollapsed = collapsed.includes(id)
          ? collapsed.filter(c => c !== id)
          : [...collapsed, id];
        set({ collapsedCategories: newCollapsed });
      },

      // Todo actions
      addTodo: (text) => {
        const newTodo: Todo = {
          id: generateId(),
          text,
          completed: false,
          createdAt: Date.now(),
        };
        set({ todos: [...get().todos, newTodo] });
      },

      toggleTodo: (id) => {
        set({
          todos: get().todos.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        });
      },

      deleteTodo: (id) => {
        set({ todos: get().todos.filter(t => t.id !== id) });
      },

      // Settings actions
      updateSettings: (settings) => {
        set({ settings: { ...get().settings, ...settings } });
      },

      // Search actions
      setSearchQuery: (query) => {
        const websites = get().websites;
        const results = query
          ? websites.filter(w =>
              w.name.toLowerCase().includes(query.toLowerCase()) ||
              w.url.toLowerCase().includes(query.toLowerCase())
            )
          : [];
        set({ searchQuery: query, searchResults: results });
      },

      // Import data
      importData: (data) => {
        set({
          websites: data.websites,
          categories: data.categories,
          todos: data.todos || [],
        });
      },
    }),
    {
      name: 'myhomepage-storage',
      version: 3,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Record<string, unknown>;
        const settings = (state?.settings ?? {}) as Record<string, unknown>;

        // v1 → v2: default to free layout
        if (version < 2 && settings.layoutMode !== 'free') {
          settings.layoutMode = 'free';
        }

        // v2 → v3: convert x/y pixels to gridCol/gridRow
        if (version < 3) {
          const websites = (state?.websites ?? []) as Array<Record<string, unknown>>;
          for (const w of websites) {
            if (w.x !== undefined || w.y !== undefined) {
              const x = (w.x as number) ?? 0;
              const y = (w.y as number) ?? 0;
              w.gridCol = Math.round(x / GRID_SIZE_X);
              w.gridRow = Math.round(y / GRID_SIZE_Y);
              delete w.x;
              delete w.y;
            }
          }
          state.websites = websites;
        }

        state.settings = settings;
        return state;
      },
      partialize: (state) => {
        const { searchQuery, searchResults, ...rest } = state;
        return rest;
      },
    }
  )
);
