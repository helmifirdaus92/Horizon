/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import {
  ContextServiceTesting,
  ContextServiceTestingModule,
  DEFAULT_TEST_CONTEXT,
} from 'app/shared/client-state/context.service.testing';
import { ItemChange, ItemChangeService } from 'app/shared/client-state/item-change-service';
import { Item } from 'app/shared/graphql/item.interface';
import { createSpyObserver, TestBedInjectSpy } from 'app/testing/test.utils';
import { NEVER, of, skip, Subject } from 'rxjs';
import { VersionsWorkflowService } from './versions-workflow.service';
import { VersionsDalService } from './versions.dal.service';
import { WorkflowDalService } from './workflow.dal.service';

describe(VersionsWorkflowService.name, () => {
  let sut: VersionsWorkflowService;
  let dalService: jasmine.SpyObj<VersionsDalService>;
  let context: ContextServiceTesting;
  let itemChangeServiceSpy: jasmine.SpyObj<ItemChangeService>;
  let itemChanges$: Subject<ItemChange>;
  let getContextItemSpy: jasmine.Spy<any>;
  let workflowDalService: jasmine.SpyObj<WorkflowDalService>;

  const dummyItemVersions = [
    {
      version: 1,
      versionName: 'versionName1',
      updatedBy: 'user1',
      updatedDate: '2021-09-07T11:18:55Z',
      publishing: {
        validFromDate: '2021-09-07T11:18:58Z',
        validToDate: '9999-12-31T23:59:59.9999999Z',
        isAvailableToPublish: true,
      },
      workflow: {
        displayName: 'workflowName1',
      },
      isLatestPublishableVersion: false,
    },
    {
      version: 2,
      versionName: 'versionName2',
      updatedBy: 'user2',
      updatedDate: '2021-09-07T11:19:21Z',
      publishing: {
        validFromDate: '2021-09-07T11:19:07Z',
        validToDate: '9999-12-31T23:59:59.9999999Z',
        isAvailableToPublish: true,
      },
      workflow: {
        displayName: 'workflowName2',
      },
      isLatestPublishableVersion: true,
    },
  ] as Item[];

  const dummyVersionsInfos = {
    versions: dummyItemVersions,
    permissions: {
      canWrite: true,
      canDelete: false,
      canPublish: false,
    },
  } as Item;

  const expectedWatchVersionResult = {
    versions: [
      {
        versionNumber: 1,
        name: 'versionName1',
        lastModifiedBy: 'user1',
        lastModifiedAt: '2021-09-07T11:18:55Z',
        validFrom: '2021-09-07T11:18:58Z',
        validTo: '9999-12-31T23:59:59.9999999Z',
        workflowState: 'workflowName1',
        isLatestPublishableVersion: false,
        isAvailableToPublish: true,
      },
      {
        versionNumber: 2,
        name: 'versionName2',
        lastModifiedBy: 'user2',
        lastModifiedAt: '2021-09-07T11:19:21Z',
        validFrom: '2021-09-07T11:19:07Z',
        validTo: '9999-12-31T23:59:59.9999999Z',
        workflowState: 'workflowName2',
        isLatestPublishableVersion: true,
        isAvailableToPublish: true,
      },
    ],
    permissions: {
      canWrite: true,
      canDelete: false,
      canPublish: false,
    },
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ContextServiceTestingModule],
      providers: [
        {
          provide: VersionsDalService,
          useValue: jasmine.createSpyObj<VersionsDalService>('VersionsDalService', [
            'addItemVersion',
            'deleteItemVersion',
            'renameItemVersion',
            'setPublishingSettings',
          ]),
        },
        {
          provide: ItemChangeService,
          useValue: jasmine.createSpyObj<ItemChangeService>(['watchForChanges', 'notifyChange']),
        },

        {
          provide: WorkflowDalService,
          useValue: jasmine.createSpyObj<WorkflowDalService>({
            executeCommand: NEVER,
          }),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    dalService = TestBedInjectSpy(VersionsDalService);

    context = TestBed.inject(ContextServiceTesting);
    context.provideDefaultTestContext();
    getContextItemSpy = spyOn(context, 'getItem').and.resolveTo(dummyVersionsInfos);

    itemChangeServiceSpy = TestBedInjectSpy(ItemChangeService);

    itemChanges$ = new Subject<ItemChange>();
    itemChangeServiceSpy.watchForChanges.and.returnValue(itemChanges$);

    workflowDalService = TestBedInjectSpy(WorkflowDalService);

    sut = new VersionsWorkflowService(dalService, context, itemChangeServiceSpy, workflowDalService);
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('watchVersionsAndWorkflow', () => {
    it('should return versions context', fakeAsync(() => {
      const resultSpyObserver = createSpyObserver();
      sut.watchVersionsAndWorkflow().subscribe(resultSpyObserver);
      tick();

      expect(resultSpyObserver.next).toHaveBeenCalledOnceWith(expectedWatchVersionResult);
      flush();
    }));

    it('should emit when context changes', fakeAsync(() => {
      const resultSpyObserver = createSpyObserver();

      // Skip first "default" emission
      sut.watchVersionsAndWorkflow().pipe(skip(1)).subscribe(resultSpyObserver);
      tick();

      // Provide item version here, because we skip emissions without version set
      context.provideTestValue({ itemId: 'new item', itemVersion: 2 });
      tick();

      expect(context.getItem).toHaveBeenCalled();
      expect(resultSpyObserver.next).toHaveBeenCalledOnceWith(expectedWatchVersionResult);
      flush();
    }));

    it('should watch for item changes in case "New version created"', fakeAsync(() => {
      const resultSpyObserver = createSpyObserver();

      // Skip first "default" emission
      sut.watchVersionsAndWorkflow().pipe(skip(1)).subscribe(resultSpyObserver);
      tick();
      itemChanges$.next({ itemId: DEFAULT_TEST_CONTEXT.itemId, scopes: ['versions'] });
      tick();

      expect(resultSpyObserver.next).toHaveBeenCalledOnceWith(expectedWatchVersionResult);
      flush();
    }));

    it('should watch for item changes in case "Workflow changed"', fakeAsync(() => {
      const resultSpyObserver = createSpyObserver();

      // Skip first "default" emission
      sut.watchVersionsAndWorkflow().pipe(skip(1)).subscribe(resultSpyObserver);
      tick();
      itemChanges$.next({ itemId: DEFAULT_TEST_CONTEXT.itemId, scopes: ['workflow'] });
      tick();

      expect(resultSpyObserver.next).toHaveBeenCalledOnceWith(expectedWatchVersionResult);
      flush();
    }));
  });

  describe('watchVersionsLoading', () => {
    it('should export loading status', fakeAsync(() => {
      let resolveGetPage: (value: Item) => void = () => {};
      getContextItemSpy.and.returnValue(
        new Promise((resolve) => {
          resolveGetPage = resolve;
        }),
      );
      const resultLoadingSpy = createSpyObserver();
      sut.watchVersionsLoading().subscribe(resultLoadingSpy);
      tick();

      // Initial value
      expect(resultLoadingSpy.next).toHaveBeenCalledOnceWith(false);
      resultLoadingSpy.next.calls.reset();

      // Loading is on the process
      sut.watchVersionsAndWorkflow().subscribe();
      tick();
      expect(resultLoadingSpy.next).toHaveBeenCalledOnceWith(true);
      resultLoadingSpy.next.calls.reset();

      // Loading is completed
      resolveGetPage(dummyVersionsInfos as Item);
      tick();
      expect(resultLoadingSpy.next).toHaveBeenCalledOnceWith(false);
      flush();
    }));
  });

  describe('createVersion', () => {
    it('should proxy request to the dal service', () => {
      const spyObserver = createSpyObserver();
      dalService.addItemVersion.and.returnValue(of({ success: true, itemVersion: dummyItemVersions[0].version }));

      sut.createVersion('path', 'language', 'site', 'name', 3).subscribe(spyObserver);

      expect(dalService.addItemVersion).toHaveBeenCalledWith({
        path: 'path',
        versionName: 'name',
        language: 'language',
        siteName: 'site',
        baseVersionNumber: 3,
      });
      expect(spyObserver.next).toHaveBeenCalledWith({
        success: true,
        itemVersion: dummyItemVersions[0].version,
      });
    });
  });

  describe('renameVersion', () => {
    it('should proxy request to the dal service', () => {
      const spyObserver = createSpyObserver();
      dalService.renameItemVersion.and.returnValue(of({ success: true }));

      sut.renameVersion('path', 3, 'newName', 'languageA', 'siteA').subscribe(spyObserver);

      expect(dalService.renameItemVersion).toHaveBeenCalledWith({
        path: 'path',
        versionNumber: 3,
        newName: 'newName',
        language: 'languageA',
        siteName: 'siteA',
      });
      expect(spyObserver.next).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('removeVersion', () => {
    it('should proxy request to the dal service', () => {
      const spyObserver = createSpyObserver();
      dalService.deleteItemVersion.and.returnValue(
        of({ success: true, latestPublishableVersionNumber: dummyItemVersions[0].version }),
      );

      sut.removeVersion('path', 'language', 'site', 3).subscribe(spyObserver);

      expect(dalService.deleteItemVersion).toHaveBeenCalledWith({
        path: 'path',
        versionNumber: 3,
        language: 'language',
        siteName: 'site',
      });
      expect(spyObserver.next).toHaveBeenCalledWith({
        success: true,
        latestPublishableVersionNumber: dummyItemVersions[0].version,
      });
    });
  });

  describe('setPublishingSettings', () => {
    it('should proxy request to the dal service', () => {
      const spyObserver = createSpyObserver();
      dalService.setPublishingSettings.and.returnValue(of({ success: true }));

      sut
        .setPublishingSettings('path', 2, '2021-09-07T11:19:21Z', '2021-09-09T12:20:00Z', true, 'en', 'site')
        .subscribe(spyObserver);

      expect(dalService.setPublishingSettings).toHaveBeenCalledWith({
        path: 'path',
        versionNumber: 2,
        validFromDate: '2021-09-07T11:19:21Z',
        validToDate: '2021-09-09T12:20:00Z',
        isAvailableToPublish: true,
        language: 'en',
        siteName: 'site',
      });
      expect(spyObserver.next).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('executeCommand()', () => {
    it('should notify itemChangeService about change', async () => {
      workflowDalService.executeCommand.and.returnValue(
        of({ completed: true, error: '', datasourcesCommandResult: [] }),
      );

      await sut.executeCommand('bar', 'baz', context);

      expect(itemChangeServiceSpy.notifyChange).toHaveBeenCalledWith(context.itemId, ['workflow', 'versions']);
    });
  });
});
