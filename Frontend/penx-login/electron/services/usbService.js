import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readUSBDirectory } from '../usbFileSystem.js';
import { identityExists } from '../utils/penxIdentity.js';
const run = promisify(execFile);
export function getUSBFiles(driveLetter, subPath = '') {
  return readUSBDirectory(driveLetter, subPath);
}
export async function getUSBDevices() {
  // Traverse real CIM associations; never zip unrelated physical/logical arrays.
  // Keep PNPDeviceID as SerialNumber to match existing backend registrations.
  const script = `
$ErrorActionPreference = 'Stop'
$usbNumbers = @(Get-Disk | Where-Object { $_.BusType -eq 'USB' } | Select-Object -ExpandProperty Number)
$items = @(foreach ($disk in (Get-CimInstance Win32_DiskDrive | Where-Object { $_.InterfaceType -eq 'USB' -or $_.Index -in $usbNumbers })) {
  foreach ($partition in (Get-CimAssociatedInstance -InputObject $disk -Association Win32_DiskDriveToDiskPartition)) {
    foreach ($logical in (Get-CimAssociatedInstance -InputObject $partition -Association Win32_LogicalDiskToPartition)) {
      [PSCustomObject]@{ Model=$disk.Model; DriveLetter=$logical.DeviceID; Size=$logical.Size; SerialNumber=$disk.PNPDeviceID }
    }
  }
})
# An unmapped removable volume must never become an unrestricted local path.
$seen = @($items | ForEach-Object { $_.DriveLetter })
foreach ($volume in (Get-CimInstance Win32_LogicalDisk | Where-Object { $_.DriveType -eq 2 -and $_.DeviceID -notin $seen })) {
  $items += [PSCustomObject]@{ Model=$volume.VolumeName; DriveLetter=$volume.DeviceID; Size=$volume.Size; SerialNumber=$null }
}
ConvertTo-Json -InputObject $items -Compress
`;
  const {stdout} = await run('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', Buffer.from(script, 'utf16le').toString('base64')], {timeout:10000, windowsHide:true, maxBuffer:1024*1024});
  const parsed = JSON.parse(stdout.replace(/^\uFEFF/, '').trim() || '[]');
  const result = Array.isArray(parsed) ? parsed : [parsed];
  return Promise.all(result.filter(Boolean).map(async d => {
    const registered = await identityExists(d.DriveLetter + '\\');
    return {...d, Size:Number(d.Size) || 0, PenX: registered ? {registered:true} : null, Registered:registered};
  }));
}
