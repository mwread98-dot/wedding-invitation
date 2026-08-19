import type { AdminSummary, GuestRsvp } from '../types/rsvp';

export function calculateSummary(guests: GuestRsvp[]): AdminSummary {
  return guests.reduce<AdminSummary>(
    (summary, guest) => {
      summary.invited += 1;
      summary.adults += guest.guestType === 'ADULT' ? 1 : 0;
      summary.children += guest.guestType === 'CHILD' ? 1 : 0;
      summary.attending += guest.attending === 'YES' ? 1 : 0;
      summary.declined += guest.attending === 'NO' ? 1 : 0;
      summary.awaiting += guest.attending === 'PENDING' ? 1 : 0;
      summary.dietaryRequirements += guest.dietaryRequirements.trim() ? 1 : 0;
      return summary;
    },
    {
      invited: 0,
      attending: 0,
      declined: 0,
      awaiting: 0,
      adults: 0,
      children: 0,
      dietaryRequirements: 0,
    },
  );
}

export function toCsv(rows: Array<Record<string, string | number | boolean | null | undefined>>) {
  if (!rows.length) return '';
  const headings = Object.keys(rows[0]);
  const escape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  return [headings.map(escape), ...rows.map((row) => headings.map((key) => escape(row[key])))]
    .map((line) => line.join(','))
    .join('\r\n');
}
