// Calendar.js
import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarTheme.css';

const localizer = momentLocalizer(moment);

const CalendarComponent = () => {
    const [events, setEvents] = useState([]);

    const handleSelect = ({ start, end }) => {
        const title = window.prompt('New Event name');
        if (title) {
            setEvents([...events, { start, end, title }]);
        }
    };

    return (
        <div className="calendar-page">
            <h1 className="section-title">Event Calendar</h1>
            <p className="section-subtitle">
                Plan your month — click any day or drag across a time range to add an event.
            </p>

            <div className="calendar-card surface-card">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    selectable
                    onSelectSlot={handleSelect}
                    style={{ height: 560 }}
                />
            </div>
        </div>
    );
};

export default CalendarComponent;
