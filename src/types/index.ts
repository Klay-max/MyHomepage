// Website types
export interface Website {
  id: string;
  name: string;
  url: string;
  icon?: string;
  categoryId: string;
  order: number;
  x?: number;
  y?: number;
}

export interface Category {
  id: string;
  name: string;
  order: number;
}

// Todo types
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

// Settings types
export type IconSize = 'small' | 'medium' | 'large';
export type Density = 'compact' | 'comfortable' | 'spacious';
export type Theme = 'light' | 'dark' | 'system';
export type SearchEngine = 'baidu' | 'google' | 'bing';

export type LayoutMode = 'grid' | 'free';

export interface Settings {
  iconSize: IconSize;
  density: Density;
  background: string;
  theme: Theme;
  searchEngine: SearchEngine;
  layoutMode: LayoutMode;
  showSearch: boolean;
  showTodo: boolean;
}

// App state
export interface AppState {
  // Websites
  websites: Website[];
  categories: Category[];
  addWebsite: (website: Omit<Website, 'id' | 'order'>) => void;
  updateWebsite: (id: string, updates: Partial<Website>) => void;
  deleteWebsite: (id: string) => void;
  reorderWebsites: (categoryId: string, oldIndex: number, newIndex: number) => void;
  moveWebsite: (activeId: string, overId: string) => void;
  updateWebsitePosition: (id: string, x: number, y: number) => void;
  moveWebsiteToCategory: (id: string, categoryId: string) => void;
  
  // Categories
  addCategory: (name: string) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (oldIndex: number, newIndex: number) => void;
  
  // Todos
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  
  // Settings
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Website[];
}
