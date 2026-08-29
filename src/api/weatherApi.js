import axios from 'axios';

const API_KEY = '40a28ff1b4673496c2588373ce595910';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Fetch current weather by city name
export const getWeatherByCity = async (city) => {
  try {
    
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        q: city,
        units: 'metric', // Change to 'imperial' for Fahrenheit
        appid: API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error('City not found');
    } else {
      throw new Error('An error occurred while fetching the weather data');
    }
  }
};

// Fetch 7-day forecast by city name
export const getForecastByCity = async (city) => {
  try {
    // First, get the current weather to extract the coordinates
    const weatherData = await getWeatherByCity(city);
    const { lat, lon } = weatherData.coord;

    // Use the coordinates to get the forecast
    const response = await axios.get(`${BASE_URL}/onecall`, {
      params: {
        lat,
        lon,
        exclude: 'current,minutely,hourly,alerts', // Exclude unwanted data
        units: 'metric',
        appid: API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error('City not found');
    } else {
      throw new Error('An error occurred while fetching the forecast data');
    }
  }
};
