import path from 'node:path';
import fs from 'node:fs/promises';
const win = path.win32;
export function leaf(value) {
  if (typeof value !== 'string' || !value || value === '.' || value === '..' ||
      /[<>:"/\\|?*\x00-\x1f]/.test(value) || /[. ]$/.test(value) ||
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i.test(value)) {
    throw new Error('Invalid file or folder name.');
  }
  return value;
}
export function absolute(value) {
  if (typeof value !== 'string' || !/^[a-z]:[\\/]/i.test(value) ||
      /[:\x00-\x1f]/.test(value.slice(2))) throw new Error('An absolute local drive path is required.');
  // Reject ambiguous Windows names and traversal before normalization.
  for (const part of value.slice(3).split(/[\\/]/).filter(Boolean)) leaf(part);
  return win.normalize(value);
}
export function root(value) {
  if (typeof value !== 'string' || !/^[a-z]:[\\/]?$/i.test(value)) throw new Error('Invalid USB drive.');
  return value.slice(0, 2).toUpperCase() + '\\';
}
export function inside(base, target) {
  const relative = win.relative(base, target);
  return relative === '' || (!relative.startsWith('..\\') && relative !== '..' && !win.isAbsolute(relative));
}
export function child(drive, relative = '') {
  const base = root(drive);
  if (typeof relative !== 'string' || win.isAbsolute(relative) || relative.includes(':')) throw new Error('Invalid relative path.');
  const candidate = absolute(base + relative);
  if (!inside(base, candidate)) throw new Error('Path is outside this USB.');
  return candidate;
}
export async function noLinks(value, missing = false) {
  const target = absolute(value);
  let current = win.parse(target).root;
  for (const component of target.slice(current.length).split('\\').filter(Boolean)) {
    current = win.join(current, component);
    try {
      const stat = await fs.lstat(current);
      if (stat.isSymbolicLink()) throw new Error('Symbolic links and junctions are not allowed.');
      const actual = await fs.realpath(current);
      if (win.normalize(actual).toLowerCase() !== current.toLowerCase()) throw new Error('Redirected paths are not allowed.');
    } catch (error) {
      if (missing && error.code === 'ENOENT') return target;
      throw error;
    }
  }
  return target;
}
export async function safeTree(directory) {
  await noLinks(directory, true);
  let entries;
  try { entries = await fs.readdir(directory, {withFileTypes: true}); }
  catch (error) { if (error.code === 'ENOENT') return; throw error; }
  for (const entry of entries) {
    leaf(entry.name);
    const item = win.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error('Links inside the vault are not allowed.');
    if (entry.isDirectory()) await safeTree(item);
  }
}
