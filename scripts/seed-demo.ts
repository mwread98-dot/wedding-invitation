import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { signIn, signOut } from 'aws-amplify/auth';
import outputs from '../amplify_outputs.json';
import type { Schema } from '../amplify/data/resource';

const email = process.env.SEED_ADMIN_EMAIL;
const password = process.env.SEED_ADMIN_PASSWORD;
if (!email || !password)
  throw new Error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD for an ADMINS user.');

Amplify.configure(outputs);
await signIn({ username: email, password });
const client = generateClient<Schema>();

const samples = [
  {
    displayName: 'Sherlock Holmes & John Watson',
    guests: [
      ['Sherlock', 'Holmes'],
      ['John', 'Watson'],
    ],
  },
  {
    displayName: 'Elizabeth Bennet & Fitzwilliam Darcy',
    guests: [
      ['Elizabeth', 'Bennet'],
      ['Fitzwilliam', 'Darcy'],
    ],
  },
];

for (const sample of samples) {
  const { data: invitation } = await client.models.Invitation.create({
    displayName: sample.displayName,
    rsvpDeadline: '2027-04-10T22:59:59.000Z',
    status: 'ACTIVE',
    reopened: false,
  });
  if (!invitation) throw new Error(`Could not create ${sample.displayName}`);
  for (const [firstName, lastName] of sample.guests)
    await client.models.Guest.create({
      invitationId: invitation.id,
      firstName,
      lastName,
      guestType: 'ADULT',
      plusOneAllowed: false,
    });
  const { data: code } = await client.mutations.rotateInviteCode({ invitationId: invitation.id });
  console.log(
    `${sample.displayName}: ${process.env.VITE_SITE_URL ?? 'http://localhost:5173'}/rsvp?code=${code?.code}`,
  );
}
await signOut();
