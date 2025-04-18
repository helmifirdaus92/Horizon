/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { VersionsInfo, VersionsWorkflowService } from 'app/editor/shared/versions-workflow/versions-workflow.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { ItemChange, ItemChangeService } from 'app/shared/client-state/item-change-service';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { BehaviorSubject, NEVER, Observable, of, Subject } from 'rxjs';
import { VersionActionsDialogService } from './version-actions-dialog/version-actions-dialog.service';
import { VersionsUtilService } from './versions-util.service';

describe(VersionsUtilService.name, () => {
  let sut: VersionsUtilService;

  let contextService: ContextServiceTesting;
  let timedNotificationsServiceSpy: jasmine.SpyObj<TimedNotificationsService>;
  let itemChangeServiceSpy: jasmine.SpyObj<ItemChangeService>;
  let itemChanges$: Subject<ItemChange>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let versionActionsDialogServiceSpy: jasmine.SpyObj<VersionActionsDialogService>;

  let versionsServiceMock: jasmine.SpyObj<VersionsWorkflowService>;
  let watchVersionsMock: BehaviorSubject<VersionsInfo>;
  let watchLoadingMock: BehaviorSubject<boolean>;

  // Test data and utilities
  const getTestVersionsInfo = (): VersionsInfo => {
    return {
      versions: [
        {
          versionNumber: 1,
          workflowState: 'Draft1',
          name: 'name1',
          lastModifiedBy: 'author1',
          lastModifiedAt: '2020-01-09T12:05:14.815Z',
          validFrom: '2020-01-09T12:05:14.815Z',
          validTo: '2020-09-09T12:07:05.816Z',
          isLatestPublishableVersion: true,
          isAvailableToPublish: true,
        },
        {
          versionNumber: 2,
          name: 'name2',
          workflowState: 'Draft2',
          lastModifiedBy: 'author2',
          lastModifiedAt: '2021-01-09T12:05:14.815Z',
          validFrom: '2021-01-09T12:05:14.815Z',
          validTo: '2021-09-09T12:07:05.816Z',
          isLatestPublishableVersion: false,
          isAvailableToPublish: true,
        },
      ],
      permissions: {
        canWrite: true,
        canDelete: true,
        canPublish: true,
      },
    };
  };

  const contextItemId = 'foo1BAR2-BaZ3-0000-AAAA-bbbbCCCC1234'.toLocaleLowerCase();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ContextServiceTestingModule],
      declarations: [],
      providers: [
        {
          provide: ItemChangeService,
          useValue: jasmine.createSpyObj<ItemChangeService>(['watchForChanges', 'notifyChange']),
        },
      ],
    });
  }));

  beforeEach(waitForAsync(() => {
    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideDefaultTestContext();

    timedNotificationsServiceSpy = jasmine.createSpyObj<TimedNotificationsService>('TimedNotificationsService', [
      'push',
      'hideNotificationById',
      'pushNotification',
    ]);
    timedNotificationsServiceSpy.push.and.resolveTo();
    timedNotificationsServiceSpy.hideNotificationById.and.resolveTo();

    itemChangeServiceSpy = jasmine.createSpyObj<ItemChangeService>(['watchForChanges', 'notifyChange']);
    versionActionsDialogServiceSpy = jasmine.createSpyObj<VersionActionsDialogService>(['showCreateVersionDialog']);

    versionsServiceMock = jasmine.createSpyObj<VersionsWorkflowService>('VersionsService', [
      'createVersion',
      'renameVersion',
      'removeVersion',
      'setPublishingSettings',
      'watchVersionsLoading',
      'watchVersionsAndWorkflow',
    ]);

    // Default versions context
    contextService.setTestItemVersion(2);

    watchVersionsMock = new BehaviorSubject(getTestVersionsInfo());
    versionsServiceMock.watchVersionsAndWorkflow.and.returnValue(watchVersionsMock as any);

    itemChangeServiceSpy.notifyChange.and.callFake(() => watchVersionsMock.next(watchVersionsMock.value));

    watchLoadingMock = new BehaviorSubject<boolean>(false);
    versionsServiceMock.watchVersionsLoading.and.returnValue(watchLoadingMock);

    versionsServiceMock.createVersion.and.callFake(
      (_path: string, _language: string, _siteName: string, versionName: string) => {
        const newVersionsInfo = getTestVersionsInfo();
        newVersionsInfo.versions.push({
          versionNumber: 3,
          name: versionName,
          lastModifiedBy: 'author3',
          lastModifiedAt: '2022-01-09T12:05:14.815Z',
          validFrom: '2022-01-09T12:05:14.815Z',
          validTo: '2022-09-09T12:07:05.816Z',
          workflowState: 'Draft3',
          isLatestPublishableVersion: false,
          isAvailableToPublish: true,
        });
        watchVersionsMock.next(newVersionsInfo);
        return of({ success: true, itemVersion: 3 });
      },
    );
    versionsServiceMock.renameVersion.and.callFake(
      (_path: string, versionNumber: number, newName: string, _language: string, _siteName: string) => {
        const newVersionsInfo = getTestVersionsInfo();
        newVersionsInfo.versions = newVersionsInfo.versions.map((item) => {
          return item.versionNumber !== versionNumber ? item : { ...item, ...{ name: newName } };
        });

        watchVersionsMock.next(newVersionsInfo);
        return of({ success: true });
      },
    );
    versionsServiceMock.removeVersion.and.callFake(
      (_path: string, _language: string, _siteName: string, itemVersion: number) => {
        const newVersionsInfo = getTestVersionsInfo();
        newVersionsInfo.versions = newVersionsInfo.versions.filter((item) => item.versionNumber !== itemVersion);

        watchVersionsMock.next(newVersionsInfo);
        return of({ success: true, latestPublishableVersion: newVersionsInfo.versions[0].versionNumber });
      },
    );

    itemChanges$ = new Subject<ItemChange>();
    itemChangeServiceSpy.watchForChanges.and.returnValue(itemChanges$);

    translateService = jasmine.createSpyObj<TranslateService>({ get: NEVER });
    translateService.get.and.callFake((key) => of(key));

    sut = new VersionsUtilService(
      versionsServiceMock,
      contextService,
      timedNotificationsServiceSpy,
      translateService,
      itemChangeServiceSpy,
      versionActionsDialogServiceSpy,
    );
  }));

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('Create new version', () => {
    it('should create new version', async () => {
      await sut.createVersion('New version');

      expect(versionsServiceMock.createVersion).toHaveBeenCalledWith(
        contextService.itemId,
        contextService.language,
        contextService.siteName,
        'New version',
        2,
      );
    });

    it('should notify change if create new operation is success', async () => {
      versionsServiceMock.createVersion.and.returnValue(of({ success: true, itemId: contextItemId }));
      contextService.setTestItemId(contextItemId);
      await sut.createVersion('New version');

      expect(itemChangeServiceSpy.notifyChange).toHaveBeenCalled();
      expect(itemChangeServiceSpy.notifyChange).toHaveBeenCalledWith(contextItemId, ['versions', 'workflow']);
    });

    it('should update context if create new operation is success', async () => {
      versionsServiceMock.createVersion.and.returnValue(of({ success: true, itemId: contextItemId, itemVersion: 3 }));
      contextService.setTestItemId(contextItemId);
      const updateContextSpy = spyOn(contextService, 'updateContext').and.callThrough();
      await sut.createVersion('New version');

      expect(updateContextSpy).toHaveBeenCalled();
    });

    it('should not update context and notify change if context has changed', async () => {
      versionsServiceMock.createVersion.and.returnValue(of({ success: true, itemVersion: 3 }));
      const updateContextSpy = spyOn(contextService, 'updateContext').and.callThrough();

      const createResult = sut.createVersion('New version');
      contextService.setTestItemId('new context item id');
      await createResult;

      expect(updateContextSpy).not.toHaveBeenCalled();
      expect(itemChangeServiceSpy.notifyChange).not.toHaveBeenCalled();
    });

    it('should show error notification if request fails', async () => {
      versionsServiceMock.createVersion.and.returnValue(of({ success: false }));
      await sut.createVersion('New version');

      expect(timedNotificationsServiceSpy.push).toHaveBeenCalledWith(
        'CreateVersionError-New version',
        'VERSIONS.CREATE.ERROR',
        'error',
      );
    });

    describe('When nodeId is defined', () => {
      it('should create new version to correct node ', () => {
        const nodeId = 'nodeId';
        sut.createVersion('New version', undefined, nodeId);

        expect(versionsServiceMock.createVersion).toHaveBeenCalledWith(
          nodeId,
          contextService.language,
          contextService.siteName,
          'New version',
          2,
        );
      });

      it('should update context if node to create version at is the current context item', fakeAsync(() => {
        const nodeId = contextService.itemId;
        versionsServiceMock.createVersion.and.returnValue(of({ success: true, itemVersion: 1 }));
        const updateContextSpy = spyOn(contextService, 'updateContext').and.callThrough();

        sut.createVersion('New version', undefined, nodeId);
        tick();

        expect(updateContextSpy).toHaveBeenCalled();
        expect(itemChangeServiceSpy.notifyChange).toHaveBeenCalled();
      }));

      it('should not update context if node to create version at is not the current context item', fakeAsync(() => {
        const nodeId = 'nodeId';
        versionsServiceMock.createVersion.and.returnValue(of({ success: true, itemVersion: 1 }));
        const updateContextSpy = spyOn(contextService, 'updateContext').and.callThrough();

        sut.createVersion('New version', undefined, nodeId);
        tick();

        expect(updateContextSpy).not.toHaveBeenCalled();
        expect(itemChangeServiceSpy.notifyChange).toHaveBeenCalled();
      }));
    });
  });

  describe('Duplicate version', () => {
    it('should duplicate version', async () => {
      await sut.duplicateVersion('duplicate', 2);

      expect(versionsServiceMock.createVersion).toHaveBeenCalledWith(
        contextService.itemId,
        contextService.language,
        contextService.siteName,
        'duplicate',
        2,
      );
    });

    it('should update context if duplicate version operation is success', async () => {
      versionsServiceMock.createVersion.and.returnValue(of({ success: true, itemId: contextItemId }));
      contextService.setTestItemId(contextItemId);
      const updateContextSpy = spyOn(contextService, 'updateContext').and.callThrough();
      await sut.duplicateVersion('duplicate', 2);

      expect(updateContextSpy).toHaveBeenCalled();
    });

    it('should not update context if duplicate version operation is success but context has changed', async () => {
      versionsServiceMock.createVersion.and.returnValue(of({ success: true, itemId: contextItemId }));
      const updateContextSpy = spyOn(contextService, 'updateContext').and.callThrough();

      const duplicateResult = sut.duplicateVersion('duplicate', 2);
      contextService.setTestItemId('new contect item id');
      await duplicateResult;

      expect(updateContextSpy).not.toHaveBeenCalled();
    });

    it('should show error message WHEN duplicate request fails', async () => {
      versionsServiceMock.createVersion.and.returnValue(of({ success: false }));

      await sut.duplicateVersion('', 2);

      expect(timedNotificationsServiceSpy.push).toHaveBeenCalledOnceWith(
        'DuplicateVersionError-2',
        'VERSIONS.MENU.DUPLICATE_ERROR',
        'error',
      );
    });
  });

  describe('Remove version', () => {
    it('should remove version', async () => {
      await sut.deleteVersion(2);

      expect(versionsServiceMock.removeVersion).toHaveBeenCalledWith(
        contextService.itemId,
        contextService.language,
        contextService.siteName,
        2,
      );
    });

    it('should notify change if delete version operation is success', async () => {
      versionsServiceMock.removeVersion.and.returnValue(of({ success: true, itemId: contextItemId }));
      contextService.setTestItemId(contextItemId);
      await sut.deleteVersion(2);

      expect(itemChangeServiceSpy.notifyChange).toHaveBeenCalled();
      expect(itemChangeServiceSpy.notifyChange).toHaveBeenCalledWith(contextItemId, ['versions', 'workflow']);
    });

    it('should not update context if delete version operation is success but context has changed', async () => {
      versionsServiceMock.removeVersion.and.returnValue(of({ success: true, itemId: contextItemId }));

      const updateContextSpy = spyOn(contextService, 'updateContext').and.callThrough();
      const deleteResult = sut.deleteVersion(2);
      contextService.setTestItemId('new context item id');
      await deleteResult;

      expect(updateContextSpy).not.toHaveBeenCalled();
    });

    it('should show error message WHEN remove request fails', async () => {
      versionsServiceMock.removeVersion.and.returnValue(of({ success: false }));

      await sut.deleteVersion(2);

      expect(timedNotificationsServiceSpy.push).toHaveBeenCalledOnceWith(
        'RemoveVersionError',
        'VERSIONS.MENU.REMOVE_ERROR',
        'error',
      );
    });
  });

  describe('Rename version', () => {
    it('should not invoke call to renameVersion if currentVersion is null', async () => {
      const versionToUpdate = undefined;
      await sut.renameVersion(versionToUpdate, 'New version name');

      expect(versionsServiceMock.renameVersion).not.toHaveBeenCalled();
    });

    it('should rename version', async () => {
      const versionToUpdate = getTestVersionsInfo().versions[1] as any;

      await sut.renameVersion(versionToUpdate, 'New version name');

      expect(versionsServiceMock.renameVersion).toHaveBeenCalledWith(
        contextService.itemId,
        versionToUpdate.versionNumber,
        'New version name',
        contextService.language,
        contextService.siteName,
      );
    });

    it('should show error notification if rename request fails', async () => {
      versionsServiceMock.renameVersion.and.returnValue(of({ success: false }));
      const versionToUpdate = getTestVersionsInfo().versions[1] as any;

      await sut.renameVersion(versionToUpdate, 'New version name');

      expect(timedNotificationsServiceSpy.push).toHaveBeenCalledWith(
        'RenameVersionError',
        'VERSIONS.RENAME.ERROR',
        'error',
      );
    });
  });

  describe('setPublishSettings', () => {
    it('should set publishing settings for the version', async () => {
      const validFrom = new Date('2020-01-09T12:05:14.815Z').toISOString();
      const validTo = new Date('2020-09-09T12:07:05.816Z').toISOString();
      const versionToPublish = getTestVersionsInfo().versions[1] as any;

      await sut.setPublishSettings(versionToPublish, validFrom, validTo, true);

      expect(versionsServiceMock.setPublishingSettings).toHaveBeenCalled();
      expect(versionsServiceMock.setPublishingSettings).toHaveBeenCalledWith(
        contextItemId,
        2,
        validFrom,
        validTo,
        true,
        'pt-BR',
        'sitecore1',
      );
    });

    it('should notify change if setPublishSettings operation is success', async () => {
      versionsServiceMock.setPublishingSettings.and.returnValue(of({ success: true }));
      const versionToPublish = getTestVersionsInfo().versions[1] as any;

      await sut.setPublishSettings(versionToPublish, '', '', true);

      expect(itemChangeServiceSpy.notifyChange).toHaveBeenCalled();
      expect(itemChangeServiceSpy.notifyChange).toHaveBeenCalledWith(contextItemId, ['versions', 'workflow']);
    });

    it('should show time notification if publish version failed', async () => {
      versionsServiceMock.setPublishingSettings.and.returnValue(of({ success: false }));
      const versionToPublish = getTestVersionsInfo().versions[1] as any;

      await sut.setPublishSettings(versionToPublish, '', '', true);

      expect(timedNotificationsServiceSpy.push).toHaveBeenCalled();
      expect(timedNotificationsServiceSpy.push).toHaveBeenCalledWith(
        jasmine.anything(),
        jasmine.any(Observable),
        'error',
      );
    });

    it('should not invoke call to setPublishingSettings if versionToPublish is null', async () => {
      const versionToUpdate = undefined;
      await sut.setPublishSettings(versionToUpdate, '', '', true);

      expect(versionsServiceMock.setPublishingSettings).not.toHaveBeenCalled();
    });
  });
});
