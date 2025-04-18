/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import { ContentItemPickerContract } from 'sdk/contracts/content-item-picker.contract';
import { EditingShellContentItemPickerImpl } from './content-item-picker.impl';
import { ContentItemPickerSdkMessagingService } from './content-item-picker.sdk-messaging.service';

describe('ContentItemPickerSdkMessagingService', () => {
  let service: ContentItemPickerSdkMessagingService;
  let globalMessagingSpy: jasmine.SpyObj<NgGlobalMessaging>;

  beforeEach(() => {
    globalMessagingSpy = jasmine.createSpyObj('NgGlobalMessaging', ['createRpc']);

    TestBed.configureTestingModule({
      providers: [
        ContentItemPickerSdkMessagingService,
        { provide: EditingShellContentItemPickerImpl, useValue: {} },
        { provide: NgGlobalMessaging, useValue: globalMessagingSpy },
      ],
    });
    service = TestBed.inject(ContentItemPickerSdkMessagingService);
  });

  it('init() should create global messaging for EditingShellDatasourceMessagingContract', () => {
    // act
    service.init();

    // assert
    expect(globalMessagingSpy.createRpc).toHaveBeenCalledWith(ContentItemPickerContract, jasmine.any(Object));
  });
});
