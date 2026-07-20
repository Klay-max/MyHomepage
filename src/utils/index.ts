// Get favicon URL for a website
export const getFaviconUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    // Use Google's favicon service
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch {
    return '';
  }
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
    large: 'w-18 h-18',
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
