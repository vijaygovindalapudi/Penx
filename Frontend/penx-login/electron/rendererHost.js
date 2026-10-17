import { app, net, protocol } from 'electron';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { assetSegments, isTrustedPage, DEV_URL, PACKAGED_URL } from './security/rendererPolicy.js';

protocol.registerSchemesAsPrivileged([{
  scheme: 'penx',
  privileges: {standard: true, secure: true, supportFetchAPI: true, corsEnabled: true},
}]);

export const isTrustedRendererURL = value => isTrustedPage(value, app.isPackaged);
export function registerRendererHost() {
  if (!app.isPackaged) return;
  const root = path.join(app.getAppPath(), 'dist');
  protocol.handle('penx', async request => {
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response(null, {status:405});
    try {
      const target = path.resolve(root, ...assetSegments(request.url));
      const relative = path.relative(root, target);
      if (relative.startsWith('..') || path.isAbsolute(relative)) return new Response(null, {status:403});
      return await net.fetch(pathToFileURL(target).href, {method:request.method});
    } catch { return new Response('Asset not found', {status:404}); }
  });
}
export function loadRenderer(window) {
  return window.loadURL(app.isPackaged ? PACKAGED_URL : DEV_URL);
}
