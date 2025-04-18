/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { A11yModule } from '@angular/cdk/a11y';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import {
  ButtonModule,
  CheckboxComponent,
  CheckboxModule,
  DroplistModule,
  IconButtonModule,
  ListItemComponent,
  ListModule,
  PopoverModule,
  TabsModule,
} from '@sitecore/ng-spd-lib';
import { ApolloModule } from 'apollo-angular';
import { LhsPanelStateService } from 'app/editor/lhs-panel/lhs-panel.service';
import { Device, DeviceService } from 'app/shared/client-state/device.service';
import { CmUrlModule } from 'app/shared/pipes/platform-url/cm-url.module';
import { getLocalStorageMock } from 'app/testing/local-storage-mock';
import { TESTING_URL, TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { DEVICES_BREAKPOINT_STORAGE_KEY, DeviceSelectorComponent } from './device-selector.component';
import { DevicesBreakPointInfo } from './devices-api/devices.types';

const mockIconUrl = TESTING_URL + 'ico.png';

describe(DeviceSelectorComponent.name, () => {
  let sut: DeviceSelectorComponent;
  let fixture: ComponentFixture<DeviceSelectorComponent>;
  let deviceServiceSpy: jasmine.SpyObj<DeviceService>;
  let lhsPanelStateService: LhsPanelStateService;

  const localStorage = window.localStorage;

  const devicesBreakPointInfo: DevicesBreakPointInfo = {
    default: 'cc624769-5132-4084-a298-24fc5ce86f96',
    devices: [
      {
        id: 'bc624769-5132-4084-a298-24fc5ce86f56',
        name: 'Phone',
        icon: mockIconUrl,
        type: 'fixed',
        width: '600',
        stackBreakpoint: 'sm',
      },
      {
        id: 'cc624769-5132-4084-a298-24fc5ce86f96',
        name: 'Desktop',
        icon: mockIconUrl,
        type: 'fixed',
        width: '800',
        stackBreakpoint: 'xs',
      },
      {
        id: 'dd624769-5132-4084-a298-24fc5ce86f96',
        name: 'Desktop Large',
        icon: mockIconUrl,
        type: 'disabled',
        width: '1000',
        stackBreakpoint: 'md',
      },
      {
        id: 'ee624769-5132-4084-a298-24fc5ce86f97',
        name: 'Large Desktop',
        icon: mockIconUrl,
        type: 'optional',
        width: '1300',
        stackBreakpoint: 'lg',
      },
      {
        id: 'ff624769-5132-4084-a298-24fc5ce86f99',
        name: 'Flexiable',
        icon: mockIconUrl,
        type: 'optional',
        width: '0',
        stackBreakpoint: 'xs',
      },
    ],
  };

  const initComponent = async () => {
    // Fire initial update cycle.
    fixture.detectChanges();
    // Is required, because GraphQL derives value with a delay.
    await Promise.resolve();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TabsModule,
        TranslateModule,
        TranslateServiceStubModule,
        ApolloModule,
        TranslateModule,
        ListModule,
        CheckboxModule,
        PopoverModule,
        IconButtonModule,
        CmUrlModule,
        BrowserAnimationsModule,
        ButtonModule,
        DroplistModule,
        A11yModule,
      ],
      providers: [
        {
          provide: DeviceService,
          useValue: jasmine.createSpyObj('DeviceService', ['getDevicesInfo', 'setActiveDevice']),
        },
        LhsPanelStateService,
      ],
      declarations: [DeviceSelectorComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    lhsPanelStateService = TestBed.inject(LhsPanelStateService);

    fixture = TestBed.createComponent(DeviceSelectorComponent);
    sut = fixture.componentInstance;
    deviceServiceSpy = TestBedInjectSpy(DeviceService);

    deviceServiceSpy.setActiveDevice.and.callFake(() => {});

    Object.defineProperty(window, 'localStorage', {
      value: getLocalStorageMock(),
    });
  });

  afterEach(async () => {
    window.localStorage.setItem(DEVICES_BREAKPOINT_STORAGE_KEY, '');
    Object.defineProperty(window, 'localStorage', {
      value: localStorage,
    });
  });

  describe('show icons', async () => {
    it('should set icons instead of device images, if there is images error', async () => {
      // Arrange
      deviceServiceSpy.getDevicesInfo.and.returnValue(Promise.resolve(devicesBreakPointInfo));

      // Act
      sut.imageLoadError = true;
      await initComponent();

      // Assert
      const devices = fixture.debugElement.queryAll(By.css('.device-icon'));
      expect(devices[0].nativeElement.classList).toContain('mdi');
    });
  });

  describe('show devices', async () => {
    it('should get all enabled devices from device service ', async () => {
      // Arrange
      const expectDevices: Device[] = [
        {
          id: 'bc624769-5132-4084-a298-24fc5ce86f56',
          name: 'Phone',
          icon: mockIconUrl,
          type: 'fixed',
          width: '600',
          stackBreakpoint: 'sm',
          isAddedToTopBar: false,
        },
        {
          id: 'cc624769-5132-4084-a298-24fc5ce86f96',
          name: 'Desktop',
          icon: mockIconUrl,
          type: 'fixed',
          stackBreakpoint: 'xs',
          width: '800',
          isAddedToTopBar: false,
        },
        {
          id: 'ff624769-5132-4084-a298-24fc5ce86f99',
          name: 'Flexiable',
          icon: mockIconUrl,
          type: 'optional',
          stackBreakpoint: 'xs',
          width: '0',
          isAddedToTopBar: false,
        },
        {
          id: 'ee624769-5132-4084-a298-24fc5ce86f97',
          name: 'Large Desktop',
          icon: mockIconUrl,
          type: 'optional',
          width: '1300',
          stackBreakpoint: 'lg',
          isAddedToTopBar: false,
        },
      ];
      deviceServiceSpy.getDevicesInfo.and.returnValue(Promise.resolve(devicesBreakPointInfo));

      // Act
      await initComponent();

      // Assert
      expect(sut.devices).toEqual(expectDevices);
      expect(sut.default).toEqual(devicesBreakPointInfo.default);
      expect(deviceServiceSpy.setActiveDevice).toHaveBeenCalledOnceWith(
        {
          id: 'cc624769-5132-4084-a298-24fc5ce86f96',
          name: 'Desktop',
          icon: mockIconUrl,
          type: 'fixed',
          width: '800',
          stackBreakpoint: 'xs',
          isAddedToTopBar: false,
        },
        true,
      );
    });

    it('should show all enabled devices in devices dropdown', async () => {
      // Arrange
      deviceServiceSpy.getDevicesInfo.and.returnValue(Promise.resolve(devicesBreakPointInfo));

      // Act
      await initComponent();

      const button = fixture.debugElement.query(By.css('[ngSpdDroplistToggle]')).nativeElement;
      button.click();
      fixture.detectChanges();

      // Assert
      const devices = fixture.debugElement.queryAll(By.css('.list-option'));

      expect(devices.length).toBe(4);
      expect(devices[0].nativeElement.textContent).toBe('Phone (600px)');
      expect(devices[1].nativeElement.textContent).toBe('Desktop (800px)');
      expect(devices[2].nativeElement.textContent).toBe('Flexiable');
      expect(devices[3].nativeElement.textContent).toBe('Large Desktop (1300px)');
    });

    it('should sort devices correctly', async () => {
      // Arrange
      const devicesInfo: DevicesBreakPointInfo = {
        default: '2',
        devices: [
          { id: '1', name: 'device 1', type: 'fixed', width: '768', icon: mockIconUrl, stackBreakpoint: 'md' },
          { id: '2', name: 'device 2', type: 'optional', width: '992', icon: mockIconUrl, stackBreakpoint: 'lg' },
          { id: '3', name: 'device 3', type: 'fixed', width: '576', icon: mockIconUrl, stackBreakpoint: 'sm' },
          { id: '4', name: 'device 4', type: 'optional', width: '1200', icon: mockIconUrl, stackBreakpoint: 'xl' },
        ],
      };

      deviceServiceSpy.getDevicesInfo.and.returnValue(Promise.resolve(devicesInfo));

      // Act
      await initComponent();

      // Assert
      expect(sut.devices.length).toBe(4);
      expect(sut.devices[0].id).toBe('3');
      expect(sut.devices[1].id).toBe('1');
      expect(sut.devices[2].id).toBe('2');
      expect(sut.devices[3].id).toBe('4');
    });

    it('should check devices if ids found in local storage', async () => {
      // Arrange
      deviceServiceSpy.getDevicesInfo.and.returnValue(Promise.resolve(devicesBreakPointInfo));
      window.localStorage.setItem(
        DEVICES_BREAKPOINT_STORAGE_KEY,
        'ee624769-5132-4084-a298-24fc5ce86f97,ff624769-5132-4084-a298-24fc5ce86f99',
      );

      // Act
      await initComponent();
      const showDevicesdropdownbutton = fixture.debugElement.query(By.css('[ngSpdDroplistToggle]')).nativeElement;
      showDevicesdropdownbutton.click();
      fixture.detectChanges();

      // Assert
      const deviceSelectionCheckBoxes = fixture.debugElement.queryAll(By.directive(CheckboxComponent));
      expect(deviceSelectionCheckBoxes[0].nativeElement.ariaChecked).toBe('true');
      expect(deviceSelectionCheckBoxes[1].nativeElement.ariaChecked).toBe('true');
    });

    it('should make device active if currently selected', async () => {
      // Arrange
      deviceServiceSpy.getDevicesInfo.and.returnValue(Promise.resolve(devicesBreakPointInfo));

      // Act
      await initComponent();
      sut.setDevice({
        id: 'bc624769-5132-4084-a298-24fc5ce86f56',
        name: 'Phone',
        icon: 'ico',
        type: 'fixed',
        stackBreakpoint: 'xs',
        width: '600',
        isAddedToTopBar: false,
      });

      // Assert
      expect(deviceServiceSpy.setActiveDevice.calls.mostRecent().args[0]).toEqual({
        id: 'bc624769-5132-4084-a298-24fc5ce86f56',
        name: 'Phone',
        icon: 'ico',
        type: 'fixed',
        stackBreakpoint: 'xs',
        width: '600',
        isAddedToTopBar: false,
      });
    });
  });

  describe('add to toolbar', async () => {
    it('should store device id to local storage', async () => {
      // Arrange
      const devicesInfo: DevicesBreakPointInfo = {
        default: 'cc624769-5132-4084-a298-24fc5ce86f96',
        devices: [
          {
            id: 'bc624769-5132-4084-a298-24fc5ce86f56',
            name: 'Phone',
            icon: mockIconUrl,
            type: 'fixed',
            width: '600',
            stackBreakpoint: 'sm',
          },
          {
            id: 'cc624769-5132-4084-a298-24fc5ce86f96',
            name: 'Desktop',
            icon: mockIconUrl,
            type: 'fixed',
            width: '800',
            stackBreakpoint: 'xs',
          },
        ],
      };
      deviceServiceSpy.getDevicesInfo.and.returnValue(Promise.resolve(devicesInfo));

      // Act
      await initComponent();
      sut.devices[1].isAddedToTopBar = true;
      sut.saveDeviceSelection();

      // Assert
      expect(window.localStorage.getItem(DEVICES_BREAKPOINT_STORAGE_KEY)).toContain(sut.devices[1].id);
    });

    it('should update device selection on checkbox change', async () => {
      // Arrange
      deviceServiceSpy.getDevicesInfo.and.returnValue(Promise.resolve(devicesBreakPointInfo));

      // Act
      await initComponent();

      const showDevicesdropdownbutton = fixture.debugElement.query(By.css('[ngSpdDroplistToggle]')).nativeElement;
      showDevicesdropdownbutton.click();
      fixture.detectChanges();

      const firstOptionalDeviceCheckbox = fixture.debugElement.queryAll(By.directive(CheckboxComponent))[0];
      firstOptionalDeviceCheckbox.triggerEventHandler('checkedChange', true);
      fixture.detectChanges();

      // Assert
      expect(window.localStorage.getItem(DEVICES_BREAKPOINT_STORAGE_KEY)).toContain(
        'ff624769-5132-4084-a298-24fc5ce86f99',
      );
    });

    it('should update device selection and set active device on click', async () => {
      // Arrange
      deviceServiceSpy.getDevicesInfo.and.returnValue(Promise.resolve(devicesBreakPointInfo));

      // Act
      await initComponent();

      const showDevicesdropdownbutton = fixture.debugElement.query(By.css('[ngSpdDroplistToggle]')).nativeElement;
      showDevicesdropdownbutton.click();
      fixture.detectChanges();

      const firstOptionalDevice = fixture.debugElement.queryAll(By.directive(ListItemComponent))[2].nativeElement;
      firstOptionalDevice.click();
      fixture.detectChanges();

      // Assert
      expect(window.localStorage.getItem(DEVICES_BREAKPOINT_STORAGE_KEY)).toContain(
        'ff624769-5132-4084-a298-24fc5ce86f99',
      );
      expect(deviceServiceSpy.setActiveDevice.calls.mostRecent().args[0]).toEqual({
        id: 'ff624769-5132-4084-a298-24fc5ce86f99',
        name: 'Flexiable',
        icon: mockIconUrl,
        type: 'optional',
        width: '0',
        stackBreakpoint: 'xs',
        isAddedToTopBar: true,
      });
    });
  });

  describe('expanded LHS panel', () => {
    afterEach(() => {
      lhsPanelStateService.setExpand(false);
    });

    it('should disable device switcher when LHS panel is expanded', () => {
      lhsPanelStateService.setExpand(true);
      fixture.detectChanges();

      const sutEl = fixture.debugElement.nativeElement;
      expect(sutEl.classList.contains('disabled')).toBeTrue();
    });
  });
});
