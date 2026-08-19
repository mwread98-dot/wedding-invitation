import { z } from 'zod';

const optionalText = z.string().trim().max(500);

export const rsvpSubmissionSchema = z.object({
  guests: z
    .array(
      z.object({
        guestId: z.string().min(1).max(128),
        attending: z.enum(['YES', 'NO']),
        dietaryRequirements: optionalText,
        allergies: optionalText,
        plusOneName: z.string().trim().max(120),
        songRequest: z.string().trim().max(180),
      }),
    )
    .min(1)
    .max(20),
  message: z.string().trim().max(1000),
});

export const inviteCodeSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_-]{32,128}$/, 'That invitation code is not valid.');
