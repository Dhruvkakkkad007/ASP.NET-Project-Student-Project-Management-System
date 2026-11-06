/**
 * Utilities for decoding and verifying JWT tokens without external libraries
 */

/**
 * Decode JWT token payload
 * @param {string} token
 * @returns {object|null}
 */
export function decodeJwt(token) {
  if (!token || typeof token !== 'string') return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Check if token is expired
 * @param {string} token
 * @returns {boolean}
 */
export function isTokenExpired(token) {
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return true;
  // exp is in seconds, Date.now() in ms
  return Date.now() >= payload.exp * 1000;
}

/**
 * Extract user information from token
 * @param {string} token
 * @returns {{ email: string, role: string, userId: number|null, exp: number } | null}
 */
export function getUserFromToken(token) {
  const payload = decodeJwt(token);
  if (!payload) return null;

  // ClaimTypes.Role in ASP.NET defaults to URI or "role"
  const role =
    payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
    payload['role'] ||
    payload['Role'] ||
    'Student';

  const email =
    payload['email'] ||
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
    payload['sub'] ||
    '';

  const userIdRaw = payload['userId'] ?? payload['UserId'];
  const parsedId = userIdRaw !== undefined && userIdRaw !== null && userIdRaw !== ''
    ? Number(userIdRaw)
    : NaN;
  const userId = Number.isFinite(parsedId) && parsedId > 0 ? parsedId : null;

  return {
    email,
    role,
    userId,
    fullName: payload['fullName'] || payload['name'] || '',
    profilePicturePath: payload['profilePicturePath'] || '',
    exp: payload.exp,
  };
}

