import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Website, Category, Todo } from '../types';

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
        showSearch: true,
        showTodo: true,
      },
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
        const websites = get().websites.filter(w => w.categoryId === categoryId);
        const otherWebsites = get().websites.filter(w => w.categoryId !== categoryId);
        const [moved] = websites.splice(oldIndex, 1);
        websites.splice(newIndex, 0, moved);
        const reordered = websites.map((w, i) => ({ ...w, order: i }));
        set({ websites: [...otherWebsites, ...reordered] });
      },

      moveWebsite: (activeId, overId) => {
        const { websites } = get();
        const active = websites.find(w => w.id === activeId);
        const over = websites.find(w => w.id === overId);
        if (!active || !over) return;

        const newCategoryId = active.categoryId === over.categoryId
          ? active.categoryId
          : over.categoryId;

        // Build new websites array grouped by category
        const categoryIds = [...new Set(websites.map(w => w.categoryId))];
        const result: Website[] = [];

        for (const catId of categoryIds) {
          // Get all websites in this category, excluding the one being moved
          const catWebsites = websites
            .filter(w => w.categoryId === catId && w.id !== activeId);

          if (catId === newCategoryId) {
            // Insert the moved website at the target position
            const insertIndex = catWebsites.findIndex(w => w.id === overId);
            catWebsites.splice(insertIndex, 0, { ...active, categoryId: newCategoryId });
          }

          // Re-index
          catWebsites.forEach((w, i) => { w.order = i; });
          result.push(...catWebsites);
        }

        set({ websites: result });
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
    }),
    {
      name: 'myhomepage-storage',
    }
  )
);
