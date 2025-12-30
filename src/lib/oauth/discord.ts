// Discord OAuth Service

export interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface DiscordUserInfo {
  id: string;
  username: string;
  discriminator: string;
  global_name: string | null;
  avatar: string | null;
  email: string;
  verified: boolean;
}

export interface DiscordOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

const DISCORD_AUTH_URL = 'https://discord.com/api/oauth2/authorize';
const DISCORD_TOKEN_URL = 'https://discord.com/api/oauth2/token';
const DISCORD_USERINFO_URL = 'https://discord.com/api/users/@me';

export function getDiscordAuthUrl(config: DiscordOAuthConfig, state: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'identify email',
    state,
  });

  return `${DISCORD_AUTH_URL}?${params.toString()}`;
}

export async function exchangeDiscordCode(
  code: string,
  config: DiscordOAuthConfig
): Promise<DiscordTokenResponse> {
  const response = await fetch(DISCORD_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Discord token exchange failed: ${error}`);
  }

  return response.json();
}

export async function getDiscordUserInfo(accessToken: string): Promise<DiscordUserInfo> {
  const response = await fetch(DISCORD_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Discord user info fetch failed: ${error}`);
  }

  return response.json();
}

export function getDiscordAvatarUrl(userId: string, avatarHash: string | null): string | null {
  if (!avatarHash) return null;
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png`;
}
