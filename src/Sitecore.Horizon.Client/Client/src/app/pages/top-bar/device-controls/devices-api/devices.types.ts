/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export type DeviceType = 'disabled' | 'optional' | 'fixed';

export interface DeviceBreakPoint {
  id: string;
  name: string;
  width: string;
  stackBreakpoint: string;
  icon: string;
  type: DeviceType;
}

export interface DevicesBreakPointInfo {
  default: string;
  devices: DeviceBreakPoint[];
}

export interface DevicesBreakPointResponse {
  data: DevicesBreakPointInfo;
  ok: boolean;
}
