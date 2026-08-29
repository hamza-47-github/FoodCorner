import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import './WeatherDisplay.css'; // Custom CSS for additional styling

const WeatherDisplay = ({ weather }) => {
  debugger
  const iconUrl = `http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`; // Weather icon URL

  return (
    <div className="container mt-4">
      <div className="card weather-card text-center">
        <div className="card-body">
          <h2 className="card-title">{weather.name}</h2>
          <img src={iconUrl} alt={weather.weather[0].description} className="weather-icon" />
          <p className="weather-description">{weather.weather[0].description}</p>
          <h3 className="weather-temp">
            <i className="fas fa-thermometer-half"></i> {/* Temperature Icon */}
            <span className="ml-2">{weather.main.temp}°C</span>
          </h3>
          <p>
            <i className="fas fa-water"></i> {/* Humidity Icon */}
            <span className="ml-2">Humidity: {weather.main.humidity}%</span>
          </p>
          <p>
            <i className="fas fa-wind"></i> {/* Wind Speed Icon */}
            <span className="ml-2">Wind Speed: {weather.wind.speed} m/s</span>
          </p>
          <p>
            <i className="fas fa-smog"></i> {/* Smoke Icon */}
            <span className="ml-2">Air Quality: {/* Add your air quality data here */}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeatherDisplay;
