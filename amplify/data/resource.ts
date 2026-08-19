import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { guestRsvp } from '../functions/guest-rsvp/resource';
import { inviteAdmin } from '../functions/invite-admin/resource';

const schema = a
  .schema({
    Invitation: a
      .model({
        displayName: a.string().required(),
        inviteCodeHash: a.string(),
        notes: a.string(),
        status: a.enum(['ACTIVE', 'CLOSED']),
        rsvpDeadline: a.datetime().required(),
        reopened: a.boolean(),
        responseMessage: a.string(),
        guests: a.hasMany('Guest', 'invitationId'),
      })
      .authorization((allow) => [allow.group('ADMINS')]),
    Guest: a
      .model({
        invitationId: a.id().required(),
        invitation: a.belongsTo('Invitation', 'invitationId'),
        firstName: a.string().required(),
        lastName: a.string().required(),
        email: a.email(),
        guestType: a.enum(['ADULT', 'CHILD']),
        plusOneAllowed: a.boolean(),
        rsvp: a.hasOne('Rsvp', 'guestId'),
      })
      .authorization((allow) => [allow.group('ADMINS')]),
    Rsvp: a
      .model({
        guestId: a.id().required(),
        guest: a.belongsTo('Guest', 'guestId'),
        attending: a.enum(['YES', 'NO']),
        dietaryRequirements: a.string(),
        allergies: a.string(),
        plusOneName: a.string(),
        songRequest: a.string(),
        submittedAt: a.datetime().required(),
      })
      .authorization((allow) => [allow.group('ADMINS')]),
    GuestView: a.customType({
      guestId: a.id().required(),
      firstName: a.string().required(),
      lastName: a.string().required(),
      guestType: a.string().required(),
      plusOneAllowed: a.boolean().required(),
      attending: a.string().required(),
      dietaryRequirements: a.string().required(),
      allergies: a.string().required(),
      plusOneName: a.string().required(),
      songRequest: a.string().required(),
    }),
    InvitationView: a.customType({
      invitationId: a.id().required(),
      displayName: a.string().required(),
      message: a.string().required(),
      deadline: a.datetime().required(),
      isOpen: a.boolean().required(),
      guests: a.ref('GuestView').array().required(),
    }),
    RsvpResult: a.customType({ success: a.boolean().required(), message: a.string().required() }),
    InviteCodeResult: a.customType({
      code: a.string().required(),
      invitationId: a.id().required(),
    }),
    lookupInvitation: a
      .query()
      .arguments({ code: a.string().required() })
      .returns(a.ref('InvitationView'))
      .authorization((allow) => [allow.publicApiKey()])
      .handler(a.handler.function(guestRsvp)),
    submitRsvp: a
      .mutation()
      .arguments({ code: a.string().required(), response: a.string().required() })
      .returns(a.ref('RsvpResult'))
      .authorization((allow) => [allow.publicApiKey()])
      .handler(a.handler.function(guestRsvp)),
    rotateInviteCode: a
      .mutation()
      .arguments({ invitationId: a.id().required() })
      .returns(a.ref('InviteCodeResult'))
      .authorization((allow) => [allow.group('ADMINS')])
      .handler(a.handler.function(inviteAdmin)),
  })
  .authorization((allow) => [
    allow.resource(guestRsvp).to(['query', 'mutate']),
    allow.resource(inviteAdmin).to(['query', 'mutate']),
  ]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: { expiresInDays: 365 },
  },
});
