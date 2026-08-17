import { CurrentWeatherData, WeatherSticker, AirQualityData } from '../types';

export function degToCardinal(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((deg % 360) / 22.5) % 16;
  return directions[index];
}

export function formatCoordinate(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
}

export function formatStationName(lat: number): string {
  const latDir = lat >= 0 ? 'NORTH' : 'SOUTH';
  return `${latDir}_LAT_${Math.abs(lat).toFixed(1)}`;
}

export function calculateDewPoint(tempC: number, humidity: number): number {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * tempC) / (b + tempC)) + Math.log(humidity / 100.0);
  return (b * alpha) / (a - alpha);
}

export function calculateUVIndex(clouds: number, hour: number, lat: number): { value: number; label: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'EXTREME' } {
  // Peak midday solar estimate modified by latitude & cloud cover
  const solarAngle = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI));
  const latFactor = Math.cos((lat * Math.PI) / 180);
  const cloudFactor = (100 - clouds * 0.75) / 100;
  const raw = Math.max(0, Math.round(11 * solarAngle * latFactor * cloudFactor));

  if (raw <= 2) return { value: raw, label: 'LOW' };
  if (raw <= 5) return { value: raw, label: 'MODERATE' };
  if (raw <= 7) return { value: raw, label: 'HIGH' };
  if (raw <= 10) return { value: raw, label: 'VERY_HIGH' };
  return { value: raw, label: 'EXTREME' };
}

export function computeUSAQI(pm25: number): number {
  // EPA PM2.5 concentration to AQI formula
  if (pm25 <= 12.0) {
    return Math.round(((50 - 0) / (12.0 - 0)) * (pm25 - 0));
  } else if (pm25 <= 35.4) {
    return Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51);
  } else if (pm25 <= 55.4) {
    return Math.round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101);
  } else if (pm25 <= 150.4) {
    return Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151);
  } else if (pm25 <= 250.4) {
    return Math.round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201);
  } else {
    return Math.round(((500 - 301) / (500.4 - 250.5)) * (pm25 - 250.5) + 301);
  }
}

export function getAQICategory(aqi: number): AirQualityData['category'] {
  if (aqi <= 50) return 'GOOD';
  if (aqi <= 100) return 'FAIR';
  if (aqi <= 150) return 'MODERATE';
  if (aqi <= 200) return 'POOR';
  if (aqi <= 300) return 'VERY_POOR';
  return 'HAZARDOUS';
}

export function getDiagnosticNarrative(weather: CurrentWeatherData, isImperial: boolean): string {
  const id = weather.weatherId;
  const tempF = isImperial ? weather.temp : (weather.temp * 9) / 5 + 32;
  const windMph = isImperial ? weather.windSpeed : weather.windSpeed * 0.621371;

  if (id >= 200 && id < 300) {
    return "Severe atmospheric instability detected. Active cyclonic electrical discharge and precipitation imminent. Seek shelter if necessary.";
  }
  if (id >= 300 && id < 600) {
    return "Heavy tropospheric moisture saturation. Continuous precipitation band moving across station radar. Barometric pressure dipping.";
  }
  if (id >= 600 && id < 700) {
    return "Sub-freezing polar front active. Crystalline precipitation accumulating with low visibility. Hazardous surface conditions.";
  }
  if (id >= 700 && id < 800) {
    return "Dense atmospheric particulate suspension and low ceiling. Optical visibility degraded across sector boundary.";
  }
  if (windMph > 28) {
    return "Gale-force cyclonic velocity gradients logged. Micro-burst turbulence and structural wind shear advisory active.";
  }
  if (tempF > 95) {
    return "Extreme hyperthermic solar radiation. Intense thermal plume active with high evaporative demand. Hydration critical.";
  }
  if (tempF < 25) {
    return "Cryogenic cold front immersion. Severe thermal depression and wind-chill hazard registered at ground telemetry.";
  }
  if (weather.clouds > 75) {
    return "Stratocumulus cloud deck dominating regional ceiling. Solar irradiance diminished with stable barometric gradient.";
  }
  return "Stable atmospheric pressure ridge centered over regional perimeter. High visibility and balanced thermal equilibrium.";
}

export function getWeatherSticker(weather: CurrentWeatherData, isImperial: boolean): WeatherSticker {
  const id = weather.weatherId;
  const tempF = isImperial ? weather.temp : (weather.temp * 9) / 5 + 32;
  const windMph = isImperial ? weather.windSpeed : weather.windSpeed * 0.621371;

  if (id >= 200 && id < 300) {
    return {
      label: 'STORM_WARNING',
      type: 'storm',
      description: 'Active lightning & squall detected',
      colorClass: 'bg-[#ffb59a] text-[#5a1b00]',
    };
  }
  if (windMph > 25) {
    return {
      label: 'GALE_FORCE_WIND',
      type: 'wind',
      description: 'High velocity gusts active',
      colorClass: 'bg-[#ff5e07] text-[#ffffff]',
    };
  }
  if (id >= 500 && id < 600) {
    return {
      label: 'PRECIPITATION_SURGE',
      type: 'rain',
      description: 'Substantial rain band in sector',
      colorClass: 'bg-[#bfc2ff] text-[#0600ab]',
    };
  }
  if (id >= 600 && id < 700) {
    return {
      label: 'FROST_SURGE',
      type: 'frost',
      description: 'Cryogenic frozen precipitation',
      colorClass: 'bg-[#e0e0ff] text-[#02006d]',
    };
  }
  if (tempF > 92) {
    return {
      label: 'HEAT_ADVISORY',
      type: 'heat',
      description: 'Critical thermal load',
      colorClass: 'bg-[#ff5e07] text-[#ffffff]',
    };
  }
  if (id >= 700 && id < 800) {
    return {
      label: 'VISIBILITY_HAZARD',
      type: 'fog',
      description: 'Dense fog/particulate ceiling',
      colorClass: 'bg-[#c6c4da] text-[#200534]',
    };
  }
  return {
    label: 'STATION_NOMINAL',
    type: 'clear',
    description: 'Equilibrium atmospheric field',
    colorClass: 'bg-[#bef500] text-[#151f00]',
  };
}

// Web Audio Ambient Synthesizer for cyber weather ambiance
class WeatherAudioSynth {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private isPlaying = false;

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }

  private start() {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      // Generate pink/brown atmospheric noise buffer
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.95 * b1 + white * 0.05;
        b2 = 0.85 * b2 + white * 0.1;
        data[i] = (b0 + b1 + b2) * 0.08;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Filter to simulate soft atmospheric wind & rain texture
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 420;

      const gain = this.ctx.createGain();
      gain.gain.value = 0.15;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      this.noiseNode = noise;
      this.isPlaying = true;
    } catch {
      this.isPlaying = false;
    }
  }

  private stop() {
    if (this.noiseNode) {
      try {
        (this.noiseNode as AudioBufferSourceNode).stop();
      } catch {
        // ignore
      }
      this.noiseNode = null;
    }
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {
        // ignore
      }
      this.ctx = null;
    }
    this.isPlaying = false;
  }

  public playRadarBlip() {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {
      // Audio might be restricted
    }
  }
}

export const weatherAudio = new WeatherAudioSynth();
