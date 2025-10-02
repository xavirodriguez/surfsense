// lib/weather-api/providers/openmeteo.ts (o la ruta correspondiente)
import { fetchWeatherApi } from 'openmeteo';
import type { WeatherProvider, RawWeatherData, NormalizedForecast } from '../types'; // Ajusta la ruta si es necesario

export class OpenMeteoProvider implements WeatherProvider {
    readonly name = 'openmeteo';
    
    // La API pública de Open-Meteo para pronósticos no requiere una API key
    // en la URL como Stormglass. Mantenemos el constructor para consistencia
    // con otros proveedores, pero 'apiKey' no se usa en este 'fetch'.
    constructor(private readonly apiKey?: string) {} 
  
    async fetch(lat: number, lon: number): Promise<RawWeatherData> {
        const params = {
            "latitude": lat, // Usa la latitud de la petición
            "longitude": lon, // Usa la longitud de la petición
            "hourly": ["temperature_2m", "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m"],
            "forecast_days": 1, // Obtener datos para hoy
            "timezone": "auto", // Obtener la zona horaria automáticamente
        };
        const url = "https://api.open-meteo.com/v1/forecast";

        // fetchWeatherApi ya usa 'fetch' internamente.
        // Dado que Open-Meteo no usa un encabezado 'Authorization' para su API pública,
        // Next.js debería ser capaz de cachear esta petición automáticamente
        // si se ejecuta en un Server Component o Route Handler, sin necesidad de 'next: { revalidate }'
        // explícitamente aquí, a menos que necesites un control más fino.
        const responses = await fetchWeatherApi(url, params);
        
        // Open-Meteo devuelve un array de respuestas si se piden múltiples ubicaciones o modelos.
        // Para este caso, tomamos la primera (y única) respuesta.
        const response = responses[0];
        
        // console.log para depuración si es necesario, similar a Stormglass
        console.log('Open-Meteo raw data:');
        console.log({
            latitude: response.latitude(),
            longitude: response.longitude(),
            elevation: response.elevation(),
            utcOffsetSeconds: response.utcOffsetSeconds(),
            timezone: response.timezone(),
            timezoneAbbreviation: response.timezoneAbbreviation(),
        });

        // La estructura de 'data' es el array de respuestas directamente de Open-Meteo
        return {
            provider: this.name,
            timestamp: new Date(), // Timestamp de cuando se realizó la petición
            data: responses // Almacenamos el array completo de respuestas
        };
    }
  
    normalize(raw: RawWeatherData): NormalizedForecast {
        // 'raw.data' aquí será el array de 'WeatherApiResponse'
        const responses = raw.data as ReturnType<typeof fetchWeatherApi>;
        const response = responses[0]; // Tomamos la primera respuesta
        
        if (!response || !response.hourly()) {
          throw new Error('Open-Meteo: No hourly data found');
        }

        const hourly = response.hourly()!;
        const utcOffsetSeconds = response.utcOffsetSeconds();

        // Las variables se acceden por el índice en el que fueron solicitadas en 'params.hourly'
        const temperature2mArray = hourly.variables(0)!.valuesArray(); // temperature_2m
        const windSpeedArray = hourly.variables(1)!.valuesArray();      // wind_speed_10m
        const windDirectionArray = hourly.variables(2)!.valuesArray();   // wind_direction_10m
        const windGustsArray = hourly.variables(3)!.valuesArray();       // wind_gusts_10m

        // Tomamos el primer punto de datos para el pronóstico actual/inmediato
        const firstHourlyTime = Number(hourly.time());
        const firstTimestamp = new Date((firstHourlyTime + utcOffsetSeconds) * 1000);

        const temperature2m = temperature2mArray && temperature2mArray.length > 0 ? temperature2mArray[0] : null;
        const windSpeed = windSpeedArray && windSpeedArray.length > 0 ? windSpeedArray[0] : null;
        const windDirection = windDirectionArray && windDirectionArray.length > 0 ? windDirectionArray[0] : null;
        const windGust = windGustsArray && windGustsArray.length > 0 ? windGustsArray[0] : null;

        return {
            timestamp: firstTimestamp,
            waveHeightMin: null, // Open-Meteo no proporciona esto en su API de pronóstico estándar
            waveHeightMax: null,
            wavePeriod: null,
            waveDirection: null,
            windSpeed: windSpeed,
            windDirection: windDirection,
            // Si Open-Meteo no da ráfagas, se podría estimar o usar null.
            // Aquí lo tomamos directamente si lo pedimos en los parámetros.
            windGust: windGust, 
            tideHeight: null, // Open-Meteo no proporciona esto
            tideType: null,
            waterTemperature: null, // Open-Meteo no proporciona esto
            temperature2m: temperature2m // Temperatura del aire a 2m
        };
    }
}