import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2, ArrowRight, CornerDownLeft, Sparkles } from 'lucide-react';
import { searchCities, resolveCityDirect } from '../services/weatherApi';
import { GeoLocation } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: GeoLocation) => void;
  onLocateMe: () => void;
  isLocating: boolean;
}

const QUICK_TAGS = [
  'New York', 'Tokyo', 'London', 'Paris', 'Dubai',
  'Delhi', 'Singapore', 'Sydney', 'Mumbai', 'Berlin',
  'Reykjavik', 'Toronto', 'Los Angeles', 'Rome', 'Bangkok'
];

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  onLocateMe,
  isLocating,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setHasSearched(false);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Live autocompletion debounce
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const list = await searchCities(query);
        setResults(list);
        setHasSearched(true);
        setSelectedIndex(0);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (loc: GeoLocation) => {
    onSelectLocation(loc);
    onClose();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // If there are already results, select the highlighted/first one
    if (results.length > 0) {
      const target = results[selectedIndex] || results[0];
      handleSelect(target);
      return;
    }

    // Direct resolution
    setIsLoading(true);
    try {
      const loc = await resolveCityDirect(query.trim());
      if (loc) {
        handleSelect(loc);
      } else {
        const freshList = await searchCities(query.trim());
        if (freshList.length > 0) {
          handleSelect(freshList[0]);
        } else {
          setHasSearched(true);
        }
      }
    } catch {
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    }
  };

  const handleQuickTagClick = async (city: string) => {
    setQuery(city);
    setIsLoading(true);
    try {
      const loc = await resolveCityDirect(city);
      if (loc) {
        handleSelect(loc);
      } else {
        const list = await searchCities(city);
        if (list.length > 0) {
          handleSelect(list[0]);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-[#0a1e38]/95 backdrop-blur-3xl border border-white/15 rounded-[36px] shadow-2xl p-6 md:p-8 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating background ambient blur */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/20 blur-[90px] rounded-full pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2.5">
            <Search className="w-5 h-5 text-blue-300" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Search City & Station
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-full text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleFormSubmit} className="relative mb-4 flex items-center gap-2">
          <div className="relative flex-grow">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter city name (e.g., Delhi, Tokyo, New York, London)..."
              className="w-full bg-white/10 border border-white/20 rounded-2xl py-3.5 pl-4 pr-10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 backdrop-blur-md"
            />
            {query.length > 0 && !isLoading && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {isLoading && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 text-blue-300 animate-spin" />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="px-4 py-3.5 bg-blue-500/30 hover:bg-blue-500/50 disabled:opacity-40 border border-blue-400/40 text-white text-xs font-semibold rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
          >
            <span>Search</span>
            <CornerDownLeft className="w-3.5 h-3.5 text-blue-200" />
          </button>
        </form>

        {/* GPS Quick Action */}
        <button
          type="button"
          onClick={() => {
            onLocateMe();
            onClose();
          }}
          disabled={isLocating}
          className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/15 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold text-blue-300 hover:text-white transition-all mb-4 cursor-pointer disabled:opacity-50"
        >
          <MapPin className={`w-4 h-4 ${isLocating ? 'animate-bounce text-amber-400' : 'text-blue-400'}`} />
          {isLocating ? 'Detecting Coordinates via GPS...' : 'Use Current Device Location (GPS)'}
        </button>

        {/* Results List */}
        {results.length > 0 ? (
          <div className="space-y-1.5 max-h-60 overflow-y-auto mb-4 pr-1">
            {results.map((loc, idx) => {
              const isHighlighted = selectedIndex === idx;
              return (
                <button
                  key={`${loc.name}-${loc.lat}-${loc.lon}-${idx}`}
                  type="button"
                  onClick={() => handleSelect(loc)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full p-3 rounded-2xl flex justify-between items-center text-left transition-all cursor-pointer group ${
                    isHighlighted
                      ? 'bg-blue-500/25 border border-blue-400/50 text-white shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className={`w-4 h-4 ${isHighlighted ? 'text-blue-300' : 'text-white/40'}`} />
                    <div>
                      <span className="text-sm font-semibold text-white group-hover:text-blue-200">
                        {loc.name}
                      </span>
                      <span className="text-xs text-white/50 ml-2">
                        {loc.state ? `${loc.state}, ` : ''}{loc.country}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-blue-300/80">
                      {loc.lat.toFixed(2)}°, {loc.lon.toFixed(2)}°
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isHighlighted ? 'translate-x-0.5 text-blue-300' : 'opacity-0'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        ) : query.length >= 2 && !isLoading && hasSearched ? (
          <div className="p-4 text-center text-xs text-white/60 bg-white/5 rounded-2xl mb-4 border border-white/10">
            No exact station found matching "{query}". Press Enter or try selecting a metropolis below.
          </div>
        ) : null}

        {/* Quick Popular Cities */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
              Quick Switch Metropolis
            </span>
            <span className="text-[10px] text-blue-300/60 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> One-Click Load
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
            {QUICK_TAGS.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleQuickTagClick(city)}
                className="px-3 py-1.5 bg-white/5 hover:bg-blue-500/20 text-white/80 hover:text-white text-xs rounded-full border border-white/10 hover:border-blue-400/30 transition-all cursor-pointer"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
