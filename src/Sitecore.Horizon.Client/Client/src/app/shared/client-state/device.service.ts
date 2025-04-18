/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DEFAULT_DEVICE } from 'app/pages/top-bar/device-controls/device-selector.component';
import { DevicesApiService } from 'app/pages/top-bar/device-controls/devices-api/devices-api.service';
import { DeviceBreakPoint, DevicesBreakPointInfo } from 'app/pages/top-bar/device-controls/devices-api/devices.types';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { TimedNotificationsService } from '../notifications/timed-notifications.service';

export interface Device extends DeviceBreakPoint {
  isAddedToTopBar?: boolean;
}

export interface ActiveDevice {
  id: string;
  name: string;
  width: number;
  isDefault: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  constructor(
    private readonly devicesApiService: DevicesApiService,
    private readonly timedNotificationService: TimedNotificationsService,
    private readonly translateService: TranslateService,
  ) {}

  private readonly _active$ = new BehaviorSubject<ActiveDevice>(DEFAULT_DEVICE);
  readonly active$: Observable<ActiveDevice> = this._active$.pipe(distinctUntilChanged());

  private readonly _editorWidth$ = new BehaviorSubject<number>(0);
  readonly editorWidth$: Observable<number> = this._editorWidth$.pipe(distinctUntilChanged());

  get active(): ActiveDevice {
    return this._active$.getValue();
  }

  setActiveDevice(activeDevice: Device, isDefault: boolean) {
    this._active$.next({
      id: activeDevice.id,
      name: activeDevice.name,
      width: parseInt(activeDevice.width, 10),
      isDefault,
    });
  }

  get editorWidth(): number {
    return this._editorWidth$.getValue();
  }

  setEditorWidth(width: number) {
    this._editorWidth$.next(width);
  }

  async getDevicesInfo(): Promise<DevicesBreakPointInfo | undefined> {
    const { apiIsBroken, requestIsInvalid, data } = await this.devicesApiService.getDevicesBreakpointInfo();
    if (apiIsBroken || requestIsInvalid || !data?.ok) {
      const errorText = await firstValueFrom(this.translateService.get('ERRORS.DEVICES_BREAKPOINT_API_ERROR_MESSAGE'));
      this.timedNotificationService.push('devices-breakpoint-api-error', errorText, 'error');
      return;
    }
    return data?.data;
  }
}
