import React from 'react';
import { LayoutGrid, AlertTriangle, Wind, Globe2, Archive } from 'lucide-react';
import { ViewTab } from '../types';
import { formatStationName } from '../utils/weatherHelpers';

interface SidebarProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  lat: number;
  cityName: string;
  onOpenLiveFeed: () => void;
  hasExtremeWarning?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  lat,
  cityName,
  onOpenLiveFeed,
  hasExtremeWarning = false,
}) => {
  const stationLat = formatStationName(lat);
  const stationCode = cityName || 'Station 01';

  const navItems: Array<{ id: ViewTab; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: <LayoutGrid className="w-5 h-5" /> },
    {
      id: 'EXTREME',
      label: 'Severe Alerts',
      icon: <AlertTriangle className={`w-5 h-5 ${hasExtremeWarning ? 'text-amber-400 animate-pulse' : ''}`} />,
      badge: hasExtremeWarning ? 'Alert' : undefined,
    },
    { id: 'ATMOSPHERE', label: 'Atmosphere', icon: <Wind className="w-5 h-5" /> },
    { id: 'GEO_DATA', label: 'Radar & Maps', icon: <Globe2 className="w-5 h-5" /> },
    { id: 'ARCHIVE', label: 'Station Archive', icon: <Archive className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col h-[calc(100vh-73px)] sticky left-0 top-[73px] w-64 border-r border-white/10 bg-white/[0.02] backdrop-blur-2xl z-30 shrink-0 select-none">
        {/* Station Identification Header */}
        <div className="p-6 border-b border-white/5">
          <p className="text-[11px] uppercase tracking-widest text-white/40 font-medium mb-1">
            Active Station
          </p>
          <h1 className="text-xl font-bold text-white tracking-tight truncate">
            {stationCode}
          </h1>
          <p className="font-mono text-xs text-blue-300/80 mt-1">
            {stationLat}
          </p>
        </div>

        {/* Navigation Item Stack */}
        <div className="flex-grow flex flex-col pt-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl font-medium text-sm transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-blue-500/20 text-white border border-blue-400/30 shadow-[0_0_20px_rgba(59,130,246,0.2)] font-semibold'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-blue-300' : 'text-white/60'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-semibold rounded-full border border-amber-400/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Live Feed Action Button */}
        <div className="p-4 border-t border-white/5 mt-auto">
          <button
            onClick={onOpenLiveFeed}
            className="w-full py-3.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-2xl border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2.5 shadow-lg hover:border-blue-400/40 cursor-pointer"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
            <span>Live Radar Stream</span>
          </button>
        </div>
      </aside>

      {/* Mobile/Tablet Horizontal Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#081b33]/90 backdrop-blur-2xl border-t border-white/10 px-3 py-2 flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-500/25 text-white border border-blue-400/40'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium mt-1">
                {item.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
        <button
          onClick={onOpenLiveFeed}
          className="flex flex-col items-center justify-center p-2 text-emerald-400 cursor-pointer"
        >
          <span className="relative flex h-2 w-2 mb-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="text-[10px] font-medium text-white/70">Feed</span>
        </button>
      </div>
    </>
  );
};
