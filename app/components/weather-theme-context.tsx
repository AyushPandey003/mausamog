'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type WeatherCondition = 'rainy' | 'stormy' | 'cloudy' | 'sunny' | 'default';
export type ThemeMode = 'auto' | WeatherCondition;

export interface WeatherData {
  city: string;
  temp: number;
  condition: WeatherCondition;
  description: string;
  source: string;
}

interface WeatherThemeContextType {
  coords: { lat: number; lon: number } | null;
  weather: WeatherData | null;
  themeMode: ThemeMode;
  activeTheme: WeatherCondition;
  loading: boolean;
  error: string | null;
  setThemeMode: (mode: ThemeMode) => void;
  refreshLocation: () => void;
}

const WeatherThemeContext = createContext<WeatherThemeContextType | undefined>(undefined);

export function WeatherThemeProvider({ children }: { children: React.ReactNode }) {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('weather-theme-pref') as ThemeMode;
      if (saved && ['auto', 'rainy', 'stormy', 'cloudy', 'sunny', 'default'].includes(saved)) {
        return saved;
      }
    }
    return 'auto';
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('weather-theme-pref', mode);
  };

  // Function to fetch weather by coordinates
  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      const data = await response.json();
      setWeather({
        city: data.city,
        temp: data.temp,
        condition: data.condition,
        description: data.description,
        source: data.source,
      });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error fetching weather');
    } finally {
      setLoading(false);
    }
  }, []);

  // Request browser location
  const refreshLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setCoords({ lat, lon });
        fetchWeather(lat, lon);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Location permission denied or unavailable');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [fetchWeather]);

  // Attempt to auto-fetch location on mount if permitted
  useEffect(() => {
    // Check if permission was already granted previously
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          refreshLocation();
        }
      });
    }
  }, [refreshLocation]);

  // Determine active theme class based on settings and weather
  const activeTheme: WeatherCondition =
    themeMode === 'auto' ? (weather ? weather.condition : 'default') : themeMode;

  // Apply active theme class to HTML element
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('theme-rainy', 'theme-stormy', 'theme-cloudy', 'theme-sunny');
    if (activeTheme !== 'default') {
      html.classList.add(`theme-${activeTheme}`);
    }
  }, [activeTheme]);

  return (
    <WeatherThemeContext.Provider
      value={{
        coords,
        weather,
        themeMode,
        activeTheme,
        loading,
        error,
        setThemeMode,
        refreshLocation,
      }}
    >
      {children}
    </WeatherThemeContext.Provider>
  );
}

export function useWeatherTheme() {
  const context = useContext(WeatherThemeContext);
  if (!context) {
    throw new Error('useWeatherTheme must be used within a WeatherThemeProvider');
  }
  return context;
}
