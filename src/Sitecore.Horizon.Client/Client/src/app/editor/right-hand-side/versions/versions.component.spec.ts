/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { A11yModule } from '@angular/cdk/a11y';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import {
  DroplistModule,
  HeaderWithButtonModule,
  IconButtonModule,
  ListModule,
  LoadingIndicatorModule,
  PopoverModule,
} from '@sitecore/ng-spd-lib';
import { SlideInPanelModule } from 'app/component-lib/slide-in-panel/slide-in-panel.module';
import {
  VersionDetails,
  VersionsInfo,
  VersionsWorkflowService,
} from 'app/editor/shared/versions-workflow/versions-workflow.service';
import {
  ContextServiceTesting,
  ContextServiceTestingModule,
  DEFAULT_TEST_CONTEXT,
} from 'app/shared/client-state/context.service.testing';
import { ItemChange, ItemChangeService } from 'app/shared/client-state/item-change-service';
import { WarningDialogModule } from 'app/shared/dialogs/warning-dialog/warning-dialog.module';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { AppLetModule } from 'app/shared/utils/let-directive/let.directive';
import { DatePipeMockModule } from 'app/testing/date-pipe-testing.module';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { BehaviorSubject, ReplaySubject, Subject, firstValueFrom, of } from 'rxjs';
import { CreateVersionComponent } from './create-version/create-version.component';
import { RenameVersionComponent } from './rename-version/rename-version.component';
import { VersionActionsDialogService } from './version-actions-dialog/version-actions-dialog.service';
import { VersionListComponent } from './version-list/version-list.component';
import { VersionPublishingSettingsComponent } from './version-publishing-settings/version-publishing-settings.component';
import { VersionsUtilService } from './versions-util.service';
import { VersionsComponent } from './versions.component';

describe(VersionsComponent.name, () => {
  let sut: VersionsComponent;
  let fixture: ComponentFixture<VersionsComponent>;
  let de: DebugElement;
  let contextService: ContextServiceTesting;
  let timedNotificationsServiceSpy: jasmine.SpyObj<TimedNotificationsService>;
  let itemChangeServiceSpy: jasmine.SpyObj<ItemChangeService>;
  let itemChanges$: Subject<ItemChange>;

  let versionsServiceMock: jasmine.SpyObj<VersionsWorkflowService>;
  let versionActionsDialogServiceSpy: jasmine.SpyObj<VersionActionsDialogService>;
  let watchVersionsMock: BehaviorSubject<VersionsInfo>;
  let watchLoadingMock: BehaviorSubject<boolean>;
  let activeVersion$: Subject<VersionDetails | undefined>;

  // Test data and utilities
  const versionButtonEl = () => de.query(By.css('#versionListBtn')).nativeElement;

  const versionListCompInstance = () => de.query(By.directive(VersionListComponent)).componentInstance;

  const versionLists = () => de.queryAll(By.css('.list-container [ngSpdListItem]'));

  const popoverEl = () => de.queryAll(By.css('ng-spd-popover'));

  const getContextMenu = () => de.queryAll(By.css('.list-container .context-menu button'));

  const createAction = () => {
    versionButtonEl().click();
    fixture.detectChanges();
    const createBtn = () => de.query(By.css('.footer-section button')).nativeElement;
    createBtn().click();
    fixture.detectChanges();
    return;
  };

  const duplicateAction = (itemVersion: number) => {
    versionButtonEl().click();
    fixture.detectChanges();
    getContextMenu()[itemVersion].nativeElement.click();
    fixture.detectChanges();
    const duplicateBtn = popoverEl()[1].queryAll(By.css('ng-spd-list button'))[2];
    duplicateBtn.nativeElement.click();
    fixture.detectChanges();
    return;
  };

  const renameAction = (itemVersion: number) => {
    versionButtonEl().click();
    fixture.detectChanges();
    getContextMenu()[itemVersion].nativeElement.click();
    fixture.detectChanges();
    const renameBtn = popoverEl()[1].queryAll(By.css('ng-spd-list button'))[0];
    renameBtn.nativeElement.click();
    fixture.detectChanges();
    return;
  };

  const deleteAction = (itemVersion: number) => {
    versionButtonEl().click();
    fixture.detectChanges();
    getContextMenu()[itemVersion].nativeElement.click();
    fixture.detectChanges();
    const deleteBtn = popoverEl()[1].queryAll(By.css('ng-spd-list button'))[3];
    deleteBtn.nativeElement.click();
    fixture.detectChanges();
    return;
  };

  const publishSettingAction = (itemVersion: number) => {
    versionButtonEl().click();
    fixture.detectChanges();
    getContextMenu()[itemVersion].nativeElement.click();
    fixture.detectChanges();
    const publishSettingBtn = popoverEl()[1].queryAll(By.css('ng-spd-list button'))[1];
    publishSettingBtn.nativeElement.click();
    fixture.detectChanges();
    return;
  };

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
          name: '',
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

  const ConfirmInDialog = () =>
    (document.querySelector('ng-spd-dialog-actions button:nth-child(2)') as HTMLButtonElement).click();

  const CancelInDialog = () => (document.querySelector('ng-spd-dialog-actions button') as HTMLButtonElement).click();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ContextServiceTestingModule,
        TranslateModule,
        TranslateServiceStubModule,
        AppLetModule,
        NoopAnimationsModule,
        SlideInPanelModule,
        PopoverModule,
        IconButtonModule,
        ListModule,
        FormsModule,
        LoadingIndicatorModule,
        WarningDialogModule,
        HeaderWithButtonModule,
        PipesModule,
        DatePipeMockModule,
        DroplistModule,
        A11yModule,
      ],
      declarations: [
        VersionsComponent,
        VersionListComponent,
        CreateVersionComponent,
        RenameVersionComponent,
        VersionPublishingSettingsComponent,
      ],
      providers: [
        {
          provide: TimedNotificationsService,
          useValue: jasmine.createSpyObj<TimedNotificationsService>('TimedNotificationsService', [
            'push',
            'hideNotificationById',
          ]),
        },
        {
          provide: ItemChangeService,
          useValue: jasmine.createSpyObj<ItemChangeService>(['watchForChanges', 'notifyChange']),
        },
        {
          provide: VersionActionsDialogService,
          useValue: jasmine.createSpyObj<VersionActionsDialogService>('VersionActionsDialogService', [
            'showCreateVersionDialog',
            'showDuplicateVersionDialog',
            'showPublishingSettingDialog',
            'showRenameVersionDialog',
          ]),
        },
      ],
    })
      .overrideComponent(VersionsComponent, {
        set: {
          providers: [
            {
              provide: VersionsWorkflowService,
              useValue: jasmine.createSpyObj<VersionsWorkflowService>('VersionsService', [
                'createVersion',
                'renameVersion',
                'removeVersion',
                'setPublishingSettings',
                'watchVersionsLoading',
                'watchVersionsAndWorkflow',
                'watchActiveVersion',
              ]),
            },
            VersionsUtilService,
          ],
        },
      })
      .compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideDefaultTestContext();

    timedNotificationsServiceSpy = TestBedInjectSpy(TimedNotificationsService);
    itemChangeServiceSpy = TestBedInjectSpy(ItemChangeService);
    versionActionsDialogServiceSpy = TestBedInjectSpy(VersionActionsDialogService);

    fixture = TestBed.createComponent(VersionsComponent);
    de = fixture.debugElement;
    sut = fixture.componentInstance;

    versionsServiceMock = fixture.debugElement.injector.get(VersionsWorkflowService) as any;

    // Default versions context
    contextService.setTestItemVersion(2);

    watchVersionsMock = new BehaviorSubject(getTestVersionsInfo());
    versionsServiceMock.watchVersionsAndWorkflow.and.returnValue(watchVersionsMock as any);

    itemChangeServiceSpy.notifyChange.and.callFake(() => watchVersionsMock.next(watchVersionsMock.value));

    watchLoadingMock = new BehaviorSubject<boolean>(false);
    versionsServiceMock.watchVersionsLoading.and.returnValue(watchLoadingMock);

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

    activeVersion$ = new ReplaySubject<VersionDetails | undefined>(1);
    versionsServiceMock.watchActiveVersion.and.returnValue(activeVersion$);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should show popover on version button click', () => {
    versionButtonEl().click();
    fixture.detectChanges();

    const popoverContent = popoverEl()[0].query(By.css('.list-container'));

    expect(popoverEl().length).toEqual(1);
    expect(popoverEl()[0]).toBeDefined();
    expect(popoverContent).toBeTruthy();
  });

  describe('Active version', () => {
    it('should show active version name on the header', async () => {
      const activeVersion = getTestVersionsInfo().versions[0];
      activeVersion$.next(activeVersion);

      sut.ngOnInit();
      fixture.detectChanges();

      const headerEl = fixture.debugElement.query(By.css('.header')).nativeElement;

      expect(headerEl.innerText).toEqual('name1');
    });

    it('should show text `Version` and versionNumber if active version name is not defined', () => {
      const activeVersion = getTestVersionsInfo().versions[1];
      activeVersion$.next(activeVersion);

      sut.ngOnInit();
      fixture.detectChanges();

      const headerEl = fixture.debugElement.query(By.css('.header')).nativeElement;

      expect(headerEl.innerText).toEqual('VERSIONS.VERSION 2');
    });

    it('should show `Versions` on top bar if active version does not exist', () => {
      activeVersion$.next(undefined);

      sut.ngOnInit();
      fixture.detectChanges();

      const headerEl = fixture.debugElement.query(By.css('.header')).nativeElement;

      expect(headerEl.innerText).toEqual('VERSIONS.HEADER');
    });
  });

  describe('Versions list', () => {
    it('should pass versions to version-list component', async () => {
      versionButtonEl().click();
      fixture.detectChanges();

      const versions = await firstValueFrom(sut.versions$);

      expect(versionListCompInstance().list).toEqual(versions);
    });

    it('should pass active version number to version-list component', async () => {
      versionButtonEl().click();
      fixture.detectChanges();
      const sampleVersion = getTestVersionsInfo().versions[0];
      activeVersion$.next(sampleVersion);

      fixture.detectChanges();
      await fixture.whenStable();

      expect(versionListCompInstance().active).toEqual(1);
    });

    it('should pass loading state to version-list component', async () => {
      versionButtonEl().click();
      fixture.detectChanges();

      const loadingState = await firstValueFrom(sut.loading$);

      expect(versionListCompInstance().isLoading).toEqual(loadingState);
    });

    it('should update context when selected version is changed', async () => {
      contextService.setTestItemVersion(1);
      versionButtonEl().click();
      fixture.detectChanges();

      const updateContextSpy = spyOn(contextService, 'updateContext').and.callThrough();
      versionLists()[0].nativeElement.click();
      fixture.detectChanges();

      expect(updateContextSpy).toHaveBeenCalled();
      expect(updateContextSpy).toHaveBeenCalledOnceWith({ itemVersion: 2 });
    });

    it('should not update contex if selected version is contex version', async () => {
      contextService.setTestItemVersion(1);
      versionButtonEl().click();
      fixture.detectChanges();

      const updateContextSpy = spyOn(contextService, 'updateContext').and.callThrough();
      versionLists()[1].nativeElement.click();
      fixture.detectChanges();

      expect(updateContextSpy).not.toHaveBeenCalled();
    });
  });

  describe('Context Menu', () => {
    it('should open context menu popover on the menu button click', () => {
      versionButtonEl().click();
      fixture.detectChanges();
      getContextMenu()[0].nativeElement.click();
      fixture.detectChanges();

      expect(popoverEl().length).toEqual(2);
    });

    it('should disable action buttons if user has no write permission', () => {
      const versionsInfoWithoutWritePermission = getTestVersionsInfo();
      versionsInfoWithoutWritePermission.permissions.canWrite = false;
      watchVersionsMock.next(versionsInfoWithoutWritePermission);

      itemChanges$.next({ itemId: DEFAULT_TEST_CONTEXT.itemId, scopes: ['versions'] });

      versionButtonEl().click();
      fixture.detectChanges();

      getContextMenu()[0].nativeElement.click();
      fixture.detectChanges();

      const actionsButtons = popoverEl()[1].queryAll(By.css('ng-spd-list button'));

      expect(actionsButtons.map((item) => item.nativeElement.disabled)).toEqual([true, true, true, true]);
    });

    it('should disable delete button If user has no delete permission', () => {
      const versionsInfoWithoutWritePermission = getTestVersionsInfo();
      versionsInfoWithoutWritePermission.permissions.canDelete = false;
      watchVersionsMock.next(versionsInfoWithoutWritePermission);
      itemChanges$.next({ itemId: DEFAULT_TEST_CONTEXT.itemId, scopes: ['versions'] });

      versionButtonEl().click();
      fixture.detectChanges();

      getContextMenu()[0].nativeElement.click();
      fixture.detectChanges();

      const deleteActionBtn = popoverEl()[1].queryAll(By.css('ng-spd-list button'))[3];

      expect(deleteActionBtn.nativeElement.disabled).toBe(true);
    });

    it('should disable publishing settings button If user has no publish permission', () => {
      const versionsInfoWithoutWritePermission = getTestVersionsInfo();
      versionsInfoWithoutWritePermission.permissions.canPublish = false;
      watchVersionsMock.next(versionsInfoWithoutWritePermission);
      itemChanges$.next({ itemId: DEFAULT_TEST_CONTEXT.itemId, scopes: ['versions'] });

      versionButtonEl().click();
      fixture.detectChanges();

      getContextMenu()[0].nativeElement.click();
      fixture.detectChanges();

      const publishSettingBtn = popoverEl()[1].queryAll(By.css('ng-spd-list button'))[1];

      expect(publishSettingBtn.nativeElement.disabled).toBe(true);
    });
  });

  describe('Create version', () => {
    it('should show create version dialog', () => {
      createAction();
      expect(versionActionsDialogServiceSpy.showCreateVersionDialog).toHaveBeenCalled();
    });

    it('should disable create new button when user has no permissions', () => {
      const versionsInfoWithoutWritePermission = getTestVersionsInfo();
      versionsInfoWithoutWritePermission.permissions.canWrite = false;
      watchVersionsMock.next(versionsInfoWithoutWritePermission);

      itemChanges$.next({ itemId: DEFAULT_TEST_CONTEXT.itemId, scopes: ['versions'] });
      versionButtonEl().click();
      fixture.detectChanges();

      const createNewBtn = de.query(By.css('.footer-section button')).nativeElement;

      expect(createNewBtn.disabled).toBe(true);
    });
  });

  describe('Duplicate version', () => {
    it('should show duplicate version dialog', () => {
      // Since list in version are reversed
      const versionToDuplicate = getTestVersionsInfo().versions[0];

      duplicateAction(1);
      fixture.detectChanges();

      expect(versionActionsDialogServiceSpy.showDuplicateVersionDialog).toHaveBeenCalled();
      expect(versionActionsDialogServiceSpy.showDuplicateVersionDialog).toHaveBeenCalledWith(versionToDuplicate);
    });
  });

  describe('Rename version', () => {
    it('should show rename version dialog', () => {
      const versionToRename = getTestVersionsInfo().versions[0];

      renameAction(1);
      fixture.detectChanges();

      expect(versionActionsDialogServiceSpy.showRenameVersionDialog).toHaveBeenCalled();
      expect(versionActionsDialogServiceSpy.showRenameVersionDialog).toHaveBeenCalledWith(versionToRename);
    });
  });

  describe('Delete action', () => {
    it('should remove version', async () => {
      deleteAction(0);
      await fixture.whenStable();

      ConfirmInDialog();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(versionsServiceMock.removeVersion).toHaveBeenCalledWith(
        contextService.itemId,
        contextService.language,
        contextService.siteName,
        2,
      );
    });

    it('should not remove version when action is canceled in confirmation dialog', async () => {
      deleteAction(0);
      await fixture.whenStable();
      fixture.detectChanges();

      CancelInDialog();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(versionsServiceMock.removeVersion).not.toHaveBeenCalled();
    });

    it('should show error message WHEN remove request fails', async () => {
      versionsServiceMock.removeVersion.and.returnValue(of({ success: false }));

      deleteAction(0);
      await fixture.whenStable();
      fixture.detectChanges();

      ConfirmInDialog();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(timedNotificationsServiceSpy.push).toHaveBeenCalledOnceWith(
        'RemoveVersionError',
        'VERSIONS.MENU.REMOVE_ERROR',
        'error',
      );
    });
  });

  describe('Version publishing settings', () => {
    it('should should show publish setting dialog', async () => {
      publishSettingAction(1);
      await fixture.whenStable();
      fixture.detectChanges();

      const versionToPublish = getTestVersionsInfo().versions[0];
      const startDate = versionToPublish.validFrom;
      const endDate = versionToPublish.validTo;

      expect(versionActionsDialogServiceSpy.showPublishingSettingDialog).toHaveBeenCalled();
      expect(versionActionsDialogServiceSpy.showPublishingSettingDialog).toHaveBeenCalledWith(
        versionToPublish,
        startDate,
        endDate,
        versionToPublish.isAvailableToPublish,
      );
    });
  });
});
