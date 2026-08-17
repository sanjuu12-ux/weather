import { AirQualityData, CurrentWeatherData, ForecastDayItem, ForecastHourlyItem, GeoLocation, WeatherUnit } from '../types';
import { computeUSAQI, getAQICategory } from '../utils/weatherHelpers';

const DEFAULT_API_KEY = 'e9560f1a3524e70171b49caf7bfb5013';

// Storage key to allow custom API key override in settings if user wants
const API_KEY_STORAGE_KEY = 'meteo_vortex_owm_key';

export function getApiKey(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (custom && custom.trim().length > 10) return custom.trim();
  }
  return DEFAULT_API_KEY;
}

export function setCustomApiKey(key: string) {
  if (typeof window !== 'undefined') {
    if (!key || key.trim() === '') {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    } else {
      localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
    }
  }
}

// Fallback high-fidelity dataset for offline / rapid autocompletion resilience
const FALLBACK_CITIES: Record<string, { name: string; lat: number; lon: number; country: string; state?: string }> = {
  'new york': { name: 'New York', lat: 40.7128, lon: -74.0060, country: 'US', state: 'NY' },
  'los angeles': { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, country: 'US', state: 'CA' },
  'chicago': { name: 'Chicago', lat: 41.8781, lon: -87.6298, country: 'US', state: 'IL' },
  'houston': { name: 'Houston', lat: 29.7604, lon: -95.3698, country: 'US', state: 'TX' },
  'miami': { name: 'Miami', lat: 25.7617, lon: -80.1918, country: 'US', state: 'FL' },
  'san francisco': { name: 'San Francisco', lat: 37.7749, lon: -122.4194, country: 'US', state: 'CA' },
  'seattle': { name: 'Seattle', lat: 47.6062, lon: -122.3321, country: 'US', state: 'WA' },
  'boston': { name: 'Boston', lat: 42.3601, lon: -71.0589, country: 'US', state: 'MA' },
  'denver': { name: 'Denver', lat: 39.7392, lon: -104.9903, country: 'US', state: 'CO' },
  'washington': { name: 'Washington', lat: 38.9072, lon: -77.0369, country: 'US', state: 'DC' },
  'toronto': { name: 'Toronto', lat: 43.6532, lon: -79.3832, country: 'CA', state: 'ON' },
  'vancouver': { name: 'Vancouver', lat: 49.2827, lon: -123.1207, country: 'CA', state: 'BC' },
  'london': { name: 'London', lat: 51.5074, lon: -0.1278, country: 'GB' },
  'paris': { name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'FR' },
  'berlin': { name: 'Berlin', lat: 52.5200, lon: 13.4050, country: 'DE' },
  'madrid': { name: 'Madrid', lat: 40.4168, lon: -3.7038, country: 'ES' },
  'rome': { name: 'Rome', lat: 41.9028, lon: 12.4964, country: 'IT' },
  'amsterdam': { name: 'Amsterdam', lat: 52.3676, lon: 4.9041, country: 'NL' },
  'zurich': { name: 'Zurich', lat: 47.3769, lon: 8.5417, country: 'CH' },
  'vienna': { name: 'Vienna', lat: 48.2082, lon: 16.3738, country: 'AT' },
  'reykjavik': { name: 'Reykjavik', lat: 64.1466, lon: -21.9426, country: 'IS' },
  'oslo': { name: 'Oslo', lat: 59.9139, lon: 10.7522, country: 'NO' },
  'stockholm': { name: 'Stockholm', lat: 59.3293, lon: 18.0686, country: 'SE' },
  'tokyo': { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'JP' },
  'seoul': { name: 'Seoul', lat: 37.5665, lon: 126.9780, country: 'KR' },
  'beijing': { name: 'Beijing', lat: 39.9042, lon: 116.4074, country: 'CN' },
  'shanghai': { name: 'Shanghai', lat: 31.2304, lon: 121.4737, country: 'CN' },
  'hong kong': { name: 'Hong Kong', lat: 22.3193, lon: 114.1694, country: 'HK' },
  'singapore': { name: 'Singapore', lat: 1.3521, lon: 103.8198, country: 'SG' },
  'bangkok': { name: 'Bangkok', lat: 13.7563, lon: 100.5018, country: 'TH' },
  'delhi': { name: 'Delhi', lat: 28.6139, lon: 77.2090, country: 'IN' },
  'new delhi': { name: 'New Delhi', lat: 28.6139, lon: 77.2090, country: 'IN' },
  'mumbai': { name: 'Mumbai', lat: 19.0760, lon: 72.8777, country: 'IN' },
  'bengaluru': { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, country: 'IN' },
  'kolkata': { name: 'Kolkata', lat: 22.5726, lon: 88.3639, country: 'IN' },
  'chennai': { name: 'Chennai', lat: 13.0827, lon: 80.2707, country: 'IN' },
  'hyderabad': { name: 'Hyderabad', lat: 17.3850, lon: 78.4867, country: 'IN' },
  'dubai': { name: 'Dubai', lat: 25.2048, lon: 55.2708, country: 'AE' },
  'cairo': { name: 'Cairo', lat: 30.0444, lon: 31.2357, country: 'EG' },
  'sydney': { name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'AU' },
  'melbourne': { name: 'Melbourne', lat: -37.8136, lon: 144.9631, country: 'AU' },
  'auckland': { name: 'Auckland', lat: -36.8485, lon: 174.7633, country: 'NZ' },
  'rio de janeiro': { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729, country: 'BR' },
  'sao paulo': { name: 'São Paulo', lat: -23.5505, lon: -46.6333, country: 'BR' },
  'buenos aires': { name: 'Buenos Aires', lat: -34.6037, lon: -58.3816, country: 'AR' },
  'mexico city': { name: 'Mexico City', lat: 19.4326, lon: -99.1332, country: 'MX' },
  'cape town': { name: 'Cape Town', lat: -33.9249, lon: 18.4241, country: 'ZA' },
};

export async function searchCities(query: string): Promise<GeoLocation[]> {
  if (!query || query.trim().length < 1) return [];
  const key = getApiKey();
  const clean = query.trim();
  const results: GeoLocation[] = [];

  // 1. Try Direct OpenWeather Geocoding API
  try {
    const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(clean)}&limit=6&appid=${key}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        data.forEach((item: { name: string; lat: number; lon: number; country: string; state?: string }) => {
          results.push({
            name: item.name,
            lat: item.lat,
            lon: item.lon,
            country: item.country,
            state: item.state,
          });
        });
      }
    }
  } catch (err) {
    console.warn('Geocoding search failed, trying direct weather API endpoint', err);
  }

  // 2. If Geocoding returned nothing, query OpenWeather Weather by City Name directly
  if (results.length === 0) {
    try {
      const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(clean)}&appid=${key}`);
      if (weatherRes.ok) {
        const wData = await weatherRes.json();
        if (wData && wData.coord) {
          results.push({
            name: wData.name || clean,
            lat: wData.coord.lat,
            lon: wData.coord.lon,
            country: wData.sys?.country || '',
          });
        }
      }
    } catch (directErr) {
      console.warn('Direct weather city search fallback error', directErr);
    }
  }

  // 3. Fallback search in static presets for instant local match
  const lower = clean.toLowerCase();
  Object.entries(FALLBACK_CITIES).forEach(([keyName, data]) => {
    if (keyName.includes(lower) || data.name.toLowerCase().includes(lower)) {
      const alreadyExists = results.some(
        (r) => Math.abs(r.lat - data.lat) < 0.1 && Math.abs(r.lon - data.lon) < 0.1
      );
      if (!alreadyExists) {
        results.push(data);
      }
    }
  });

  return results;
}

export async function resolveCityDirect(cityName: string): Promise<GeoLocation | null> {
  if (!cityName || cityName.trim().length === 0) return null;
  const clean = cityName.trim();
  const lower = clean.toLowerCase();

  // Check instant fallback first
  if (FALLBACK_CITIES[lower]) {
    return FALLBACK_CITIES[lower];
  }

  // Try searching via API
  const list = await searchCities(clean);
  if (list.length > 0) {
    return list[0];
  }

  return null;
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeoLocation | null> {
  const key = getApiKey();
  try {
    const res = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${key}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return {
          name: data[0].name,
          lat: data[0].lat,
          lon: data[0].lon,
          country: data[0].country,
          state: data[0].state,
        };
      }
    }
  } catch (err) {
    console.warn('Reverse geocode error', err);
  }
  return null;
}

export async function fetchCurrentWeather(lat: number, lon: number, units: WeatherUnit = 'imperial'): Promise<CurrentWeatherData> {
  const key = getApiKey();
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${key}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Weather fetch failed (${res.status}): ${res.statusText}`);
  }
  
  const data = await res.json();
  const weatherItem = data.weather?.[0] || { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' };

  // Calculate visibility in miles or km
  const visibilityMeters = data.visibility ?? 10000;
  const visibilityVal = units === 'imperial' 
    ? parseFloat((visibilityMeters * 0.000621371).toFixed(1))
    : parseFloat((visibilityMeters / 1000).toFixed(1));

  return {
    cityName: data.name || 'Station Coordinates',
    country: data.sys?.country || '',
    lat: data.coord?.lat ?? lat,
    lon: data.coord?.lon ?? lon,
    temp: Math.round(data.main?.temp ?? 70),
    feelsLike: Math.round(data.main?.feels_like ?? data.main?.temp ?? 70),
    tempMin: Math.round(data.main?.temp_min ?? data.main?.temp ?? 65),
    tempMax: Math.round(data.main?.temp_max ?? data.main?.temp ?? 75),
    humidity: data.main?.humidity ?? 50,
    pressure: data.main?.pressure ?? 1013,
    visibility: visibilityVal,
    windSpeed: Math.round(data.wind?.speed ?? 10),
    windDeg: data.wind?.deg ?? 0,
    windGust: data.wind?.gust ? Math.round(data.wind.gust) : undefined,
    clouds: data.clouds?.all ?? 20,
    weatherId: weatherItem.id,
    condition: weatherItem.main,
    description: weatherItem.description,
    icon: weatherItem.icon,
    sunrise: data.sys?.sunrise ? data.sys.sunrise * 1000 : Date.now() - 3600 * 4000,
    sunset: data.sys?.sunset ? data.sys.sunset * 1000 : Date.now() + 3600 * 8000,
    timezone: data.timezone ?? 0,
    dt: data.dt ? data.dt * 1000 : Date.now(),
  };
}

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityData> {
  const key = getApiKey();
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${key}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return getFallbackAirQuality();
    }
    const data = await res.json();
    const item = data.list?.[0];
    if (!item) return getFallbackAirQuality();

    const comps = item.components || {};
    const pm25 = comps.pm2_5 ?? 12.0;
    const pm10 = comps.pm10 ?? 20.0;
    const aqiUs = computeUSAQI(pm25);
    const category = getAQICategory(aqiUs);

    return {
      aqi: item.main?.aqi ?? 2,
      aqiUs,
      category,
      components: {
        co: comps.co ?? 200,
        no: comps.no ?? 0,
        no2: comps.no2 ?? 15,
        o3: comps.o3 ?? 45,
        so2: comps.so2 ?? 5,
        pm2_5: pm25,
        pm10: pm10,
        nh3: comps.nh3 ?? 0,
      },
    };
  } catch {
    return getFallbackAirQuality();
  }
}

function getFallbackAirQuality(): AirQualityData {
  return {
    aqi: 2,
    aqiUs: 42,
    category: 'Good',
    components: {
      co: 210,
      no: 0,
      no2: 12.4,
      o3: 48.1,
      so2: 3.2,
      pm2_5: 10.2,
      pm10: 18.4,
      nh3: 0.5,
    },
  };
}

export async function fetch5DayForecast(lat: number, lon: number, units: WeatherUnit = 'imperial'): Promise<{
  days: ForecastDayItem[];
  hourly: ForecastHourlyItem[];
}> {
  const key = getApiKey();
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${key}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Forecast fetch failed (${res.status}): ${res.statusText}`);
  }

  const data = await res.json();
  const list = data.list || [];

  // 1. Process next 24 hours of hourly projections
  const hourly: ForecastHourlyItem[] = list.slice(0, 10).map((item: any) => {
    const d = new Date(item.dt * 1000);
    const hourNumber = d.getHours();
    const hourLabel = d.toLocaleTimeString([], { hour: 'numeric', hour12: true });
    const weatherItem = item.weather?.[0] || { id: 800, main: 'Clear', description: 'clear', icon: '01d' };
    
    return {
      time: hourLabel,
      hour: hourNumber,
      temp: Math.round(item.main?.temp ?? 70),
      weatherId: weatherItem.id,
      condition: weatherItem.main,
      pop: Math.round((item.pop ?? 0) * 100),
      icon: weatherItem.icon,
    };
  });

  // 2. Group by date string to build 7-day multi-day outlook
  const dayGroups: Record<string, any[]> = {};
  list.forEach((item: any) => {
    const dateKey = new Date(item.dt * 1000).toISOString().split('T')[0];
    if (!dayGroups[dateKey]) dayGroups[dateKey] = [];
    dayGroups[dateKey].push(item);
  });

  const days: ForecastDayItem[] = Object.entries(dayGroups).slice(0, 7).map(([dateKey, items]) => {
    const dateObj = new Date(dateKey + 'T12:00:00');
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    
    const temps = items.map((i) => i.main.temp);
    const tempMin = Math.round(Math.min(...temps));
    const tempMax = Math.round(Math.max(...temps));

    // Midday representative item
    const midItem = items[Math.floor(items.length / 2)] || items[0];
    const weatherItem = midItem.weather?.[0] || { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' };
    const maxPop = Math.round(Math.max(...items.map((i) => i.pop ?? 0)) * 100);
    const avgWind = Math.round(items.reduce((acc, curr) => acc + (curr.wind?.speed || 0), 0) / items.length);
    const avgHumidity = Math.round(items.reduce((acc, curr) => acc + (curr.main?.humidity || 0), 0) / items.length);

    const dayHourly: ForecastHourlyItem[] = items.map((i) => {
      const d = new Date(i.dt * 1000);
      const wItem = i.weather?.[0] || { id: 800, main: 'Clear', description: 'clear', icon: '01d' };
      return {
        time: d.toLocaleTimeString([], { hour: 'numeric', hour12: true }),
        dt: i.dt * 1000,
        temp: Math.round(i.main?.temp ?? 70),
        condition: wItem.main,
        icon: wItem.icon,
        pop: Math.round((i.pop ?? 0) * 100),
        windSpeed: Math.round(i.wind?.speed ?? 5),
      };
    });

    return {
      date: dateKey,
      dayName,
      tempMin,
      tempMax,
      weatherId: weatherItem.id,
      condition: weatherItem.main,
      description: weatherItem.description,
      icon: weatherItem.icon,
      pop: maxPop,
      windSpeed: avgWind,
      humidity: avgHumidity,
      hourly: dayHourly,
    };
  });

  return { days, hourly };
}
