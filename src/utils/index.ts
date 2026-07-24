import type { SearchEngine } from '../types';

// Get favicon sources for a website (multi-source fallback, China-friendly)
export const getFaviconSources = (url: string): string[] => {
  try {
    const domain = new URL(url).hostname;
    return [
      `https://${domain}/favicon.ico`,
      `https://api.iowen.cn/favicon/${domain}.png`,
      `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    ];
  } catch {
    return [];
  }
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
