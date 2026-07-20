import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Globe } from 'lucide-react';
import type { Website } from '../types';
import { getFaviconUrl, formatUrl, getIconSizeClass } from '../utils';
import { useStore } from '../store';

interface WebsiteCardProps {
  website: Website;
}

export function WebsiteCard({ website }: WebsiteCardProps) {
  const { settings, deleteWebsite } = useStore();
  const [iconError, setIconError] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: website.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const iconSizeClass = getIconSizeClass(settings.iconSize);
  const faviconUrl = getFaviconUrl(website.url);

  const handleClick = () => {
    window.open(website.url, '_blank');
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative"
    >
      <button
        onClick={handleClick}
        className="w-full flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-100 hover:bg-white hover:shadow-lg transition-all duration-300"
      >
        {/* Icon */}
        <div className={`${iconSizeClass} rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden`}>
          {!iconError && faviconUrl ? (
            <img
              src={faviconUrl}
              alt={website.name}
              className="w-full h-full object-contain p-2"
              onError={() => setIconError(true)}
            />
          ) : (
            <Globe className="w-1/2 h-1/2 text-gray-400" />
          )}
        </div>

        {/* Name */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900 truncate max-w-[100px]">
            {website.name}
          </p>
          <p className="text-xs text-gray-400 truncate max-w-[100px] mt-0.5">
            {formatUrl(website.url)}
          </p>
        </div>
      </button>

      {/* Delete button - visible on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (confirm('确定要删除这个网站吗？')) {
            deleteWebsite(website.id);
          }
        }}
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-sm hover:bg-red-600"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}
