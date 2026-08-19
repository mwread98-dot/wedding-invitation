import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { guestRsvp } from './functions/guest-rsvp/resource';
import { inviteAdmin } from './functions/invite-admin/resource';

defineBackend({ auth, data, guestRsvp, inviteAdmin });
