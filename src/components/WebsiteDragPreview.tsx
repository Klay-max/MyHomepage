import { Globe } from 'lucide-react';
import type { Website } from '../types';
import { getFaviconSources, formatUrl } from '../utils';

interface WebsiteDragPreviewProps {
  website: Website;
}

export function WebsiteDragPreview({ website }: WebsiteDragPreviewProps) {
  const faviconSources = getFaviconSources(website.url);
  const favicon = faviconSources[0] || '';

  return (
    <div className="w-28 flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200 dark:border-gray-600 shadow-2xl scale-110 opacity-90 cursor-grabbing">
      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
        {favicon ? (
          <img
            src={favicon}
            alt={website.name}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <Globe className="w-6 h-6 text-gray-400" />
        )}
      </div>
      <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate w-full text-center">
        {website.name}
      </p>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate w-full text-center">
        {formatUrl(website.url)}
      </p>
    </div>
  );
}
