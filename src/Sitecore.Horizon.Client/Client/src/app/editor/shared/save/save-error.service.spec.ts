/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DialogModule, DialogOverlayService } from '@sitecore/ng-spd-lib';
import { ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { WarningDialogComponent } from 'app/shared/dialogs/warning-dialog/warning-dialog.component';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { nextTick, TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { BehaviorSubject } from 'rxjs';
import { resolveErrorMessageTranslationKeyByErrorCode, SaveErrorService } from './save-error.service';
import { SaveResult } from './save.interfaces';

class TestWarningDialogComponent {
  title = 'Dialog title';
  text = 'Dialog text';
  declineText = 'Decline';
  confirmText = 'Confirm';

  dialogResultEvent = new BehaviorSubject<{ confirmed: boolean }>({ confirmed: true });
}

describe(SaveErrorService.name, () => {
  let sut: SaveErrorService;

  let timedNotificationsServiceSpy: jasmine.SpyObj<TimedNotificationsService>;
  let testWarningDialogComponent: TestWarningDialogComponent;

  const testContextItemId = 'testItemId';

  let testResult: SaveResult;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateServiceStubModule, TranslateModule, DialogModule, ContextServiceTestingModule],
      providers: [
        SaveErrorService,
        {
          provide: TimedNotificationsService,
          useValue: jasmine.createSpyObj<TimedNotificationsService>(['push', 'pushNotification']),
        },
        DialogOverlayService,
      ],
    });

    testResult = {
      errors: [],
      savedItems: [],
      validationErrors: [],
      warnings: [],
      newCreatedVersions: [],
    };

    testWarningDialogComponent = new TestWarningDialogComponent();
    spyOn(WarningDialogComponent, 'show').and.returnValue({ component: testWarningDialogComponent } as any);

    sut = TestBed.inject(SaveErrorService);

    timedNotificationsServiceSpy = TestBedInjectSpy(TimedNotificationsService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('handleSaveResult', () => {
    it('should NOT show error notification if there are NO errors, validation errors, or warnings', () => {
      sut.handleSaveResult(testContextItemId, testResult, () => {});

      expect(timedNotificationsServiceSpy.push).not.toHaveBeenCalled();
      expect(timedNotificationsServiceSpy.pushNotification).not.toHaveBeenCalled();
    });

    describe('AND there are Errors', () => {
      it('should show existing error message if it is provided', () => {
        testResult.errors = [
          {
            message: 'Error message',
            errorCode: 'Some code',
            itemId: testContextItemId,
          },
        ] as any;

        sut.handleSaveResult(testContextItemId, testResult, () => {});

        const calls = timedNotificationsServiceSpy.pushNotification.calls.allArgs();
        expect(calls[0][0]).toEqual(
          jasmine.objectContaining({
            id: 'SaveResultError-testItemId',
            text: 'Error message',
            severity: 'error',
          }),
        );
      });

      it('should show error messages', async () => {
        testResult.errors = [
          {
            message: '',
            errorCode: 'BaseTemplateWasChanged',
            itemId: testContextItemId,
          },
          {
            message: '',
            errorCode: 'NoWriteAccess',
            itemId: testContextItemId,
          },
          {
            message: '',
            errorCode: 'IncorrectCloneSource',
            itemId: 'another-item',
          },
        ];

        await sut.handleSaveResult(testContextItemId, testResult, () => {});

        const calls = timedNotificationsServiceSpy.pushNotification.calls.allArgs();
        const [call1, call2, call3] = calls;
        expect(calls.length).toBe(3);

        expect(call1[0]).toEqual(
          jasmine.objectContaining({
            id: 'SaveResultError-testItemId',
            text: 'EDITOR.SAVE.ERRORS.BASE_TEMPLATE_WAS_CHANGED',
            severity: 'error',
          }),
        );
        expect(call2[0]).toEqual(
          jasmine.objectContaining({
            id: 'SaveResultError-testItemId',
            text: 'EDITOR.SAVE.ERRORS.NO_WRITE_ACCESS',
            severity: 'error',
          }),
        );
        expect(call3[0]).toEqual(
          jasmine.objectContaining({
            id: 'SaveResultError-testItemId',
            text: 'EDITOR.SAVE.ERRORS.INCORRECT_CLONE_SOURCE',
            severity: 'error',
          }),
        );
      });

      it('should show error messages for ItemDoesNotExist', async () => {
        testResult.errors = [
          {
            message: '',
            errorCode: 'ItemDoesNotExist',
            itemId: testContextItemId,
          },
        ];

        await sut.handleSaveResult(testContextItemId, testResult, () => {});
        await nextTick();

        const calls = timedNotificationsServiceSpy.pushNotification.calls.allArgs();

        expect(calls[0][0]).toEqual(
          jasmine.objectContaining({
            id: 'SaveResultError-testItemId',
            text: 'EDITOR.SAVE.ERRORS.PAGE_DOES_NOT_EXIST',
            severity: 'error',
            action: jasmine.objectContaining({
              title: 'EDITOR.SAVE.ERRORS.RELOAD_ACTION_TITLE',
            }),
          }),
        );
      });

      describe('AND error is FieldWasModified', () => {
        describe('AND confirmation dialog is shown', () => {
          it('should return OverwriteModifiedItem', async () => {
            testResult.errors = [
              {
                message: '',
                errorCode: 'FieldWasModified',
                itemId: testContextItemId,
              },
            ];
            const resultAction = await sut.handleSaveResult(testContextItemId, testResult, () => {});

            expect(timedNotificationsServiceSpy.pushNotification).not.toHaveBeenCalled();
            expect(resultAction).toBe('OverwriteModifiedItem');
          });

          it('should return ReloadCanvas', async () => {
            testResult.errors = [
              {
                message: '',
                errorCode: 'FieldWasModified',
                itemId: testContextItemId,
              },
            ];

            testWarningDialogComponent.dialogResultEvent.next({ confirmed: false });
            const resultAction = await sut.handleSaveResult(testContextItemId, testResult, () => {});

            expect(timedNotificationsServiceSpy.pushNotification).not.toHaveBeenCalled();
            expect(resultAction).toBe('ReloadCanvas');
          });
        });
      });
    });

    describe('AND there are Warnings', () => {
      it('should show warnings', () => {
        testResult.warnings = ['warning 1', 'warning 2', 'warning 3'];

        sut.handleSaveResult(testContextItemId, testResult, () => {});

        const calls = timedNotificationsServiceSpy.push.calls.allArgs();
        const [call1, call2, call3] = calls;
        expect(calls.length).toBe(3);
        expect(call1).toEqual(['SaveResultWarning-testItemId', 'warning 1', 'warning']);
        expect(call2).toEqual(['SaveResultWarning-testItemId', 'warning 2', 'warning']);
        expect(call3).toEqual(['SaveResultWarning-testItemId', 'warning 3', 'warning']);
      });

      it('ItemWasModified', fakeAsync(() => {
        testResult.warnings = ['ItemWasModified'];

        const reloadCanvasSpy = jasmine.createSpy();
        sut.handleSaveResult(testContextItemId, testResult, reloadCanvasSpy);
        tick();

        const notification = timedNotificationsServiceSpy.pushNotification.calls.mostRecent().args[0];
        expect(notification.text).toEqual('EDITOR.SAVE.ERRORS.PAGE_WAS_MODIFIED_WARNING');
        expect(notification.action?.run).toBe(reloadCanvasSpy);
        expect(notification.closable).toBe(true);
        expect(notification.severity).toEqual('warning');
        flush();
      }));
    });

    describe('AND there are Validation Errors', () => {
      it('should show errors', () => {
        testResult.validationErrors = [
          {
            errorMessage: 'error 1',
          },
          {
            errorMessage: 'error 2',
          },
          {
            errorMessage: 'error 3',
          },
        ] as any;

        sut.handleSaveResult(testContextItemId, testResult, () => {});

        const calls = timedNotificationsServiceSpy.push.calls.allArgs();
        const [call1, call2, call3] = calls;
        expect(calls.length).toBe(3);
        expect(call1).toEqual(['SaveResultValidationError-testItemId', 'error 1', 'error']);
        expect(call2).toEqual(['SaveResultValidationError-testItemId', 'error 2', 'error']);
        expect(call3).toEqual(['SaveResultValidationError-testItemId', 'error 3', 'error']);
      });
    });

    describe('resolveErrorMessageTranslationKeyByErrorCode', () => {
      it('should resolve translation key', () => {
        expect(resolveErrorMessageTranslationKeyByErrorCode('random code')).toBeUndefined();
        expect(resolveErrorMessageTranslationKeyByErrorCode('ChangedUnversionedOrSharedFlag')).toBe(
          'EDITOR.SAVE.ERRORS.CHANGED_UNVERSIONED_OR_SHARED_FLAG',
        );
        expect(resolveErrorMessageTranslationKeyByErrorCode('ChangedUnversionedOrSharedFlag')).toBe(
          'EDITOR.SAVE.ERRORS.CHANGED_UNVERSIONED_OR_SHARED_FLAG',
        );
        expect(resolveErrorMessageTranslationKeyByErrorCode('ItemDoesNotExist')).toBe(
          'EDITOR.SAVE.ERRORS.PAGE_DOES_NOT_EXIST',
        );
        expect(resolveErrorMessageTranslationKeyByErrorCode('ValidationError')).toBe(
          'EDITOR.SAVE.ERRORS.VALIDATION_ERROR',
        );
      });
    });
  });
});
