/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DevicesApiService } from 'app/pages/top-bar/device-controls/devices-api/devices-api.service';
import {
  DevicesBreakPointInfo,
  DevicesBreakPointResponse,
} from 'app/pages/top-bar/device-controls/devices-api/devices.types';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { TimedNotificationsService } from '../notifications/timed-notifications.service';
import { Device, DeviceService } from './device.service';

describe(DeviceService.name, () => {
  let sut: DeviceService;
  let devicesApiService: jasmine.SpyObj<DevicesApiService>;
  let timedNotificationService: jasmine.SpyObj<TimedNotificationsService>;

  beforeEach(waitForAsync(() => {
    devicesApiService = jasmine.createSpyObj<DevicesApiService>('DevicesApiService', ['getDevicesBreakpointInfo']);

    TestBed.configureTestingModule({
      imports: [TranslateModule, TranslateServiceStubModule],
      providers: [
        { provide: DevicesApiService, useValue: devicesApiService },
        { provide: TimedNotificationsService, useValue: jasmine.createSpyObj<TimedNotificationsService>(['push']) },
        {
          provide: TranslateService,
          useValue: jasmine.createSpyObj<TranslateService>({
            get: of('translation'),
          }),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    timedNotificationService = TestBedInjectSpy(TimedNotificationsService);
    devicesApiService = TestBedInjectSpy(DevicesApiService);

    sut = TestBed.inject(DeviceService);
  });

  describe('active', () => {
    it('should be "desktop" by default', () => {
      expect(sut.active).toEqual({
        id: 'desktop',
        name: 'Desktop',
        width: 0,
        isDefault: true,
      });
    });
  });

  describe('active$', () => {
    it('should emit "desktop"', () => {
      const spy = jasmine.createSpy();
      sut.active$.subscribe(spy);
      expect(spy).toHaveBeenCalledWith({
        id: 'desktop',
        name: 'Desktop',
        width: 0,
        isDefault: true,
      });
    });
  });

  describe('setActiveDevice()', () => {
    it('should change the device', () => {
      const newValue: Device = {
        id: 'bc624769-5132-4084-a298-24fc5ce86f56',
        name: 'Phone',
        width: '600',
        stackBreakpoint: 'sm',
        icon: 'ico',
        type: 'fixed',
        isAddedToTopBar: false,
      };

      const spy = jasmine.createSpy();
      sut.active$.subscribe(spy);

      sut.setActiveDevice(newValue, false);

      expect(spy.calls.mostRecent().args[0]).toEqual({
        id: 'bc624769-5132-4084-a298-24fc5ce86f56',
        name: 'Phone',
        width: 600,
        isDefault: false,
      });
      expect(sut.active).toEqual({
        id: 'bc624769-5132-4084-a298-24fc5ce86f56',
        name: 'Phone',
        width: 600,
        isDefault: false,
      });
    });
  });

  describe('editorWidth', () => {
    it('should be 0 by default', () => {
      expect(sut.editorWidth).toBe(0);
    });
  });

  describe('editorWidth$', () => {
    it('should emit the initial value of 0', () => {
      const spy = jasmine.createSpy();
      sut.editorWidth$.subscribe(spy);
      expect(spy).toHaveBeenCalledWith(0);
    });
  });

  describe('setEditorWidth()', () => {
    it('should change the editor width and emit the new value', () => {
      const spy = jasmine.createSpy();
      sut.editorWidth$.subscribe(spy);

      sut.setEditorWidth(800);

      expect(sut.editorWidth).toBe(800);
      expect(spy.calls.mostRecent().args[0]).toBe(800);
    });
  });

  describe('getDevicesInfo', () => {
    it('should return devices breakpoint info from api', fakeAsync(async () => {
      const devicesInfo: DevicesBreakPointInfo = {
        default: 'bc624769-5132-4084-a298-24fc5ce86f56',
        devices: [
          {
            id: 'bc624769-5132-4084-a298-24fc5ce86f56',
            name: 'Phone',
            icon: 'ico',
            type: 'fixed',
            width: '600',
            stackBreakpoint: 'sm',
          },
          {
            id: 'de624769-5132-4084-a298-24fc5ce86f56',
            name: 'Desktop',
            icon: 'ico',
            type: 'fixed',
            width: '800',
            stackBreakpoint: 'md',
          },
        ],
      };
      const devicesResponse: DevicesBreakPointResponse = {
        data: devicesInfo,
        ok: true,
      };

      devicesApiService.getDevicesBreakpointInfo.and.returnValue(
        Promise.resolve({
          apiIsBroken: false,
          requestIsInvalid: false,
          data: devicesResponse,
        }),
      );

      const result = await sut.getDevicesInfo();

      expect(result).toEqual(devicesInfo);
      flush();
    }));

    it('should show error notification if unable to load device breakpoint list from', fakeAsync(async () => {
      devicesApiService.getDevicesBreakpointInfo.and.returnValue(
        Promise.resolve({
          apiIsBroken: true,
          requestIsInvalid: true,
          data: null,
        }),
      );

      await sut.getDevicesInfo();

      // assert;
      expect(timedNotificationService.push).toHaveBeenCalledWith(
        'devices-breakpoint-api-error',
        'translation',
        'error',
      );
      flush();
    }));
  });
});
