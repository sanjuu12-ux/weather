import React, { useState } from 'react';
import { 
  Wind, 
  Eye, 
  Sun, 
  CloudRain, 
  CloudLightning, 
  Cloud, 
  CloudSun, 
  Snowflake, 
  Droplets, 
  Gauge, 
  Thermometer, 
  Clock, 
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ShieldCheck
} from 'lucide-react';
import { CurrentWeatherData, AirQualityData, ForecastDayItem, ForecastHourlyItem, WeatherUnit } from '../types';
import { degToCardinal, calculateUVIndex, calculateDewPoint, getDiagnosticNarrative, getWeatherSticker } from '../utils/weatherHelpers';

interface DashboardViewProps {
  weather: CurrentWeatherData;
  airQuality: AirQualityData;
  forecastDays: ForecastDayItem[];
  forecastHourly: ForecastHourlyItem[];
  unit: WeatherUnit;
  onToggleUnit?: (unit: WeatherUnit) => void;
  onOpenLiveFeed: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  weather,
  airQuality,
  forecastDays,
  forecastHourly,
  unit,
  onToggleUnit,
  onOpenLiveFeed,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const isImperial = unit === 'imperial';
  const tempUnit = isImperial ? '°F' : '°C';
  const speedUnit = isImperial ? 'mph' : 'km/h';
  const visUnit = isImperial ? 'mi' : 'km';

  // Calculate true day High & Low from today's forecast slices & current weather
  const todayForecast = forecastDays && forecastDays.length > 0 ? forecastDays[0] : null;
  let trueHigh = weather.tempMax;
  let trueLow = weather.tempMin;

  if (todayForecast) {
    trueHigh = Math.max(weather.temp, weather.tempMax, todayForecast.tempMax);
    trueLow = Math.min(weather.temp, weather.tempMin, todayForecast.tempMin);
  }

  // If High and Low from station are identical (due to single reading), ensure a natural diurnal span
  if (trueHigh <= trueLow) {
    trueHigh = weather.temp + (isImperial ? 3 : 2);
    trueLow = Math.max(isImperial ? -20 : -30, weather.temp - (isImperial ? 5 : 3));
  }

  const feelsLike = weather.feelsLike;
  const feelsLikeDelta = feelsLike - weather.temp;

  const cardinalDir = degToCardinal(weather.windDeg);
  const localHour = new Date(weather.dt).getHours();
  const uv = calculateUVIndex(weather.clouds, localHour, weather.lat);
  const dewPoint = calculateDewPoint(
    isImperial ? ((weather.temp - 32) * 5) / 9 : weather.temp,
    weather.humidity
  );
  const formattedDewPoint = isImperial ? Math.round((dewPoint * 9) / 5 + 32) : Math.round(dewPoint);

  const diagnosticText = getDiagnosticNarrative(weather, isImperial);
  const sticker = getWeatherSticker(weather, isImperial);

  const getConditionIcon = (weatherId: number, className = 'w-6 h-6') => {
    if (weatherId >= 200 && weatherId < 300) return <CloudLightning className={`${className} text-amber-400`} />;
    if (weatherId >= 300 && weatherId < 600) return <CloudRain className={`${className} text-blue-400`} />;
    if (weatherId >= 600 && weatherId < 700) return <Snowflake className={`${className} text-cyan-200`} />;
    if (weatherId >= 700 && weatherId < 800) return <Wind className={`${className} text-slate-300`} />;
    if (weatherId === 800) return <Sun className={`${className} text-amber-300`} />;
    if (weatherId > 800 && weatherId <= 802) return <CloudSun className={`${className} text-blue-200`} />;
    return <Cloud className={`${className} text-blue-300`} />;
  };

  const currentDateFormatted = new Date(weather.dt).toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="flex-grow p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Grid: Hero Weather Section + Right 7-Day Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Section (col-span 7) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {/* Main Hero Frosted Glass Card */}
          <div className="glass-card rounded-[36px] md:rounded-[44px] p-8 md:p-10 flex flex-col justify-between relative overflow-hidden shadow-2xl min-h-[420px]">
            {/* Ambient inner soft glowing orbs */}
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-indigo-500/15 blur-[100px] rounded-full pointer-events-none"></div>

            {/* Header / Location */}
            <div className="flex justify-between items-start z-10">
              <div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-white mb-1 tracking-tight">
                  {weather.cityName}
                </h1>
                <p className="text-lg md:text-xl text-white/70 font-normal">
                  {currentDateFormatted}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="bg-white/10 px-4 py-1.5 rounded-full text-xs font-semibold border border-white/20 uppercase tracking-wider backdrop-blur-md text-white/90">
                  Updated {new Date(weather.dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>

                {/* Status sticker */}
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-medium rounded-full backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                  {sticker.label}
                </span>
              </div>
            </div>

            {/* Huge Temperature Display & Interactive Unit Switcher & Condition */}
            <div className="flex flex-wrap items-end justify-between gap-6 my-6 z-10">
              <div className="flex items-start gap-4">
                <span className="text-[88px] sm:text-[112px] md:text-[136px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30 select-none">
                  {weather.temp}°
                </span>

                {/* Dedicated On-Hero °F / °C Switcher */}
                {onToggleUnit && (
                  <div className="flex flex-col gap-1 pt-2 sm:pt-4">
                    <div className="inline-flex bg-white/10 p-1 rounded-2xl border border-white/20 backdrop-blur-md shadow-lg">
                      <button
                        type="button"
                        onClick={() => onToggleUnit('imperial')}
                        title="Switch to Fahrenheit (°F)"
                        className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                          isImperial
                            ? 'bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)] border border-blue-400/50'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        °F
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleUnit('metric')}
                        title="Switch to Celsius (°C)"
                        className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                          !isImperial
                            ? 'bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)] border border-blue-400/50'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        °C
                      </button>
                    </div>
                    <span className="text-[10px] font-mono text-white/50 text-center font-medium">
                      {isImperial ? '°F Scale' : '°C Scale'}
                    </span>
                  </div>
                )}
              </div>

              <div className="pb-2">
                <div className="flex items-center gap-2.5 mb-3">
                  {getConditionIcon(weather.weatherId, 'w-8 h-8')}
                  <p className="text-2xl sm:text-3xl md:text-4xl font-medium text-white capitalize">
                    {weather.condition}
                  </p>
                </div>

                {/* High, Low, & Feels Like Badges with Real API Data */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs sm:text-sm">
                  {/* High (H) */}
                  <div 
                    title="Daily Maximum Temperature"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/35 rounded-xl text-amber-200 backdrop-blur-md transition-all shadow-sm"
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>H: <strong className="text-white font-bold">{trueHigh}°{tempUnit}</strong></span>
                  </div>

                  {/* Low (L) */}
                  <div 
                    title="Daily Minimum Temperature"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/35 rounded-xl text-cyan-200 backdrop-blur-md transition-all shadow-sm"
                  >
                    <ArrowDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>L: <strong className="text-white font-bold">{trueLow}°{tempUnit}</strong></span>
                  </div>

                  {/* Feels Like */}
                  <div 
                    title={`Real thermal perception: ${feelsLike}°${tempUnit} (${feelsLikeDelta === 0 ? 'matching ambient temp' : feelsLikeDelta > 0 ? `+${feelsLikeDelta}° warmer with humidity` : `${feelsLikeDelta}° cooler with wind chill`})`}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 rounded-xl text-blue-200 backdrop-blur-md transition-all shadow-sm"
                  >
                    <Thermometer className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                    <span>Feels Like: <strong className="text-white font-bold">{feelsLike}°{tempUnit}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnostic meteorological insight summary */}
            <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-sm md:text-base text-white/85 leading-relaxed z-10">
              {diagnosticText}
            </div>
          </div>

          {/* 4 Telemetry Mini Glass Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Wind Speed */}
            <div className="glass-card-hover rounded-3xl p-4 sm:p-5 flex flex-col justify-between h-32">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest text-white/50 font-semibold">
                  Wind Speed
                </p>
                <Wind className="w-4 h-4 text-blue-300/70" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {weather.windSpeed} <span className="text-xs font-normal text-white/60">{speedUnit}</span>
                <span className="text-xs font-medium text-blue-300 ml-1.5">{cardinalDir}</span>
              </p>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (weather.windSpeed / (isImperial ? 40 : 60)) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Humidity */}
            <div className="glass-card-hover rounded-3xl p-4 sm:p-5 flex flex-col justify-between h-32">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest text-white/50 font-semibold">
                  Humidity
                </p>
                <Droplets className="w-4 h-4 text-cyan-300/70" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {weather.humidity} <span className="text-xs font-normal text-white/60">%</span>
              </p>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 rounded-full transition-all"
                  style={{ width: `${weather.humidity}%` }}
                ></div>
              </div>
            </div>

            {/* UV Index */}
            <div className="glass-card-hover rounded-3xl p-4 sm:p-5 flex flex-col justify-between h-32">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest text-white/50 font-semibold">
                  UV Index
                </p>
                <Sun className="w-4 h-4 text-yellow-300/70" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {uv.value} <span className="text-xs font-normal text-white/60">{uv.label}</span>
              </p>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (uv.value / 11) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Visibility */}
            <div className="glass-card-hover rounded-3xl p-4 sm:p-5 flex flex-col justify-between h-32">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest text-white/50 font-semibold">
                  Visibility
                </p>
                <Eye className="w-4 h-4 text-emerald-300/70" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {weather.visibility} <span className="text-xs font-normal text-white/60">{visUnit}</span>
              </p>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (weather.visibility / (isImperial ? 10 : 16)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Section (col-span 5): 7-Day Forecast & Air Quality */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          
          {/* 7-Day Forecast Glass Card */}
          <div className="glass-card rounded-[36px] md:rounded-[44px] p-6 md:p-8 flex-1 flex flex-col justify-between shadow-2xl">
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-300" />
                  7-Day Forecast
                </span>
                <span className="text-xs text-white/40 font-normal uppercase tracking-wider">
                  Daily Outlook
                </span>
              </h3>

              <div className="flex flex-col gap-1">
                {forecastDays.slice(0, 6).map((day, idx) => {
                  const isSelected = selectedDayIndex === idx;
                  return (
                    <div key={day.date}>
                      <button
                        onClick={() => setSelectedDayIndex(isSelected ? null : idx)}
                        className={`w-full flex items-center justify-between py-3 border-b border-white/5 hover:bg-white/5 px-3 rounded-2xl transition-all cursor-pointer ${
                          isSelected ? 'bg-white/10 border-blue-400/30' : ''
                        }`}
                      >
                        <span className={`w-12 text-sm text-left font-medium ${
                          idx === 0 ? 'text-blue-300 font-semibold' : 'text-white/70'
                        }`}>
                          {idx === 0 ? 'Today' : day.dayName}
                        </span>

                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 flex items-center justify-center">
                            {getConditionIcon(day.weatherId, 'w-5 h-5')}
                          </div>
                          <span className="w-24 text-sm text-white/90 text-left capitalize truncate">
                            {day.condition}
                          </span>
                        </div>

                        {day.pop > 15 && (
                          <span className="text-[10px] text-blue-300 bg-blue-500/15 px-2 py-0.5 rounded-full border border-blue-400/25">
                            {day.pop}%
                          </span>
                        )}

                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm text-white w-8 text-right">
                            {day.tempMax}°
                          </span>
                          <span className="text-white/40 text-sm w-8 text-right">
                            {day.tempMin}°
                          </span>
                        </div>
                      </button>

                      {/* Expandable details */}
                      {isSelected && (
                        <div className="bg-white/5 rounded-2xl p-3.5 my-2 border border-white/10 text-xs space-y-1.5 animate-in fade-in">
                          <div className="flex justify-between text-blue-300 font-medium">
                            <span>{day.dayName} Atmospheric Summary</span>
                            <span className="text-white/60">Precip: {day.pop}%</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-white/70 pt-1 text-[11px]">
                            <div>Wind: <span className="text-white font-medium">{day.windSpeed} {speedUnit}</span></div>
                            <div>Humidity: <span className="text-white font-medium">{day.humidity}%</span></div>
                            <div>Condition: <span className="text-white font-medium capitalize">{day.condition}</span></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Forecast Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-mono">
                OPENWEATHER STREAM ACTIVE
              </span>
              <button
                onClick={onOpenLiveFeed}
                className="bg-blue-500/20 hover:bg-blue-500/35 border border-blue-400/30 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.2)]"
              >
                Live Radar Stream
              </button>
            </div>
          </div>

          {/* Air Quality Mini Card */}
          <div className="glass-card rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs uppercase tracking-widest text-white/60 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                Air Quality Index (AQI)
              </h4>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                airQuality.category === 'GOOD' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' :
                airQuality.category === 'FAIR' ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' :
                airQuality.category === 'MODERATE' ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' :
                'bg-rose-500/20 text-rose-300 border-rose-400/30'
              }`}>
                {airQuality.category}
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-3xl font-bold text-white">
                {airQuality.aqiUs}
              </span>
              <span className="text-xs text-white/60">
                US EPA Air Quality Scale
              </span>
            </div>

            {/* Smooth gradient progress bar */}
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden flex mb-4">
              <div 
                className="h-full bg-emerald-400 transition-all rounded-full"
                style={{ width: `${Math.min(100, (airQuality.aqiUs / 200) * 100)}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/5 text-center">
              <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                <span className="text-[9px] text-white/50 block font-medium">PM2.5</span>
                <span className="text-xs font-semibold text-white">{airQuality.components.pm2_5.toFixed(1)}</span>
              </div>
              <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                <span className="text-[9px] text-white/50 block font-medium">PM10</span>
                <span className="text-xs font-semibold text-white">{airQuality.components.pm10.toFixed(0)}</span>
              </div>
              <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                <span className="text-[9px] text-white/50 block font-medium">NO₂</span>
                <span className="text-xs font-semibold text-white">{airQuality.components.no2.toFixed(1)}</span>
              </div>
              <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                <span className="text-[9px] text-white/50 block font-medium">O₃</span>
                <span className="text-xs font-semibold text-white">{airQuality.components.o3.toFixed(1)}</span>
              </div>
            </div>
          </div>

        </section>

      </div>

      {/* Hourly 24-Hour Trajectory Strip */}
      <div className="glass-card rounded-3xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-300" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              24-Hour Hourly Trajectory
            </h3>
          </div>
          <span className="text-xs text-white/50">
            Hourly Temperature & Precipitation
          </span>
        </div>

        {/* Scrollable Hourly Strip */}
        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          {forecastHourly.map((hour, idx) => (
            <div
              key={idx}
              className="glass-card-hover rounded-2xl p-3.5 flex flex-col items-center min-w-[95px] shrink-0 text-center"
            >
              <span className="text-xs font-medium text-white/60 mb-1">
                {hour.time}
              </span>
              <div className="my-1.5">
                {getConditionIcon(hour.condition.includes('Rain') ? 500 : hour.condition.includes('Cloud') ? 803 : 800, 'w-6 h-6')}
              </div>
              <span className="text-base font-bold text-white">
                {hour.temp}°
              </span>
              <span className="text-[11px] text-blue-300 font-medium mt-0.5">
                {hour.pop > 0 ? `${hour.pop}%` : '0%'}
              </span>
              <span className="text-[10px] text-white/40 mt-1">
                {hour.windSpeed} {speedUnit}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
