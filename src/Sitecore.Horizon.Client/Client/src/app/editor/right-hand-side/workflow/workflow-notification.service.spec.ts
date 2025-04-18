/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { firstValueFrom, Observable } from 'rxjs';
import { WorkflowNotificationService } from './workflow-notification.service';

describe(WorkflowNotificationService.name, () => {
  let sut: WorkflowNotificationService;
  let timedNotificationsServiceSpy: jasmine.SpyObj<TimedNotificationsService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule, TranslateServiceStubModule],
      providers: [
        WorkflowNotificationService,
        {
          provide: TimedNotificationsService,
          useValue: jasmine.createSpyObj<TimedNotificationsService>('TimedNotificationsService', [
            'push',
            'pushNotification',
          ]),
        },
      ],
    });
  });

  beforeEach(() => {
    timedNotificationsServiceSpy = TestBedInjectSpy(TimedNotificationsService);

    sut = TestBed.inject(WorkflowNotificationService);
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('showOnPublishFailedNotification', () => {
    it('should show notification', async () => {
      await sut.showOnPublishFailedNotification('itemId');

      const [id, text$, severity] = timedNotificationsServiceSpy.push.calls.mostRecent().args;
      const text = await firstValueFrom(text$ as Observable<string>);
      expect(id).toBe('WorkflowPublishFail-itemId');
      expect(text).toBe('EDITOR.WORKFLOW.PUBLISH_FAILED');
      expect(severity).toBe('error');
    });
  });

  describe('showSuccessNotification', () => {
    describe('without sub items', () => {
      it('should show notification', async () => {
        await sut.showSuccessNotification('itemId', 'display name');

        const [id, text$, severity] = timedNotificationsServiceSpy.push.calls.mostRecent().args;
        const text = await firstValueFrom(text$ as Observable<string>);
        expect(id).toBe('WorkflowPublishSuccess-itemId');
        expect(text).toBe('EDITOR.WORKFLOW.PUBLISH_SUCCESSFUL {"itemName":"display name"}');
        expect(severity).toBe('success');
      });
    });

    describe('with sub items', () => {
      it('should show notification', async () => {
        await sut.showSuccessNotification('itemId', 'display name', 123);

        const [id, text$, severity] = timedNotificationsServiceSpy.push.calls.mostRecent().args;
        const text = await firstValueFrom(text$ as Observable<string>);
        expect(id).toBe('WorkflowPublishWithSubitemsSuccess-itemId');
        expect(text).toBe(
          'EDITOR.WORKFLOW.PUBLISH_WITH_SUBITEMS_SUCCESSFUL {"itemName":"display name","processedItemsCount":123}',
        );
        expect(severity).toBe('success');
      });
    });

    describe('showExecuteCommandErrorNotification', () => {
      it('should show notification', async () => {
        await sut.showExecuteCommandErrorNotification('itemId', 'Error Text', 'page');

        const notification = timedNotificationsServiceSpy.pushNotification.calls.mostRecent().args[0];
        expect(notification.id).toContain('WorkflowExecuteCommand-itemId');
        expect(notification.text).toBe('');
        expect(notification.innerHtml).toContain('Error Text');
        expect(notification.severity).toBe('warning');
      });
    });
  });
});
