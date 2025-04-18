/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import { MediaPickerContract } from 'sdk';
import { EditingShellMediaImpl } from './editing-shell-media.impl';
import { MediaPickerSdkMessagingService } from './media-picker.sdk-messaging.service';

describe('MediaPickerSdkMessagingService', () => {
  let sut: MediaPickerSdkMessagingService;
  let globalMessagingSpy: jasmine.SpyObj<NgGlobalMessaging>;

  beforeEach(() => {
    globalMessagingSpy = jasmine.createSpyObj('NgGlobalMessaging', ['createRpc']);

    TestBed.configureTestingModule({
      providers: [
        MediaPickerSdkMessagingService,
        { provide: EditingShellMediaImpl, useValue: {} },
        { provide: NgGlobalMessaging, useValue: globalMessagingSpy },
      ],
    });
    sut = TestBed.inject(MediaPickerSdkMessagingService);
  });

  it('init() should create global messaging for EditingShellMediaMessagingContract', () => {
    // act
    sut.init();

    // assert
    expect(globalMessagingSpy.createRpc).toHaveBeenCalledWith(MediaPickerContract, jasmine.any(Object));
  });
});
