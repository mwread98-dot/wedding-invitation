export type Attendance = 'YES' | 'NO' | 'PENDING';

export type GuestRsvp = {
  guestId: string;
  firstName: string;
  lastName: string;
  guestType: 'ADULT' | 'CHILD';
  plusOneAllowed: boolean;
  attending: Attendance;
  dietaryRequirements: string;
  allergies: string;
  plusOneName: string;
  songRequest: string;
};

export type InvitationView = {
  invitationId: string;
  displayName: string;
  message: string;
  deadline: string;
  isOpen: boolean;
  guests: GuestRsvp[];
};

export type RsvpSubmission = {
  guests: Array<
    Pick<
      GuestRsvp,
      'guestId' | 'attending' | 'dietaryRequirements' | 'allergies' | 'plusOneName' | 'songRequest'
    >
  >;
  message: string;
};

export type AdminSummary = {
  invited: number;
  attending: number;
  declined: number;
  awaiting: number;
  adults: number;
  children: number;
  dietaryRequirements: number;
};
