import React from 'react';
import { AlertTriangle, Zap, Wind, Flame, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { CurrentWeatherData, AirQualityData, WeatherUnit } from '../types';
import { degToCardinal } from '../utils/weatherHelpers';

interface ExtremeViewProps {
  weather: CurrentWeatherData;
  airQuality: AirQualityData;
  unit: WeatherUnit;
}

export const ExtremeView: React.FC<ExtremeViewProps> = ({ weather, airQuality, unit }) => {
  const isImperial = unit === 'imperial';
  const windMph = isImperial ? weather.windSpeed : weather.windSpeed * 0.621371;
  const tempF = isImperial ? weather.temp : (weather.temp * 9) / 5 + 32;

  // Beaufort Wind Scale Calculation
  const getBeaufort = (speedMph: number) => {
    if (speedMph < 1) return { num: 0, desc: 'Calm', effect: 'Smoke rises vertically' };
    if (speedMph <= 3) return { num: 1, desc: 'Light Air', effect: 'Smoke drift indicates wind direction' };
    if (speedMph <= 7) return { num: 2, desc: 'Light Breeze', effect: 'Wind felt on exposed skin' };
    if (speedMph <= 12) return { num: 3, desc: 'Gentle Breeze', effect: 'Leaves and small twigs in constant motion' };
    if (speedMph <= 18) return { num: 4, desc: 'Moderate Breeze', effect: 'Dust and loose paper raised' };
    if (speedMph <= 24) return { num: 5, desc: 'Fresh Breeze', effect: 'Small trees in leaf begin to sway' };
    if (speedMph <= 31) return { num: 6, desc: 'Strong Breeze', effect: 'Large branches in motion; whistling in wires' };
    if (speedMph <= 38) return { num: 7, desc: 'Near Gale', effect: 'Whole trees in motion; resistance walking against wind' };
    if (speedMph <= 46) return { num: 8, desc: 'Gale', effect: 'Twigs break off trees; progress generally impeded' };
    if (speedMph <= 54) return { num: 9, desc: 'Strong Gale', effect: 'Slight structural damage occurs; roof slate dislodged' };
    if (speedMph <= 63) return { num: 10, desc: 'Storm', effect: 'Trees uprooted; considerable structural damage' };
    if (speedMph <= 72) return { num: 11, desc: 'Violent Storm', effect: 'Widespread structural damage' };
    return { num: 12, desc: 'Hurricane Force', effect: 'Devastation occurring; catastrophic structural failure' };
  };

  const beaufort = getBeaufort(windMph);

  // Storm Warning Severity Level
  const isStorm = weather.weatherId >= 200 && weather.weatherId < 300;
  const isHighWind = windMph >= 25;
  const isHeatWave = tempF >= 95;
  const isFrostAlert = tempF <= 32;
  const isBadAir = airQuality.aqiUs > 150;

  const activeAlertCount = [isStorm, isHighWind, isHeatWave, isFrostAlert, isBadAir].filter(Boolean).length;

  return (
    <div className="flex-grow p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Banner Alert System */}
      <div className={`glass-card rounded-[32px] md:rounded-[40px] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden border ${
        activeAlertCount > 0
          ? 'bg-amber-500/10 border-amber-400/30'
          : 'bg-white/5 border-white/10'
      }`}>
        <div className="flex items-center gap-5">
          <div className={`p-4 rounded-3xl backdrop-blur-xl border ${
            activeAlertCount > 0 
              ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-[0_0_25px_rgba(245,158,11,0.25)]' 
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 shadow-[0_0_25px_rgba(16,185,129,0.2)]'
          }`}>
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-md ${
                activeAlertCount > 0
                  ? 'bg-amber-500/20 text-amber-200 border-amber-400/30'
                  : 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
              }`}>
                {activeAlertCount > 1 ? 'Elevated Critical Warning' : activeAlertCount === 1 ? 'Moderate Advisory' : 'Nominal Advisory'}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
              {activeAlertCount > 0 ? `${activeAlertCount} Severe Weather Advisories Active` : 'No Severe Weather Hazards Detected'}
            </h2>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 text-xs text-white/70 space-y-1">
          <div><span className="text-white/40">STATION:</span> <span className="font-semibold text-white">{weather.cityName}</span></div>
          <div><span className="text-white/40">COORDINATES:</span> <span className="font-mono text-blue-300">{weather.lat.toFixed(2)}°, {weather.lon.toFixed(2)}°</span></div>
        </div>
      </div>

      {/* Grid of Extreme Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Beaufort Wind Analyzer */}
        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-blue-300" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                Beaufort Wind Force
              </h3>
            </div>
            <span className="px-2.5 py-0.5 bg-blue-500/15 text-blue-200 text-xs font-medium rounded-full border border-blue-400/30">
              Force {beaufort.num} / 12
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-5 text-center my-3 border border-white/10">
            <span className="text-3xl font-bold text-white tracking-tight">
              {beaufort.desc}
            </span>
            <p className="text-xs text-white/60 mt-2">
              {beaufort.effect}
            </p>
          </div>

          <div className="space-y-2 mt-2 text-xs text-white/70">
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span>Sustained Velocity:</span>
              <span className="text-white font-semibold">{weather.windSpeed} {isImperial ? 'mph' : 'km/h'}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span>Estimated Peak Gust:</span>
              <span className="text-amber-300 font-semibold">{weather.windGust ? `${weather.windGust} ${isImperial ? 'mph' : 'km/h'}` : `${Math.round(weather.windSpeed * 1.35)} ${isImperial ? 'mph' : 'km/h'}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Vector Heading:</span>
              <span className="text-blue-300 font-semibold">{weather.windDeg}° ({degToCardinal(weather.windDeg)})</span>
            </div>
          </div>
        </div>

        {/* Convective Instability & Lightning */}
        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-300" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                Cyclonic Discharge
              </h3>
            </div>
            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${
              isStorm ? 'bg-amber-500/20 text-amber-300 border-amber-400/40' : 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
            }`}>
              {isStorm ? 'Cell Active' : 'Nominal Cell'}
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-5 text-center my-3 border border-white/10">
            <span className={`text-3xl font-bold ${isStorm ? 'text-amber-300' : 'text-emerald-300'}`}>
              {isStorm ? 'High Instability' : 'Stable Margin'}
            </span>
            <p className="text-xs text-white/60 mt-2">
              Atmospheric Lifted Index: {isStorm ? '-4.2 (Severe Instability)' : '+3.1 (Stable Margin)'}
            </p>
          </div>

          <div className="space-y-2 mt-2 text-xs text-white/70">
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span>Cloud Density:</span>
              <span className="text-white font-semibold">{weather.clouds}% Cover</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span>Barometric Gradient:</span>
              <span className="text-blue-300 font-semibold">{weather.pressure} hPa</span>
            </div>
            <div className="flex justify-between">
              <span>Precipitation Type:</span>
              <span className="text-white font-semibold capitalize">{weather.condition}</span>
            </div>
          </div>
        </div>

        {/* Thermal Stress & Survival Advisory */}
        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-300" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                Thermal Load Status
              </h3>
            </div>
            <span className="px-2.5 py-0.5 bg-white/10 text-white text-xs font-medium rounded-full border border-white/15">
              Feels {weather.feelsLike}°
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-5 text-center my-3 border border-white/10">
            <span className={`text-3xl font-bold ${
              isHeatWave ? 'text-rose-300' : isFrostAlert ? 'text-cyan-300' : 'text-emerald-300'
            }`}>
              {isHeatWave ? 'Hyperthermic Risk' : isFrostAlert ? 'Freezing Risk' : 'Thermal Balance'}
            </span>
            <p className="text-xs text-white/60 mt-2">
              Relative Humidity Load: {weather.humidity}%
            </p>
          </div>

          <div className="space-y-2 mt-2 text-xs text-white/70">
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span>Diurnal Temp Delta:</span>
              <span className="text-white font-semibold">{Math.abs(weather.tempMax - weather.tempMin)}°</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span>Air Quality Status:</span>
              <span className={`font-semibold ${airQuality.aqiUs > 100 ? 'text-amber-300' : 'text-emerald-300'}`}>{airQuality.category} ({airQuality.aqiUs})</span>
            </div>
            <div className="flex justify-between">
              <span>Visibility Range:</span>
              <span className="text-white font-semibold">{weather.visibility} {isImperial ? 'mi' : 'km'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Emergency Operational Protocol Checklist */}
      <div className="glass-card rounded-[32px] p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
          <ShieldAlert className="w-6 h-6 text-blue-300" />
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Station Operational Safety Protocol
            </h3>
            <p className="text-xs text-white/50">Standard meteorological response checklist</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="glass-card-hover rounded-2xl p-4 flex items-start gap-3.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Surface Drainage Monitoring</div>
              <p className="text-white/60 mt-1">Verify runoff channels if precipitation rate exceeds 15mm/hr.</p>
            </div>
          </div>

          <div className="glass-card-hover rounded-2xl p-4 flex items-start gap-3.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Structural Wind Anchoring</div>
              <p className="text-white/60 mt-1">Secure lightweight outdoor hardware if Beaufort force exceeds 6.</p>
            </div>
          </div>

          <div className="glass-card-hover rounded-2xl p-4 flex items-start gap-3.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Aerosol & Particulate Filtration</div>
              <p className="text-white/60 mt-1">Activate HVAC HEPA air recirculators if PM2.5 crosses 35.0 μg/m³ threshold.</p>
            </div>
          </div>

          <div className="glass-card-hover rounded-2xl p-4 flex items-start gap-3.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Optical Visibility Sensors</div>
              <p className="text-white/60 mt-1">Keep infrared telemetry beacon operational during low ceiling fog events.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
