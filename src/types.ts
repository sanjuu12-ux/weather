export type WeatherUnit = 'imperial' | 'metric';
export type ViewTab = 'DASHBOARD' | 'EXTREME' | 'ATMOSPHERE' | 'GEO_DATA' | 'ARCHIVE';
export type SubNavTab = 'SATELLITE' | 'RADAR' | 'HISTORICAL' | 'ALERTS';

export interface GeoLocation {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface CurrentWeatherData {
  cityName: string;
  country: string;
  lat: number;
  lon: number;
  temp: number; // in active units
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  pressure: number; // hPa
  visibility: number; // in miles or km
  windSpeed: number; // mph or km/h
  windDeg: number;
  windGust?: number;
  clouds: number; // %
  weatherId: number;
  condition: string;
  description: string;
  icon: string;
  sunrise: number; // timestamp
  sunset: number; // timestamp
  timezone: number; // seconds offset from UTC
  dt: number; // timestamp
}

export interface AirQualityData {
  aqi: number; // 1 to 5
  aqiUs: number; // 0 to 500
  category: string;
  components: {
    co: number;
    no?: number;
    no2: number;
    o3: number;
    so2: number;
    pm2_5: number;
    pm10: number;
    nh3?: number;
  };
}

export interface ForecastDayItem {
  date: string; // YYYY-MM-DD
  dayName: string; // e.g. "MON", "TUE"
  tempMax: number;
  tempMin: number;
  condition: string;
  description: string;
  icon: string;
  weatherId: number;
  pop: number; // Probability of precipitation (0 - 100%)
  rainMm?: number;
  windSpeed: number;
  humidity: number;
  hourly: ForecastHourlyItem[];
}

export interface ForecastHourlyItem {
  time: string; // e.g. "14:00"
  dt: number;
  temp: number;
  condition: string;
  icon: string;
  pop: number;
  windSpeed: number;
}

export interface SavedCity {
  id: string;
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  savedAt: number;
}

export interface WeatherSticker {
  label: string;
  type: 'storm' | 'heat' | 'frost' | 'wind' | 'clear' | 'fog' | 'rain';
  description: string;
  colorClass: string;
}
