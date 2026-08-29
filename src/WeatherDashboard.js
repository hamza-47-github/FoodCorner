// src/WeatherDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getWeatherByCity } from './api/weatherApi';
import './WeatherDashboard.css';

const WeatherDashboard = () => {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [cityInput, setCityInput] = useState('');
  const [loading, setLoading] = useState(false);

  const loadCity = async (name) => {
    try {
      setError(null);
      setLoading(true);
      const data = await getWeatherByCity(name);
      setWeather(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const ipResponse = await axios.get('http://ip-api.com/json');
              const { city } = ipResponse.data;
              await loadCity(city);
            },
            (geoError) => {
              setError('Geolocation error: ' + geoError.message);
            }
          );
        } else {
          setError('Geolocation is not supported by this browser.');
        }
      } catch (err) {
        setError('An error occurred: ' + err.message);
      }
    };

    fetchWeather();
  }, []);

  return (
    <div className="weather-page">
      <h1 className="section-title">Weather Dashboard</h1>
      <p className="section-subtitle">
        Live conditions for your location — or search any city worldwide.
      </p>

      <form
        className="weather-search"
        onSubmit={(e) => {
          e.preventDefault();
          if (cityInput.trim()) loadCity(cityInput.trim());
        }}
      >
        <input
          type="text"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          placeholder="Search city… e.g. Lahore"
        />
        <button type="submit" className="btn-modern btn-primary-modern" disabled={loading}>
          {loading ? 'Loading…' : 'Search'}
        </button>
      </form>

      {error && <div className="alert-banner">{error}</div>}

      {!weather && !error && (
        <div className="empty-state">
          <h2>Fetching your location…</h2>
          <p>Detecting nearby weather automatically.</p>
        </div>
      )}

      {weather && (
        <div className="weather-hero">
          <div className="weather-hero-main">
            <div className="weather-hero-head">
              <h1>{weather.name}, {weather.sys?.country}</h1>
              <span className="live-pill">Live</span>
            </div>
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
              alt={weather.weather[0].description}
              className="hero-icon"
            />
            <p className="hero-temp">{Math.round(weather.main.temp)}°C</p>
            <p className="hero-desc">
              {weather.weather[0].description.charAt(0).toUpperCase() +
                weather.weather[0].description.slice(1)}
            </p>
          </div>

          <div className="weather-tiles stagger">
            <div className="tile">
              <span>Feels Like</span>
              <strong>{Math.round(weather.main.feels_like)}°C</strong>
            </div>
            <div className="tile">
              <span>Humidity</span>
              <strong>{weather.main.humidity}%</strong>
            </div>
            <div className="tile">
              <span>Wind</span>
              <strong>{weather.wind?.speed} m/s</strong>
            </div>
            <div className="tile">
              <span>Pressure</span>
              <strong>{weather.main.pressure} hPa</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherDashboard;
