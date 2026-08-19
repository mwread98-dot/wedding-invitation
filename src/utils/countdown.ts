export type Countdown = { days: number; hours: number; minutes: number };

export function calculateCountdown(target: string | Date, now = new Date()): Countdown {
  const distance = Math.max(0, new Date(target).getTime() - now.getTime());
  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance % 86_400_000) / 3_600_000),
    minutes: Math.floor((distance % 3_600_000) / 60_000),
  };
}

export function isRsvpOpen(deadline: string, reopened = false, now = new Date()) {
  return reopened || now.getTime() <= new Date(deadline).getTime();
}
