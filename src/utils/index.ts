import type { Modifier } from '@dnd-kit/core';
import type { SearchEngine } from '../types';

// ===== Grid snap constants =====
export const GRID_SIZE_X = 140;
export const GRID_SIZE_Y = 120;

/** Snap a coordinate to the nearest grid point */
export const snapToGrid = (value: number, gridSize: number): number =>
  Math.round(value / gridSize) * gridSize;

/** Convert pixel position to grid coordinates */
export const pixelToGrid = (x: number, y: number) => ({
  gridCol: Math.round(x / GRID_SIZE_X),
  gridRow: Math.round(y / GRID_SIZE_Y),
});

/** Convert grid coordinates to pixel position */
export const gridToPixel = (gridCol: number, gridRow: number) => ({
  x: gridCol * GRID_SIZE_X,
  y: gridRow * GRID_SIZE_Y,
});

/** dnd-kit modifier: snaps dragging website cards to grid in free mode */
export const createSnapToGridModifier = (gridX: number, gridY: number): Modifier =>
  ({ transform, active }) => {
    if (!active || active.data.current?.type !== 'website') return transform;
    return {
      ...transform,
      x: snapToGrid(transform.x, gridX),
      y: snapToGrid(transform.y, gridY),
    };
  };

// Get favicon sources for a website (multi-source fallback, China-friendly)
export const getFaviconSources = (url: string): string[] => {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const protocol = urlObj.protocol;
    return [
      // DuckDuckGo — usually the most reliable for arbitrary domains
      `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      // Google's high-res favicon service (may be blocked/return blank in some regions)
      `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
      // Site's own favicon (original protocol preserved)
      `${protocol}//${domain}/favicon.ico`,
      // China-friendly fallback
      `https://api.iowen.cn/favicon/${domain}.png`,
    ];
  } catch {
    return [];
  }
};

// Generate a deterministic gradient from a string (for letter-avatar fallback)
const AVATAR_GRADIENTS: Array<{ from: string; to: string }> = [
  { from: '#6366f1', to: '#3b82f6' },  // indigo → blue
  { from: '#8b5cf6', to: '#6366f1' },  // violet → indigo
  { from: '#ec4899', to: '#8b5cf6' },  // pink → violet
  { from: '#f59e0b', to: '#ef4444' },  // amber → red
  { from: '#10b981', to: '#06b6d4' },  // emerald → cyan
  { from: '#06b6d4', to: '#3b82f6' },  // cyan → blue
  { from: '#f97316', to: '#eab308' },  // orange → yellow
  { from: '#a855f7', to: '#ec4899' },  // purple → pink
  { from: '#14b8a6', to: '#10b981' },  // teal → emerald
  { from: '#0ea5e9', to: '#6366f1' },  // sky → indigo
  { from: '#d946ef', to: '#a855f7' },  // fuchsia → purple
  { from: '#22c55e', to: '#14b8a6' },  // green → teal
];

export const getAvatarColor = (name: string): string => {
  const gradient = getAvatarGradient(name);
  return gradient.from;
};

export const getAvatarGradient = (name: string): { from: string; to: string } => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
};

export const getFaviconUrl = (url: string): string => {
  const sources = getFaviconSources(url);
  return sources[0] || '';
};

// Format URL for display
export const formatUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
};

// Validate URL
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Add https if missing
export const normalizeUrl = (url: string): string => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};

// Get icon size class based on settings
export const getIconSizeClass = (size: 'small' | 'medium' | 'large'): string => {
  const sizes = {
    small: 'w-10 h-10',
    medium: 'w-14 h-14',
    large: 'w-16 h-16',
  };
  return sizes[size];
};

// Get grid gap class based on density
export const getDensityGapClass = (density: 'compact' | 'comfortable' | 'spacious'): string => {
  const gaps = {
    compact: 'gap-3',
    comfortable: 'gap-4',
    spacious: 'gap-6',
  };
  return gaps[density];
};

// Get padding class based on density
export const getDensityPaddingClass = (density: 'compact' | 'comfortable' | 'spacious'): string => {
  const paddings = {
    compact: 'p-3',
    comfortable: 'p-4',
    spacious: 'p-6',
  };
  return paddings[density];
};

// Search engine URLs
export const getSearchEngineUrl = (engine: SearchEngine, query: string): string => {
  const engines = {
    baidu: `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`,
    google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
    bing: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
  };
  return engines[engine];
};

export const getSearchEngineName = (engine: SearchEngine): string => {
  const names = {
    baidu: '百度',
    google: 'Google',
    bing: 'Bing',
  };
  return names[engine];
};
