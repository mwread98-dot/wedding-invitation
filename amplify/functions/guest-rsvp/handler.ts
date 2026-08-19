import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from '$amplify/env/guest-rsvp';
import type { Schema } from '../../data/resource';
import { hashInviteCode, looksLikeInviteCode } from '../../shared/invite-code';
import { rsvpSubmissionSchema } from '../../../src/validation/rsvp';
import { isRsvpOpen } from '../../../src/utils/countdown';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);
const client = generateClient<Schema>();

async function findInvitation(code: string) {
  if (!looksLikeInviteCode(code)) return null;
  const inviteCodeHash = hashInviteCode(code, env.INVITE_CODE_PEPPER);
  const { data } = await client.models.Invitation.list({
    filter: { inviteCodeHash: { eq: inviteCodeHash } },
  });
  return data[0] ?? null;
}

async function buildView(code: string) {
  const invitation = await findInvitation(code);
  if (!invitation || invitation.status !== 'ACTIVE') return null;
  const [{ data: guests }, { data: rsvps }] = await Promise.all([
    client.models.Guest.list({ filter: { invitationId: { eq: invitation.id } } }),
    client.models.Rsvp.list(),
  ]);
  const invitationGuestIds = new Set(guests.map((guest) => guest.id));
  const byGuest = new Map(
    rsvps
      .filter((rsvp) => invitationGuestIds.has(rsvp.guestId))
      .map((rsvp) => [rsvp.guestId, rsvp]),
  );
  return {
    invitationId: invitation.id,
    displayName: invitation.displayName,
    message: invitation.responseMessage ?? '',
    deadline: invitation.rsvpDeadline,
    isOpen: isRsvpOpen(invitation.rsvpDeadline, invitation.reopened ?? false),
    guests: guests.map((guest) => {
      const rsvp = byGuest.get(guest.id);
      return {
        guestId: guest.id,
        firstName: guest.firstName,
        lastName: guest.lastName,
        guestType: guest.guestType ?? 'ADULT',
        plusOneAllowed: guest.plusOneAllowed ?? false,
        attending: rsvp?.attending ?? 'PENDING',
        dietaryRequirements: rsvp?.dietaryRequirements ?? '',
        allergies: rsvp?.allergies ?? '',
        plusOneName: rsvp?.plusOneName ?? '',
        songRequest: rsvp?.songRequest ?? '',
      };
    }),
  };
}

type GuestRsvpEvent =
  | Parameters<Schema['lookupInvitation']['functionHandler']>[0]
  | Parameters<Schema['submitRsvp']['functionHandler']>[0];

export const handler = async (event: GuestRsvpEvent) => {
  if (event.info.fieldName === 'lookupInvitation') return buildView(event.arguments.code);

  const invitation = await findInvitation(event.arguments.code);
  if (!invitation) return { success: false, message: 'Invitation not found.' };
  if (!isRsvpOpen(invitation.rsvpDeadline, invitation.reopened ?? false))
    return { success: false, message: 'The RSVP deadline has passed.' };
  if (!('response' in event.arguments)) return { success: false, message: 'Invalid RSVP request.' };
  let payload: unknown;
  try {
    payload = JSON.parse(event.arguments.response);
  } catch {
    return { success: false, message: 'Invalid RSVP request.' };
  }
  const parsed = rsvpSubmissionSchema.safeParse(payload);
  if (!parsed.success)
    return { success: false, message: 'Please check the information in your reply.' };

  const { data: invitedGuests } = await client.models.Guest.list({
    filter: { invitationId: { eq: invitation.id } },
  });
  const allowed = new Map(invitedGuests.map((guest) => [guest.id, guest]));
  if (parsed.data.guests.some((response) => !allowed.has(response.guestId)))
    return { success: false, message: 'The reply contains a guest outside this invitation.' };

  for (const response of parsed.data.guests) {
    const invited = allowed.get(response.guestId)!;
    const { data: existing } = await client.models.Rsvp.list({
      filter: { guestId: { eq: response.guestId } },
    });
    const values = {
      guestId: response.guestId,
      attending: response.attending,
      dietaryRequirements: response.attending === 'YES' ? response.dietaryRequirements : '',
      allergies: response.attending === 'YES' ? response.allergies : '',
      plusOneName:
        response.attending === 'YES' && invited.plusOneAllowed ? response.plusOneName : '',
      songRequest: response.attending === 'YES' ? response.songRequest : '',
      submittedAt: new Date().toISOString(),
    } as const;
    if (existing[0]) await client.models.Rsvp.update({ id: existing[0].id, ...values });
    else await client.models.Rsvp.create(values);
  }
  await client.models.Invitation.update({
    id: invitation.id,
    responseMessage: parsed.data.message,
  });
  return { success: true, message: 'Your reply has been saved.' };
};
