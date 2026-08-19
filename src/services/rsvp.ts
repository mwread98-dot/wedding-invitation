import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import type { InvitationView, RsvpSubmission } from '../types/rsvp';
import { inviteCodeSchema, rsvpSubmissionSchema } from '../validation/rsvp';

const guestClient = generateClient<Schema>({ authMode: 'apiKey' });

export async function lookupInvitation(rawCode: string): Promise<InvitationView> {
  const code = inviteCodeSchema.parse(rawCode);
  const { data, errors } = await guestClient.queries.lookupInvitation({ code });
  if (errors?.length || !data)
    throw new Error('We could not find that invitation. Please check your personal link.');
  return JSON.parse(JSON.stringify(data)) as InvitationView;
}

export async function submitRsvp(rawCode: string, submission: RsvpSubmission) {
  const code = inviteCodeSchema.parse(rawCode);
  const valid = rsvpSubmissionSchema.parse(submission);
  const { data, errors } = await guestClient.mutations.submitRsvp({
    code,
    response: JSON.stringify(valid),
  });
  if (errors?.length || !data?.success)
    throw new Error(data?.message ?? 'Your reply could not be saved. Please try again.');
  return data;
}
