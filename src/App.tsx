import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ExtremeView } from './components/ExtremeView';
import { AtmosphereView } from './components/AtmosphereView';
import { GeoDataView } from './components/GeoDataView';
import { ArchiveView } from './components/ArchiveView';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { LiveFeedModal } from './components/LiveFeedModal';
import { SettingsModal } from './components/SettingsModal';
import { UpgradeProModal } from './components/UpgradeProModal';
import { fetchCurrentWeather, fetchAirQuality, fetch5DayForecast, reverseGeocode } from './services/weatherApi';
import { CurrentWeatherData, AirQualityData, ForecastDayItem, ForecastHourlyItem, GeoLocation, ViewTab, SubNavTab, WeatherUnit } from './types';
import { AlertCircle, RefreshCw, Radio } from 'lucide-react';

const DEFAULT_CITY: GeoLocation = {
  name: 'New York',
  lat: 40.7128,
  lon: -74.0060,
  country: 'US',
  state: 'NY',
};

export default function App() {
  const [activeViewTab, setActiveViewTab] = useState<ViewTab>('DASHBOARD');
  const [activeSubTab, setActiveSubTab] = useState<SubNavTab>('RADAR');
  const [unit, setUnit] = useState<WeatherUnit>(() => {
    try {
      const saved = localStorage.getItem('meteo_vortex_unit');
      if (saved === 'imperial' || saved === 'metric') return saved;
    } catch {
      // ignore
    }
    return 'imperial';
  });

  const handleSetUnit = (newUnit: WeatherUnit) => {
    setUnit(newUnit);
    try {
      localStorage.setItem('meteo_vortex_unit', newUnit);
    } catch {
      // ignore
    }
  };
  const [location, setLocation] = useState<GeoLocation>(() => {
    try {
      const saved = localStorage.getItem('meteo_vortex_last_location');
      return saved ? JSON.parse(saved) : DEFAULT_CITY;
    } catch {
      return DEFAULT_CITY;
    }
  });

  const [weather, setWeather] = useState<CurrentWeatherData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [forecastDays, setForecastDays] = useState<ForecastDayItem[]>([]);
  const [forecastHourly, setForecastHourly] = useState<ForecastHourlyItem[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isLiveFeedOpen, setIsLiveFeedOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Load weather pipeline
  const loadWeatherData = useCallback(async (targetLoc: GeoLocation, targetUnit: WeatherUnit) => {
    setIsLoading(true);
    setError(null);

    try {
      const [currentRes, aqiRes, forecastRes] = await Promise.all([
        fetchCurrentWeather(targetLoc.lat, targetLoc.lon, targetUnit),
        fetchAirQuality(targetLoc.lat, targetLoc.lon),
        fetch5DayForecast(targetLoc.lat, targetLoc.lon, targetUnit),
      ]);

      // Preserve explicit target city name if API returns sub-locality
      if (targetLoc.name && targetLoc.name.length > 0) {
        currentRes.cityName = targetLoc.name;
        if (targetLoc.country) currentRes.country = targetLoc.country;
      }

      setWeather(currentRes);
      setAirQuality(aqiRes);
      setForecastDays(forecastRes.days);
      setForecastHourly(forecastRes.hourly);

      try {
        localStorage.setItem('meteo_vortex_last_location', JSON.stringify(targetLoc));
      } catch {
        // ignore
      }
    } catch (err: unknown) {
      console.error('Failed to load telemetry', err);
      setError(err instanceof Error ? err.message : 'Unable to connect to OpenWeather telemetry stream');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeatherData(location, unit);
  }, [location, unit, loadWeatherData]);

  // Handle Location Switch
  const handleSelectLocation = (loc: GeoLocation) => {
    setLocation(loc);
  };

  // Handle HTML5 Geolocation locate me
  const handleQuickLocate = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser environment.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        
        let geoInfo: GeoLocation = {
          name: 'Current Station',
          lat,
          lon,
          country: 'GPS',
        };

        try {
          const rev = await reverseGeocode(lat, lon);
          if (rev) {
            geoInfo = rev;
          }
        } catch {
          // fallback to coordinates
        }

        setLocation(geoInfo);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation failed', err);
        setIsLocating(false);
        setError('GPS positioning request declined or unavailable. Switched to default station.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const hasExtremeWarning = weather ? (weather.weatherId >= 200 && weather.weatherId < 300) || weather.windSpeed > 25 : false;

  return (
    <div className="dot-grid-bg text-white min-h-screen flex flex-col antialiased selection:bg-blue-500 selection:text-white relative overflow-x-hidden">
      {/* Ambient background light orbs */}
      <div className="fixed -top-40 -right-40 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse-slow"></div>
      <div className="fixed top-1/3 -left-40 w-96 h-96 bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none -z-10 animate-pulse-slow"></div>
      <div className="fixed -bottom-40 right-1/4 w-96 h-96 bg-cyan-600/15 blur-[140px] rounded-full pointer-events-none -z-10 animate-pulse-slow"></div>

      {/* Top Header Bar */}
      <Header
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
        activeViewTab={activeViewTab}
        setActiveViewTab={setActiveViewTab}
        unit={unit}
        setUnit={handleSetUnit}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
        cityName={weather?.cityName || location.name}
        onQuickLocate={handleQuickLocate}
        isLocating={isLocating}
        onSelectLocation={handleSelectLocation}
      />

      {/* Main Body Section with Side Navigation */}
      <div className="flex-grow flex flex-col lg:flex-row min-w-0 pb-16 lg:pb-0 z-10">
        {/* Left SideNav */}
        <Sidebar
          activeTab={activeViewTab}
          setActiveTab={setActiveViewTab}
          lat={weather?.lat ?? location.lat}
          cityName={weather?.cityName ?? location.name}
          onOpenLiveFeed={() => setIsLiveFeedOpen(true)}
          hasExtremeWarning={hasExtremeWarning}
        />

        {/* Dynamic Main Content Container */}
        <main className="flex-grow flex flex-col min-w-0">
          {/* Error Banner */}
          {error && (
            <div className="mx-4 md:mx-8 mt-4 p-4 bg-rose-500/20 backdrop-blur-xl text-rose-200 border border-rose-400/30 rounded-2xl flex justify-between items-center text-xs">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => loadWeatherData(location, unit)}
                className="px-3 py-1.5 bg-rose-500/30 hover:bg-rose-500/50 text-white font-medium rounded-xl border border-rose-400/40 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> RETRY
              </button>
            </div>
          )}

          {/* Loading Radar Overlay */}
          {isLoading && !weather && (
            <div className="flex-grow flex flex-col items-center justify-center p-12 space-y-4">
              <div className="relative w-20 h-20 bg-white/5 backdrop-blur-2xl border border-white/20 rounded-full flex items-center justify-center shadow-2xl">
                <div className="absolute inset-0 rounded-full border border-blue-400/40 animate-ping opacity-30"></div>
                <Radio className="w-8 h-8 text-blue-400 animate-pulse" />
              </div>
              <span className="text-sm font-semibold tracking-wider text-blue-300">
                CONNECTING ATMOSPHERIC TELEMETRY...
              </span>
              <p className="text-xs text-white/50">
                Synchronizing OpenWeather Core Streams
              </p>
            </div>
          )}

          {/* Render Active View */}
          {weather && airQuality && (
            <>
              {activeViewTab === 'DASHBOARD' && (
                <DashboardView
                  weather={weather}
                  airQuality={airQuality}
                  forecastDays={forecastDays}
                  forecastHourly={forecastHourly}
                  unit={unit}
                  onToggleUnit={handleSetUnit}
                  onOpenLiveFeed={() => setIsLiveFeedOpen(true)}
                />
              )}

              {activeViewTab === 'EXTREME' && (
                <ExtremeView
                  weather={weather}
                  airQuality={airQuality}
                  unit={unit}
                />
              )}

              {activeViewTab === 'ATMOSPHERE' && (
                <AtmosphereView
                  weather={weather}
                  airQuality={airQuality}
                  unit={unit}
                />
              )}

              {activeViewTab === 'GEO_DATA' && (
                <GeoDataView
                  weather={weather}
                  unit={unit}
                />
              )}

              {activeViewTab === 'ARCHIVE' && (
                <ArchiveView
                  currentWeather={weather}
                  unit={unit}
                  onSelectCity={handleSelectLocation}
                />
              )}
            </>
          )}

          {/* Footer Component */}
          {weather && (
            <Footer
              lat={weather.lat}
              lon={weather.lon}
              timezoneOffsetSeconds={weather.timezone}
            />
          )}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectLocation={handleSelectLocation}
        onLocateMe={handleQuickLocate}
        isLocating={isLocating}
      />

      <LiveFeedModal
        isOpen={isLiveFeedOpen}
        onClose={() => setIsLiveFeedOpen(false)}
        weather={weather || {
          cityName: location.name,
          country: location.country,
          lat: location.lat,
          lon: location.lon,
          temp: 72,
          feelsLike: 72,
          tempMin: 68,
          tempMax: 76,
          humidity: 50,
          pressure: 1013,
          visibility: 10,
          windSpeed: 15,
          windDeg: 240,
          clouds: 40,
          weatherId: 800,
          condition: 'Clear',
          description: 'clear sky',
          icon: '01d',
          sunrise: Date.now(),
          sunset: Date.now(),
          timezone: 0,
          dt: Date.now(),
        }}
        unit={unit}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        unit={unit}
        setUnit={setUnit}
        onReload={() => loadWeatherData(location, unit)}
      />

      <UpgradeProModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
}
