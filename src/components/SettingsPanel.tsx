import { X, LayoutGrid, Type, Palette, CheckSquare, Sun, Moon, Monitor, Search, Move, Download, Upload, Image } from 'lucide-react';
import { useStore } from '../store';
import type { IconSize, Density, Theme, SearchEngine, LayoutMode } from '../types';
import { useRef, useState } from 'react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { settings, updateSettings } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);

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
    { value: 'gradient', label: '默认' },
    { value: 'white', label: '纯白' },
    { value: 'gray', label: '浅灰' },
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

  // Shared button class builder
  const segButton = (active: boolean) =>
    `flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
      active
        ? 'bg-accent text-white'
        : 'bg-surface-hover text-ink-secondary hover:bg-line-light'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm dark:bg-black/60"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-surface rounded-3xl shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-line-light sticky top-0 bg-surface z-10">
          <h2 className="text-lg font-semibold text-ink tracking-tight">设置</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-hover transition-all"
          >
            <X className="w-5 h-5 text-ink-secondary" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Icon Size */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <LayoutGrid className="w-4 h-4 text-ink-secondary" />
              <h3 className="text-sm font-medium text-ink">图标大小</h3>
            </div>
            <div className="flex gap-2">
              {iconSizes.map((size) => (
                <button
                  key={size.value}
                  onClick={() => updateSettings({ iconSize: size.value })}
                  className={segButton(settings.iconSize === size.value)}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Density */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-4 h-4 text-ink-secondary" />
              <h3 className="text-sm font-medium text-ink">显示密度</h3>
            </div>
            <div className="flex gap-2">
              {densities.map((density) => (
                <button
                  key={density.value}
                  onClick={() => updateSettings({ density: density.value })}
                  className={segButton(settings.density === density.value)}
                >
                  {density.label}
                </button>
              ))}
            </div>
          </div>

          {/* Background */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-ink-secondary" />
              <h3 className="text-sm font-medium text-ink">背景样式</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {backgrounds.map((bg) => (
                <button
                  key={bg.value}
                  onClick={() => updateSettings({ background: bg.value })}
                  className={`relative h-16 rounded-xl border-2 transition-all ${
                    settings.background === bg.value
                      ? 'border-accent ring-1 ring-accent'
                      : 'border-line-light hover:border-line'
                  }`}
                >
                  <div className={`absolute inset-0 rounded-[10px] ${bg.value === 'white' ? 'bg-surface' : bg.value === 'gray' ? 'bg-surface-hover' : 'bg-canvas'}`} />
                  <span className="absolute bottom-2 left-0 right-0 text-center text-xs font-medium text-ink-secondary">
                    {bg.label}
                  </span>
                  {settings.background === bg.value && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                      <CheckSquare className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Moon className="w-4 h-4 text-ink-secondary" />
              <h3 className="text-sm font-medium text-ink">显示主题</h3>
            </div>
            <div className="flex gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => updateSettings({ theme: theme.value })}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    settings.theme === theme.value
                      ? 'bg-accent text-white'
                      : 'bg-surface-hover text-ink-secondary hover:bg-line-light'
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
              <Search className="w-4 h-4 text-ink-secondary" />
              <h3 className="text-sm font-medium text-ink">默认搜索引擎</h3>
            </div>
            <div className="flex gap-2">
              {searchEngines.map((engine) => (
                <button
                  key={engine.value}
                  onClick={() => updateSettings({ searchEngine: engine.value })}
                  className={segButton(settings.searchEngine === engine.value)}
                >
                  {engine.label}
                </button>
              ))}
            </div>
          </div>

          {/* Layout Mode */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Move className="w-4 h-4 text-ink-secondary" />
              <h3 className="text-sm font-medium text-ink">布局模式</h3>
            </div>
            <div className="flex gap-2">
              {[
                { value: 'grid' as LayoutMode, label: '网格布局', desc: '自动排列' },
                { value: 'free' as LayoutMode, label: '自由布局', desc: '自由拖拽' },
              ].map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => updateSettings({ layoutMode: mode.value })}
                  className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                    settings.layoutMode === mode.value
                      ? 'bg-accent text-white'
                      : 'bg-surface-hover text-ink-secondary hover:bg-line-light'
                  }`}
                >
                  <div>{mode.label}</div>
                  <div className={`text-xs mt-0.5 ${settings.layoutMode === mode.value ? 'text-white/70' : 'text-ink-tertiary'}`}>
                    {mode.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Widgets */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckSquare className="w-4 h-4 text-ink-secondary" />
              <h3 className="text-sm font-medium text-ink">小组件</h3>
            </div>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-4 rounded-xl bg-surface-hover cursor-pointer hover:bg-line-light transition-colors">
                <span className="text-sm text-ink">显示搜索框</span>
                <input
                  type="checkbox"
                  checked={settings.showSearch}
                  onChange={(e) => updateSettings({ showSearch: e.target.checked })}
                  className="w-5 h-5 rounded border-line text-accent focus:ring-accent"
                />
              </label>
              <label className="flex items-center justify-between p-4 rounded-xl bg-surface-hover cursor-pointer hover:bg-line-light transition-colors">
                <span className="text-sm text-ink">显示待办事项</span>
                <input
                  type="checkbox"
                  checked={settings.showTodo}
                  onChange={(e) => updateSettings({ showTodo: e.target.checked })}
                  className="w-5 h-5 rounded border-line text-accent focus:ring-accent"
                />
              </label>
            </div>
          </div>

          {/* Data Import/Export */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Download className="w-4 h-4 text-ink-secondary" />
              <h3 className="text-sm font-medium text-ink">数据管理</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const data = { websites: useStore.getState().websites, categories: useStore.getState().categories, todos: useStore.getState().todos };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `myhomepage-backup-${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface-hover text-sm font-medium text-ink hover:bg-line-light transition-all"
              >
                <Download className="w-4 h-4" />
                导出备份
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface-hover text-sm font-medium text-ink hover:bg-line-light transition-all"
              >
                <Upload className="w-4 h-4" />
                导入恢复
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    try {
                      const data = JSON.parse(reader.result as string);
                      if (data.websites && data.categories) {
                        const store = useStore.getState();
                        store.importData(data);
                        setImportMessage('数据导入成功！');
                        setTimeout(() => setImportMessage(null), 2000);
                      } else {
                        setImportMessage('文件格式不正确');
                        setTimeout(() => setImportMessage(null), 2000);
                      }
                    } catch {
                      setImportMessage('文件解析失败');
                      setTimeout(() => setImportMessage(null), 2000);
                    }
                  };
                  reader.readAsText(file);
                  e.target.value = '';
                }}
              />
            </div>
            {importMessage && (
              <p className={`mt-2 text-xs ${importMessage.includes('成功') ? 'text-success' : 'text-danger'}`}>
                {importMessage}
              </p>
            )}
          </div>

          {/* Background Image */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Image className="w-4 h-4 text-ink-secondary" />
              <h3 className="text-sm font-medium text-ink">自定义背景</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => bgInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface-hover text-sm font-medium text-ink hover:bg-line-light transition-all"
              >
                <Upload className="w-4 h-4" />
                {settings.backgroundImage ? '更换背景图' : '上传背景图'}
              </button>
              {settings.backgroundImage && (
                <button
                  onClick={() => updateSettings({ backgroundImage: undefined })}
                  className="px-4 py-2.5 rounded-xl bg-danger-soft text-sm font-medium text-danger hover:bg-danger-soft/80 transition-all"
                >
                  清除
                </button>
              )}
              <input
                ref={bgInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    if (typeof reader.result === 'string') {
                      updateSettings({ backgroundImage: reader.result });
                    }
                  };
                  reader.readAsDataURL(file);
                  e.target.value = '';
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
