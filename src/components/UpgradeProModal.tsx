import React from 'react';
import { X, Sparkles, Check } from 'lucide-react';

interface UpgradeProModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeProModal: React.FC<UpgradeProModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const features = [
    { title: 'Doppler Radar 4K Live Stream', desc: 'Real-time 1km resolution S-band precipitation composite' },
    { title: '14-Day Cyclonic ML Trajectory Projection', desc: 'Predictive hurricane, typhoon, and squall line trajectory modeling' },
    { title: 'Global Lightning Sensor Network', desc: 'Sub-millisecond atmospheric electrical discharge triangulation' },
    { title: 'Infrared Geostationary Satellite Feed', desc: 'Live thermal water vapor and troposphere cloud layer feeds' },
    { title: 'Unlimited Telemetry Archive & Snapshot Sync', desc: 'Continuous sensor history logging and multi-city station comparison' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div 
        className="w-full max-w-xl bg-[#0a1e38]/90 backdrop-blur-3xl border border-white/15 rounded-[36px] shadow-2xl p-6 md:p-8 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>

        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-blue-500/20 border border-blue-400/30 rounded-2xl text-blue-300">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-300">
                AtmosWatch Enterprise
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Upgrade to Pro Radar
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-full text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Features List */}
        <div className="space-y-2.5 mb-6">
          {features.map((f, i) => (
            <div key={i} className="glass-card-hover rounded-2xl p-3.5 flex items-start gap-3">
              <div className="p-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-400/30 shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">
                  {f.title}
                </div>
                <div className="text-xs text-white/60 mt-0.5">
                  {f.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="space-y-2.5">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-blue-500/25 hover:bg-blue-500/40 border border-blue-400/40 text-white font-semibold text-sm rounded-2xl shadow-[0_0_25px_rgba(59,130,246,0.3)] transition-all cursor-pointer hover:scale-[1.01]"
          >
            Access Full Pro Radar Suite (Active Open Alpha)
          </button>
          <p className="text-center text-[11px] text-white/40">
            All core telemetry is activated free for AtmosWatch Alpha users
          </p>
        </div>
      </div>
    </div>
  );
};
