/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { LhsPanelStateService } from 'app/editor/lhs-panel/lhs-panel.service';
import { ActiveDevice, Device, DeviceService } from 'app/shared/client-state/device.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { EMPTY, Observable } from 'rxjs';
import { DevicesBreakPointInfo } from './devices-api/devices.types';

export const DEVICES_BREAKPOINT_STORAGE_KEY = 'pages-devices-selected-breakpoints';

export const DEFAULT_DEVICE = {
  id: 'desktop',
  name: 'Desktop',
  width: 0,
  isDefault: true,
};

export const DEFAULT_BREAKPOINTS_DATA: DevicesBreakPointInfo = {
  default: 'desktop',
  devices: [
    {
      id: 'mobile',
      name: 'Mobile',
      width: '370',
      stackBreakpoint: 'sm',
      icon: 'mdi-cellphone',
      type: 'fixed',
    },
    {
      id: 'tablet',
      name: 'Tablet Portrait',
      width: '768',
      stackBreakpoint: 'md',
      icon: 'mdi-tablet mdi-rotate-90',
      type: 'fixed',
    },
    {
      id: 'desktop',
      name: 'Desktop',
      width: '0',
      stackBreakpoint: 'xs',
      icon: 'mdi-monitor',
      type: 'fixed',
    },
  ],
};

@Component({
  selector: 'app-device-selector',
  templateUrl: 'device-selector.component.html',
  styleUrls: ['device-selector.component.scss'],
  host: {
    '[class.disabled]': 'isLhsPanelExpanded',
  },
})
export class DeviceSelectorComponent implements OnInit, OnDestroy {
  devices: Device[] = DEFAULT_BREAKPOINTS_DATA.devices;
  default: string = DEFAULT_BREAKPOINTS_DATA.default;

  activeDevice$: Observable<ActiveDevice> = EMPTY;
  editorWidth$: Observable<number> = EMPTY;

  imageLoadError = false;

  isLhsPanelExpanded = false;
  private lifetime = new Lifetime();

  constructor(
    private readonly deviceService: DeviceService,
    private readonly lhsPanelStateService: LhsPanelStateService,
  ) {}

  ngOnDestroy() {
    this.lifetime.dispose();
  }

  async ngOnInit() {
    this.lhsPanelStateService.isExpanded$.pipe(takeWhileAlive(this.lifetime)).subscribe((val) => {
      this.isLhsPanelExpanded = val;
    });
    this.activeDevice$ = this.deviceService.active$;
    this.editorWidth$ = this.deviceService.editorWidth$;

    const selectedDeviceBreakPoints = localStorage.getItem(DEVICES_BREAKPOINT_STORAGE_KEY)?.split(',');

    const devicesInfo = await this.deviceService.getDevicesInfo();

    if (devicesInfo?.devices) {
      this.devices = devicesInfo.devices
        .filter((d) => d.type !== 'disabled')
        .map((device) => ({
          ...device,
          isAddedToTopBar: selectedDeviceBreakPoints?.includes(device.id) ?? false,
        }));
      this.devices.sort((a, b) => {
        if (a.type === b.type) {
          if (a.width === b.width) {
            return 0;
          }
          return parseInt(a.width, 10) - parseInt(b.width, 10);
        }
        if (a.type === 'fixed') {
          return -1;
        }
        if (b.type === 'fixed') {
          return 1;
        }
        return parseInt(a.width, 10) - parseInt(b.width, 10);
      });
    }

    if (devicesInfo?.default) {
      const defaultDevice = this.devices?.find((device) => device.id === devicesInfo.default);
      this.default = devicesInfo.default;

      if (defaultDevice) {
        this.setDevice(defaultDevice);
      }
    }
  }

  setDevice(device: Device) {
    this.deviceService.setActiveDevice(device, device.id === this.default);
  }

  devicesAddedToTopbar(devices: Device[]) {
    return devices.filter((device) => device.isAddedToTopBar || device.type === 'fixed');
  }

  saveDeviceSelection() {
    const selectedDeviceBreakPoints = this.devices?.filter((item) => item.isAddedToTopBar).map((item) => item.id);
    localStorage.setItem(DEVICES_BREAKPOINT_STORAGE_KEY, selectedDeviceBreakPoints?.join(',') ?? '');
  }
}
