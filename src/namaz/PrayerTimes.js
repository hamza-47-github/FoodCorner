// src/components/PrayerTimes.js
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';
import './PrayerTimes.css';

const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Rawalpindi'];

const PrayerTimes = () => {
    const [prayerTimes, setPrayerTimes] = useState({});
    const [city, setCity] = useState('Lahore');

    const scheduleAlarms = useCallback((times) => {
        Object.entries(times).forEach(([key, time]) => {
            const date = new Date();
            const [hours, minutes] = time.split(':');
            date.setHours(hours);
            date.setMinutes(minutes);
            date.setSeconds(0);

            const now = new Date();
            const delay = date - now;

            if (delay > 0) {
                setTimeout(() => {
                    toast.success(`It's time for ${key}!`);
                    new Notification('Namaz Reminder', {
                        body: `It's time for ${key}!`,
                    });

                    const audio = new Audio(`${process.env.PUBLIC_URL}/8163_download_makkah_azan_1_ringtone.mp3`);
                    audio.play().catch((error) => console.error('Error playing sound:', error));
                }, delay);
            }
        });
    }, []);

    const fetchPrayerTimes = useCallback(async () => {
        try {
            const response = await axios.get(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Pakistan&method=2`);
            setPrayerTimes(response.data.data.timings);
            scheduleAlarms(response.data.data.timings);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch prayer times');
        }
    }, [city, scheduleAlarms]);

    useEffect(() => {
        fetchPrayerTimes();
    }, [fetchPrayerTimes]);

    const playSound = () => {
        const audio = new Audio(`${process.env.PUBLIC_URL}/8163_download_makkah_azan_1_ringtone.mp3`);
        audio.play().catch((error) => console.error('Error playing sound:', error));
        toast.info('Alarm sound played!');
    };

    const sharePrayerTimes = () => {
        const prayerTimeMessage = Object.entries(prayerTimes)
            .filter(([key]) => !['First Third', 'Last Third'].includes(key))
            .map(([key, time]) => `${key}: ${time}`)
            .join('\n');

        const message = `Prayer Times for ${city}:\n${prayerTimeMessage}`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="prayer-page">
            <h1 className="section-title">Prayer Times</h1>
            <p className="section-subtitle">
                Accurate daily prayer timings with azan reminders for cities across Pakistan.
            </p>

            <div className="prayer-controls">
                <select value={city} onChange={(e) => setCity(e.target.value)}>
                    {CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                <button className="btn-modern btn-outline-modern" onClick={playSound}>
                    Play Alarm Sound
                </button>
                <button className="btn-modern btn-primary-modern" onClick={sharePrayerTimes}>
                    Share via WhatsApp
                </button>
            </div>

            <div className="clock-grid stagger">
                {Object.entries(prayerTimes)
                    .filter(([key]) => !['Midnight', 'First Third', 'Last Third'].includes(key))
                    .map(([key, time]) => {
                        const [hours, minutes] = time.split(':');
                        const clockTime = new Date();
                        clockTime.setHours(hours);
                        clockTime.setMinutes(minutes);
                        clockTime.setSeconds(0);

                        return (
                            <div className="clock-item" key={key}>
                                <strong>{key}</strong>
                                <Clock value={clockTime} size={72} />
                                <p>{time}</p>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export default PrayerTimes;
