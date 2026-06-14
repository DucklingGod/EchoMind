import type { VercelRequest } from '@vercel/node';

// Minimal Clerk JWT verification without external SDK
// Decodes the JWT and extracts userId from the 'sub' claim
// For production, use @clerk/backend's verifyToken() with proper signature verification

function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return Buffer.from(padded, 'base64').toString('utf-8');
}

export function extractClerkJwtUser(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    // Clerk JWT has 'sub' claim = user ID
    if (payload.sub && typeof payload.sub === 'string') {
      return payload.sub;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getUserIdFromRequest(req: VercelRequest): Promise<string> {
  // Try to get userId from Authorization header (Clerk JWT)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const userId = extractClerkJwtUser(token);
    if (userId) return userId;
  }

  // Try custom header from frontend
  const userIdHeader = req.headers['x-user-id'] as string;
  if (userIdHeader && userIdHeader.startsWith('user_')) {
    return userIdHeader;
  }

  // Fallback to default-user (for backward compatibility)
  return 'default-user';
}
