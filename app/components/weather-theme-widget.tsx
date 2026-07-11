'use client';

import { useState, useEffect, useRef } from 'react';
import { useWeatherTheme, type ThemeMode } from './weather-theme-context';

export function WeatherThemeWidget() {
  const {
    weather,
    themeMode,
    activeTheme,
    loading,
    error,
    setThemeMode,
    refreshLocation,
  } = useWeatherTheme();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Icon mapping
  const getWeatherIcon = (theme: string) => {
    switch (theme) {
      case 'rainy':
        return '🌧️';
      case 'stormy':
        return '⛈️';
      case 'cloudy':
        return '☁️';
      case 'sunny':
        return '☀️';
      default:
        return '🌐';
    }
  };

  const getModeLabel = (mode: ThemeMode) => {
    switch (mode) {
      case 'auto':
        return 'Auto (Detect)';
      case 'rainy':
        return 'Rainy 🌧️';
      case 'stormy':
        return 'Stormy ⛈️';
      case 'cloudy':
        return 'Cloudy ☁️';
      case 'sunny':
        return 'Sunny ☀️';
      case 'default':
        return 'Default 🌐';
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-11 items-center gap-2 rounded-2xl border border-outline-variant bg-surface-strong px-3.5 text-sm font-semibold text-[color:var(--foreground)] transition shadow-sm hover:border-accent hover:bg-surface-soft cursor-pointer active:scale-[0.98]"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin text-[color:var(--accent)]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs text-[color:var(--muted)] font-medium">Detecting...</span>
          </div>
        ) : weather ? (
          <div className="flex items-center gap-1.5">
            <span className="text-base leading-none">{getWeatherIcon(activeTheme)}</span>
            <span className="truncate max-w-[90px] sm:max-w-[130px] font-bold">{weather.city}</span>
            <span className="text-xs bg-[color:var(--surface-soft)] px-1.5 py-0.5 rounded-lg border border-[color:var(--outline-variant)]/40 text-[color:var(--muted)]">
              {weather.temp}°C
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-[color:var(--muted)] font-medium">
            <span>📍 Detect Location</span>
          </div>
        )}
        
        {/* Small caret */}
        <svg
          className={`h-4 w-4 text-[color:var(--muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-outline-variant bg-surface-strong p-2 shadow-xl ring-1 ring-outline/10 focus:outline-none z-50 animate-in fade-in duration-200">
          <div className="px-3 py-2 border-b border-[color:var(--outline-variant)]/40 mb-1.5">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[color:var(--muted)]">
              Weather & Ambiance
            </p>
            {weather ? (
              <p className="text-xs mt-1 text-[color:var(--foreground)] font-semibold capitalize">
                Current: {weather.description} ({weather.source === 'openweather' ? 'OpenWeather' : 'Open-Meteo'})
              </p>
            ) : error ? (
              <p className="text-[10px] mt-1 text-red-500 font-semibold">{error}</p>
            ) : (
              <p className="text-xs mt-1 text-[color:var(--muted)]">Location not yet detected.</p>
            )}
          </div>

          <div className="space-y-1">
            {(['auto', 'rainy', 'stormy', 'cloudy', 'sunny', 'default'] as ThemeMode[]).map((mode) => {
              const isSelected = themeMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => {
                    setThemeMode(mode);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition cursor-pointer ${
                    isSelected
                      ? 'bg-accent/15 text-[color:var(--accent-strong)] border border-[color:var(--accent)]/30'
                      : 'text-[color:var(--foreground)] hover:bg-surface-soft'
                  }`}
                >
                  <span>{getModeLabel(mode)}</span>
                  {isSelected && (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          <div className="border-t border-[color:var(--outline-variant)]/40 mt-1.5 pt-1.5">
            <button
              onClick={() => {
                refreshLocation();
                setIsOpen(false);
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[color:var(--surface-soft)] px-3 py-2 text-center text-xs font-bold text-[color:var(--foreground)] transition hover:bg-[color:var(--outline-variant)]/20 cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Refresh Location</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
