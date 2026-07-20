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
    
    // Create new category if needed
    if (showNewCategory && newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      // Get the newly created category (it will be the last one)
      const newCategories = useStore.getState().categories;
      finalCategoryId = newCategories[newCategories.length - 1].id;
    }

    const normalizedUrl = normalizeUrl(url);
    
    if (name.trim() && isValidUrl(normalizedUrl)) {
      addWebsite({
        name: name.trim(),
        url: normalizedUrl,
        categoryId: finalCategoryId,
      });
      
      // Reset form
      setName('');
      setUrl('');
      setNewCategoryName('');
      setShowNewCategory(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">添加网站</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              网站名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：GitHub"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
              required
            />
          </div>

          {/* URL input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              网址
            </label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="github.com 或 https://github.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分类
            </label>
            
            {!showNewCategory ? (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      categoryId === cat.id
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowNewCategory(true)}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-50 text-gray-500 hover:bg-gray-100 border border-dashed border-gray-300 transition-all"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  新建分类
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="输入新分类名称"
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategory(false);
                    setNewCategoryName('');
                  }}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-all"
                >
                  取消
                </button>
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 active:scale-95 transition-all"
          >
            添加
          </button>
        </form>
      </div>
    </div>
  );
}
