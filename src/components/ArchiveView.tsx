import React, { useState } from 'react';
import { Camera, Trash2, Check, MapPin } from 'lucide-react';
import { CurrentWeatherData, WeatherUnit } from '../types';

interface ArchiveViewProps {
  currentWeather: CurrentWeatherData;
  unit: WeatherUnit;
  onSelectCity: (city: { name: string; lat: number; lon: number; country: string }) => void;
}

interface WeatherSnapshot {
  id: string;
  cityName: string;
  country: string;
  temp: number;
  condition: string;
  humidity: number;
  pressure: number;
  windSpeed: number;
  timestamp: number;
}

const PRESET_METROPOLISES = [
  { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503, tag: 'East Asia' },
  { name: 'New York', country: 'US', lat: 40.7128, lon: -74.0060, tag: 'North America' },
  { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278, tag: 'Western Europe' },
  { name: 'Reykjavik', country: 'IS', lat: 64.1466, lon: -21.9426, tag: 'Arctic Zone' },
  { name: 'Dubai', country: 'AE', lat: 25.2048, lon: 55.2708, tag: 'Middle East' },
  { name: 'Sydney', country: 'AU', lat: -33.8688, lon: 151.2093, tag: 'Oceania' },
  { name: 'Singapore', country: 'SG', lat: 1.3521, lon: 103.8198, tag: 'Equatorial' },
  { name: 'Mumbai', country: 'IN', lat: 19.0760, lon: 72.8777, tag: 'South Asia' },
  { name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522, tag: 'Central Europe' },
  { name: 'Cairo', country: 'EG', lat: 30.0444, lon: 31.2357, tag: 'North Africa' },
];

export const ArchiveView: React.FC<ArchiveViewProps> = ({ currentWeather, unit, onSelectCity }) => {
  const [snapshots, setSnapshots] = useState<WeatherSnapshot[]>(() => {
    try {
      const saved = localStorage.getItem('meteo_vortex_snapshots');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [justLogged, setJustLogged] = useState(false);
  const isImperial = unit === 'imperial';
  const tempUnit = isImperial ? '°F' : '°C';

  const handleLogSnapshot = () => {
    const newSnapshot: WeatherSnapshot = {
      id: `${Date.now()}-${Math.random()}`,
      cityName: currentWeather.cityName,
      country: currentWeather.country,
      temp: currentWeather.temp,
      condition: currentWeather.condition,
      humidity: currentWeather.humidity,
      pressure: currentWeather.pressure,
      windSpeed: currentWeather.windSpeed,
      timestamp: Date.now(),
    };

    const updated = [newSnapshot, ...snapshots.slice(0, 19)];
    setSnapshots(updated);
    try {
      localStorage.setItem('meteo_vortex_snapshots', JSON.stringify(updated));
    } catch {
      // ignore
    }

    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 2000);
  };

  const handleDeleteSnapshot = (id: string) => {
    const updated = snapshots.filter((s) => s.id !== id);
    setSnapshots(updated);
    try {
      localStorage.setItem('meteo_vortex_snapshots', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex-grow p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Archive Header */}
      <div className="glass-card rounded-[32px] md:rounded-[40px] p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl">
        <div>
          <span className="text-xs uppercase font-semibold text-blue-300 tracking-wider">
            Station Memory & Global Presets
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-1">
            Station Archive & Saved Telemetry
          </h2>
        </div>

        <button
          onClick={handleLogSnapshot}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all cursor-pointer shadow-lg ${
            justLogged
              ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/50'
              : 'bg-blue-500/25 hover:bg-blue-500/40 text-white border border-blue-400/40'
          }`}
        >
          {justLogged ? <Check className="w-4 h-4 text-emerald-300" /> : <Camera className="w-4 h-4 text-blue-300" />}
          {justLogged ? 'Snapshot Logged' : 'Capture Snapshot'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Preset Metropolis Station Hub (col-span 7) */}
        <div className="lg:col-span-7 glass-card rounded-[36px] p-6 md:p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Global Metropolises
            </h3>
            <span className="text-xs text-white/50">
              One-click station switch
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRESET_METROPOLISES.map((city) => {
              const isCurrent = currentWeather.cityName.toLowerCase() === city.name.toLowerCase();
              return (
                <button
                  key={city.name}
                  onClick={() => onSelectCity(city)}
                  className={`flex items-center justify-between p-4 rounded-2xl text-left transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-500/25 text-white border border-blue-400/40 shadow-[0_0_20px_rgba(59,130,246,0.25)] font-semibold'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium">
                      {city.name}, {city.country}
                    </div>
                    <span className="text-xs text-white/50">
                      {city.tag}
                    </span>
                  </div>
                  {isCurrent ? (
                    <span className="px-2.5 py-1 bg-blue-500/30 text-blue-200 text-[10px] font-semibold rounded-full border border-blue-400/40">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs text-blue-300/70">
                      Connect &rarr;
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Telemetry Snapshot Archive Log (col-span 5) */}
        <div className="lg:col-span-5 glass-card rounded-[36px] p-6 md:p-8 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                Recorded Snapshots ({snapshots.length})
              </h3>
              {snapshots.length > 0 && (
                <button
                  onClick={() => {
                    setSnapshots([]);
                    localStorage.removeItem('meteo_vortex_snapshots');
                  }}
                  className="text-xs text-rose-300 hover:text-rose-200 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {snapshots.length === 0 ? (
              <div className="bg-white/5 rounded-2xl border border-dashed border-white/10 p-8 text-center my-4 text-white/50 text-xs">
                <Camera className="w-8 h-8 mx-auto mb-2 text-white/30" />
                No atmospheric snapshots recorded yet.
                <p className="text-[11px] text-white/40 mt-1">
                  Click "Capture Snapshot" above to store live readings to local memory.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {snapshots.map((s) => (
                  <div
                    key={s.id}
                    className="glass-card-hover rounded-2xl p-3.5 flex justify-between items-center group cursor-pointer hover:border-blue-400/40"
                    onClick={async () => {
                      onSelectCity({ name: s.cityName, country: s.country, lat: currentWeather.lat, lon: currentWeather.lon });
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white group-hover:text-blue-200">
                          {s.cityName}
                        </span>
                        <span className="text-sm font-bold text-blue-300">
                          {s.temp}{tempUnit}
                        </span>
                      </div>
                      <div className="text-xs text-white/50 mt-0.5 capitalize">
                        {s.condition} · {s.humidity}% Humidity · {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSnapshot(s.id);
                      }}
                      title="Delete Snapshot"
                      className="p-1.5 text-white/40 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 mt-4 text-[11px] text-white/40">
            Persistence: Local client cache active
          </div>
        </div>

      </div>
    </div>
  );
};
