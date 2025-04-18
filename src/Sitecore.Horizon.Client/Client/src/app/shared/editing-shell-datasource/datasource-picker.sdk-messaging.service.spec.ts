/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import { DatasourcePickerContract } from 'sdk';
import { DatasourcePickerSdkMessagingService } from './datasource-picker.sdk-messaging.service';
import { EditingShellDatasourceImpl } from './editing-shell-datasource.impl';

describe('DatasourcePickerSdkMessagingService', () => {
  let service: DatasourcePickerSdkMessagingService;
  let globalMessagingSpy: jasmine.SpyObj<NgGlobalMessaging>;

  beforeEach(() => {
    globalMessagingSpy = jasmine.createSpyObj('NgGlobalMessaging', ['createRpc']);

    TestBed.configureTestingModule({
      providers: [
        DatasourcePickerSdkMessagingService,
        { provide: EditingShellDatasourceImpl, useValue: {} },
        { provide: NgGlobalMessaging, useValue: globalMessagingSpy },
      ],
    });
    service = TestBed.inject(DatasourcePickerSdkMessagingService);
  });

  it('init() should create global messaging for EditingShellDatasourceMessagingContract', () => {
    // act
    service.init();

    // assert
    expect(globalMessagingSpy.createRpc).toHaveBeenCalledWith(DatasourcePickerContract, jasmine.any(Object));
  });
});
