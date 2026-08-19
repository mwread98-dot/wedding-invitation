import { createHmac, randomBytes } from 'node:crypto';

export function generateInviteCode() {
  return randomBytes(32).toString('base64url');
}

export function hashInviteCode(code: string, pepper: string) {
  if (!pepper) throw new Error('Invitation code secret is not configured.');
  return createHmac('sha256', pepper).update(code, 'utf8').digest('hex');
}

export function looksLikeInviteCode(code: string) {
  return /^[A-Za-z0-9_-]{32,128}$/.test(code);
}
