import React, { useState, useEffect } from 'react';
import { formatCoordinate } from '../utils/weatherHelpers';
import { Clock, MapPin } from 'lucide-react';

interface FooterProps {
  lat: number;
  lon: number;
  timezoneOffsetSeconds: number;
}

export const Footer: React.FC<FooterProps> = ({
  lat,
  lon,
  timezoneOffsetSeconds,
}) => {
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Calculate local time in the selected station timezone
      const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
      const stationTime = new Date(utcMs + timezoneOffsetSeconds * 1000);
      
      const hours = String(stationTime.getHours()).padStart(2, '0');
      const minutes = String(stationTime.getMinutes()).padStart(2, '0');
      const seconds = String(stationTime.getSeconds()).padStart(2, '0');
      setTimeString(`${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timezoneOffsetSeconds]);

  const coords = formatCoordinate(lat, lon);

  return (
    <footer className="w-full py-6 px-6 md:px-10 flex flex-wrap justify-between items-center mt-auto border-t border-white/10 bg-white/[0.02] backdrop-blur-2xl text-white/70 text-xs select-none z-20">
      {/* Brand Station Copyright */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-white tracking-tight">ATMOS<span className="text-white/60 font-light">WATCH</span></span>
        <span className="text-white/40">© 2026</span>
      </div>

      {/* Real-time Telemetry Status Coordinates & Station Local Time */}
      <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-3 md:mt-0">
        <a
          href={`https://www.google.com/maps?q=${lat},${lon}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Open Geolocation in Map"
          className="flex items-center gap-1.5 text-blue-300 hover:text-blue-200 transition-colors font-mono"
        >
          <MapPin className="w-3.5 h-3.5" />
          {coords}
        </a>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/15 rounded-full text-white font-mono text-[11px]">
          <Clock className="w-3.5 h-3.5 text-blue-300" />
          <span>Local Time: {timeString || '14:45:00'}</span>
        </div>

        <span className="text-white/40 hover:text-white/80 transition-colors cursor-pointer">
          Telemetry Terms
        </span>

        <span className="text-white/40 hover:text-white/80 transition-colors cursor-pointer">
          Privacy
        </span>
      </div>
    </footer>
  );
};
