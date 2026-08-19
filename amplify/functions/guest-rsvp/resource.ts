import { defineFunction, secret } from '@aws-amplify/backend';

export const guestRsvp = defineFunction({
  name: 'guest-rsvp',
  entry: './handler.ts',
  timeoutSeconds: 15,
  environment: { INVITE_CODE_PEPPER: secret('INVITE_CODE_PEPPER') },
});
