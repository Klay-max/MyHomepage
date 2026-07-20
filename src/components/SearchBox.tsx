import { useState, useRef, useEffect } from 'react';
import { Search, Globe, ArrowRight } from 'lucide-react';
import { useStore } from '../store';
import { normalizeUrl, isValidUrl } from '../utils';

export function SearchBox() {
  const { searchQuery, setSearchQuery, searchResults, websites } = useStore();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle search submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim();
    
    // If it's a valid URL, go directly
    if (isValidUrl(normalizeUrl(query))) {
      window.open(normalizeUrl(query), '_blank');
      setSearchQuery('');
      return;
    }

    // If there are search results, open the first one
    if (searchResults.length > 0) {
      window.open(searchResults[0].url, '_blank');
      setSearchQuery('');
      return;
    }
  };

  // Handle result click
  const handleResultClick = (url: string) => {
    window.open(url, '_blank');
    setSearchQuery('');
    setIsFocused(false);
  };

  // Handle keydown for quick navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      <form onSubmit={handleSubmit}>
        <div
          className={`relative flex items-center transition-all duration-300 ${
            isFocused ? 'scale-105' : ''
          }`}
        >
          <Search className="absolute left-5 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder="搜索收藏的网站，或直接输入网址..."
            className="w-full pl-14 pr-14 py-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all shadow-lg"
          />
          <button
            type="submit"
            className="absolute right-3 p-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isFocused && searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-50">
          {searchResults.length > 0 ? (
            <div className="py-2">
              <p className="px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                搜索结果
              </p>
              {searchResults.map((website) => (
                <button
                  key={website.id}
                  onClick={() => handleResultClick(website.url)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <Globe className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{website.name}</p>
                    <p className="text-xs text-gray-400">{website.url}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              {isValidUrl(normalizeUrl(searchQuery)) ? (
                <button
                  onClick={() => handleResultClick(normalizeUrl(searchQuery))}
                  className="w-full flex items-center gap-3 text-left"
                >
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span>直接访问: {normalizeUrl(searchQuery)}</span>
                </button>
              ) : (
                <span>未找到匹配的网站</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
