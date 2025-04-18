/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { DialogOverlayService, ListModule, PopoverModule } from '@sitecore/ng-spd-lib';
import { LhsPanelComponent } from 'app/editor/lhs-panel/lhs-panel.component';
import { FeatureFlagsModule } from 'app/feature-flags/feature-flags.module';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { adminPermissions } from 'app/page-design/shared/page-templates-test-data';
import { CreateFolderService } from 'app/pages/left-hand-side/create-page/create-folder.service';
import { TemplateSelectionDialogService } from 'app/pages/left-hand-side/create-page/template-selection-dialog/template-selection-dialog.service';
import { PageSettingsDialogComponent } from 'app/pages/page-settings/page-settings-dialog.component';
import { ContextService } from 'app/shared/client-state/context.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { BaseItemDalService } from 'app/shared/graphql/item.dal.service';
import { Item } from 'app/shared/graphql/item.interface';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { Site, SiteService } from 'app/shared/site-language/site-language.service';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of, Subject } from 'rxjs';
import { ContentTreeLocking } from '../content-tree-locking';
import { ContentTreeNode } from '../content-tree-node';
import { ContentTreePermissions } from '../content-tree-permissions';
import { ContentTreeService } from '../content-tree.service';
import { ContentTreeContextComponent } from './content-tree-context.component';

@Component({
  selector: 'test-item-tree',
  template: ` <app-content-tree-context [node]="testNode" [rootNodesIds]="rootNodesIds"> </app-content-tree-context> `,
})
class TestComponent {
  testNode = ContentTreeNode.createEmpty();
  rootNodesIds = ['0', '1', '3'];
}

describe(ContentTreeContextComponent.name, () => {
  let testComponent: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  let sut: ContentTreeContextComponent;
  let componentDe: DebugElement;

  let lhsService: jasmine.SpyObj<CreateFolderService>;
  let testNode: ContentTreeNode;
  let templateSelectionDialogService: jasmine.SpyObj<TemplateSelectionDialogService>;
  let featureFlagsServiceSpy: jasmine.SpyObj<FeatureFlagsService>;
  let contextServiceSpy: jasmine.SpyObj<ContextService>;
  let valueSubject: Subject<{ itemId: string }>;

  function openContextMenu() {
    const openContextMenuButton = fixture.debugElement.query(By.css(`button[icon='dots-horizontal']`)).nativeElement;
    openContextMenuButton.click();
    fixture.detectChanges();
  }

  function getCreatePageBtn() {
    return componentDe.queryAll(By.css(`button[role='listitem']`))[0].nativeElement as HTMLButtonElement;
  }

  function getCreateFolderBtn() {
    return componentDe.queryAll(By.css(`button[role='listitem']`))[1].nativeElement as HTMLButtonElement;
  }

  function getDuplicateBtn() {
    return componentDe.queryAll(By.css(`button[role='listitem']`))[2].nativeElement as HTMLButtonElement;
  }

  function getDeleteBtn() {
    return componentDe.queryAll(By.css(`button[role='listitem']`))[5].nativeElement as HTMLButtonElement;
  }

  const contextMenuButtonList = () => componentDe.queryAll(By.css(`button[role='listitem']`));
  const createVersionButtonEl = () => fixture.debugElement.query(By.css('.add-version'));

  const sites: Site[] = [
    {
      id: '227bc0ff-6237-42b6-851f-49e68c1998e8',
      hostId: 'hostId 1',
      collectionId: '337bc0ff-6237-42b6-851f-49e68c1998e8',
      name: 'site-01',
      displayName: 'site-01',
      language: 'en',
      appName: '',
      layoutServiceConfig: '',
      renderingEngineEndpointUrl: '',
      renderingEngineApplicationUrl: '',
      pointOfSale: [],
      startItemId: 'startItemId',
      supportedLanguages: ['en'],
      properties: {
        isSxaSite: true,
        tagsFolderId: 'id001',
        isLocalDatasourcesEnabled: true,
      },
    },
  ];

  beforeEach(waitForAsync(() => {
    testNode = new ContentTreeNode({
      id: 'bar',
      item: {} as Item,
      text: '',
      locking: {
        lockedByCurrentUser: false,
        isLocked: false,
      },
      permissions: {
        canWrite: false,
        canDelete: false,
        canRename: false,
        canCreate: false,
      },
    });

    TestBed.configureTestingModule({
      imports: [
        TranslateModule,
        TranslateServiceStubModule,
        PopoverModule,
        BrowserAnimationsModule,
        ListModule,
        ContextServiceTestingModule,
        StaticConfigurationServiceStubModule,
        FeatureFlagsModule,
      ],
      declarations: [ContentTreeContextComponent, TestComponent],
      providers: [
        {
          provide: ContentTreeService,
          useValue: jasmine.createSpyObj<ContentTreeService>('ContentTreeService', ['renamePage']),
        },
        {
          provide: TemplateSelectionDialogService,
          useValue: jasmine.createSpyObj<TemplateSelectionDialogService>('TemplateSelectionDialogService', ['show']),
        },
        {
          provide: CreateFolderService,
          useValue: jasmine.createSpyObj<CreateFolderService>('CreateFolderService', [
            'startCreateOperation',
            'getInsertOptions',
          ]),
        },
        {
          provide: SiteService,
          useValue: jasmine.createSpyObj<SiteService>('siteService', {
            getSites: sites,
          }),
        },
        {
          provide: ConfigurationService,
          useValue: jasmine.createSpyObj<ConfigurationService>('ConfigurationService', [
            'isDeleteItemContextFieldsAvailable',
          ]),
        },
        {
          provide: BaseItemDalService,
          useValue: jasmine.createSpyObj<BaseItemDalService>({
            getItem: of({
              name: 'OldItemName',
              displayName: 'OldDisplayName',
              versions: [],
            } as any),
          }),
        },
        {
          provide: TimedNotificationsService,
          useValue: jasmine.createSpyObj<TimedNotificationsService>('TimedNotificationsService', [
            'pushNotification',
            'push',
          ]),
        },
        {
          provide: DialogOverlayService,
          useValue: jasmine.createSpyObj<DialogOverlayService>(['open']),
        },
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>(['isFeatureEnabled']),
        },
        {
          provide: ContextService,
          useValue: jasmine.createSpyObj<ContextService>(['getItem', 'updateContext']),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    TestBed.inject(ContextServiceTesting).provideDefaultTestContext();

    contextServiceSpy = TestBedInjectSpy(ContextService);
    contextServiceSpy.getItem.and.returnValue(Promise.resolve({ id: 'bar' } as Item));

    valueSubject = new Subject<{ itemId: string }>();

    Object.defineProperty(contextServiceSpy, 'value$', {
      get: () => valueSubject.asObservable(),
    });

    let mockItemId = 'bar';
    Object.defineProperty(contextServiceSpy, 'itemId', {
      get: () => mockItemId,
      set: (value: string) => {
        mockItemId = value;
      },
    });

    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    sut = fixture.debugElement.query(By.directive(ContentTreeContextComponent)).componentInstance;
    componentDe = fixture.debugElement;
    lhsService = TestBedInjectSpy(CreateFolderService);
    templateSelectionDialogService = TestBedInjectSpy(TemplateSelectionDialogService);
    templateSelectionDialogService.show.and.returnValue(of(true));

    featureFlagsServiceSpy = TestBedInjectSpy(FeatureFlagsService);
    featureFlagsServiceSpy.isFeatureEnabled.and.returnValue(true);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('when user has permissions', () => {
    beforeEach(() => {
      const allowPermissions: ContentTreePermissions = {
        canWrite: true,
        canDelete: true,
        canRename: true,
        canCreate: true,
      };

      const itemLocking: ContentTreeLocking = {
        lockedByCurrentUser: false,
        isLocked: false,
      };

      const parent = new ContentTreeNode({
        id: 'parent',
        item: {} as Item,
        text: '',
        permissions: allowPermissions,
        locking: itemLocking,
      });

      sut.node = new ContentTreeNode({
        id: 'bar',
        item: {} as Item,
        text: '',
        permissions: allowPermissions,
        locking: itemLocking,
        parent,
      });
    });

    it('should set canCreate to true', () => {
      expect(sut.canCreate).toBe(true);
    });

    it('should set canCreateSameLevel to true', () => {
      expect(sut.canCreateSameLevel).toBe(true);
    });

    it('should set canDelete to true', () => {
      expect(sut.canDelete).toBe(true);
    });
  });

  describe('when user does not have permissions', () => {
    beforeEach(() => {
      const denyPermissions: ContentTreePermissions = {
        canWrite: false,
        canDelete: false,
        canRename: false,
        canCreate: false,
      };

      const itemLocking: ContentTreeLocking = {
        lockedByCurrentUser: false,
        isLocked: false,
      };

      const parent = new ContentTreeNode({
        id: 'parent',
        item: {} as Item,
        text: '',
        permissions: denyPermissions,
        locking: itemLocking,
      });

      sut.node = new ContentTreeNode({
        id: 'bar',
        item: {} as Item,
        text: '',
        permissions: denyPermissions,
        locking: itemLocking,
        parent,
      });
    });

    it('should set canCreate to false', () => {
      expect(sut.canCreate).toBe(false);
    });

    it('should set canCreateSameLevel to false', () => {
      expect(sut.canCreateSameLevel).toBe(false);
    });

    it('should set canDelete to false', () => {
      expect(sut.canDelete).toBe(false);
    });
  });

  describe('when item is not locked', () => {
    beforeEach(() => {
      const denyPermissions: ContentTreePermissions = {
        canWrite: true,
        canDelete: true,
        canRename: true,
        canCreate: true,
      };

      const itemLocking: ContentTreeLocking = {
        lockedByCurrentUser: false,
        isLocked: false,
      };

      const parent = new ContentTreeNode({
        id: 'parent',
        item: {} as Item,
        text: '',
        permissions: denyPermissions,
        locking: itemLocking,
      });

      sut.node = new ContentTreeNode({
        id: 'bar',
        item: {} as Item,
        text: '',
        permissions: denyPermissions,
        locking: itemLocking,
        parent,
      });
    });

    it('should set lockedByCurrentUser to false', () => {
      expect(sut.isLockedByCurrentUser).toBeFalse();
    });

    it('should set isLocked to false', () => {
      expect(sut.isLocked).toBeFalse();
    });
  });

  describe('when item is locked by another user', () => {
    beforeEach(() => {
      const denyPermissions: ContentTreePermissions = {
        canWrite: true,
        canDelete: true,
        canRename: true,
        canCreate: true,
      };

      const itemLocking: ContentTreeLocking = {
        lockedByCurrentUser: false,
        isLocked: true,
      };

      const parent = new ContentTreeNode({
        id: 'parent',
        item: {} as Item,
        text: '',
        permissions: denyPermissions,
        locking: itemLocking,
      });

      sut.node = new ContentTreeNode({
        id: 'bar',
        item: {} as Item,
        text: '',
        permissions: denyPermissions,
        locking: itemLocking,
        parent,
      });
    });

    it('should set lockedByCurrentUser to true', () => {
      expect(sut.isLockedByCurrentUser).toBeFalse();
    });

    it('should set isLocked to true', () => {
      expect(sut.isLocked).toBeTrue();
    });
  });

  describe('createPageSameLevel()', () => {
    describe('when the node has a parent', () => {
      const parentId = 'foo';
      const parentName = 'parentName';
      beforeEach(() => {
        const parent = new ContentTreeNode({
          id: parentId,
          item: {} as Item,
          hasChildren: true,
          text: parentName,
          permissions: ContentTreePermissions.empty(),
          locking: ContentTreeLocking.empty(),
        });

        sut.node = new ContentTreeNode({
          parent,
          id: 'bar',
          item: {} as Item,
          text: '',
          permissions: ContentTreePermissions.empty(),
          locking: ContentTreeLocking.empty(),
        });
      });

      it('should show template selection dialog with id and name of parent', fakeAsync(() => {
        sut.createPageSameLevel();
        tick();

        expect(templateSelectionDialogService.show).toHaveBeenCalledWith(parentId, parentName);
        flush();
      }));
    });
  });

  describe('createPage()', () => {
    it('should show template selection dialog with node id and node text', fakeAsync(() => {
      sut.createPage();
      tick();

      expect(templateSelectionDialogService.show).toHaveBeenCalledWith(sut.node.id, sut.node.text);
      flush();
    }));
  });

  describe('createFolder()', () => {
    it('should call `create()` on the CreateFolderService with node id', () => {
      sut.createFolder();

      expect(lhsService.startCreateOperation).toHaveBeenCalledWith(sut.node.id);
    });
  });

  describe('openPageSettingsDialog()', () => {
    it('should show setting button in context menu when node is selected', () => {
      openContextMenu();

      const settingButton = componentDe.query(By.css('.page-setting'));

      expect(contextMenuButtonList().length).toBe(6);
      expect(settingButton).toBeTruthy();
    });

    it('should open dialog without updating context if targetItemId matches current context', async () => {
      contextServiceSpy.getItem.and.returnValue(Promise.resolve({ id: 'bar' } as Item));

      spyOn(LhsPanelComponent, 'show').and.stub();

      sut.openPageSettingsDialog('bar');

      valueSubject.next({ itemId: 'bar' });

      expect(contextServiceSpy.updateContext).not.toHaveBeenCalled();
      expect(LhsPanelComponent.show).toHaveBeenCalledWith(PageSettingsDialogComponent);
    });

    it('should update context and open dialog if targetItemId does not match current context', async () => {
      const targetItemId = 'foo';
      contextServiceSpy.getItem.and.returnValue(Promise.resolve({ id: 'bar' } as Item));

      spyOn(LhsPanelComponent, 'show').and.stub();

      sut.openPageSettingsDialog(targetItemId);

      valueSubject.next({ itemId: targetItemId });

      expect(contextServiceSpy.updateContext).toHaveBeenCalledWith({ itemId: targetItemId });
      expect(LhsPanelComponent.show).toHaveBeenCalledWith(PageSettingsDialogComponent);
    });

    it('should set correct write permission in page setting dialog', async () => {
      const permissions: ContentTreePermissions = {
        canWrite: false,
        canDelete: true,
        canRename: true,
        canCreate: true,
      };

      const itemLocking: ContentTreeLocking = {
        lockedByCurrentUser: false,
        isLocked: false,
      };

      const parent = new ContentTreeNode({
        id: 'parent',
        item: {} as Item,
        text: '',
        permissions,
        locking: itemLocking,
      });

      sut.node = new ContentTreeNode({
        id: 'bar',
        item: {} as Item,
        text: '',
        permissions,
        locking: itemLocking,
        parent,
      });

      openContextMenu();

      spyOn(LhsPanelComponent, 'show').and.stub();

      const settingButton = componentDe.query(By.css('.page-setting')).nativeElement;
      settingButton.click();
      fixture.detectChanges();

      await fixture.whenStable();

      expect(PageSettingsDialogComponent.canWrite).toBeTrue();
      expect(LhsPanelComponent.show).toHaveBeenCalledWith(PageSettingsDialogComponent);
    });
  });

  describe('popoverIsActive', () => {
    it('should change value on toggle', async () => {
      sut.node = testNode;
      fixture.detectChanges();

      expect(sut.popoverIsActive()).toBeFalse();

      const openContextMenuButton = fixture.debugElement.query(By.css(`button[icon='dots-horizontal']`)).nativeElement;
      openContextMenuButton.click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(sut.popoverIsActive()).toBeTrue();
    });
  });

  describe('context menu buttons', () => {
    it('should keep all buttons enabled when user has permissions and item is not locked by another user', async () => {
      const parent = new ContentTreeNode({
        id: 'parentId',
        item: {} as Item,
        hasChildren: true,
        text: '',
        permissions: {
          canWrite: true,
          canDelete: true,
          canRename: true,
          canCreate: true,
        },
        locking: ContentTreeLocking.empty(),
      });

      testNode = new ContentTreeNode({
        parent,
        id: 'bar',
        item: {} as Item,
        text: '',
        locking: {
          lockedByCurrentUser: false,
          isLocked: false,
        },
        permissions: {
          canWrite: true,
          canDelete: true,
          canRename: true,
          canCreate: true,
        },
      });

      testComponent.testNode = testNode;
      fixture.detectChanges();
      await fixture.whenStable();

      openContextMenu();

      await fixture.whenStable();

      const createPageBtn = getCreatePageBtn();

      expect(createPageBtn.disabled).toBe(false);
      expect(createPageBtn.title).toBe('');

      const duplicateBtn = getDuplicateBtn();

      expect(duplicateBtn.disabled).toBe(false);
      expect(duplicateBtn.title).toBe('');

      const createFolderBtn = getCreateFolderBtn();

      expect(createFolderBtn.disabled).toBe(false);
      expect(createFolderBtn.title).toBe('');

      const deleteBtn = getDeleteBtn();

      expect(deleteBtn.disabled).toBe(false);
      expect(deleteBtn.title).toBe('');
    });

    it('should disable all buttons when user has no permissions', async () => {
      const parent = new ContentTreeNode({
        id: 'parentId',
        item: {} as Item,
        hasChildren: true,
        text: '',
        permissions: {
          canWrite: false,
          canDelete: false,
          canRename: false,
          canCreate: false,
        },
        locking: ContentTreeLocking.empty(),
      });

      testNode = new ContentTreeNode({
        parent,
        id: 'bar',
        item: {} as Item,
        text: '',
        locking: {
          lockedByCurrentUser: true,
          isLocked: true,
        },
        permissions: {
          canWrite: false,
          canDelete: false,
          canRename: false,
          canCreate: false,
        },
      });

      testComponent.testNode = testNode;
      fixture.detectChanges();
      await fixture.whenStable();

      openContextMenu();

      await fixture.whenStable();

      const createPageBtn = getCreatePageBtn();

      expect(createPageBtn.disabled).toBe(true);
      expect(createPageBtn.title).toBe('EDITOR.CREATE_PAGE_INSUFFICIENT_PRIVILEGES');

      const duplicateBtn = getDuplicateBtn();

      expect(duplicateBtn.disabled).toBe(true);
      expect(duplicateBtn.title).toBe('EDITOR.DUPLICATE_ITEM_INSUFFICIENT_PRIVILEGES');

      const createFolderBtn = getCreateFolderBtn();

      expect(createFolderBtn.disabled).toBe(true);
      expect(createFolderBtn.title).toBe('EDITOR.CREATE_FOLDER_INSUFFICIENT_PRIVILEGES');

      const deleteBtn = getDeleteBtn();

      expect(deleteBtn.disabled).toBe(true);
      expect(deleteBtn.title).toBe('EDITOR.DELETE_ITEM.ERRORS.INSUFFICIENT_PRIVILEGES');
    });

    it('should disable delete button when locked by another user', async () => {
      const parent = new ContentTreeNode({
        id: 'parentId',
        item: {} as Item,
        hasChildren: true,
        text: '',
        permissions: {
          canWrite: true,
          canDelete: true,
          canRename: true,
          canCreate: true,
        },
        locking: ContentTreeLocking.empty(),
      });

      testNode = new ContentTreeNode({
        parent,
        id: 'bar',
        item: {} as Item,
        text: '',
        locking: {
          lockedByCurrentUser: false,
          isLocked: true,
        },
        permissions: {
          canWrite: true,
          canDelete: true,
          canRename: true,
          canCreate: true,
        },
      });

      testComponent.testNode = testNode;
      fixture.detectChanges();
      await fixture.whenStable();

      openContextMenu();

      await fixture.whenStable();

      const deleteBtn = getDeleteBtn();

      expect(deleteBtn.disabled).toBe(true);
      expect(deleteBtn.title).toBe('EDITOR.DELETE_ITEM.ERRORS.ITEM_IS_LOCKED');
    });

    it('should keep delete button enabled when locked by current user', async () => {
      const parent = new ContentTreeNode({
        id: 'parentId',
        item: {} as Item,
        hasChildren: true,
        text: '',
        permissions: {
          canWrite: true,
          canDelete: true,
          canRename: true,
          canCreate: true,
        },
        locking: ContentTreeLocking.empty(),
      });

      testNode = new ContentTreeNode({
        parent,
        id: 'bar',
        item: {} as Item,
        text: '',
        locking: {
          lockedByCurrentUser: true,
          isLocked: true,
        },
        permissions: {
          canWrite: true,
          canDelete: true,
          canRename: true,
          canCreate: true,
        },
      });

      testComponent.testNode = testNode;
      fixture.detectChanges();
      await fixture.whenStable();

      openContextMenu();

      await fixture.whenStable();

      const deleteBtn = getDeleteBtn();

      expect(deleteBtn.disabled).toBe(false);
      expect(deleteBtn.title).toBe('');
    });

    it('should disable delete button if item to delete is the start item for the site', () => {
      testNode = new ContentTreeNode({
        item: {} as Item,
        id: 'startItemId',
        text: '',
        locking: {
          lockedByCurrentUser: true,
          isLocked: true,
        },
        permissions: {
          canWrite: true,
          canDelete: true,
          canRename: true,
          canCreate: true,
        },
      });

      testComponent.testNode = testNode;
      fixture.detectChanges();
      openContextMenu();

      const deleteBtn = getDeleteBtn();

      expect(deleteBtn.disabled).toBe(true);
      expect(deleteBtn.title).toBe('EDITOR.DELETE_ITEM.START_ITEM');
    });

    it('should not disable delete button if item to delete is not the start item for the site', () => {
      testNode = new ContentTreeNode({
        item: {} as Item,
        id: 'bar',
        text: '',
        locking: {
          lockedByCurrentUser: true,
          isLocked: true,
        },
        permissions: {
          canWrite: true,
          canDelete: true,
          canRename: true,
          canCreate: true,
        },
      });

      testComponent.testNode = testNode;
      fixture.detectChanges();
      openContextMenu();

      const deleteBtn = getDeleteBtn();

      expect(deleteBtn.disabled).toBe(false);
      expect(deleteBtn.title).toBe('');
    });
  });

  describe('node version', () => {
    const testNode = (hasVersions: boolean) => {
      return {
        item: {} as Item,
        id: 'bar',
        itemName: '',
        text: '',
        locking: {
          lockedByCurrentUser: false,
          isLocked: false,
        },
        permissions: adminPermissions,
        enableEdit: false,
        isFolder: false,
        hasVersions,
      };
    };
    it('should show create version icon if node has no version ', () => {
      // Arrange
      testComponent.testNode = new ContentTreeNode(testNode(false));
      fixture.detectChanges();

      // Assert
      expect(createVersionButtonEl()).toBeDefined();
    });

    it('should not show create version icon if node has version ', () => {
      // Arrange
      testComponent.testNode = new ContentTreeNode(testNode(true));
      fixture.detectChanges();

      // Assert
      expect(createVersionButtonEl()).toBeNull();
    });

    it('should emit createVersionChange with node info on icon button click', () => {
      // Arrange
      spyOn(sut.createVersionChange, 'emit');
      const node = new ContentTreeNode(testNode(false));
      testComponent.testNode = node;
      fixture.detectChanges();

      // Act
      createVersionButtonEl().nativeElement.click();

      // Assert
      expect(sut.createVersionChange.emit).toHaveBeenCalledWith(node);
    });
  });
});
