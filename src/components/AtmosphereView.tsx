import React from 'react';
import { Droplets, Gauge, Activity, CloudFog, Sparkles } from 'lucide-react';
import { CurrentWeatherData, AirQualityData, WeatherUnit } from '../types';
import { calculateDewPoint } from '../utils/weatherHelpers';

interface AtmosphereViewProps {
  weather: CurrentWeatherData;
  airQuality: AirQualityData;
  unit: WeatherUnit;
}

export const AtmosphereView: React.FC<AtmosphereViewProps> = ({ weather, airQuality, unit }) => {
  const isImperial = unit === 'imperial';
  const tempC = isImperial ? ((weather.temp - 32) * 5) / 9 : weather.temp;
  const dewPointC = calculateDewPoint(tempC, weather.humidity);
  const dewPointDisplay = isImperial ? Math.round((dewPointC * 9) / 5 + 32) : Math.round(dewPointC);
  const tempUnit = isImperial ? '°F' : '°C';

  // Air density estimation (kg/m^3) at station pressure & temp
  const pressurePa = weather.pressure * 100;
  const tempKelvin = tempC + 273.15;
  const gasConstant = 287.058;
  const airDensity = (pressurePa / (gasConstant * tempKelvin)).toFixed(3);

  // Vapor Pressure (hPa)
  const vaporPressure = (6.11 * Math.pow(10, (7.5 * tempC) / (237.3 + tempC))).toFixed(1);

  // Pollutant threshold benchmarks (WHO & EPA standards)
  const pollutants = [
    { key: 'PM2.5', name: 'Fine Particulates (PM2.5)', val: airQuality.components.pm2_5, unit: 'μg/m³', maxSafe: 15 },
    { key: 'PM10', name: 'Coarse Particulates (PM10)', val: airQuality.components.pm10, unit: 'μg/m³', maxSafe: 45 },
    { key: 'NO₂', name: 'Nitrogen Dioxide (NO₂)', val: airQuality.components.no2, unit: 'μg/m³', maxSafe: 25 },
    { key: 'O₃', name: 'Tropospheric Ozone (O₃)', val: airQuality.components.o3, unit: 'μg/m³', maxSafe: 100 },
    { key: 'SO₂', name: 'Sulfur Dioxide (SO₂)', val: airQuality.components.so2, unit: 'μg/m³', maxSafe: 40 },
    { key: 'CO', name: 'Carbon Monoxide (CO)', val: (airQuality.components.co / 1000).toFixed(2), unit: 'mg/m³', maxSafe: 4 },
  ];

  return (
    <div className="flex-grow p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Title Header */}
      <div className="glass-card rounded-[32px] md:rounded-[40px] p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-2xl">
        <div>
          <span className="text-xs uppercase font-semibold text-blue-300 tracking-wider">
            Tropospheric Telemetry
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-1">
            Atmospheric Sensors & Chemical Matrix
          </h2>
        </div>
        <div className="px-4 py-2 bg-white/10 border border-white/20 text-blue-200 text-xs font-mono font-medium rounded-full backdrop-blur-md">
          Air Density: {airDensity} kg/m³
        </div>
      </div>

      {/* Atmospheric Science Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Dew Point Spread */}
        <div className="glass-card-hover rounded-3xl p-6 flex flex-col justify-between h-56 shadow-xl">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase font-semibold text-blue-300">
              Dew Point Spread
            </span>
            <Droplets className="w-5 h-5 text-blue-300" />
          </div>
          <div className="my-2">
            <span className="text-4xl font-bold text-white">
              {dewPointDisplay}{tempUnit}
            </span>
            <p className="text-xs text-white/60 mt-1">
              Air/Dew Spread: {Math.abs(weather.temp - dewPointDisplay)}°
            </p>
          </div>
          <div className="text-xs text-white/50 border-t border-white/5 pt-2">
            {weather.humidity > 85 ? 'High condensation' : 'Comfortable margin'}
          </div>
        </div>

        {/* Card 2: Barometric Pressure */}
        <div className="glass-card-hover rounded-3xl p-6 flex flex-col justify-between h-56 shadow-xl">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase font-semibold text-cyan-300">
              Barometric Pressure
            </span>
            <Gauge className="w-5 h-5 text-cyan-300" />
          </div>
          <div className="my-2">
            <span className="text-4xl font-bold text-white">
              {weather.pressure}
            </span>
            <span className="text-xs text-cyan-300 ml-1.5 font-mono">hPa</span>
            <p className="text-xs text-white/60 mt-1">
              Equivalent: {(weather.pressure * 0.02953).toFixed(2)} inHg
            </p>
          </div>
          <div className="text-xs text-white/50 border-t border-white/5 pt-2">
            {weather.pressure >= 1013 ? 'High pressure ridge' : 'Low pressure trough'}
          </div>
        </div>

        {/* Card 3: Vapor Pressure */}
        <div className="glass-card-hover rounded-3xl p-6 flex flex-col justify-between h-56 shadow-xl">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase font-semibold text-yellow-300">
              Vapor Pressure
            </span>
            <Activity className="w-5 h-5 text-yellow-300" />
          </div>
          <div className="my-2">
            <span className="text-4xl font-bold text-white">
              {vaporPressure}
            </span>
            <span className="text-xs text-yellow-300 ml-1.5 font-mono">hPa</span>
            <p className="text-xs text-white/60 mt-1">
              Relative Saturation: {weather.humidity}%
            </p>
          </div>
          <div className="text-xs text-white/50 border-t border-white/5 pt-2">
            Evaporative index: Moderate
          </div>
        </div>

        {/* Card 4: Cloud Ceiling */}
        <div className="glass-card-hover rounded-3xl p-6 flex flex-col justify-between h-56 shadow-xl">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase font-semibold text-emerald-300">
              Cloud Ceiling
            </span>
            <CloudFog className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="my-2">
            <span className="text-4xl font-bold text-white">
              {weather.clouds}
            </span>
            <span className="text-xs text-emerald-300 ml-1.5 font-mono">%</span>
            <p className="text-xs text-white/60 mt-1">
              Visibility: {weather.visibility} {isImperial ? 'mi' : 'km'}
            </p>
          </div>
          <div className="text-xs text-white/50 border-t border-white/5 pt-2">
            {weather.clouds > 70 ? 'Overcast deck' : weather.clouds > 20 ? 'Scattered stratocumulus' : 'Clear sky'}
          </div>
        </div>

      </div>

      {/* Comprehensive Chemical Pollutants Matrix */}
      <div className="glass-card rounded-[32px] md:rounded-[40px] p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h3 className="text-xl font-bold text-white">
              Pollutant Composition Matrix
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              Continuous molecular concentrations from OpenWeather Air Pollution stream
            </p>
          </div>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-md ${
            airQuality.category === 'GOOD' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' :
            airQuality.category === 'FAIR' ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' :
            airQuality.category === 'MODERATE' ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' :
            'bg-rose-500/20 text-rose-300 border-rose-400/30'
          }`}>
            AQI: {airQuality.aqiUs} ({airQuality.category})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pollutants.map((p) => {
            const numVal = Number(p.val);
            const ratio = Math.min(100, Math.round((numVal / (p.maxSafe * 2)) * 100));
            const isExceeded = numVal > p.maxSafe;

            return (
              <div key={p.key} className="glass-card-hover rounded-2xl p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-blue-300">
                      {p.key}
                    </span>
                    <div className="text-xs text-white/70 mt-0.5">
                      {p.name}
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    isExceeded ? 'bg-rose-500/20 text-rose-300 border-rose-400/30' : 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                  }`}>
                    {isExceeded ? 'Exceeded' : 'Nominal'}
                  </span>
                </div>

                <div className="my-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-white">
                      {p.val}
                    </span>
                    <span className="text-xs text-white/50">
                      {p.unit}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isExceeded ? 'bg-rose-400' : 'bg-blue-400'}`}
                      style={{ width: `${ratio}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-[11px] text-white/40 flex justify-between border-t border-white/5 pt-2">
                  <span>Safe Threshold:</span>
                  <span className="text-white/80 font-medium">&lt; {p.maxSafe} {p.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
