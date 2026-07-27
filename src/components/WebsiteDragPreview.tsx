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
    <div className="w-[112px] flex flex-col items-center gap-2.5 py-4 px-3 rounded-2xl
                    bg-surface border-2 border-accent
                    shadow-[0_16px_40px_rgba(0,0,0,0.2),0_4px_12px_rgba(0,0,0,0.1)]
                    dark:shadow-[0_16px_44px_rgba(0,0,0,0.6),0_4px_16px_rgba(0,0,0,0.4)]
                    scale-110 cursor-grabbing
                    ring-4 ring-accent/10"
    >
      <div className="w-14 h-14 rounded-2xl bg-surface-hover flex items-center justify-center overflow-hidden">
        {favicon ? (
          <img src={favicon} alt={website.name} className="w-full h-full object-contain p-3" />
        ) : (
          <Globe className="w-7 h-7 text-ink-tertiary" />
        )}
      </div>
      <p className="text-[13px] font-semibold text-ink truncate w-full text-center leading-tight">
        {website.name}
      </p>
      <p className="text-[11px] text-accent font-medium">
        {formatUrl(website.url)}
      </p>
    </div>
  );
}
