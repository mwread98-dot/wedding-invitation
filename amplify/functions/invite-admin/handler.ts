import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from '$amplify/env/invite-admin';
import type { Schema } from '../../data/resource';
import { generateInviteCode, hashInviteCode } from '../../shared/invite-code';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);
const client = generateClient<Schema>();

export const handler: Schema['rotateInviteCode']['functionHandler'] = async (event) => {
  const invitation = await client.models.Invitation.get({ id: event.arguments.invitationId });
  if (!invitation.data) throw new Error('Invitation not found.');
  const code = generateInviteCode();
  await client.models.Invitation.update({
    id: invitation.data.id,
    inviteCodeHash: hashInviteCode(code, env.INVITE_CODE_PEPPER),
  });
  return { code, invitationId: invitation.data.id };
};
