// Independent of Electron so denial behavior can be regression-tested.
export async function verifyOwner(request, token, serial) {
  if (typeof token !== 'string' || !token || token === 'undefined' || token === 'null') throw new Error('Please sign in again.');
  if (typeof serial !== 'string' || !serial.trim()) throw new Error('USB serial is unavailable. Access blocked.');
  const result = await request('/devices/check', token, {usb_serial: serial});
  if (result?.registered !== true || result?.owner !== true) throw new Error('This USB is not registered to your account.');
  return true;
}
export function maskEmail(value) {
  if (typeof value !== 'string' || !value.includes('@')) return 'Hidden account';
  const [name, domain] = value.split('@');
  if (!name || !domain) return 'Hidden account';
  if (name.includes('*')) return value;
  return (name.length > 10 ? name.slice(0,6) + '******' + name.slice(-4) :
    name.length > 4 ? name.slice(0,2) + '******' + name.slice(-1) : name.slice(0,1) + '******') + '@' + domain;
}
