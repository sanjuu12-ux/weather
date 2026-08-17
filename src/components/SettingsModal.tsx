import React, { useState } from 'react';
import { X, Key, Check, Sliders, ShieldCheck } from 'lucide-react';
import { getApiKey, setCustomApiKey } from '../services/weatherApi';
import { WeatherUnit } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: WeatherUnit;
  setUnit: (u: WeatherUnit) => void;
  onReload: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  unit,
  setUnit,
  onReload,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(getApiKey());
  const [savedStatus, setSavedStatus] = useState(false);

  if (!isOpen) return null;

  const handleSaveApiKey = () => {
    setCustomApiKey(apiKeyInput);
    setSavedStatus(true);
    setTimeout(() => {
      setSavedStatus(false);
      onReload();
      onClose();
    }, 1000);
  };

  const handleResetApiKey = () => {
    setCustomApiKey('');
    setApiKeyInput('e9560f1a3524e70171b49caf7bfb5013');
    setSavedStatus(true);
    setTimeout(() => {
      setSavedStatus(false);
      onReload();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
      <div 
        className="w-full max-w-lg bg-[#0a1e38]/90 backdrop-blur-3xl border border-white/15 rounded-[36px] shadow-2xl p-6 md:p-8 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/20 blur-[90px] rounded-full pointer-events-none"></div>

        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-blue-300" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Station Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-full text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* API Key Configuration */}
        <div className="mb-6 space-y-2">
          <label className="text-xs font-semibold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-300" />
            OpenWeather API Key:
          </label>
          <p className="text-[11px] text-white/50">
            Preloaded with your active key: <code className="text-blue-300 font-mono">e9560f1a3524e70171b49caf7bfb5013</code>
          </p>
          <input
            type="text"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-2xl p-3 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-400/50 backdrop-blur-md"
          />
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSaveApiKey}
              className="px-4 py-2 bg-blue-500/25 hover:bg-blue-500/40 border border-blue-400/40 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.2)]"
            >
              {savedStatus ? <Check className="w-4 h-4 text-emerald-300" /> : <ShieldCheck className="w-4 h-4 text-blue-300" />}
              {savedStatus ? 'Saved & Synced' : 'Save Key'}
            </button>
            <button
              onClick={handleResetApiKey}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs rounded-xl border border-white/10 transition-colors cursor-pointer"
            >
              Reset Default
            </button>
          </div>
        </div>

        {/* Unit Preference */}
        <div className="mb-6 space-y-2">
          <label className="text-xs font-semibold text-white">
            Measurement Unit System:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setUnit('imperial')}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                unit === 'imperial'
                  ? 'bg-blue-500/25 border-blue-400/50 text-white font-semibold shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
              }`}
            >
              <span className="block text-sm font-semibold">Imperial (°F, mph, mi)</span>
            </button>
            <button
              onClick={() => setUnit('metric')}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                unit === 'metric'
                  ? 'bg-blue-500/25 border-blue-400/50 text-white font-semibold shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
              }`}
            >
              <span className="block text-sm font-semibold">Metric (°C, km/h, km)</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-white/40 border-t border-white/5 pt-4">
          OpenWeather 2.5 Atmospheric Stream Engine
        </div>
      </div>
    </div>
  );
};
