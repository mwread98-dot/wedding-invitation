import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

export const adminClient = generateClient<Schema>();
export type InvitationRecord = Schema['Invitation']['type'];
export type GuestRecord = Schema['Guest']['type'];
export type RsvpRecord = Schema['Rsvp']['type'];

export async function loadAdminData() {
  const [invitations, guests, rsvps] = await Promise.all([
    adminClient.models.Invitation.list(),
    adminClient.models.Guest.list(),
    adminClient.models.Rsvp.list(),
  ]);
  const errors = [...(invitations.errors ?? []), ...(guests.errors ?? []), ...(rsvps.errors ?? [])];
  if (errors.length) throw new Error(errors[0].message);
  return { invitations: invitations.data, guests: guests.data, rsvps: rsvps.data };
}

export async function createInvitation(displayName: string, deadline: string) {
  const { data, errors } = await adminClient.models.Invitation.create({
    displayName,
    rsvpDeadline: new Date(`${deadline}T23:59:59`).toISOString(),
    status: 'ACTIVE',
    reopened: false,
  });
  if (errors?.length || !data)
    throw new Error(errors?.[0]?.message ?? 'Invitation could not be created.');
  return data;
}

export async function addGuest(
  invitationId: string,
  firstName: string,
  lastName: string,
  guestType: 'ADULT' | 'CHILD',
  plusOneAllowed: boolean,
) {
  const { errors } = await adminClient.models.Guest.create({
    invitationId,
    firstName,
    lastName,
    guestType,
    plusOneAllowed,
  });
  if (errors?.length) throw new Error(errors[0].message);
}

export async function removeGuest(guestId: string, rsvpId?: string) {
  if (rsvpId) await adminClient.models.Rsvp.delete({ id: rsvpId });
  const { errors } = await adminClient.models.Guest.delete({ id: guestId });
  if (errors?.length) throw new Error(errors[0].message);
}

export async function setAttendance(
  guestId: string,
  status: 'YES' | 'NO' | 'PENDING',
  existing?: RsvpRecord,
) {
  if (status === 'PENDING') {
    if (existing) await adminClient.models.Rsvp.delete({ id: existing.id });
    return;
  }
  const values = { guestId, attending: status, submittedAt: new Date().toISOString() } as const;
  if (existing) await adminClient.models.Rsvp.update({ id: existing.id, ...values });
  else await adminClient.models.Rsvp.create(values);
}

export async function toggleReopened(invitation: InvitationRecord) {
  await adminClient.models.Invitation.update({ id: invitation.id, reopened: !invitation.reopened });
}

export async function editInvitation(invitationId: string, displayName: string, deadline: string) {
  const { errors } = await adminClient.models.Invitation.update({
    id: invitationId,
    displayName,
    rsvpDeadline: new Date(`${deadline}T23:59:59`).toISOString(),
  });
  if (errors?.length) throw new Error(errors[0].message);
}

export async function updateRsvpDetails(
  rsvp: RsvpRecord,
  updates: Pick<RsvpRecord, 'dietaryRequirements' | 'allergies' | 'plusOneName' | 'songRequest'>,
) {
  const { errors } = await adminClient.models.Rsvp.update({ id: rsvp.id, ...updates });
  if (errors?.length) throw new Error(errors[0].message);
}

export async function rotateCode(invitationId: string) {
  const { data, errors } = await adminClient.mutations.rotateInviteCode({ invitationId });
  if (errors?.length || !data)
    throw new Error(errors?.[0]?.message ?? 'A link could not be generated.');
  return data.code;
}
