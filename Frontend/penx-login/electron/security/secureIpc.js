import { app } from 'electron';
import { isTrustedPage } from './rendererPolicy.js';
import { ipcMain, net } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';
import { getUSBDevices } from '../services/usbService.js';
import { absolute, root, child, leaf, inside, noLinks, safeTree } from './pathPolicy.js';
import { verifyOwner, maskEmail } from './accessPolicy.js';
const win = path.win32;
const API = 'http://127.0.0.1:8000'; // Matches src/services/api.js; never supplied by renderer.
let trustedContents;
const sessions = new Map();
export function trustWindow(contents) {
  trustedContents = contents;
  contents.on('did-start-navigation', (_event, _url, _inPlace, mainFrame) => {
    if (mainFrame) sessions.delete(contents.id);
  });
  contents.once('destroyed', () => sessions.delete(contents.id));
}
function trusted(event) {
  if (!trustedContents || event.sender !== trustedContents || event.senderFrame !== event.sender.mainFrame ||
      !isTrustedPage(event.senderFrame.url, app.isPackaged)) throw new Error('Untrusted application window.');
}
function session(event, token) {
  trusted(event);
  let state = sessions.get(event.sender.id);
  if (!state || state.token !== token) {
    state = {token, files: new Set(), folders: new Set()};
    sessions.set(event.sender.id, state);
  }
  return state;
}
ipcMain.on('penx-session-changed', (event, token) => {
  try { session(event, typeof token === 'string' ? token : null); } catch { /* reject foreign senders */ }
});
async function request(endpoint, token, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await net.fetch(API + endpoint, {
      method: body ? 'POST' : 'GET', signal: controller.signal, redirect: 'error',
      headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
      ...(body ? {body: JSON.stringify(body)} : {}),
    });
    if (!response.ok) throw new Error(response.status === 401 ? 'Session expired. Please sign in again.' : 'Ownership verification failed.');
    return await response.json();
  } catch (error) {
    if (controller.signal.aborted) throw new Error('Ownership verification timed out. Access blocked.');
    throw error;
  } finally { clearTimeout(timer); }
}
function identity(user) {
  return {owner_id: user.id, owner_name: user.full_name, owner_email: user.email};
}
// All IPC registrations must use this helper. Unknown channels are denied.
export function secureHandle(channel, handler) {
  ipcMain.handle(channel, async (event, envelope, ...args) => {
    trusted(event);
    if (!envelope || envelope.penx !== 2) throw new Error('Restart PenX to load the updated preload.');
    const token = typeof envelope.token === 'string' ? envelope.token : null;
    const state = session(event, token);
    const active = () => {
      if (event.sender.isDestroyed() || sessions.get(event.sender.id) !== state) throw new Error('Account changed. Retry after signing in.');
    };
    if (channel === 'google-login') return handler(event, ...args);
    if (!token || token === 'undefined' || token === 'null') throw new Error('Please sign in again.');
    const user = await request('/auth/me', token);
    if (user?.id === undefined || user?.id === null) throw new Error('Invalid account response.');
    active();
    const devices = await getUSBDevices();
    const owned = new Map();
    async function device(drive) {
      const base = root(drive);
      const candidates = devices.filter(d => root(d.DriveLetter) === base);
      if (candidates.length !== 1) throw new Error('USB disconnected or drive mapping is ambiguous.');
      const item = candidates[0];
      if (!owned.has(base)) {
        await verifyOwner(request, token, item.SerialNumber);
        owned.set(base, item.SerialNumber);
      }
      active();
      return base;
    }
    async function permitted(value, {local = false, missing = false, mutate = false, internal = false} = {}) {
      const target = absolute(value);
      const base = win.parse(target).root.toUpperCase();
      const usb = devices.some(d => root(d.DriveLetter) === base);
      if (usb) await device(base);
      else if (!local || !(state.files.has(target.toLowerCase()) || [...state.folders].some(f => inside(f, target)))) {
        throw new Error('Use the PenX file/folder picker for local paths.');
      }
      if (mutate && target.toLowerCase() === base.toLowerCase()) throw new Error('Drive-root modification is blocked.');
      const parts = target.slice(3).toLowerCase().split('\\');
      if (!internal && parts.includes('.penx') && !(parts[0] === '.penx' && parts[1] === 'vault' && (!mutate || parts.length > 2))) {
        throw new Error('Protected PenX identity, keys and metadata cannot be modified through file actions.');
      }
      await noLinks(target, missing);
      return target;
    }
    async function vault(drive) {
      const base = await device(drive);
      await safeTree(win.join(base, '.penx'));
      return base;
    }
    async function source(value) {
      const target = await permitted(value, {local: true});
      if (!(await fs.stat(target)).isFile()) throw new Error('Select a file.');
      return target;
    }
    async function destination(value) {
      const target = await permitted(value, {local: true});
      if (!(await fs.stat(target)).isDirectory()) throw new Error('Select an existing destination folder.');
      return target;
    }
    switch (channel) {
      case 'get-usb-devices':
        return devices.map(({PenX, ...d}) => ({...d, PenX: PenX ? {registered: true} : null}));
      case 'pick-file': case 'pick-folder': {
        const selected = await handler(event, ...args);
        active();
        if (!selected) return null;
        const value = absolute(selected);
        await noLinks(value);
        const base = win.parse(value).root.toUpperCase();
        if (devices.some(d => root(d.DriveLetter) === base)) await device(base);
        (channel === 'pick-file' ? state.files : state.folders).add(value.toLowerCase());
        return value;
      }
      case 'get-usb-files': {
        args[0] = await device(args[0]);
        await permitted(child(args[0], args[1] || ''));
        break;
      }
      case 'create-usb-identity': case 'initialize-vault':
        args[0] = await vault(args[0]); args[1] = identity(user); break;
      case 'read-usb-identity': case 'check-vault-password': case 'create-vault-password':
      case 'verify-vault-password': case 'list-vault-files':
        args[0] = await vault(args[0]); break;
      case 'delete-vault-file': case 'rename-vault-file':
        args[0] = await vault(args[0]);
        if (typeof args[1] !== 'string' || !args[1]) throw new Error('Invalid vault file ID.');
        if (channel === 'rename-vault-file') leaf(args[2]);
        break;
      case 'import-vault-file':
        args[0] = await source(args[0]); args[1] = await vault(args[1]); args[3] = identity(user); break;
      case 'export-vault-file': {
        // The actual service uses (encryptedPath/object, destination, password).
        const value = args[0];
        const encrypted = typeof value === 'string' ? value :
          win.join(root(value?.driveLetter), '.penx', 'vault', leaf(value?.encrypted_name));
        args[0] = await permitted(encrypted, {internal: true});
        await vault(win.parse(args[0]).root);
        args[1] = await destination(args[1]);
        break;
      }
      case 'copy-usb-file': case 'move-usb-file':
        args[0] = channel === 'copy-usb-file' ? await source(args[0]) : await permitted(args[0], {mutate:true});
        if (channel === 'move-usb-file' && (await fs.stat(args[0])).isDirectory()) await safeTree(args[0]);
        args[1] = await destination(args[1]);
        await permitted(win.join(args[1], leaf(win.basename(args[0]))), {local:true, missing:true, mutate:true});
        if (channel === 'move-usb-file') await permitted(args[0], {mutate:true});
        break;
      case 'delete-usb-file':
        args[0] = await permitted(args[0], {mutate:true});
        if ((await fs.stat(args[0])).isDirectory()) await safeTree(args[0]);
        break;
      case 'rename-usb-file':
        args[0] = await permitted(args[0], {mutate:true}); leaf(args[1]);
        await permitted(win.join(win.dirname(args[0]), args[1]), {missing:true, mutate:true}); break;
      case 'create-usb-folder':
        args[0] = await device(args[0]); leaf(args[2]);
        await permitted(child(args[0], win.join(args[1] || '', args[2])), {missing:true, mutate:true}); break;
      case 'encrypt-file':
        args[0] = await source(args[0]);
        await noLinks(win.join(win.dirname(args[0]), win.parse(args[0]).name + '.penx'), true); break;
      case 'decrypt-file':
        args[0] = await permitted(args[0], {internal:true});
        await vault(win.parse(args[0]).root);
        args[2] = await destination(args[2]); break;
      case 'export-pdf-report': break; // Destination comes from native save dialog.
      case 'execute-remote-wipe':
        args[0] = await vault(args[0]); break;
      default: throw new Error('Unrecognized IPC operation. Access blocked.');
    }
    // Refresh physical mappings after slow network/path checks, before filesystem work.
    if (owned.size) {
      const current = await getUSBDevices();
      for (const [base, serial] of owned) {
        const matching = current.filter(d => root(d.DriveLetter) === base);
        if (matching.length !== 1 || matching[0].SerialNumber !== serial) throw new Error('USB changed. Retry the operation.');
      }
    }
    active();
    const result = await handler(event, ...args);
    active();
    if (channel === 'get-usb-files' && Array.isArray(result)) return result.filter(f => f.name?.toLowerCase() !== '.penx');
    if (channel === 'read-usb-identity' || channel === 'create-usb-identity') {
      return result ? {...result, owner_email: maskEmail(result.owner_email)} : result;
    }
    return result;
  });
}
