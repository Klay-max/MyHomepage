import { useState } from 'react';
import type { Website } from '../types';
import { getFaviconSources, getAvatarGradient, formatUrl } from '../utils';

interface WebsiteDragPreviewProps {
  website: Website;
}

export function WebsiteDragPreview({ website }: WebsiteDragPreviewProps) {
  const faviconSources = getFaviconSources(website.url);
  const [faviconIndex, setFaviconIndex] = useState(0);
  const [iconError, setIconError] = useState(false);
  const favicon = faviconSources[faviconIndex] || '';
  const avatarGradient = getAvatarGradient(website.name);

  const handleIconError = () => {
    if (faviconIndex < faviconSources.length - 1) {
      setFaviconIndex((prev) => prev + 1);
    } else {
      setIconError(true);
    }
  };

  const handleIconLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth < 16 || img.naturalHeight < 16) {
      handleIconError();
    }
  };

  return (
    <div className="w-[116px] flex flex-col items-center gap-2.5 py-4 px-3 rounded-2xl
                    bg-surface border-2 border-accent
                    shadow-[0_16px_40px_rgba(0,0,0,0.2),0_4px_12px_rgba(0,0,0,0.1)]
                    dark:shadow-[0_16px_44px_rgba(0,0,0,0.6),0_4px_16px_rgba(0,0,0,0.4)]
                    cursor-grabbing
                    ring-4 ring-accent/10"
    >
      <div
        className="w-14 h-14 rounded-[14px] flex items-center justify-center overflow-hidden relative
                   ring-1 ring-black/5 dark:ring-white/10
                   shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.18)]"
        style={{
          background: `linear-gradient(135deg, ${avatarGradient.from}, ${avatarGradient.to})`,
        }}
      >
        {!iconError && favicon ? (
          <>
            {/* White inner square — consistent visual size for all favicons */}
            <div className="absolute inset-[6px] bg-white dark:bg-white/95 rounded-[6px] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.06)]" />
            <img
              src={favicon}
              alt={website.name}
              className="w-full h-full object-contain p-[8px] relative z-10"
              referrerPolicy="no-referrer"
              onError={handleIconError}
              onLoad={handleIconLoad}
            />
          </>
        ) : (
          <span className="text-xl font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
            {website.name.charAt(0).toUpperCase()}
          </span>
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
