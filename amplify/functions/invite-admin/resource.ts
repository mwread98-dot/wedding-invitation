import { defineFunction, secret } from '@aws-amplify/backend';

export const inviteAdmin = defineFunction({
  name: 'invite-admin',
  entry: './handler.ts',
  timeoutSeconds: 15,
  environment: { INVITE_CODE_PEPPER: secret('INVITE_CODE_PEPPER') },
});
