/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { MessagingService } from './messaging.service';
import { TranslationMessagingService } from './translation-messaging.service';

describe(TranslationMessagingService.name, () => {
  let sut: TranslationMessagingService;
  let messagingService: jasmine.SpyObj<MessagingService>;

  let setRpcServicesImplSpy: jasmine.Spy;

  let translateService: jasmine.SpyObj<TranslateService>;

  const testTranslations = {
    i1: '1',
    i2: '2',
  };

  beforeEach(() => {
    translateService = jasmine.createSpyObj<TranslateService>(['get']);
    translateService.get.and.callFake((key: any) => {
      if (key === 'CANVAS_TRANSLATIONS') {
        return of(testTranslations);
      } else {
        return of({});
      }
    });

    setRpcServicesImplSpy = jasmine.createSpy();
    messagingService = jasmine.createSpyObj<MessagingService>(['getTranslationChannel']);
    messagingService.getTranslationChannel.and.callFake((() => {
      return { setRpcServicesImpl: setRpcServicesImplSpy };
    }) as any);

    sut = new TranslationMessagingService(messagingService, translateService);
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('init', () => {
    it('should set implementation for getTranslations method', async () => {
      await sut.init();

      const [implementation] = setRpcServicesImplSpy.calls.mostRecent().args;
      expect(await implementation.getTranslations()).toEqual(testTranslations);
    });
  });
});
