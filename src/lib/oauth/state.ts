import { SignJWT, jwtVerify } from 'jose';

export interface OAuthState {
  provider: string;
  timestamp: number;
}

export class OAuthStateManager {
  private secret: Uint8Array;

  constructor(jwtSecret: string) {
    this.secret = new TextEncoder().encode(jwtSecret);
  }

  async createState(provider: string): Promise<string> {
    const payload = {
      provider,
      timestamp: Date.now(),
    };

    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('10m')
      .sign(this.secret);

    return jwt;
  }

  async verifyState(state: string, expectedProvider: string): Promise<OAuthState> {
    try {
      const { payload } = await jwtVerify(state, this.secret);
      const stateData = payload as unknown as OAuthState;

      if (stateData.provider !== expectedProvider) {
        throw new Error('Provider mismatch');
      }

      return stateData;
    } catch {
      throw new Error('Invalid or expired OAuth state');
    }
  }
}
