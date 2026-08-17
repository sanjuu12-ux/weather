import React, { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, Shield, Wind, Eye } from 'lucide-react';
import { CurrentWeatherData, WeatherUnit } from '../types';
import { weatherAudio } from '../utils/weatherHelpers';

interface LiveFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  weather: CurrentWeatherData;
  unit: WeatherUnit;
}

export const LiveFeedModal: React.FC<LiveFeedModalProps> = ({
  isOpen,
  onClose,
  weather,
  unit,
}) => {
  const [logEvents, setLogEvents] = useState<Array<{ time: string; text: string; type: 'info' | 'warn' | 'crit' }>>([]);
  const [audioActive, setAudioActive] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Initial logs
    setLogEvents([
      { time: '14:22:01', text: `Live radar stream linked: ${weather.cityName} sector`, type: 'info' },
      { time: '14:22:03', text: `Atmospheric pressure locked: ${weather.pressure} hPa`, type: 'info' },
      { time: '14:22:06', text: `Wind vector computed: ${weather.windSpeed} ${unit === 'imperial' ? 'mph' : 'km/h'} @ ${weather.windDeg}°`, type: 'info' },
    ]);

    // Interval to simulate live radar echo packet logs
    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const types: Array<'info' | 'warn' | 'crit'> = ['info', 'info', 'warn'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      const messages = [
        `Doppler sweep completed: No convective funnel detected in 50km radius`,
        `Dew point stability check: ${weather.humidity}% moisture saturation`,
        `Stratocumulus cloud deck ceiling verified at station azimuth`,
        `Infrared thermal scan: Surface temp holding steady at ${weather.temp}°`,
        `Particulate aerosol sensor sync: ${weather.clouds}% cloud albedo`,
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];

      setLogEvents((prev) => [
        { time: timeStr, text: randomMsg, type: randomType },
        ...prev.slice(0, 8),
      ]);

      // Trigger subtle audio radar ping if audio active
      if (weatherAudio.getStatus()) {
        weatherAudio.playRadarBlip();
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [isOpen, weather, unit]);

  if (!isOpen) return null;

  const toggleSound = () => {
    const s = weatherAudio.toggle();
    setAudioActive(s);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div 
        className="w-full max-w-3xl bg-[#0a1e38]/90 backdrop-blur-3xl border border-white/15 rounded-[36px] shadow-2xl p-6 md:p-8 relative overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating background blur orb */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>

        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
            </span>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Live Radar Telemetry Stream
              </h3>
              <p className="text-xs text-white/50">
                {weather.cityName} Sector Doppler Link
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className={`p-2 rounded-full border transition-all cursor-pointer backdrop-blur-md ${
                audioActive ? 'bg-blue-500/30 text-blue-300 border-blue-400/40' : 'bg-white/10 text-white/60 hover:text-white border-white/15'
              }`}
            >
              {audioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-full text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Radar Screen Canvas */}
        <div className="relative rounded-3xl h-60 bg-[#051122]/80 border border-white/10 flex items-center justify-center overflow-hidden mb-4">
          <div className="absolute w-[80%] h-[80%] border border-blue-400/15 rounded-full pointer-events-none"></div>
          <div className="absolute w-[50%] h-[50%] border border-blue-400/25 rounded-full pointer-events-none"></div>
          <div className="absolute w-[20%] h-[20%] border border-blue-400/35 rounded-full pointer-events-none"></div>

          {/* Crosshairs */}
          <div className="absolute inset-x-0 top-1/2 h-[1px] bg-blue-400/15"></div>
          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-blue-400/15"></div>

          {/* Sweep Beam */}
          <div 
            className="absolute w-full h-full animate-radar-sweep pointer-events-none"
            style={{
              background: 'conic-gradient(from 0deg at 50% 50%, rgba(59, 130, 246, 0) 0deg, rgba(59, 130, 246, 0.15) 30deg, rgba(96, 165, 250, 0.4) 60deg, transparent 65deg)',
            }}
          ></div>

          {/* Center Beacon */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-3.5 h-3.5 bg-blue-400 rounded-full border-2 border-white shadow-[0px_0px_15px_#60a5fa]"></div>
            <span className="text-[10px] font-semibold text-white bg-blue-600/80 px-2 py-0.5 rounded-full mt-1 backdrop-blur-md">
              {weather.cityName}
            </span>
          </div>

          <div className="absolute bottom-3 left-4 flex gap-4 text-[11px] text-white/60 font-mono">
            <span>Range: 150 km</span>
            <span>Freq: 2.8 GHz</span>
            <span>Gain: +32 dB</span>
          </div>
        </div>

        {/* Live Packet Logs Console */}
        <div className="flex-grow flex flex-col min-h-[140px]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs uppercase font-semibold text-white/50 tracking-wider">
              Live Echo Packet Logs
            </span>
            <span className="text-[11px] text-blue-300 font-mono">
              Buffer: Nominal
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 flex-grow overflow-y-auto space-y-1.5 font-mono text-xs max-h-36">
            {logEvents.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <span className="text-white/40 shrink-0">[{log.time}]</span>
                <span className={log.type === 'warn' ? 'text-amber-300' : 'text-blue-200'}>
                  {log.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
