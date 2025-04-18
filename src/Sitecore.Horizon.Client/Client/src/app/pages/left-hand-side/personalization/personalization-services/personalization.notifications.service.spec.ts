/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CanvasServices, ChromeSelectEvent } from 'app/editor/shared/canvas.services';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { FieldChromeInfo, RenderingChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { BehaviorSubject } from 'rxjs';
import { PersonalizationNotificationsService } from './personalization.notifications.service';

describe(PersonalizationNotificationsService.name, () => {
  let sut: PersonalizationNotificationsService;
  let timedNotificationsServiceSpy: jasmine.SpyObj<TimedNotificationsService>;
  let context: ContextServiceTesting;
  let canvasServices_chromeSelect$: BehaviorSubject<ChromeSelectEvent>;

  const offerEditParentRenderingNotificationId = 'offerSelectParentRendering';
  const contentIsSameAsDefaultNotificationId = 'contentIsSameAsDefault';

  const parentRenderingChrome: RenderingChromeInfo = {
    chromeId: 'rendering-Id',
    chromeType: 'rendering',
    displayName: 'displayName',
    contextItem: {
      id: 'test-item-id',
      language: 'lang',
      version: 1,
    },
    isPersonalized: false,
    appliedPersonalizationActions: [],
    inlineEditorProtocols: [],
    renderingDefinitionId: '',
    renderingInstanceId: '',
    compatibleRenderings: [],
    parentPlaceholderChromeInfo: {} as any,
  };

  beforeEach(() => {
    canvasServices_chromeSelect$ = new BehaviorSubject<ChromeSelectEvent>({
      selection: undefined,
      eventSource: undefined,
    });

    TestBed.configureTestingModule({
      imports: [TranslateModule, TranslateServiceStubModule, ContextServiceTestingModule],
      providers: [
        PersonalizationNotificationsService,
        {
          provide: MessagingService,
          useValue: jasmine.createSpyObj<MessagingService>('MessagingService', ['getEditingCanvasChannel']),
        },
        {
          provide: TimedNotificationsService,
          useValue: jasmine.createSpyObj<TimedNotificationsService>('TimedNotificationsService', [
            'pushNotification',
            'hideNotificationById',
          ]),
        },
        {
          provide: CanvasServices,
          useValue: jasmine.createSpyObj<CanvasServices>(
            'CanvasServices',
            {},
            { chromeSelect$: canvasServices_chromeSelect$ },
          ),
        },
      ],
    });
  });

  beforeEach(() => {
    timedNotificationsServiceSpy = TestBedInjectSpy(TimedNotificationsService);
    context = TestBed.inject(ContextServiceTesting);
    context.provideTestValue({ variant: 'testSegmentId001' });
    sut = TestBed.inject(PersonalizationNotificationsService);

    sut.initShowingNotifications();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('when chromeSelect$ has been updated', () => {
    it('should not show notifications for the default page variant', fakeAsync(() => {
      // arrange
      context.provideTestValue({ variant: undefined });
      const fieldChrome: FieldChromeInfo = {
        fieldType: 'rte',
        fieldId: 'field-Id',
        displayName: 'displayName',
        chromeId: 'field_1',
        chromeType: 'field',
        contextItem: {
          id: 'test-item-id',
          language: 'lang',
          version: 1,
        },
        isPersonalized: false,
        parentRenderingChromeInfo: parentRenderingChrome,
      };
      canvasServices_chromeSelect$.next({
        selection: { chrome: fieldChrome, messaging: {} as any },
        eventSource: undefined,
      });
      tick();

      // assert
      expect(timedNotificationsServiceSpy.pushNotification).not.toHaveBeenCalled();
      expect(timedNotificationsServiceSpy.hideNotificationById).not.toHaveBeenCalled();
      flush();
    }));

    it('should hide existing chrome notifications', fakeAsync(() => {
      // arrange
      const fieldChrome: FieldChromeInfo = {
        fieldType: 'rte',
        fieldId: 'field-Id',
        displayName: 'displayName',
        chromeId: 'field_1',
        chromeType: 'field',
        contextItem: {
          id: 'test-item-id',
          language: 'lang',
          version: 1,
        },
        isPersonalized: false,
        parentRenderingChromeInfo: parentRenderingChrome,
      };
      canvasServices_chromeSelect$.next({
        selection: { chrome: fieldChrome, messaging: {} as any },
        eventSource: undefined,
      });
      tick();

      // act
      canvasServices_chromeSelect$.next({
        selection: undefined,
        eventSource: undefined,
      });
      tick();

      // assert
      expect(timedNotificationsServiceSpy.hideNotificationById).toHaveBeenCalledTimes(1);
      expect(timedNotificationsServiceSpy.hideNotificationById).toHaveBeenCalledWith(
        offerEditParentRenderingNotificationId,
      );
      flush();
    }));

    it('should hide existing new variant notification if chromeSelect$ is defined', fakeAsync(async () => {
      // arrange
      await sut.showContentIsDefaultNotification();

      // act
      const fieldChrome: FieldChromeInfo = {
        fieldType: 'rte',
        fieldId: 'field-Id',
        displayName: 'displayName',
        chromeId: 'field_1',
        chromeType: 'field',
        contextItem: {
          id: 'test-item-id',
          language: 'lang',
          version: 1,
        },
        isPersonalized: false,
        parentRenderingChromeInfo: parentRenderingChrome,
      };
      canvasServices_chromeSelect$.next({
        selection: { chrome: fieldChrome, messaging: {} as any },
        eventSource: undefined,
      });
      tick();

      // assert
      expect(timedNotificationsServiceSpy.hideNotificationById).toHaveBeenCalledTimes(1);
      expect(timedNotificationsServiceSpy.hideNotificationById).toHaveBeenCalledWith(
        contentIsSameAsDefaultNotificationId,
      );
      flush();
    }));

    it('should not hide existing new variant notification if chromeSelect$ is undefined', fakeAsync(async () => {
      // arrange
      await sut.showContentIsDefaultNotification();
      expect(timedNotificationsServiceSpy.pushNotification).toHaveBeenCalledTimes(1);

      // act
      canvasServices_chromeSelect$.next({
        selection: undefined,
        eventSource: undefined,
      });
      tick();

      // assert
      expect(timedNotificationsServiceSpy.hideNotificationById).not.toHaveBeenCalled();
      flush();
    }));

    describe('and chrome type is field', () => {
      it('should not show any notification if field is personalized', fakeAsync(async () => {
        // arrange
        const fieldChrome: FieldChromeInfo = {
          fieldType: 'rte',
          fieldId: 'field-Id',
          displayName: 'displayName',
          chromeId: 'field_1',
          chromeType: 'field',
          contextItem: {
            id: 'test-item-id',
            language: 'lang',
            version: 1,
          },
          isPersonalized: true,
          parentRenderingChromeInfo: parentRenderingChrome,
        };

        // act
        canvasServices_chromeSelect$.next({
          selection: { chrome: fieldChrome, messaging: {} as any },
          eventSource: undefined,
        });
        tick();

        // assert
        expect(timedNotificationsServiceSpy.pushNotification).not.toHaveBeenCalled();
        flush();
      }));

      it('should not show any notification if field rendering parent is not defined', fakeAsync(async () => {
        // arrange
        const fieldChrome: FieldChromeInfo = {
          fieldType: 'rte',
          fieldId: 'field-Id',
          displayName: 'displayName',
          chromeId: 'field_1',
          chromeType: 'field',
          contextItem: {
            id: 'test-item-id',
            language: 'lang',
            version: 1,
          },
          isPersonalized: false,
        };

        // act
        canvasServices_chromeSelect$.next({
          selection: { chrome: fieldChrome, messaging: {} as any },
          eventSource: undefined,
        });
        tick();

        // assert
        expect(timedNotificationsServiceSpy.pushNotification).not.toHaveBeenCalled();
        flush();
      }));

      it('should show "EditParentRendering" notification if field is not personalized', fakeAsync(async () => {
        // arrange
        const fieldChrome: FieldChromeInfo = {
          fieldType: 'rte',
          fieldId: 'field-Id',
          displayName: 'displayName',
          chromeId: 'field_1',
          chromeType: 'field',
          contextItem: {
            id: 'test-item-id',
            language: 'lang',
            version: 1,
          },
          isPersonalized: false,
          parentRenderingChromeInfo: parentRenderingChrome,
        };

        // act
        canvasServices_chromeSelect$.next({
          selection: { chrome: fieldChrome, messaging: {} as any },
          eventSource: undefined,
        });
        tick();
        const [{ id, text, severity, action, persistent }] =
          timedNotificationsServiceSpy.pushNotification.calls.mostRecent().args;

        // assert
        expect(timedNotificationsServiceSpy.pushNotification).toHaveBeenCalledTimes(1);
        expect(id).toBe(offerEditParentRenderingNotificationId);
        expect(text).toBe('PERSONALIZATION.SUGGEST_EDIT_PARENT_RENDERING');
        expect(severity).toBe('info');
        expect(action).toEqual({ title: 'PERSONALIZATION.SELECT_COMPONENT', run: jasmine.any(Function) });
        expect(persistent).toBe(true);
        flush();
      }));
    });

    describe('and chrome type is rendering', () => {
      it('should not show any notification if rendering is personalized', fakeAsync(async () => {
        // arrange
        const renderingChrome: RenderingChromeInfo = {
          chromeId: 'rendering-Id',
          chromeType: 'rendering',
          displayName: 'displayName',
          contextItem: {
            id: 'test-item-id',
            language: 'lang',
            version: 1,
          },
          isPersonalized: true,
          appliedPersonalizationActions: [],
          inlineEditorProtocols: [],
          renderingDefinitionId: '',
          renderingInstanceId: '',
          compatibleRenderings: [],
          parentPlaceholderChromeInfo: {} as any,
        };

        // act
        canvasServices_chromeSelect$.next({
          selection: { chrome: renderingChrome, messaging: {} as any },
          eventSource: undefined,
        });
        tick();

        // assert
        expect(timedNotificationsServiceSpy.pushNotification).not.toHaveBeenCalled();
        flush();
      }));
    });
  });

  describe('showContentIsDefaultNotification', () => {
    it('should show "contentIsSameAsDefault" notification', async () => {
      // act
      await sut.showContentIsDefaultNotification();

      const [{ id, text, severity, action, persistent }] =
        timedNotificationsServiceSpy.pushNotification.calls.mostRecent().args;

      // assert;
      expect(timedNotificationsServiceSpy.pushNotification).toHaveBeenCalledTimes(1);
      expect(id).toBe(contentIsSameAsDefaultNotificationId);
      expect(text).toBe('PERSONALIZATION.CONTENT_IS_SAME_AS_DEFAULT');
      expect(severity).toBe('info');
      expect(action).toBe(undefined);
      expect(persistent).toBe(true);
    });
  });

  describe('showApiBadRequestError', () => {
    it('should show "bad request error" notification', async () => {
      // act
      await sut.showApiBadRequestError();

      const [{ id, text, severity, action, persistent }] =
        timedNotificationsServiceSpy.pushNotification.calls.mostRecent().args;

      // assert;
      expect(timedNotificationsServiceSpy.pushNotification).toHaveBeenCalledTimes(1);
      expect(id).toBe('apiRequestInvalid');
      expect(text).toBe('PERSONALIZATION.API_ERRORS.BAD_REQUEST_ERROR_MESSAGE');
      expect(severity).toBe('error');
      expect(action).toBe(undefined);
      expect(persistent).toBe(true);
    });
  });

  describe('showArchivedFlowDefinitionError', () => {
    it('should show "archived flow definition error" notification', async () => {
      // act
      await sut.showArchivedFlowDefinitionError();

      const [{ id, text, severity, action, persistent }] =
        timedNotificationsServiceSpy.pushNotification.calls.mostRecent().args;

      // assert;
      expect(timedNotificationsServiceSpy.pushNotification).toHaveBeenCalledTimes(1);
      expect(id).toBe('archivedFlowDefinition');
      expect(text).toBe('PERSONALIZATION.API_ERRORS.ARCHIVED_FLOW_DEFINITION_ERROR_MESSAGE');
      expect(severity).toBe('error');
      expect(action).toBe(undefined);
      expect(persistent).toBe(true);
    });
  });

  it('should show "showVariantNameExceedLimitNotification" notification', async () => {
    // act
    await sut.showVariantNameExceedLimitNotification();

    const [{ id, text, severity, action, persistent }] =
      timedNotificationsServiceSpy.pushNotification.calls.mostRecent().args;

    // assert;
    expect(timedNotificationsServiceSpy.pushNotification).toHaveBeenCalledTimes(1);
    expect(id).toBe('variantNameExceedLimit');
    expect(text).toBe('PERSONALIZATION.ERROR_LENGTH_LIMIT');
    expect(severity).toBe('error');
    expect(action).toBe(undefined);
    expect(persistent).toBe(false);
  });

  it('should show "showVariantIsEmptyNotification" notification', async () => {
    // act
    await sut.showVariantIsEmptyNotification();

    const [{ id, text, severity, action, persistent }] =
      timedNotificationsServiceSpy.pushNotification.calls.mostRecent().args;

    // assert;
    expect(timedNotificationsServiceSpy.pushNotification).toHaveBeenCalledTimes(1);
    expect(id).toBe('emptyVariantName');
    expect(text).toBe('PERSONALIZATION.EMPTY_VARIANT_NAME');
    expect(severity).toBe('error');
    expect(action).toBe(undefined);
    expect(persistent).toBe(false);
  });
});
