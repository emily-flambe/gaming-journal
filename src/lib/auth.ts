// JWT token utilities using Web Crypto API

interface TokenPayload {
  userId: string;
  exp: number;
}

const TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function createToken(userId: string, secret: string): Promise<string> {
  const payload: TokenPayload = {
    userId,
    exp: Date.now() + TOKEN_EXPIRY,
  };

  const encoder = new TextEncoder();
  const payloadStr = JSON.stringify(payload);
  const payloadBase64 = btoa(payloadStr);

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadBase64));
  const signatureBase64 = arrayBufferToBase64(signature);

  return `${payloadBase64}.${signatureBase64}`;
}

export async function verifyToken(token: string, secret: string): Promise<{ userId: string } | null> {
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadBase64, signatureBase64] = parts;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signature = base64ToArrayBuffer(signatureBase64);
    const isValid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(payloadBase64));

    if (!isValid) return null;

    const payload: TokenPayload = JSON.parse(atob(payloadBase64));

    if (payload.exp < Date.now()) return null;

    return { userId: payload.userId };
  } catch {
    return null;
  }
}

// Generate a random ID
export function generateId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate a random state token for OAuth CSRF protection
export function generateStateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Cookie helpers
export function createSessionCookie(token: string, isSecure: boolean = true): string {
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  const parts = [`session=${token}`, 'HttpOnly', 'SameSite=Lax', 'Path=/', `Max-Age=${maxAge}`];
  if (isSecure) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

export function clearSessionCookie(isSecure: boolean = true): string {
  const parts = ['session=', 'HttpOnly', 'SameSite=Lax', 'Path=/', 'Max-Age=0'];
  if (isSecure) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

export function getSessionFromCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith('session='));
  if (!sessionCookie) return null;
  // Use substring to handle tokens with '=' characters (Base64 padding)
  return sessionCookie.substring('session='.length) || null;
}

// Admin session cookie helpers (for impersonation)
export function createAdminSessionCookie(token: string, isSecure: boolean = true): string {
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  const parts = [`admin_session=${token}`, 'HttpOnly', 'SameSite=Lax', 'Path=/', `Max-Age=${maxAge}`];
  if (isSecure) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

export function clearAdminSessionCookie(isSecure: boolean = true): string {
  const parts = ['admin_session=', 'HttpOnly', 'SameSite=Lax', 'Path=/', 'Max-Age=0'];
  if (isSecure) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

export function getAdminSessionFromCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const adminCookie = cookies.find(c => c.startsWith('admin_session='));
  if (!adminCookie) return null;
  return adminCookie.substring('admin_session='.length) || null;
}
