import { useState } from 'react';
import { X, Plus, Globe } from 'lucide-react';
import { useStore } from '../store';
import { isValidUrl, normalizeUrl } from '../utils';

interface AddWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategoryId?: string;
}

export function AddWebsiteModal({ isOpen, onClose, defaultCategoryId }: AddWebsiteModalProps) {
  const { categories, addWebsite, addCategory } = useStore();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [categoryId, setCategoryId] = useState(defaultCategoryId || categories[0]?.id || '');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalCategoryId = categoryId;

    if (showNewCategory && newCategoryName.trim()) {
      finalCategoryId = addCategory(newCategoryName.trim());
    }

    const normalizedUrl = normalizeUrl(url);

    if (name.trim() && isValidUrl(normalizedUrl)) {
      addWebsite({
        name: name.trim(),
        url: normalizedUrl,
        categoryId: finalCategoryId,
      });

      setName('');
      setUrl('');
      setNewCategoryName('');
      setShowNewCategory(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm dark:bg-black/60"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-surface rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-line-light">
          <h2 className="text-lg font-semibold text-ink tracking-tight">添加网站</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-hover transition-all"
          >
            <X className="w-5 h-5 text-ink-secondary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              网站名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：GitHub"
              className="w-full px-4 py-3 rounded-xl bg-surface-hover border border-line-light text-ink placeholder-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              网址
            </label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="github.com 或 https://github.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-hover border border-line-light text-ink placeholder-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              分类
            </label>

            {!showNewCategory ? (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      categoryId === cat.id
                        ? 'bg-accent text-white'
                        : 'bg-surface-hover text-ink-secondary hover:bg-line-light'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowNewCategory(true)}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-transparent text-ink-secondary hover:bg-surface-hover border border-dashed border-line transition-all"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  新建
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="输入新分类名称"
                  className="flex-1 px-4 py-3 rounded-xl bg-surface-hover border border-line-light text-ink placeholder-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategory(false);
                    setNewCategoryName('');
                  }}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-ink-secondary hover:bg-surface-hover transition-all"
                >
                  取消
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-accent text-white font-medium hover:bg-accent-hover active:scale-[0.98] transition-all"
          >
            添加
          </button>
        </form>
      </div>
    </div>
  );
}
