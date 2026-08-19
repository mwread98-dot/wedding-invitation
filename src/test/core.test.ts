import { describe, expect, it } from 'vitest';
import {
  generateInviteCode,
  hashInviteCode,
  looksLikeInviteCode,
} from '../../amplify/shared/invite-code';
import { isRsvpOpen } from '../utils/countdown';
import { calculateSummary, toCsv } from '../utils/stats';
import { rsvpSubmissionSchema } from '../validation/rsvp';

describe('invitation codes', () => {
  it('generates high-entropy URL-safe codes and only stores deterministic HMACs', () => {
    const first = generateInviteCode();
    const second = generateInviteCode();
    expect(first).not.toBe(second);
    expect(looksLikeInviteCode(first)).toBe(true);
    expect(hashInviteCode(first, 'test-pepper')).toHaveLength(64);
    expect(hashInviteCode(first, 'test-pepper')).toBe(hashInviteCode(first, 'test-pepper'));
    expect(hashInviteCode(first, 'another-pepper')).not.toBe(hashInviteCode(first, 'test-pepper'));
  });
});

describe('RSVP validation and deadlines', () => {
  it('rejects an invalid attendance value', () => {
    const result = rsvpSubmissionSchema.safeParse({
      guests: [
        {
          guestId: 'g1',
          attending: 'MAYBE',
          dietaryRequirements: '',
          allergies: '',
          plusOneName: '',
          songRequest: '',
        },
      ],
      message: '',
    });
    expect(result.success).toBe(false);
  });

  it('honours the deadline unless an invitation is reopened', () => {
    const now = new Date('2027-04-11T12:00:00Z');
    expect(isRsvpOpen('2027-04-10T23:59:59Z', false, now)).toBe(false);
    expect(isRsvpOpen('2027-04-10T23:59:59Z', true, now)).toBe(true);
  });
});

describe('admin reporting', () => {
  const base = {
    dietaryRequirements: '',
    allergies: '',
    plusOneName: '',
    songRequest: '',
    plusOneAllowed: false,
  } as const;
  it('calculates attendance and guest totals', () => {
    const summary = calculateSummary([
      {
        ...base,
        guestId: '1',
        firstName: 'Sherlock',
        lastName: 'Holmes',
        guestType: 'ADULT',
        attending: 'YES',
      },
      {
        ...base,
        guestId: '2',
        firstName: 'John',
        lastName: 'Watson',
        guestType: 'ADULT',
        attending: 'NO',
        dietaryRequirements: 'Vegetarian',
      },
      {
        ...base,
        guestId: '3',
        firstName: 'Rosie',
        lastName: 'Watson',
        guestType: 'CHILD',
        attending: 'PENDING',
      },
    ]);
    expect(summary).toMatchObject({
      invited: 3,
      attending: 1,
      declined: 1,
      awaiting: 1,
      adults: 2,
      children: 1,
      dietaryRequirements: 1,
    });
  });

  it('escapes spreadsheet values', () => {
    expect(toCsv([{ guest: 'Holmes, Sherlock', message: 'He said "yes"' }])).toContain(
      '"Holmes, Sherlock","He said ""yes"""',
    );
  });
});
