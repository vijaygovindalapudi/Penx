export const DEV_URL = 'http://localhost:5173';
export const PACKAGED_URL = 'penx://app/index.html';

export function isTrustedPage(value, packaged) {
  try {
    const url = new URL(value);
    if (url.username || url.password) return false;
    if (packaged) {
      return url.protocol === 'penx:' && url.hostname === 'app' &&
        !url.port && url.pathname === '/index.html' && !url.search;
    }
    return url.origin === DEV_URL;
  } catch { return false; }
}

export function assetSegments(value) {
  const url = new URL(value);
  if (url.protocol !== 'penx:' || url.hostname !== 'app' || url.port || url.username || url.password) throw new Error('Invalid asset origin');
  const decoded = decodeURIComponent(url.pathname);
  const parts = decoded.split('/').filter(Boolean);
  if (!parts.length) return ['index.html'];
  if (parts.some(part => part === '.' || part === '..' || /[\\:\x00-\x1f]/.test(part) || /[. ]$/.test(part))) throw new Error('Invalid asset path');
  return parts;
}
