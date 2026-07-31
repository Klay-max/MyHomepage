import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CornerDownLeft, Globe } from 'lucide-react';
import { useStore } from '../store';
import { getAvatarGradient, formatUrl } from '../utils';
import type { Website } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ScoredWebsite {
  website: Website;
  score: number;
  categoryName: string;
}

// ===== Search Engines =====
interface SearchEngine {
  id: string;
  name: string;
  domain: string;
  url: (q: string) => string;
}

const SEARCH_ENGINES: SearchEngine[] = [
  { id: 'metaso',     name: '秘塔AI',    domain: 'metaso.cn',           url: q => `https://metaso.cn/?q=${encodeURIComponent(q)}` },
  { id: 'bing',       name: 'Bing',      domain: 'www.bing.com',        url: q => `https://www.bing.com/search?q=${encodeURIComponent(q)}` },
  { id: 'kimi',       name: 'Kimi',      domain: 'kimi.moonshot.cn',    url: q => `https://kimi.moonshot.cn/` },
  { id: 'baidu',      name: '百度',      domain: 'www.baidu.com',       url: q => `https://www.baidu.com/s?wd=${encodeURIComponent(q)}` },
  { id: 'perplexity', name: 'Perplexity', domain: 'www.perplexity.ai',  url: q => `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}` },
];

// ===== Fuzzy match =====
function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) {
    const pos = t.indexOf(q);
    return 1000 - pos * 10;
  }
  let qi = 0;
  let score = 0;
  let lastMatchPos = -1;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      score += 10;
      if (lastMatchPos !== -1 && ti - lastMatchPos === 1) score += 5;
      lastMatchPos = ti;
      qi++;
    }
  }
  return qi === q.length ? score : -1;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const { websites, categories, settings } = useStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [engineIndex, setEngineIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Category name lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach(c => map.set(c.id, c.name));
    return map;
  }, [categories]);

  // Filter + score results
  const results = useMemo<ScoredWebsite[]>(() => {
    if (!query.trim()) {
      return websites
        .map(w => ({ website: w, score: 0, categoryName: categoryMap.get(w.categoryId) ?? '' }))
        .sort((a, b) => a.website.name.localeCompare(b.website.name, 'zh-CN'))
        .slice(0, 8);
    }
    return websites
      .map(w => {
        const nameScore = fuzzyScore(query, w.name);
        const urlScore = fuzzyScore(query, w.url);
        return {
          website: w,
          score: Math.max(nameScore, urlScore),
          categoryName: categoryMap.get(w.categoryId) ?? '',
        };
      })
      .filter(r => r.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [query, websites, categoryMap]);

  const hasQuery = query.trim().length > 0;
  const searchRowIndex = results.length; // index of the search action row
  const totalItems = results.length + (hasQuery ? 1 : 0);

  // Initialize engine from settings when opened
  useEffect(() => {
    if (isOpen) {
      const idx = SEARCH_ENGINES.findIndex(e => e.id === settings.searchEngine);
      setEngineIndex(idx >= 0 ? idx : 0);
      setQuery('');
      setSelectedIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen, settings.searchEngine]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[selectedIndex] as HTMLElement;
    if (item) item.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const openWebsite = useCallback((w: Website) => {
    window.open(w.url, '_blank');
    onClose();
  }, [onClose]);

  const executeSearch = useCallback(() => {
    const engine = SEARCH_ENGINES[engineIndex];
    if (engine && query.trim()) {
      window.open(engine.url(query.trim()), '_blank');
      onClose();
    }
  }, [engineIndex, query, onClose]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, totalItems - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (hasQuery && selectedIndex === searchRowIndex) {
        executeSearch();
      } else {
        const selected = results[selectedIndex];
        if (selected) openWebsite(selected.website);
      }
    } else if (e.key === 'Tab' && hasQuery) {
      e.preventDefault();
      setEngineIndex(i => (i + 1) % SEARCH_ENGINES.length);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const currentEngine = SEARCH_ENGINES[engineIndex];
  const engineFavicon = `https://icons.duckduckgo.com/ip3/${currentEngine.domain}.ico`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          {/* Panel */}
          <motion.div
            className="relative w-full max-w-[600px] rounded-2xl overflow-hidden shadow-2xl border border-line-light"
            style={{
              background: 'color-mix(in srgb, var(--color-surface) 92%, transparent)',
              backdropFilter: 'blur(24px) saturate(160%)',
              WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            }}
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            onClick={e => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-line-light">
              <Search className="w-5 h-5 text-ink-tertiary shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="搜索网站或输入关键词..."
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className="flex-1 bg-transparent text-[15px] text-ink placeholder-ink-tertiary focus:outline-none"
              />
              <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-hover text-[11px] text-ink-tertiary font-medium border border-line-light">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[400px] overflow-y-auto py-2">
              {results.length === 0 && !hasQuery ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm text-ink-tertiary">输入关键词搜索收藏的网站</p>
                  <p className="text-xs text-ink-tertiary mt-1">或直接输入内容用搜索引擎查找</p>
                </div>
              ) : (
                <>
                  {results.map((result, index) => (
                    <ResultItem
                      key={result.website.id}
                      result={result}
                      isSelected={index === selectedIndex}
                      onClick={() => openWebsite(result.website)}
                      onHover={() => setSelectedIndex(index)}
                    />
                  ))}

                  {/* Search engine action row */}
                  {hasQuery && (
                    <>
                      {results.length > 0 && (
                        <div className="mx-4 my-1 border-t border-line-light" />
                      )}
                      <SearchRow
                        engineName={currentEngine.name}
                        favicon={engineFavicon}
                        query={query.trim()}
                        isSelected={selectedIndex === searchRowIndex}
                        onClick={executeSearch}
                        onHover={() => setSelectedIndex(searchRowIndex)}
                      />
                    </>
                  )}

                  {results.length === 0 && hasQuery && (
                    <div className="px-5 py-3 text-center">
                      <p className="text-xs text-ink-tertiary">没有收藏的网站匹配，按 Enter 搜索</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-2.5 border-t border-line-light bg-surface-hover/50">
              <div className="flex items-center gap-3 text-[11px] text-ink-tertiary">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-surface border border-line-light text-[10px] font-medium">↑↓</kbd>
                  导航
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-surface border border-line-light text-[10px] font-medium">Enter</kbd>
                  打开
                </span>
                {hasQuery && (
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-surface border border-line-light text-[10px] font-medium">Tab</kbd>
                    切换引擎
                  </span>
                )}
              </div>
              <span className="text-[11px] text-ink-tertiary tabular-nums">
                {results.length} 个网站{hasQuery ? ' · 搜索' : ''}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ===== Website Result Item =====
interface ResultItemProps {
  result: ScoredWebsite;
  isSelected: boolean;
  onClick: () => void;
  onHover: () => void;
}

function ResultItem({ result, isSelected, onClick, onHover }: ResultItemProps) {
  const { website, categoryName } = result;
  const [faviconIndex, setFaviconIndex] = useState(0);
  const [iconError, setIconError] = useState(false);

  const faviconSources = useMemo(() => {
    try {
      const urlObj = new URL(website.url);
      const domain = urlObj.hostname;
      return [
        `https://icons.duckduckgo.com/ip3/${domain}.ico`,
        `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
        `${urlObj.protocol}//${domain}/favicon.ico`,
        `https://api.iowen.cn/favicon/${domain}.png`,
      ];
    } catch {
      return [];
    }
  }, [website.url]);

  const currentFavicon = faviconSources[faviconIndex] || '';
  const gradient = getAvatarGradient(website.name);

  const handleIconError = () => {
    if (faviconIndex < faviconSources.length - 1) {
      setFaviconIndex(i => i + 1);
    } else {
      setIconError(true);
    }
  };

  const handleIconLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth < 16 || img.naturalHeight < 16) handleIconError();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: 0.02 }}
      className={`mx-2 flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors duration-100 ${
        isSelected ? 'bg-accent/10 ring-1 ring-accent/20' : 'hover:bg-surface-hover'
      }`}
      onClick={onClick}
      onMouseEnter={onHover}
    >
      <div
        className="w-9 h-9 rounded-[9px] flex items-center justify-center overflow-hidden shrink-0 relative ring-1 ring-black/5 dark:ring-white/10"
        style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
      >
        {!iconError && currentFavicon ? (
          <>
            <div className="absolute inset-[4px] bg-white dark:bg-white/95 rounded-[5px]" />
            <img
              src={currentFavicon}
              alt=""
              className="w-full h-full object-contain p-[6px] relative z-10"
              onError={handleIconError}
              onLoad={handleIconLoad}
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          </>
        ) : (
          <span className="text-sm font-bold text-white">
            {website.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate leading-tight">{website.name}</p>
        <p className="text-xs text-ink-tertiary truncate mt-0.5 leading-tight">{formatUrl(website.url)}</p>
      </div>

      <span className="text-[11px] text-ink-tertiary px-2 py-0.5 rounded-md bg-surface-hover shrink-0">
        {categoryName}
      </span>

      {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-accent shrink-0" />}
    </motion.div>
  );
}

// ===== Search Engine Row =====
interface SearchRowProps {
  engineName: string;
  favicon: string;
  query: string;
  isSelected: boolean;
  onClick: () => void;
  onHover: () => void;
}

function SearchRow({ engineName, favicon, query, isSelected, onClick, onHover }: SearchRowProps) {
  const [iconError, setIconError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: 0.04 }}
      className={`mx-2 flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors duration-100 ${
        isSelected ? 'bg-accent/10 ring-1 ring-accent/20' : 'hover:bg-surface-hover'
      }`}
      onClick={onClick}
      onMouseEnter={onHover}
    >
      {/* Engine icon */}
      <div className="w-9 h-9 rounded-[9px] flex items-center justify-center overflow-hidden shrink-0 bg-surface-elevated ring-1 ring-line-light">
        {!iconError ? (
          <img
            src={favicon}
            alt=""
            className="w-6 h-6 object-contain"
            onError={() => setIconError(true)}
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        ) : (
          <Globe className="w-5 h-5 text-ink-secondary" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate leading-tight">
          用 <span className="text-accent">{engineName}</span> 搜索
        </p>
        <p className="text-xs text-ink-tertiary truncate mt-0.5 leading-tight">
          "{query}"
        </p>
      </div>

      <span className="text-[11px] text-ink-tertiary px-2 py-0.5 rounded-md bg-surface-hover shrink-0">
        Tab
      </span>

      {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-accent shrink-0" />}
    </motion.div>
  );
}
