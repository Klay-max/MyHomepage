import { X, LayoutGrid, Type, Palette, CheckSquare, Sun, Moon, Monitor, Search, Move } from 'lucide-react';
import { useStore } from '../store';
import type { IconSize, Density, Theme, SearchEngine, LayoutMode } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { settings, updateSettings } = useStore();

  if (!isOpen) return null;

  const iconSizes: { value: IconSize; label: string }[] = [
    { value: 'small', label: '小' },
    { value: 'medium', label: '中' },
    { value: 'large', label: '大' },
  ];

  const densities: { value: Density; label: string }[] = [
    { value: 'compact', label: '紧凑' },
    { value: 'comfortable', label: '舒适' },
    { value: 'spacious', label: '宽松' },
  ];

  const backgrounds = [
    { value: 'gradient', label: '渐变', class: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800' },
    { value: 'white', label: '纯白', class: 'bg-white dark:bg-gray-900' },
    { value: 'gray', label: '浅灰', class: 'bg-gray-50 dark:bg-gray-800' },
  ];

  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: '亮色', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: '暗色', icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: '跟随系统', icon: <Monitor className="w-4 h-4" /> },
  ];

  const searchEngines: { value: SearchEngine; label: string }[] = [
    { value: 'baidu', label: '百度' },
    { value: 'google', label: 'Google' },
    { value: 'bing', label: 'Bing' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm dark:bg-black/60"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">设置</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Icon Size */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <LayoutGrid className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">图标大小</h3>
            </div>
            <div className="flex gap-2">
              {iconSizes.map((size) => (
                <button
                  key={size.value}
                  onClick={() => updateSettings({ iconSize: size.value })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    settings.iconSize === size.value
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Density */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">显示密度</h3>
            </div>
            <div className="flex gap-2">
              {densities.map((density) => (
                <button
                  key={density.value}
                  onClick={() => updateSettings({ density: density.value })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    settings.density === density.value
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {density.label}
                </button>
              ))}
            </div>
          </div>

          {/* Background */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">背景样式</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {backgrounds.map((bg) => (
                <button
                  key={bg.value}
                  onClick={() => updateSettings({ background: bg.value })}
                  className={`relative h-20 rounded-2xl border-2 transition-all overflow-hidden ${
                    settings.background === bg.value
                      ? 'border-gray-900 dark:border-gray-100'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className={`absolute inset-0 ${bg.class}`} />
                  {settings.background === bg.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-gray-900 dark:bg-gray-100 flex items-center justify-center">
                        <CheckSquare className="w-3.5 h-3.5 text-white dark:text-gray-900" />
                      </div>
                    </div>
                  )}
                  <span className="absolute bottom-2 left-0 right-0 text-center text-xs font-medium text-gray-700 dark:text-gray-300">
                    {bg.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Moon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">显示主题</h3>
            </div>
            <div className="flex gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => updateSettings({ theme: theme.value })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    settings.theme === theme.value
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {theme.icon}
                  {theme.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Engine */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">默认搜索引擎</h3>
            </div>
            <div className="flex gap-2">
              {searchEngines.map((engine) => (
                <button
                  key={engine.value}
                  onClick={() => updateSettings({ searchEngine: engine.value })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    settings.searchEngine === engine.value
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {engine.label}
                </button>
              ))}
            </div>
          </div>

          {/* Layout Mode */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Move className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">布局模式</h3>
            </div>
            <div className="flex gap-2">
              {[
                { value: 'grid' as LayoutMode, label: '网格布局', desc: '自动排列，整齐有序' },
                { value: 'free' as LayoutMode, label: '自由布局', desc: '自由拖拽，任意放置' },
              ].map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => updateSettings({ layoutMode: mode.value })}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                    settings.layoutMode === mode.value
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <div>{mode.label}</div>
                  <div className={`text-xs mt-0.5 ${
                    settings.layoutMode === mode.value
                      ? 'text-gray-300 dark:text-gray-500'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>{mode.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Widgets */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckSquare className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">小组件</h3>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <span className="text-sm text-gray-700 dark:text-gray-300">显示搜索框</span>
                <input
                  type="checkbox"
                  checked={settings.showSearch}
                  onChange={(e) => updateSettings({ showSearch: e.target.checked })}
                  className="w-5 h-5 rounded-lg border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100 focus:ring-gray-900 dark:focus:ring-gray-400"
                />
              </label>
              <label className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <span className="text-sm text-gray-700 dark:text-gray-300">显示待办事项</span>
                <input
                  type="checkbox"
                  checked={settings.showTodo}
                  onChange={(e) => updateSettings({ showTodo: e.target.checked })}
                  className="w-5 h-5 rounded-lg border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100 focus:ring-gray-900 dark:focus:ring-gray-400"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
