// src/components/LocationTracker.js
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './LocationTracker.css';

// Fix marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const LocationTracker = () => {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleSuccess = (position) => {
      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });
    };

    const handleError = (error) => {
      setError(error.message);
    };

    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  }, []);

  return (
    <div className="location-page">
      <h1 className="section-title">Live Location Tracker</h1>
      <p className="section-subtitle">
        Real-time GPS tracking with live map updates of your current position.
      </p>

      {error ? (
        <div className="empty-state">
          <h2>Unable to track location</h2>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="location-stats stagger">
            <div className="stat-tile surface-card">
              <span>Latitude</span>
              <strong>{location.latitude !== null ? location.latitude.toFixed(5) : '—'}</strong>
            </div>
            <div className="stat-tile surface-card">
              <span>Longitude</span>
              <strong>{location.longitude !== null ? location.longitude.toFixed(5) : '—'}</strong>
            </div>
            <div className="stat-tile surface-card">
              <span>Status</span>
              <strong className={location.latitude ? 'live' : ''}>
                {location.latitude ? 'Tracking Live' : 'Connecting…'}
              </strong>
            </div>
          </div>

          <div className="map-card surface-card">
            {location.latitude && location.longitude ? (
              <MapContainer
                center={[location.latitude, location.longitude]}
                zoom={15}
                className="map-frame"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[location.latitude, location.longitude]}>
                  <Popup>Your current location</Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="map-loading">Fetching location…</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default LocationTracker;
