import React from 'react';

const ForecastDisplay = ({ forecast }) => {
  return (
    <div>
      <h3>7-Day Forecast</h3>
      <div>
        {forecast.list.map((day, index) => (
          <div key={index}>
            <p>{new Date(day.dt * 1000).toLocaleDateString()}</p>
            <p>{day.weather[0].description}</p>
            <p>Temp: {day.temp.day}°C</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForecastDisplay;
