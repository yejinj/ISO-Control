import React, { useEffect, useState } from 'react';
import { fetchEvents } from '../api/events';

const Events = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const getEvents = async () => {
      try {
        const data = await fetchEvents();
        setEvents(data.events);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };

    getEvents();
  }, []);

  return (
    <div>
      <h1>Events</h1>
      {events.length > 0 ? (
        <ul>
          {events.map((event, index) => (
            <li key={index}>{event.event}</li>
          ))}
        </ul>
      ) : (
        <p>이벤트 로그를 불러올 수 없습니다.</p>
      )}
    </div>
  );
};

export default Events;