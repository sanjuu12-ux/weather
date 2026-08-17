import React, { useState, useRef, useEffect } from 'react';
import { Search, Volume2, VolumeX, Settings, Sparkles, MapPin, CloudSun, X, Loader2, CornerDownLeft } from 'lucide-react';
import { SubNavTab, WeatherUnit, ViewTab, GeoLocation } from '../types';
import { weatherAudio } from '../utils/weatherHelpers';
import { searchCities, resolveCityDirect } from '../services/weatherApi';

interface HeaderProps {
  activeSubTab: SubNavTab;
  setActiveSubTab: (tab: SubNavTab) => void;
  activeViewTab: ViewTab;
  setActiveViewTab: (tab: ViewTab) => void;
  unit: WeatherUnit;
  setUnit: (unit: WeatherUnit) => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onOpenUpgradeModal: () => void;
  cityName: string;
  onQuickLocate: () => void;
  isLocating: boolean;
  onSelectLocation: (loc: GeoLocation) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSubTab,
  setActiveSubTab,
  setActiveViewTab,
  unit,
  setUnit,
  onOpenSearch,
  onOpenSettings,
  onOpenUpgradeModal,
  cityName,
  onQuickLocate,
  isLocating,
  onSelectLocation,
}) => {
  const [audioActive, setAudioActive] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [isSearchingHeader, setIsSearchingHeader] = useState(false);
  const [headerSuggestions, setHeaderSuggestions] = useState<GeoLocation[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const toggleAudio = () => {
    const state = weatherAudio.toggle();
    setAudioActive(state);
  };

  const handleSubTabClick = (tab: SubNavTab) => {
    setActiveSubTab(tab);
    if (tab === 'RADAR' || tab === 'SATELLITE') {
      setActiveViewTab('GEO_DATA');
    } else if (tab === 'ALERTS') {
      setActiveViewTab('EXTREME');
    } else if (tab === 'HISTORICAL') {
      setActiveViewTab('ARCHIVE');
    }
  };

  // Live autocomplete suggestions in header
  useEffect(() => {
    if (!headerSearchQuery || headerSearchQuery.trim().length < 2) {
      setHeaderSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingHeader(true);
      try {
        const results = await searchCities(headerSearchQuery);
        setHeaderSuggestions(results);
      } catch {
        setHeaderSuggestions([]);
      } finally {
        setIsSearchingHeader(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [headerSearchQuery]);

  // Click outside to close header search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHeaderSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headerSearchQuery.trim()) return;

    if (headerSuggestions.length > 0) {
      onSelectLocation(headerSuggestions[0]);
      setShowDropdown(false);
      setHeaderSearchQuery('');
      return;
    }

    setIsSearchingHeader(true);
    try {
      const loc = await resolveCityDirect(headerSearchQuery.trim());
      if (loc) {
        onSelectLocation(loc);
        setShowDropdown(false);
        setHeaderSearchQuery('');
      } else {
        onOpenSearch();
      }
    } catch {
      onOpenSearch();
    } finally {
      setIsSearchingHeader(false);
    }
  };

  const handleSelectSuggestion = (loc: GeoLocation) => {
    onSelectLocation(loc);
    setShowDropdown(false);
    setHeaderSearchQuery('');
  };

  return (
    <header className="flex flex-wrap justify-between items-center w-full px-4 sm:px-6 md:px-10 py-3.5 sticky top-0 z-40 bg-white/[0.04] backdrop-blur-2xl border-b border-white/10 select-none shadow-[0_4px_30px_rgba(0,0,0,0.15)] gap-3">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveViewTab('DASHBOARD')}
          className="flex items-center gap-3 group cursor-pointer text-left"
        >
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 group-hover:border-blue-400/40 group-hover:bg-blue-500/10 transition-all shadow-inner">
            <CloudSun className="w-5 h-5 text-blue-300 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <span className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center">
              ATMOS<span className="font-light text-white/70">WATCH</span>
            </span>
          </div>
        </button>

        <span className="hidden sm:inline-block px-3 py-0.5 bg-blue-500/15 text-blue-300 font-mono text-[10px] font-medium tracking-wider rounded-full border border-blue-400/30 backdrop-blur-md">
          v2.5 PRO
        </span>
      </div>

      {/* Sub Navigation Links in Frosted Glass Pill Container */}
      <nav className="hidden lg:flex items-center gap-1 p-1 bg-white/[0.06] backdrop-blur-xl rounded-full border border-white/10">
        {(['RADAR', 'SATELLITE', 'HISTORICAL', 'ALERTS'] as SubNavTab[]).map((tab) => {
          const isActive = activeSubTab === tab;
          return (
            <button
              key={tab}
              onClick={() => handleSubTabClick(tab)}
              className={`px-4 py-1.5 rounded-full text-xs tracking-wider transition-all cursor-pointer font-medium ${
                isActive
                  ? 'bg-blue-500/30 text-white font-semibold shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-blue-400/40'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </nav>

      {/* Center/Right Search Bar & Controls */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* Interactive Search Bar in Header */}
        <div ref={searchContainerRef} className="relative">
          <form onSubmit={handleHeaderSearchSubmit} className="relative flex items-center">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-blue-300 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={headerSearchQuery}
                onChange={(e) => {
                  setHeaderSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder={`Search city (e.g. ${cityName || 'Tokyo'})...`}
                className="w-40 sm:w-56 md:w-64 pl-9 pr-8 py-2 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 focus:border-blue-400/50 rounded-full text-xs text-white placeholder-white/50 focus:outline-none backdrop-blur-md transition-all shadow-inner"
              />
              {headerSearchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setHeaderSearchQuery('');
                    setHeaderSuggestions([]);
                  }}
                  className="absolute right-3 text-white/40 hover:text-white p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenSearch}
                  title="Open Full Search Dialog"
                  className="absolute right-2.5 text-white/40 hover:text-blue-300 p-0.5 cursor-pointer"
                >
                  <CornerDownLeft className="w-3 h-3" />
                </button>
              )}
            </div>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showDropdown && headerSearchQuery.trim().length >= 2 && (
            <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-[#0a1e38]/95 backdrop-blur-3xl border border-white/20 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in max-h-64 overflow-y-auto">
              <div className="flex justify-between items-center px-3 py-1.5 border-b border-white/10 text-[10px] uppercase font-semibold text-white/40">
                <span>Matching Cities</span>
                {isSearchingHeader && <Loader2 className="w-3 h-3 text-blue-300 animate-spin" />}
              </div>

              {headerSuggestions.length > 0 ? (
                <div className="space-y-1 mt-1">
                  {headerSuggestions.map((loc, idx) => (
                    <button
                      key={`${loc.name}-${loc.lat}-${loc.lon}-${idx}`}
                      type="button"
                      onClick={() => handleSelectSuggestion(loc)}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-blue-500/25 flex items-center justify-between text-xs text-white transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-blue-300" />
                        <span className="font-medium group-hover:text-blue-200">
                          {loc.name}
                        </span>
                        <span className="text-white/40 text-[11px]">
                          {loc.country}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-blue-300/70">
                        {loc.lat.toFixed(1)}°, {loc.lon.toFixed(1)}°
                      </span>
                    </button>
                  ))}
                </div>
              ) : !isSearchingHeader ? (
                <div className="p-3 text-center text-xs text-white/50">
                  Press Enter to search "{headerSearchQuery}" or click below
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  setShowDropdown(false);
                  onOpenSearch();
                }}
                className="w-full mt-1 pt-2 border-t border-white/10 text-center text-xs text-blue-300 hover:text-blue-200 py-1 hover:underline cursor-pointer"
              >
                Open Advanced Search & Global Metropolises &rarr;
              </button>
            </div>
          )}
        </div>

        {/* Quick GPS Location */}
        <button
          onClick={onQuickLocate}
          disabled={isLocating}
          title="Detect Current Location via GPS"
          className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/15 text-white/80 hover:text-white border border-white/20 rounded-full text-xs font-medium backdrop-blur-md transition-all cursor-pointer disabled:opacity-50"
        >
          <MapPin className={`w-3.5 h-3.5 ${isLocating ? 'animate-bounce text-amber-400' : 'text-blue-400'}`} />
          <span className="hidden sm:inline">{isLocating ? 'Locating...' : 'GPS'}</span>
        </button>

        {/* Unit Switcher: Fahrenheit (°F) / Celsius (°C) */}
        <div className="flex items-center bg-white/10 p-1 rounded-full border border-white/20 backdrop-blur-md shadow-inner">
          <button
            type="button"
            onClick={() => setUnit('imperial')}
            title="Switch to Fahrenheit (°F)"
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1 ${
              unit === 'imperial'
                ? 'bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)] border border-blue-400/50'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>°F</span>
            <span className="hidden sm:inline font-normal text-[10px] text-white/80">Fahrenheit</span>
          </button>
          <button
            type="button"
            onClick={() => setUnit('metric')}
            title="Switch to Celsius (°C)"
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1 ${
              unit === 'metric'
                ? 'bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)] border border-blue-400/50'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>°C</span>
            <span className="hidden sm:inline font-normal text-[10px] text-white/80">Celsius</span>
          </button>
        </div>

        {/* Audio Ambience Synthesizer Toggle */}
        <button
          onClick={toggleAudio}
          title={audioActive ? 'Mute Atmospheric Audio Synthesizer' : 'Activate Atmospheric Audio Synthesizer'}
          className={`p-2 rounded-full border backdrop-blur-md transition-all cursor-pointer ${
            audioActive
              ? 'bg-blue-500/30 text-blue-300 border-blue-400/40 shadow-[0_0_12px_rgba(59,130,246,0.4)]'
              : 'bg-white/10 text-white/60 hover:text-white border-white/20'
          }`}
        >
          {audioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Upgrade Pro Action */}
        <button
          onClick={onOpenUpgradeModal}
          className="hidden xl:flex items-center gap-1.5 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/35 border border-blue-400/35 text-white rounded-full text-xs font-semibold backdrop-blur-md transition-all shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:scale-[1.02] cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-300" />
          PRO RADAR
        </button>

        {/* Settings modal button */}
        <button
          onClick={onOpenSettings}
          title="Terminal Settings & Custom API Key"
          className="p-2 text-white/60 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 rounded-full backdrop-blur-md transition-all cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
