import { X, LayoutGrid, Type, Palette, CheckSquare } from 'lucide-react';
import { useStore } from '../store';
import type { IconSize, Density } from '../types';

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
    { value: 'gradient', label: '渐变', class: 'bg-gradient-to-br from-gray-50 to-gray-100' },
    { value: 'white', label: '纯白', class: 'bg-white' },
    { value: 'gray', label: '浅灰', class: 'bg-gray-50' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">设置</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Icon Size */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <LayoutGrid className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-900">图标大小</h3>
            </div>
            <div className="flex gap-2">
              {iconSizes.map((size) => (
                <button
                  key={size.value}
                  onClick={() => updateSettings({ iconSize: size.value })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    settings.iconSize === size.value
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              <Type className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-900">显示密度</h3>
            </div>
            <div className="flex gap-2">
              {densities.map((density) => (
                <button
                  key={density.value}
                  onClick={() => updateSettings({ density: density.value })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    settings.density === density.value
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              <Palette className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-900">背景样式</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {backgrounds.map((bg) => (
                <button
                  key={bg.value}
                  onClick={() => updateSettings({ background: bg.value })}
                  className={`relative h-20 rounded-2xl border-2 transition-all overflow-hidden ${
                    settings.background === bg.value
                      ? 'border-gray-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`absolute inset-0 ${bg.class}`} />
                  {settings.background === bg.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center">
                        <CheckSquare className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  )}
                  <span className="absolute bottom-2 left-0 right-0 text-center text-xs font-medium text-gray-700">
                    {bg.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Widgets */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckSquare className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-900">小组件</h3>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="text-sm text-gray-700">显示搜索框</span>
                <input
                  type="checkbox"
                  checked={settings.showSearch}
                  onChange={(e) => updateSettings({ showSearch: e.target.checked })}
                  className="w-5 h-5 rounded-lg border-gray-300 text-gray-900 focus:ring-gray-900"
                />
              </label>
              <label className="flex items-center justify-between p-4 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="text-sm text-gray-700">显示待办事项</span>
                <input
                  type="checkbox"
                  checked={settings.showTodo}
                  onChange={(e) => updateSettings({ showTodo: e.target.checked })}
                  className="w-5 h-5 rounded-lg border-gray-300 text-gray-900 focus:ring-gray-900"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
