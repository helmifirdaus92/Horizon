/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { ContentTreeLocking } from 'app/pages/content-tree/content-tree-locking';
import { ContentTreeNode } from 'app/pages/content-tree/content-tree-node';
import { ContentTreePermissions } from 'app/pages/content-tree/content-tree-permissions';
import { ContentTreeService, DISPLAY_NAME_FIELD_ID } from 'app/pages/content-tree/content-tree.service';
import { Context } from 'app/shared/client-state/context.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { ItemChangeService } from 'app/shared/client-state/item-change-service';
import { BaseItemDalService } from 'app/shared/graphql/item.dal.service';
import { Item } from 'app/shared/graphql/item.interface';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { of } from 'rxjs';
import { PageRenamingComponent } from './page-rename.component';

describe('PageRenamingComponent', () => {
  let sut: PageRenamingComponent;
  let fixture: ComponentFixture<PageRenamingComponent>;
  let contentTreeServiceSpy: jasmine.SpyObj<ContentTreeService>;
  let contextService: ContextServiceTesting;
  let itemChangeServiceSpy: jasmine.SpyObj<ItemChangeService>;
  let timedNotificationsServiceSpy: jasmine.SpyObj<TimedNotificationsService>;
  let itemDalServiceSpy: jasmine.SpyObj<BaseItemDalService>;

  const inputs = () => fixture.debugElement.queryAll(By.css('input'));

  const mockItem: Item = {
    id: '123',
    name: 'OldItemName',
    version: 1,
    versionName: 'Version 1',
    versions: [],
    hasVersions: false,
    revision: 'rev123',
    updatedBy: 'admin',
    updatedDate: '2024-01-02T00:00:00Z',
    displayName: 'OldDisplayName',
    icon: 'icon-path',
    path: '/old-item-path',
    hasChildren: false,
    children: [],
    language: 'en',
    template: undefined,
    fields: [],
    isFolder: false,
    ancestors: [],
    workflow: null,
    isLatestPublishableVersion: true,
    creationDate: '2024-01-01T00:00:00Z',
    createdBy: 'admin',
    insertOptions: [],
    permissions: {
      canWrite: true,
      canDelete: false,
      canRename: true,
      canCreate: false,
      canPublish: false,
    },
    locking: {
      isLocked: false,
      lockedByCurrentUser: false,
    },
    publishing: {
      isPublishable: true,
      hasPublishableVersion: false,
      validFromDate: '',
      validToDate: '',
      isAvailableToPublish: false,
    },
    presentationDetails: '',
    layoutEditingKind: 'FINAL',
    route: '/old-item-route',
  };

  const mockContext = {
    itemId: '123',
    language: 'en',
    siteName: 'testSite',
    itemVersion: 1,
  };
  const mockContentTreeNode = new ContentTreeNode({
    id: '123',
    text: 'OldDisplayName',
    item: mockItem,
    permissions: mockItem.permissions,
    locking: mockItem.locking,
    parent: undefined,
    isFolder: false,
    hasChildren: false,
    enableEdit: true,
    hasVersions: false,
  });

  beforeEach(async () => {
    contentTreeServiceSpy = jasmine.createSpyObj('ContentTreeService', ['renamePage', 'getTreeItem']);
    itemChangeServiceSpy = jasmine.createSpyObj('ItemChangeService', ['notifyChange']);
    timedNotificationsServiceSpy = jasmine.createSpyObj('TimedNotificationsService', ['push']);
    itemDalServiceSpy = jasmine.createSpyObj('BaseItemDalService', {
      getItem: of(mockItem),
    });

    await TestBed.configureTestingModule({
      imports: [FormsModule, TranslateModule.forRoot(), ContextServiceTestingModule, PageRenamingComponent],
      providers: [
        { provide: ContentTreeService, useValue: contentTreeServiceSpy },
        { provide: ItemChangeService, useValue: itemChangeServiceSpy },
        { provide: TimedNotificationsService, useValue: timedNotificationsServiceSpy },
        { provide: BaseItemDalService, useValue: itemDalServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PageRenamingComponent);
    sut = fixture.componentInstance;

    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideTestValue({
      itemId: '123',
      language: 'en',
      siteName: 'testSite',
    });
    sut.context = mockContext as Context;
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should load current page details when context changes', fakeAsync(() => {
    contentTreeServiceSpy.getTreeItem.and.returnValue(mockContentTreeNode);

    sut.context = mockContext;
    tick();
    fixture.detectChanges();

    expect(sut.itemName).toBe('OldItemName');
    expect(sut.displayName).toBe('OldDisplayName');
  }));

  it('should trigger rename item name on blur', fakeAsync(() => {
    const renameResult = {
      renameItem: { id: '123', name: 'NewItemName' },
      updateItem: { id: '123', displayName: 'OldDisplayName' },
    };

    contentTreeServiceSpy.renamePage.and.returnValue(of(renameResult));
    contentTreeServiceSpy.getTreeItem.and.returnValue(mockContentTreeNode);

    sut.context = mockContext;

    tick();
    fixture.detectChanges();

    sut.itemName = 'NewItemName';
    sut.displayName = 'OldDisplayName';

    const itemNameInput = inputs()[0].nativeElement;
    itemNameInput.value = 'NewItemName';
    itemNameInput.dispatchEvent(new Event('input'));
    tick();

    itemNameInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    tick();

    expect(contentTreeServiceSpy.renamePage).toHaveBeenCalledWith(
      { itemId: '123', newName: 'NewItemName' },
      { itemId: '123', language: 'en', fields: [{ name: DISPLAY_NAME_FIELD_ID, value: 'OldDisplayName' }] },
      'en',
      'testSite',
    );
    expect(sut.itemName).toBe('NewItemName');
    expect(sut.displayName).toBe('OldDisplayName');
    expect(itemChangeServiceSpy.notifyChange).toHaveBeenCalledWith('123', ['display-name', 'name']);
  }));

  it('should trigger rename display name on blur', fakeAsync(() => {
    const renameResult = {
      renameItem: { id: '123', name: 'OldItemName' },
      updateItem: { id: '123', displayName: 'NewDisplayName' },
    };

    contentTreeServiceSpy.renamePage.and.returnValue(of(renameResult));
    contentTreeServiceSpy.getTreeItem.and.returnValue(mockContentTreeNode);

    sut.context = mockContext;

    tick();
    fixture.detectChanges();

    sut.itemName = 'OldItemName';
    sut.displayName = 'NewDisplayName';

    const displayNameInput = inputs()[1].nativeElement;
    displayNameInput.value = 'NewDisplayName';
    displayNameInput.dispatchEvent(new Event('input'));
    tick();

    displayNameInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    tick();

    expect(contentTreeServiceSpy.renamePage).toHaveBeenCalledWith(
      { itemId: '123', newName: 'OldItemName' },
      { itemId: '123', language: 'en', fields: [{ name: DISPLAY_NAME_FIELD_ID, value: 'NewDisplayName' }] },
      'en',
      'testSite',
    );
    expect(sut.itemName).toBe('OldItemName');
    expect(sut.displayName).toBe('NewDisplayName');
    expect(itemChangeServiceSpy.notifyChange).toHaveBeenCalledWith('123', ['display-name', 'name']);
  }));

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

      contextService.provideTestItemUpdate({
        id: 'bar',
        item: {} as Item,
        text: '',
        permissions: allowPermissions,
        locking: itemLocking,
        parent,
      } as any);
    });

    it('should enable the itemName and displayName inputs if not locked and permissions allow renaming', () => {
      const itemNameInput = fixture.nativeElement.querySelector('#itemName');
      const displayNameInput = fixture.nativeElement.querySelector('#displayName');

      fixture.detectChanges();

      expect(itemNameInput.disabled).toBeFalse();
      expect(displayNameInput.disabled).toBeFalse();
    });
  });

  describe('when user does not have permissions', () => {
    beforeEach(() => {
      const denyPermissions: ContentTreePermissions = {
        canWrite: true,
        canRename: false,
        canDelete: true,
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

      contextService.provideTestItemUpdate({
        id: 'bar',
        item: {} as Item,
        text: '',
        permissions: denyPermissions,
        locking: itemLocking,
        parent,
      } as any);
    });

    it('should disable the itemName and displayName inputs if the node is locked by another user', fakeAsync(() => {
      const itemNameInput = fixture.nativeElement.querySelector('#itemName');
      const displayNameInput = fixture.nativeElement.querySelector('#displayName');

      fixture.detectChanges();
      tick();

      expect(itemNameInput.disabled).toBeTrue();
      expect(displayNameInput.disabled).toBeTrue();
    }));
  });
});
