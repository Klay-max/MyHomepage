import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Website, Category, Todo } from '../types';
import { GRID_SIZE_X, GRID_SIZE_Y } from '../utils';

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Default categories — from user's browser bookmarks (2026-07-29)
const defaultCategories: Category[] = [
  { id: 'ugc', name: 'UGC', order: 0 },
  { id: 'aigc-w', name: 'AIGC-W', order: 1 },
  { id: 'aigc-t', name: 'AIGC-T', order: 2 },
  { id: 'aigc-r', name: 'AIGC-R', order: 3 },
  { id: 'aigc-v', name: 'AIGC-V', order: 4 },
  { id: 'work', name: 'Work', order: 5 },
];

// Columns per row in free-layout mode (130px each → 650px for 5 cols, fits beside todo widget)
const COLS_PER_ROW = 5;

// Helper: assign grid positions within each category
function withGridPositions(raw: Array<Omit<Website, 'gridCol' | 'gridRow'>>): Website[] {
  const byCat: Record<string, typeof raw> = {};
  for (const w of raw) (byCat[w.categoryId] ??= []).push(w);
  const result: Website[] = [];
  for (const catId of Object.keys(byCat)) {
    byCat[catId]
      .sort((a, b) => a.order - b.order)
      .forEach((w, i) => {
        result.push({ ...w, gridCol: i % COLS_PER_ROW, gridRow: Math.floor(i / COLS_PER_ROW) });
      });
  }
  return result;
}

// Default websites — from user's browser bookmarks (2026-07-29)
const defaultWebsites: Website[] = withGridPositions([
  // UGC
  { id: 'w1', name: 'AI', url: 'http://www.anjianzhao.online/', categoryId: 'ugc', order: 0 },
  { id: 'w2', name: '哔哩哔哩', url: 'https://www.bilibili.com/', categoryId: 'ugc', order: 1 },
  { id: 'w3', name: 'YouTube', url: 'https://www.youtube.com/', categoryId: 'ugc', order: 2 },
  // AIGC-W (AI Writing/Chat)
  { id: 'w4', name: 'G-Gemini', url: 'https://gemini.google.com/', categoryId: 'aigc-w', order: 0 },
  { id: 'w5', name: 'G-Notebook', url: 'https://notebooklm.google.com/', categoryId: 'aigc-w', order: 1 },
  { id: 'w6', name: 'G-Google', url: 'https://myaccount.google.com/', categoryId: 'aigc-w', order: 2 },
  { id: 'w7', name: 'G-Gmail', url: 'https://mail.google.com/', categoryId: 'aigc-w', order: 3 },
  { id: 'w8', name: 'G-Drive', url: 'https://drive.google.com/drive/home', categoryId: 'aigc-w', order: 4 },
  { id: 'w9', name: 'G-Cloud', url: 'https://console.cloud.google.com/', categoryId: 'aigc-w', order: 5 },
  { id: 'w10', name: 'G-AI Studio', url: 'https://aistudio.google.com/prompts/new_chat', categoryId: 'aigc-w', order: 6 },
  { id: 'w11', name: 'ChatGPT', url: 'https://chatgpt.com/', categoryId: 'aigc-w', order: 7 },
  { id: 'w12', name: 'Claude', url: 'https://claude.ai/new', categoryId: 'aigc-w', order: 8 },
  { id: 'w13', name: 'Perplexity', url: 'https://www.perplexity.ai/', categoryId: 'aigc-w', order: 9 },
  { id: 'w14', name: '字节豆包', url: 'https://www.doubao.com/chat/', categoryId: 'aigc-w', order: 10 },
  { id: 'w15', name: '阿里千问', url: 'https://tongyi.aliyun.com/qianwen/', categoryId: 'aigc-w', order: 11 },
  { id: 'w16', name: '腾讯元宝', url: 'https://yuanbao.tencent.com/', categoryId: 'aigc-w', order: 12 },
  { id: 'w17', name: 'DeepSeek', url: 'https://chat.deepseek.com/', categoryId: 'aigc-w', order: 13 },
  // AIGC-T (AI Tools/Platforms)
  { id: 'w18', name: 'Coze', url: 'https://code.coze.cn/', categoryId: 'aigc-t', order: 0 },
  { id: 'w19', name: 'N8N', url: 'https://darwin152140.app.n8n.cloud/home/workflows', categoryId: 'aigc-t', order: 1 },
  { id: 'w20', name: 'Dify', url: 'https://cloud.dify.ai/apps', categoryId: 'aigc-t', order: 2 },
  { id: 'w21', name: 'AWS', url: 'https://us-east-1.console.aws.amazon.com/', categoryId: 'aigc-t', order: 3 },
  { id: 'w22', name: '阿里云', url: 'https://bailian.console.aliyun.com/', categoryId: 'aigc-t', order: 4 },
  { id: 'w23', name: '字节云', url: 'https://console.volcengine.com/ark/', categoryId: 'aigc-t', order: 5 },
  { id: 'w24', name: '腾讯云', url: 'https://cloud.tencent.com/', categoryId: 'aigc-t', order: 6 },
  { id: 'w25', name: 'AnythingLLM', url: 'https://anythingllm.com/', categoryId: 'aigc-t', order: 7 },
  { id: 'w26', name: 'Chatbox', url: 'https://chatboxai.app/en', categoryId: 'aigc-t', order: 8 },
  { id: 'w27', name: 'Kiro', url: 'https://kiro.dev/', categoryId: 'aigc-t', order: 9 },
  { id: 'w28', name: 'Cursor', url: 'https://cursor.com/en', categoryId: 'aigc-t', order: 10 },
  { id: 'w29', name: 'Trae', url: 'https://www.trae.cn/', categoryId: 'aigc-t', order: 11 },
  // AIGC-R (AI Resources/Dev)
  { id: 'w30', name: 'CYLINK', url: 'https://2cy.io/user', categoryId: 'aigc-r', order: 0 },
  { id: 'w31', name: 'Hero-sms', url: 'https://hero-sms.com/cn', categoryId: 'aigc-r', order: 1 },
  { id: 'w32', name: 'Vercel', url: 'https://vercel.com/', categoryId: 'aigc-r', order: 2 },
  { id: 'w33', name: 'Expo', url: 'https://expo.dev/', categoryId: 'aigc-r', order: 3 },
  { id: 'w34', name: 'GitHub', url: 'https://github.com/', categoryId: 'aigc-r', order: 4 },
  { id: 'w35', name: 'Hugging Face', url: 'https://huggingface.co/', categoryId: 'aigc-r', order: 5 },
  { id: 'w36', name: 'Docker', url: 'https://www.docker.com/', categoryId: 'aigc-r', order: 6 },
  { id: 'w37', name: 'Ollama', url: 'https://ollama.com/', categoryId: 'aigc-r', order: 7 },
  { id: 'w38', name: 'Typora', url: 'https://typoraio.cn/', categoryId: 'aigc-r', order: 8 },
  { id: 'w39', name: 'Python', url: 'https://www.python.org/', categoryId: 'aigc-r', order: 9 },
  { id: 'w40', name: 'Node.js', url: 'https://nodejs.org/zh-cn/', categoryId: 'aigc-r', order: 10 },
  // AIGC-V (AI Video/Image)
  { id: 'w41', name: 'Sora', url: 'https://sora.chatgpt.com/explore', categoryId: 'aigc-v', order: 0 },
  { id: 'w42', name: 'Runway', url: 'https://app.runwayml.com/', categoryId: 'aigc-v', order: 1 },
  { id: 'w43', name: 'PixVerse', url: 'https://app.pixverse.ai/home', categoryId: 'aigc-v', order: 2 },
  { id: 'w44', name: 'HeyGen', url: 'https://app.heygen.com/home', categoryId: 'aigc-v', order: 3 },
  { id: 'w45', name: 'D-ID', url: 'https://studio.d-id.com/', categoryId: 'aigc-v', order: 4 },
  { id: 'w46', name: '即梦AI', url: 'https://jimeng.jianying.com/', categoryId: 'aigc-v', order: 5 },
  { id: 'w47', name: '可灵 AI', url: 'https://app.klingai.com/cn/', categoryId: 'aigc-v', order: 6 },
  { id: 'w48', name: 'Vidu AI', url: 'https://www.vidu.cn/create', categoryId: 'aigc-v', order: 7 },
  { id: 'w49', name: '海螺视频', url: 'https://hailuoai.com/video', categoryId: 'aigc-v', order: 8 },
  { id: 'w50', name: '通义万相', url: 'https://tongyi.aliyun.com/wanxiang/', categoryId: 'aigc-v', order: 9 },
  { id: 'w51', name: 'ComfyUI', url: 'https://www.comfy.org/zh-cn/gallery', categoryId: 'aigc-v', order: 10 },
  // Work
  { id: 'w52', name: '发现报告', url: 'https://www.fxbaogao.com/', categoryId: 'work', order: 0 },
  { id: 'w53', name: '学科网', url: 'https://www.zxxk.com/', categoryId: 'work', order: 1 },
  { id: 'w54', name: '组卷网', url: 'https://zujuan.xkw.com/', categoryId: 'work', order: 2 },
  { id: 'w55', name: 'LMSCB', url: 'https://lmyt.cn6.quickconnect.cn/', categoryId: 'work', order: 3 },
  { id: 'w56', name: '菁优网', url: 'https://658920.jyeoo.com/manage', categoryId: 'work', order: 4 },
  { id: 'w57', name: '北极星后台', url: 'https://ls.51polestar.com/', categoryId: 'work', order: 5 },
  { id: 'w58', name: '北极星', url: 'https://pt2.51polestar.com/login', categoryId: 'work', order: 6 },
  { id: 'w59', name: '智学通', url: 'https://super-zxt-student.chuangke100.com/login', categoryId: 'work', order: 7 },
  { id: 'w60', name: '智学通后台', url: 'https://super-zxt-manage.chuangke100.com/login', categoryId: 'work', order: 8 },
]);

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
      version: 6,
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

        // v3 → v4: replace default data with user's full bookmark set
        if (version < 4) {
          state.categories = defaultCategories;
          state.websites = defaultWebsites;
        }

        // v4 → v5: re-seed data with pre-computed grid positions
        if (version < 5) {
          state.categories = defaultCategories;
          state.websites = defaultWebsites;
        }

        // v5 → v6: recompute grid positions with 5 columns (better fit beside todo widget)
        if (version < 6) {
          const websites = (state?.websites ?? []) as Website[];
          const byCat: Record<string, Website[]> = {};
          for (const w of websites) (byCat[w.categoryId] ??= []).push(w);
          const result: Website[] = [];
          for (const catId of Object.keys(byCat)) {
            byCat[catId]
              .sort((a, b) => a.order - b.order)
              .forEach((w, i) => {
                result.push({ ...w, gridCol: i % COLS_PER_ROW, gridRow: Math.floor(i / COLS_PER_ROW) });
              });
          }
          state.websites = result;
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
