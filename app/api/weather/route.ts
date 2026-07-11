import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
      return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    // 1. Try OpenWeatherMap first if key is available
    if (apiKey) {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const mainWeather = data.weather?.[0];
          const isNight = mainWeather?.icon?.endsWith('n');
          let condition = mapOpenWeatherCondition(mainWeather?.main);
          if (condition === 'sunny' && isNight) {
            condition = 'cloudy'; // Clear night displays slate dark theme
          }
          return NextResponse.json({
            city: data.name || 'Unknown Location',
            temp: Math.round(data.main?.temp ?? 0),
            condition,
            description: mainWeather?.description || '',
            source: 'openweather'
          });
        } else {
          console.warn(`OpenWeatherMap responded with status: ${res.status}`);
        }
      } catch (err) {
        console.error('OpenWeatherMap request failed, trying fallback:', err);
      }
    } else {
      console.warn('OPENWEATHER_API_KEY not configured, using fallback');
    }

    // 2. Fallback to Open-Meteo + Mapbox reverse-geocoding
    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
      const weatherRes = await fetch(weatherUrl);
      
      let city = 'Detected Location';
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (mapboxToken) {
        const geoUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${mapboxToken}&limit=1`;
        const geoRes = await fetch(geoUrl);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          // Extract city/text name
          city = geoData.features?.[0]?.text || geoData.features?.[0]?.place_name || 'Detected Location';
        }
      }

      if (weatherRes.ok) {
        const weatherData = await weatherRes.json();
        const current = weatherData.current_weather;
        if (current) {
          const isNight = current.is_day === 0;
          let condition = mapOpenMeteoCode(current.weathercode);
          if (condition === 'sunny' && isNight) {
            condition = 'cloudy'; // Clear night displays slate dark theme
          }
          return NextResponse.json({
            city,
            temp: Math.round(current.temperature ?? 0),
            condition,
            description: getWeatherCodeDescription(current.weathercode),
            source: 'open-meteo'
          });
        }
      }
    } catch (err) {
      console.error('Fallback weather fetch failed:', err);
    }

    return NextResponse.json({ error: 'Failed to fetch weather from all providers' }, { status: 500 });
  } catch (err) {
    console.error('API weather route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function mapOpenWeatherCondition(main: string | undefined): 'rainy' | 'stormy' | 'cloudy' | 'sunny' | 'default' {
  if (!main) return 'default';
  const val = main.toLowerCase();
  if (val.includes('rain') || val.includes('drizzle')) return 'rainy';
  if (val.includes('thunderstorm')) return 'stormy';
  if (val.includes('cloud') || val.includes('mist') || val.includes('fog') || val.includes('haze') || val.includes('smoke')) return 'cloudy';
  if (val.includes('clear')) return 'sunny';
  return 'default';
}

function mapOpenMeteoCode(code: number): 'rainy' | 'stormy' | 'cloudy' | 'sunny' | 'default' {
  // WMO weather interpretation codes (https://open-meteo.com/en/docs)
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rainy';
  if ([95, 96, 99].includes(code)) return 'stormy';
  if ([1, 2, 3, 45, 48, 71, 73, 75, 77, 85, 86].includes(code)) return 'cloudy';
  if (code === 0) return 'sunny';
  return 'default';
}

function getWeatherCodeDescription(code: number): string {
  if (code === 0) return 'clear sky';
  if ([1, 2, 3].includes(code)) return 'cloudy';
  if ([45, 48].includes(code)) return 'foggy';
  if ([51, 53, 55].includes(code)) return 'drizzle';
  if ([61, 63, 65].includes(code)) return 'rainy';
  if ([80, 81, 82].includes(code)) return 'showers';
  if ([95, 96, 99].includes(code)) return 'thunderstorm';
  return 'overcast';
}
