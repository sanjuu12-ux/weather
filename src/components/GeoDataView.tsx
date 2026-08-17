import React, { useState } from 'react';
import { Compass, Sun, Play, Pause, Wind } from 'lucide-react';
import { CurrentWeatherData, WeatherUnit } from '../types';
import { formatCoordinate, degToCardinal } from '../utils/weatherHelpers';

interface GeoDataViewProps {
  weather: CurrentWeatherData;
  unit: WeatherUnit;
}

type RadarLayer = 'precipitation' | 'clouds' | 'temperature' | 'wind';

export const GeoDataView: React.FC<GeoDataViewProps> = ({ weather, unit }) => {
  const [activeLayer, setActiveLayer] = useState<RadarLayer>('precipitation');
  const [isScanning, setIsScanning] = useState(true);
  const isImperial = unit === 'imperial';

  const sunriseTime = new Date(weather.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sunsetTime = new Date(weather.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const daylightHours = ((weather.sunset - weather.sunrise) / (1000 * 60 * 60)).toFixed(1);

  // Timezone in UTC format
  const timezoneHours = weather.timezone / 3600;
  const timezoneString = `UTC ${timezoneHours >= 0 ? `+${timezoneHours}` : timezoneHours}`;

  // Solar progress estimate (0 to 100%)
  const now = Date.now();
  const solarProgress = Math.max(0, Math.min(100, Math.round(((now - weather.sunrise) / (weather.sunset - weather.sunrise)) * 100)));

  return (
    <div className="flex-grow p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Station Coordinates & Map Header */}
      <div className="glass-card rounded-[32px] md:rounded-[40px] p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl">
        <div>
          <span className="text-xs uppercase font-semibold text-blue-300 tracking-wider">
            Geophysical & Orbital Station
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-1">
            {weather.cityName}, {weather.country} Radar & Celestial Geometry
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-white/10 border border-white/20 text-blue-300 font-mono text-xs rounded-full backdrop-blur-md">
            {formatCoordinate(weather.lat, weather.lon)}
          </div>
          <div className="px-4 py-2 bg-white/5 border border-white/10 text-white/70 font-mono text-xs rounded-full backdrop-blur-md">
            {timezoneString}
          </div>
        </div>
      </div>

      {/* Radar Visualizer & Tactical Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Radar View Canvas (col-span 8) */}
        <div className="lg:col-span-8 glass-card rounded-[36px] p-6 md:p-8 relative overflow-hidden flex flex-col min-h-[480px] shadow-2xl">
          {/* Top Controls on Radar */}
          <div className="flex flex-wrap justify-between items-center z-20 mb-4 gap-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-400"></span>
              </span>
              <span className="text-xs uppercase font-semibold text-white/90 tracking-wider">
                Doppler Scan: {weather.cityName}
              </span>
            </div>

            {/* Layer Switcher Buttons */}
            <div className="flex gap-1 bg-white/10 p-1 rounded-full border border-white/15 backdrop-blur-md text-xs">
              {(['precipitation', 'clouds', 'temperature', 'wind'] as RadarLayer[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setActiveLayer(l)}
                  className={`px-3 py-1 rounded-full capitalize font-medium transition-all cursor-pointer ${
                    activeLayer === l
                      ? 'bg-blue-500/30 text-white border border-blue-400/40 shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Simulated Radar Canvas with Range Rings and Sweep Beam */}
          <div className="relative flex-grow flex items-center justify-center rounded-3xl border border-white/10 bg-[#051122]/70 overflow-hidden my-2 min-h-[300px]">
            {/* Concentric Range Rings */}
            <div className="absolute w-[85%] h-[85%] border border-blue-400/15 rounded-full pointer-events-none"></div>
            <div className="absolute w-[60%] h-[60%] border border-blue-400/20 rounded-full pointer-events-none"></div>
            <div className="absolute w-[35%] h-[35%] border border-blue-400/25 rounded-full pointer-events-none"></div>
            <div className="absolute w-[12%] h-[12%] border border-blue-400/30 rounded-full pointer-events-none"></div>

            {/* Radar Crosshairs */}
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-blue-400/15 pointer-events-none"></div>
            <div className="absolute inset-y-0 left-1/2 w-[1px] bg-blue-400/15 pointer-events-none"></div>

            {/* Radar Sweep Arc Beam */}
            {isScanning && (
              <div 
                className="absolute w-full h-full animate-radar-sweep pointer-events-none"
                style={{
                  background: 'conic-gradient(from 0deg at 50% 50%, rgba(59, 130, 246, 0) 0deg, rgba(59, 130, 246, 0.15) 30deg, rgba(96, 165, 250, 0.45) 60deg, transparent 65deg)',
                }}
              ></div>
            )}

            {/* Dynamic Echo Clusters based on active layer */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {activeLayer === 'precipitation' && (
                <>
                  <div className="absolute top-[28%] left-[35%] w-28 h-28 bg-blue-500/40 rounded-full blur-xl animate-pulse"></div>
                  <div className="absolute top-[40%] right-[30%] w-36 h-32 bg-cyan-500/30 rounded-full blur-2xl animate-pulse"></div>
                  <div className="absolute bottom-[25%] left-[45%] w-24 h-24 bg-teal-500/30 rounded-full blur-lg"></div>
                </>
              )}
              {activeLayer === 'clouds' && (
                <>
                  <div className="absolute inset-10 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="absolute top-[20%] right-[20%] w-44 h-44 bg-white/15 rounded-full blur-2xl"></div>
                </>
              )}
              {activeLayer === 'temperature' && (
                <>
                  <div className="absolute inset-12 bg-gradient-to-tr from-amber-500/30 via-indigo-500/20 to-blue-500/30 rounded-full blur-2xl"></div>
                </>
              )}
              {activeLayer === 'wind' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-blue-300 text-xs font-mono font-semibold flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                    <Wind className="w-4 h-4 text-blue-300" /> Vector: {weather.windSpeed} {isImperial ? 'mph' : 'km/h'} @ {weather.windDeg}°
                  </div>
                </div>
              )}
            </div>

            {/* Central Station Beacon Marker */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-3.5 h-3.5 bg-blue-400 border-2 border-white rounded-full shadow-[0px_0px_15px_#60a5fa]"></div>
              <span className="text-[11px] font-semibold text-white bg-blue-600/80 px-2 py-0.5 rounded-full mt-2 tracking-wider backdrop-blur-md border border-blue-400/40">
                {weather.cityName}
              </span>
            </div>

            {/* Distance Marker Labels */}
            <span className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] text-white/40 font-mono">
              NORTH (150 KM)
            </span>
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-white/40 font-mono">
              SOUTH (150 KM)
            </span>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40 font-mono">
              EAST
            </span>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40 font-mono">
              WEST
            </span>
          </div>

          {/* Bottom Radar Status Strip */}
          <div className="flex flex-wrap justify-between items-center mt-3 z-10 text-xs text-white/60">
            <div className="flex items-center gap-4">
              <span>Scan Mode: <strong className="text-white">Dual-Pol Doppler</strong></span>
              <span>Band: <strong className="text-blue-300">S-Band (2.8 GHz)</strong></span>
            </div>
            <button
              onClick={() => setIsScanning(!isScanning)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl text-xs font-medium transition-all cursor-pointer backdrop-blur-md"
            >
              {isScanning ? <Pause className="w-3.5 h-3.5 text-amber-300" /> : <Play className="w-3.5 h-3.5 text-emerald-300" />}
              {isScanning ? 'Freeze Scan' : 'Resume Scan'}
            </button>
          </div>
        </div>

        {/* Right Celestial & Solar Geophysics (col-span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Solar Orbit & Daylight Card */}
          <div className="glass-card rounded-3xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                Solar Trajectory
              </h3>
              <Sun className="w-5 h-5 text-amber-300" />
            </div>

            {/* Sun Arc Visualization */}
            <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/10">
              <div className="relative w-full h-24 flex items-end justify-center overflow-hidden border-b border-white/10">
                <div className="w-48 h-48 border border-dashed border-amber-300/30 rounded-full absolute -bottom-24"></div>
                <div 
                  className="w-5 h-5 bg-amber-400 rounded-full absolute border-2 border-white shadow-[0_0_15px_#fbbf24] transition-all"
                  style={{
                    bottom: `${Math.sin((solarProgress / 100) * Math.PI) * 60 + 5}px`,
                    left: `${solarProgress}%`,
                    transform: 'translateX(-50%)',
                  }}
                ></div>
              </div>

              <div className="flex justify-between items-center mt-3 text-xs">
                <div className="text-left">
                  <span className="text-white/40 block text-[10px]">SUNRISE</span>
                  <span className="text-white font-medium">{sunriseTime}</span>
                </div>
                <div className="text-center">
                  <span className="text-amber-300 block text-[10px]">DAYLIGHT</span>
                  <span className="text-white font-medium">{daylightHours} hrs</span>
                </div>
                <div className="text-right">
                  <span className="text-white/40 block text-[10px]">SUNSET</span>
                  <span className="text-white font-medium">{sunsetTime}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs text-white/70">
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span>Solar Elevation:</span>
                <span className="text-blue-300 font-semibold">
                  {solarProgress > 0 && solarProgress < 100 ? `${Math.round(Math.sin((solarProgress / 100) * Math.PI) * 68)}° Altitude` : 'Below Horizon'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Solar Noon (Estimated):</span>
                <span className="text-white font-medium">12:44 PM</span>
              </div>
            </div>
          </div>

          {/* Compass & Wind Rose Navigation */}
          <div className="glass-card rounded-3xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                Wind Vector Compass
              </h3>
              <Compass className="w-5 h-5 text-blue-300" />
            </div>

            <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center border border-white/10">
              <div className="relative w-28 h-28 border border-white/20 rounded-full flex items-center justify-center">
                <span className="absolute top-1.5 text-[10px] font-bold text-amber-400">N</span>
                <span className="absolute bottom-1.5 text-[10px] font-medium text-white/50">S</span>
                <span className="absolute right-2 text-[10px] font-medium text-white/50">E</span>
                <span className="absolute left-2 text-[10px] font-medium text-white/50">W</span>
                
                {/* Needle */}
                <div 
                  className="w-1 h-20 bg-gradient-to-t from-blue-500/20 via-blue-400 to-amber-400 rounded-full transition-transform"
                  style={{ transform: `rotate(${weather.windDeg}deg)` }}
                ></div>
                <div className="w-3 h-3 bg-white rounded-full absolute border border-blue-400"></div>
              </div>

              <div className="mt-3 text-center">
                <span className="text-2xl font-bold text-white">
                  {weather.windSpeed} {isImperial ? 'mph' : 'km/h'}
                </span>
                <p className="text-xs text-white/60 mt-0.5">
                  Heading: {weather.windDeg}° ({degToCardinal(weather.windDeg)})
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
