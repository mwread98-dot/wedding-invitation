import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { wedding } from '../config/wedding';
import {
  addGuest,
  createInvitation,
  editInvitation,
  loadAdminData,
  removeGuest,
  rotateCode,
  setAttendance,
  toggleReopened,
  updateRsvpDetails,
  type GuestRecord,
  type InvitationRecord,
  type RsvpRecord,
} from '../services/admin';
import type { GuestRsvp } from '../types/rsvp';
import { calculateSummary, toCsv } from '../utils/stats';

type DashboardData = {
  invitations: InvitationRecord[];
  guests: GuestRecord[];
  rsvps: RsvpRecord[];
};

function AdminDashboard({ signOut }: { signOut?: () => void }) {
  const [data, setData] = useState<DashboardData>({ invitations: [], guests: [], rsvps: [] });
  const [filter, setFilter] = useState('ALL');
  const [selectedInvitation, setSelectedInvitation] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  const [generatedLink, setGeneratedLink] = useState('');

  async function refresh() {
    setBusy(true);
    setError('');
    try {
      const result = await loadAdminData();
      setData(result);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load wedding data.');
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);

  const guestRows = useMemo(
    () =>
      data.guests.map((guest) => {
        const invitation = data.invitations.find((item) => item.id === guest.invitationId);
        const rsvp = data.rsvps.find((item) => item.guestId === guest.id);
        return { guest, invitation, rsvp, status: rsvp?.attending ?? 'PENDING' };
      }),
    [data],
  );
  const visibleRows =
    filter === 'ALL' ? guestRows : guestRows.filter((row) => row.status === filter);
  const summaryGuests: GuestRsvp[] = guestRows.map(({ guest, rsvp }) => ({
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
  }));
  const summary = calculateSummary(summaryGuests);

  async function onCreateInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await createInvitation(String(form.get('displayName')), String(form.get('deadline')));
      event.currentTarget.reset();
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to create invitation.');
    }
  }
  async function onAddGuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await addGuest(
        String(form.get('invitationId')),
        String(form.get('firstName')),
        String(form.get('lastName')),
        form.get('guestType') as 'ADULT' | 'CHILD',
        form.get('plusOneAllowed') === 'on',
      );
      event.currentTarget.reset();
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to add guest.');
    }
  }
  async function makeLink(invitationId: string) {
    try {
      const code = await rotateCode(invitationId);
      const link = `${window.location.origin}/rsvp?code=${code}`;
      setGeneratedLink(link);
      await navigator.clipboard.writeText(link);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to generate invitation link.');
    }
  }
  async function editHousehold(invitation: InvitationRecord) {
    const displayName = window.prompt('Invitation display name', invitation.displayName);
    if (!displayName) return;
    const currentDeadline = invitation.rsvpDeadline.slice(0, 10);
    const deadline = window.prompt('RSVP deadline (YYYY-MM-DD)', currentDeadline);
    if (!deadline) return;
    try {
      await editInvitation(invitation.id, displayName, deadline);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to edit invitation.');
    }
  }
  async function editResponse(rsvp: RsvpRecord) {
    const dietaryRequirements = window.prompt(
      'Dietary requirements',
      rsvp.dietaryRequirements ?? '',
    );
    if (dietaryRequirements === null) return;
    const allergies = window.prompt('Allergies', rsvp.allergies ?? '');
    if (allergies === null) return;
    const plusOneName = window.prompt('Plus-one name', rsvp.plusOneName ?? '');
    if (plusOneName === null) return;
    const songRequest = window.prompt('Song request', rsvp.songRequest ?? '');
    if (songRequest === null) return;
    await updateRsvpDetails(rsvp, {
      dietaryRequirements,
      allergies,
      plusOneName,
      songRequest,
    });
    await refresh();
  }
  function exportCsv() {
    const csv = toCsv(
      guestRows.map(({ guest, invitation, rsvp, status }) => ({
        invitation: invitation?.displayName ?? '',
        guestName: `${guest.firstName} ${guest.lastName}`,
        attendanceStatus: status,
        dietaryRequirements: rsvp?.dietaryRequirements,
        allergies: rsvp?.allergies,
        plusOne: rsvp?.plusOneName,
        songRequest: rsvp?.songRequest,
        message: invitation?.responseMessage,
      })),
    );
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'wedding-rsvps.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Private area</p>
          <h1>Guest list</h1>
        </div>
        <div>
          <button className="button light" onClick={exportCsv}>
            Export CSV
          </button>
          <button className="text-button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <section className="stat-grid" aria-label="RSVP summary">
        {Object.entries(summary).map(([label, value]) => (
          <article key={label}>
            <strong>{value}</strong>
            <span>{label.replace(/([A-Z])/g, ' $1')}</span>
          </article>
        ))}
      </section>
      <div className="admin-grid">
        <section className="admin-panel guest-list-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Live responses</p>
              <h2>Invited guests</h2>
            </div>
            <select
              aria-label="Filter attendance"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="ALL">All replies</option>
              <option value="YES">Attending</option>
              <option value="NO">Declined</option>
              <option value="PENDING">Awaiting</option>
            </select>
          </div>
          {busy ? (
            <p>Loading guest list…</p>
          ) : (
            <div className="guest-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Invitation</th>
                    <th>Reply</th>
                    <th>Dietary / allergies</th>
                    <th>Guest notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map(({ guest, invitation, rsvp, status }) => (
                    <tr key={guest.id}>
                      <td>
                        <strong>
                          {guest.firstName} {guest.lastName}
                        </strong>
                        <small>{guest.guestType?.toLowerCase()}</small>
                      </td>
                      <td>{invitation?.displayName}</td>
                      <td>
                        <select
                          value={status}
                          aria-label={`Attendance for ${guest.firstName}`}
                          onChange={async (e) => {
                            await setAttendance(
                              guest.id,
                              e.target.value as 'YES' | 'NO' | 'PENDING',
                              rsvp,
                            );
                            await refresh();
                          }}
                        >
                          <option value="PENDING">Awaiting</option>
                          <option value="YES">Attending</option>
                          <option value="NO">Declined</option>
                        </select>
                      </td>
                      <td>{rsvp?.dietaryRequirements || rsvp?.allergies || '—'}</td>
                      <td className="guest-notes">
                        {rsvp?.plusOneName && <small>Plus one: {rsvp.plusOneName}</small>}
                        {rsvp?.songRequest && <small>Song: {rsvp.songRequest}</small>}
                        {invitation?.responseMessage && (
                          <small>Message: {invitation.responseMessage}</small>
                        )}
                        {!rsvp?.plusOneName &&
                          !rsvp?.songRequest &&
                          !invitation?.responseMessage &&
                          '—'}
                      </td>
                      <td>
                        {rsvp && (
                          <button className="table-link" onClick={() => void editResponse(rsvp)}>
                            Edit RSVP
                          </button>
                        )}
                        <button
                          className="danger-link"
                          onClick={async () => {
                            if (window.confirm(`Remove ${guest.firstName}?`)) {
                              await removeGuest(guest.id, rsvp?.id);
                              await refresh();
                            }
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <aside className="admin-sidebar">
          <form className="admin-panel compact-form" onSubmit={onCreateInvitation}>
            <p className="eyebrow">New household</p>
            <h2>Create invitation</h2>
            <label>
              Display name
              <input name="displayName" placeholder="The Bennet family" required />
            </label>
            <label>
              RSVP deadline
              <input name="deadline" type="date" defaultValue="2027-04-10" required />
            </label>
            <button className="button dark">Create invitation</button>
          </form>
          <form className="admin-panel compact-form" onSubmit={onAddGuest}>
            <p className="eyebrow">Guest details</p>
            <h2>Add a guest</h2>
            <label>
              Invitation
              <select
                name="invitationId"
                required
                value={selectedInvitation}
                onChange={(e) => setSelectedInvitation(e.target.value)}
              >
                <option value="">Choose…</option>
                {data.invitations.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.displayName}
                  </option>
                ))}
              </select>
            </label>
            <div className="field-pair">
              <label>
                First name
                <input name="firstName" required />
              </label>
              <label>
                Last name
                <input name="lastName" required />
              </label>
            </div>
            <label>
              Guest type
              <select name="guestType">
                <option value="ADULT">Adult</option>
                <option value="CHILD">Child</option>
              </select>
            </label>
            <label className="check-label">
              <input type="checkbox" name="plusOneAllowed" /> Plus-one allowed
            </label>
            <button className="button dark">Add guest</button>
          </form>
          <section className="admin-panel invitation-list">
            <p className="eyebrow">Households</p>
            <h2>Invitation links</h2>
            {data.invitations.map((item) => (
              <article key={item.id}>
                <div>
                  <strong>{item.displayName}</strong>
                  <small>
                    {data.guests.filter((guest) => guest.invitationId === item.id).length} guests
                  </small>
                </div>
                <div>
                  <button onClick={() => void makeLink(item.id)}>Generate & copy link</button>
                  <button onClick={() => void editHousehold(item)}>Edit details</button>
                  <button
                    onClick={async () => {
                      await toggleReopened(item);
                      await refresh();
                    }}
                  >
                    {item.reopened ? 'Close changes' : 'Reopen RSVP'}
                  </button>
                </div>
              </article>
            ))}
            {generatedLink && (
              <div className="generated-link" role="status">
                <strong>Copied. Save this link now:</strong>
                <input
                  readOnly
                  value={generatedLink}
                  onFocus={(event) => event.currentTarget.select()}
                />
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

export function AdminPage() {
  return (
    <div className="admin-page">
      <Authenticator hideSignUp>
        {({ signOut }) => <AdminDashboard signOut={signOut} />}
      </Authenticator>
      <p className="admin-help">
        Only users in the Cognito <code>ADMINS</code> group can access wedding data. Contact{' '}
        {wedding.contactEmail} if you need access.
      </p>
    </div>
  );
}
