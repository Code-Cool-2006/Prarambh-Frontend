import React, { useEffect, useState } from 'react';
import Login from './Login';

function Countdown() {

  // Event Time
  const targetDate =
    new Date('2026-05-29T09:15:00+05:30').getTime();

  const [eventStarted, setEventStarted] = useState(false);

  useEffect(() => {

    const checkTime = () => {

      const now = new Date().getTime();

      if (now >= targetDate) {
        setEventStarted(true);
      }
    };

    checkTime();

    const interval =
      setInterval(checkTime, 1000);

    return () => clearInterval(interval);

  }, []);

  // AFTER EVENT STARTS → SHOW LOGIN
  if (eventStarted) {
    return <Login />;
  }

  // BEFORE EVENT STARTS → SHOW COUNTDOWN
  return (
    <iframe
      src="/countdown/index.html"
      title="Countdown"
      style={{
        width: '100%',
        height: '100vh',
        border: 'none'
      }}
    />
  );
}

export default Countdown;