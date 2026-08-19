import { FormEvent, useEffect, useState } from 'react';
import { PageIntro } from '../components/PageIntro';
import { lookupInvitation, submitRsvp } from '../services/rsvp';
import type { GuestRsvp, InvitationView, RsvpSubmission } from '../types/rsvp';

const CODE_KEY = 'wedding-invite-code';

export function RsvpPage() {
  const [code, setCode] = useState('');
  const [invitation, setInvitation] = useState<InvitationView | null>(null);
  const [guests, setGuests] = useState<GuestRsvp[]>([]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'success'>('idle');
  const [error, setError] = useState('');

  async function loadInvite(value: string) {
    setError('');
    setStatus('loading');
    try {
      const result = await lookupInvitation(value);
      setInvitation(result);
      setGuests(result.guests);
      setMessage(result.message ?? '');
      sessionStorage.setItem(CODE_KEY, value);
      window.history.replaceState({}, '', '/rsvp');
      setStatus('idle');
    } catch (reason) {
      setStatus('idle');
      setError(reason instanceof Error ? reason.message : 'Unable to load the invitation.');
    }
  }

  useEffect(() => {
    const queryCode = new URLSearchParams(window.location.search).get('code');
    const savedCode = sessionStorage.getItem(CODE_KEY);
    const initial = queryCode ?? savedCode;
    if (initial) {
      setCode(initial);
      void loadInvite(initial);
    }
  }, []);

  function updateGuest(id: string, updates: Partial<GuestRsvp>) {
    setGuests((current) =>
      current.map((guest) => (guest.guestId === id ? { ...guest, ...updates } : guest)),
    );
  }

  async function onLookup(event: FormEvent) {
    event.preventDefault();
    await loadInvite(code);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setStatus('saving');
    try {
      const response: RsvpSubmission = {
        message,
        guests: guests.map(
          ({ guestId, attending, dietaryRequirements, allergies, plusOneName, songRequest }) => ({
            guestId,
            attending,
            dietaryRequirements,
            allergies,
            plusOneName,
            songRequest,
          }),
        ),
      };
      await submitRsvp(code, response);
      setStatus('success');
    } catch (reason) {
      setStatus('idle');
      setError(reason instanceof Error ? reason.message : 'Unable to save your reply.');
    }
  }

  if (status === 'success')
    return (
      <div className="page section narrow">
        <div className="success-card">
          <span aria-hidden="true">✓</span>
          <p className="eyebrow">Reply received</p>
          <h1>Thank you</h1>
          <p>
            Your RSVP has been saved. You can return using your invitation link and make changes
            until the deadline.
          </p>
          <button className="text-link" onClick={() => setStatus('idle')}>
            Review your reply
          </button>
        </div>
      </div>
    );

  return (
    <div className="page section narrow rsvp-page">
      <PageIntro eyebrow="Your invitation" title="Will you join us?">
        <p>Enter the private code from your invitation. Each person can reply individually.</p>
      </PageIntro>
      {!invitation ? (
        <form className="lookup-card" onSubmit={onLookup}>
          <label htmlFor="invite-code">Invitation code</label>
          <div className="inline-field">
            <input
              id="invite-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              autoComplete="off"
              required
              placeholder="Paste your personal code"
            />
            <button className="button dark" disabled={status === 'loading'}>
              {status === 'loading' ? 'Finding…' : 'Find invitation'}
            </button>
          </div>
          <p className="privacy-note">
            Your code is checked securely and is removed from the address bar after loading.
          </p>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </form>
      ) : (
        <form className="rsvp-form" onSubmit={onSubmit}>
          <div className="invitation-heading">
            <p className="eyebrow">Invitation for</p>
            <h2>{invitation.displayName}</h2>
            <p>
              Reply by{' '}
              {new Date(invitation.deadline).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          {guests.map((guest) => (
            <fieldset className="guest-form" key={guest.guestId} disabled={!invitation.isOpen}>
              <legend>
                {guest.firstName} {guest.lastName}
              </legend>
              <div className="attendance-options">
                <label className={guest.attending === 'YES' ? 'selected' : ''}>
                  <input
                    type="radio"
                    name={`attendance-${guest.guestId}`}
                    value="YES"
                    checked={guest.attending === 'YES'}
                    onChange={() => updateGuest(guest.guestId, { attending: 'YES' })}
                    required
                  />
                  <span>Joyfully accepts</span>
                </label>
                <label className={guest.attending === 'NO' ? 'selected' : ''}>
                  <input
                    type="radio"
                    name={`attendance-${guest.guestId}`}
                    value="NO"
                    checked={guest.attending === 'NO'}
                    onChange={() => updateGuest(guest.guestId, { attending: 'NO' })}
                    required
                  />
                  <span>Sadly declines</span>
                </label>
              </div>
              {guest.attending === 'YES' && (
                <div className="field-grid">
                  <label>
                    Dietary requirements
                    <input
                      value={guest.dietaryRequirements}
                      onChange={(e) =>
                        updateGuest(guest.guestId, { dietaryRequirements: e.target.value })
                      }
                      maxLength={500}
                    />
                  </label>
                  <label>
                    Allergies
                    <input
                      value={guest.allergies}
                      onChange={(e) => updateGuest(guest.guestId, { allergies: e.target.value })}
                      maxLength={500}
                    />
                  </label>
                  {guest.plusOneAllowed && (
                    <label>
                      Plus-one name
                      <input
                        value={guest.plusOneName}
                        onChange={(e) =>
                          updateGuest(guest.guestId, { plusOneName: e.target.value })
                        }
                        maxLength={120}
                      />
                    </label>
                  )}
                  <label>
                    Song request
                    <input
                      value={guest.songRequest}
                      onChange={(e) => updateGuest(guest.guestId, { songRequest: e.target.value })}
                      maxLength={180}
                    />
                  </label>
                </div>
              )}
            </fieldset>
          ))}
          <label className="message-field">
            A note for us
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              maxLength={1000}
            />
          </label>
          {!invitation.isOpen && (
            <p className="deadline-note">
              The RSVP deadline has passed. Your saved reply is shown above; please contact us to
              request a change.
            </p>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {invitation.isOpen && (
            <button className="button dark wide" disabled={status === 'saving'}>
              {status === 'saving' ? 'Saving…' : 'Send our reply'}
            </button>
          )}
        </form>
      )}
    </div>
  );
}
