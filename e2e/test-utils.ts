import { test as base, expect } from '@playwright/test';

// Use the same secret as .dev.vars for local testing
const JWT_SECRET = process.env.JWT_SECRET || 'gaming-journal-dev-secret-key-32chars';
const TEST_USER_ID = 'test-user-e2e-12345';

// Token generation matching src/lib/auth.ts
async function createTestToken(userId: string): Promise<string> {
  const TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

  const payload = {
    userId,
    exp: Date.now() + TOKEN_EXPIRY,
  };

  const encoder = new TextEncoder();
  const payloadStr = JSON.stringify(payload);
  const payloadBase64 = btoa(payloadStr);

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadBase64));
  const signatureBase64 = arrayBufferToBase64(signature);

  return `${payloadBase64}.${signatureBase64}`;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Extended test fixture with authentication
export const test = base.extend<{ authContext: { userId: string; token: string } }>({
  authContext: async ({ context }, use) => {
    const token = await createTestToken(TEST_USER_ID);

    // Set the session cookie
    await context.addCookies([{
      name: 'session',
      value: token,
      domain: 'localhost',
      path: '/',
    }]);

    await use({ userId: TEST_USER_ID, token });
  },
});

export { expect, TEST_USER_ID };
