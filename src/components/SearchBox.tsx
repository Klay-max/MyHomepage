import { useState, useRef } from 'react';
import { Search, Globe, ArrowRight, ExternalLink } from 'lucide-react';
import { useStore } from '../store';
import { normalizeUrl, isValidUrl, getSearchEngineUrl, getSearchEngineName } from '../utils';

export function SearchBox() {
  const { searchQuery, setSearchQuery, searchResults, settings } = useStore();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim();

    if (isValidUrl(normalizeUrl(query))) {
      window.open(normalizeUrl(query), '_blank');
      setSearchQuery('');
      return;
    }

    if (searchResults.length > 0) {
      window.open(searchResults[0].url, '_blank');
      setSearchQuery('');
      return;
    }

    window.open(getSearchEngineUrl(settings.searchEngine, query), '_blank');
    setSearchQuery('');
  };

  const handleResultClick = (url: string) => {
    window.open(url, '_blank');
    setSearchQuery('');
    setIsFocused(false);
  };

  return (
    <div className="w-full relative">
      <form onSubmit={handleSubmit}>
        <div className={`relative flex items-center transition-all duration-300 ${isFocused ? 'scale-[1.006]' : ''}`}>
          <Search className="absolute left-5 sm:left-6 w-[18px] h-[18px] text-ink-tertiary pointer-events-none z-10" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="搜索收藏的网站，或输入网址..."
            className="w-full pl-13 sm:pl-15 pr-14 sm:pr-16 py-4 sm:py-[18px] rounded-[28px] bg-surface/88 border border-line-light text-[15px] text-ink placeholder-ink-tertiary focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent/50 transition-all shadow-[0_18px_50px_rgba(29,29,31,0.08),inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-xl"
          />
          <button
            type="submit"
            className="absolute right-2.5 sm:right-3 w-10 h-10 rounded-full bg-ink text-canvas hover:bg-accent transition-all flex items-center justify-center shadow-sm"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isFocused && searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-3 premium-panel rounded-[22px] overflow-hidden z-50 animate-scale-in">
          {searchResults.length > 0 ? (
            <div className="py-2">
              <p className="px-5 py-2 text-xs font-medium text-ink-tertiary uppercase tracking-wider">
                搜索结果
              </p>
              {searchResults.map((website) => (
                <button
                  key={website.id}
                  onClick={() => handleResultClick(website.url)}
                className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-surface-hover transition-colors text-left"
                >
                  <Globe className="w-4 h-4 text-ink-tertiary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{website.name}</p>
                    <p className="text-xs text-ink-secondary truncate">{website.url}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-ink-tertiary shrink-0" />
                </button>
              ))}
              <div className="border-t border-line-light pt-1 mt-1">
                <button
                  onClick={() => handleResultClick(getSearchEngineUrl(settings.searchEngine, searchQuery))}
                  className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-surface-hover transition-colors text-left"
                >
                  <ExternalLink className="w-4 h-4 text-ink-tertiary" />
                  <span className="text-sm text-ink-secondary">
                    用{getSearchEngineName(settings.searchEngine)}搜索: {searchQuery}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="px-5 py-4 text-sm text-ink-secondary">
              {isValidUrl(normalizeUrl(searchQuery)) ? (
                <button
                  onClick={() => handleResultClick(normalizeUrl(searchQuery))}
                  className="w-full flex items-center gap-3 text-left"
                >
                  <Globe className="w-4 h-4 text-ink-tertiary" />
                  <span className="text-ink">直接访问: {normalizeUrl(searchQuery)}</span>
                </button>
              ) : (
                <button
                  onClick={() => handleResultClick(getSearchEngineUrl(settings.searchEngine, searchQuery))}
                  className="w-full flex items-center gap-3 text-left"
                >
                  <ExternalLink className="w-4 h-4 text-ink-tertiary" />
                  <span className="text-ink">
                    用{getSearchEngineName(settings.searchEngine)}搜索: {searchQuery}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
