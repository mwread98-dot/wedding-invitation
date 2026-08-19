import { useEffect, useState } from 'react';
import { calculateCountdown } from '../utils/countdown';

export function Countdown({ target }: { target: string }) {
  const [time, setTime] = useState(() => calculateCountdown(target));
  useEffect(() => {
    const timer = window.setInterval(() => setTime(calculateCountdown(target)), 60_000);
    return () => window.clearInterval(timer);
  }, [target]);
  return (
    <div
      className="countdown"
      aria-label={`${time.days} days, ${time.hours} hours and ${time.minutes} minutes until the wedding`}
    >
      {Object.entries(time).map(([label, value]) => (
        <div key={label}>
          <strong>{value}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
