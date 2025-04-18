/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseHandle, DialogModule, ItemCardComponent, ItemCardModule } from '@sitecore/ng-spd-lib';
import { PageTemplatesService } from 'app/page-design/page-templates.service';
import { Item, ItemOperationOutput } from 'app/page-design/page-templates.types';
import { DirectivesModule } from 'app/shared/directives/directives/directives.module';
import { DialogCloseHandleStubModule } from 'app/testing/dialog-close-handle-stub.module';
import { createSpyObserver, nextTick, TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';

import { EmptyStateComponent } from 'app/page-design/empty-state/empty-state.component';
import { NotificationsModule } from 'app/shared/notifications/notifications.module';
import { adminPermissions } from '../page-templates-test-data';
import { MoveItemDialogComponent } from './move-item-dialog.component';

describe(MoveItemDialogComponent.name, () => {
  let sut: MoveItemDialogComponent;
  let fixture: ComponentFixture<MoveItemDialogComponent>;
  let closeHandle: jasmine.SpyObj<DialogCloseHandle>;
  let pageTemplatesServiceSpy: jasmine.SpyObj<PageTemplatesService>;

  const closeBtn = (): HTMLButtonElement => {
    return fixture.debugElement.query(By.css('ng-spd-dialog-close-button button')).nativeElement;
  };

  const cancelBtn = (): HTMLButtonElement => {
    return fixture.debugElement.query(By.css('ng-spd-dialog-actions [ngspdbutton="basic"]')).nativeElement;
  };

  const moveBtn = (): HTMLButtonElement => {
    return fixture.debugElement.query(By.css('ng-spd-dialog-actions [ngspdbutton="primary"]')).nativeElement;
  };

  const createFolderBtn = (): HTMLButtonElement => {
    return fixture.debugElement.query(By.css('ng-spd-dialog-actions [ngspdbutton="sliding"]')).nativeElement;
  };

  const folders = () => {
    return fixture.debugElement.queryAll(By.css('ng-spd-item-card'));
  };

  const moveItemResult: ItemOperationOutput = {
    successful: true,
    errorMessage: null,
    item: {
      path: '/path/to/item',
      displayName: 'item',
      itemId: 'item',
      name: 'item',
      version: 1,
      hasChildren: false,
      thumbnailUrl: 'thumbnail-url',
      hasPresentation: true,
      isFolder: false,
      insertOptions: [],
      createdDate: '20230428T111641Z',
      updatedDate: '20230429T111641Z',
      access: adminPermissions,
      children: undefined,
    },
  };

  const itemWithChildrenAndAncestors: Item = {
    path: '/path/to/item',
    displayName: 'item',
    itemId: 'itemId',
    name: 'item',
    version: 1,
    hasChildren: true,
    thumbnailUrl: 'thumbnail-url',
    hasPresentation: true,
    isFolder: true,
    insertOptions: [],
    createdDate: '20230428T111641Z',
    updatedDate: '20230429T111641Z',
    access: adminPermissions,
    children: [
      {
        path: '/path/to/item/child',
        displayName: 'child item',
        itemId: 'childItemId',
        name: 'child item',
        version: 1,
        hasChildren: false,
        thumbnailUrl: 'thumbnail-url',
        hasPresentation: true,
        isFolder: true,
        insertOptions: [],
        createdDate: '20230428T111641Z',
        updatedDate: '20230429T111641Z',
        access: adminPermissions,
        children: undefined,
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoveItemDialogComponent],
      imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        TranslateServiceStubModule,
        DialogCloseHandleStubModule,
        DialogModule,
        ItemCardModule,
        DirectivesModule,
        NotificationsModule,
        EmptyStateComponent,
      ],
      providers: [
        {
          provide: DialogCloseHandle,
          useValue: jasmine.createSpyObj<DialogCloseHandle>('DialogCloseHandle', ['close']),
        },
        {
          provide: PageTemplatesService,
          useValue: jasmine.createSpyObj<PageTemplatesService>('PageTemplatesService', [
            'moveItem',
            'getItemChildrenWithAncestors',
            'getMoveToPermissions',
          ]),
        },
      ],
    }).compileComponents();

    pageTemplatesServiceSpy = TestBedInjectSpy(PageTemplatesService);
    pageTemplatesServiceSpy.moveItem.and.returnValue(of(moveItemResult));
    pageTemplatesServiceSpy.getItemChildrenWithAncestors.and.returnValue(of(itemWithChildrenAndAncestors));
    pageTemplatesServiceSpy.getMoveToPermissions.and.returnValue(of(true));

    closeHandle = TestBedInjectSpy(DialogCloseHandle);
    fixture = TestBed.createComponent(MoveItemDialogComponent);
    sut = fixture.componentInstance;

    sut.itemId = 'itemId';
    sut.parentId = 'parentId';
    sut.rootId = 'pageDesignId';
    sut.itemName = 'itemName';
    sut.templateId = 'templateId';
    sut.language = 'lang1';

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('close dialog', () => {
    it(`should close dialog and complete onMove emitter subscribtions`, () => {
      const onMoveSpy = createSpyObserver();
      sut.onMove.subscribe(onMoveSpy);

      sut.close();

      expect(onMoveSpy.complete).toHaveBeenCalled();
      expect(closeHandle.close).toHaveBeenCalled();
    });

    it('should close the dialog on "X" button click', () => {
      closeBtn().click();
      fixture.detectChanges();

      expect(closeHandle.close).toHaveBeenCalled();
    });

    it('should close the dialog when `Cancel` button is clicked', () => {
      cancelBtn().click();
      fixture.detectChanges();

      expect(closeHandle.close).toHaveBeenCalled();
    });

    it('should close the dialog when press "Escape"', () => {
      const spy = spyOn(sut, 'close');
      const preventSpy = jasmine.createSpy();
      const event = { preventDefault: preventSpy, code: 'Escape' } as any;

      sut.onKeydownHandler(event);

      expect(preventSpy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Move item', () => {
    it('should disable move btn WHEN selectedfolder.itemId equals parentId', () => {
      pageTemplatesServiceSpy.getItemChildrenWithAncestors.and.returnValue(
        of({
          path: '/path/to',
          displayName: 'parent item',
          itemId: 'parentId',
          name: 'parent item',
          version: 1,
          hasChildren: true,
          thumbnailUrl: 'thumbnail-url',
          hasPresentation: true,
          isFolder: true,
          insertOptions: [],
          createdDate: '20230428T111641Z',
          updatedDate: '20230429T111641Z',
          access: adminPermissions,
          children: [
            {
              path: '/path/to/item',
              displayName: 'item',
              itemId: 'itemId',
              name: 'item',
              version: 1,
              hasChildren: false,
              thumbnailUrl: 'thumbnail-url',
              hasPresentation: true,
              isFolder: true,
              insertOptions: [],
              createdDate: '20230428T111641Z',
              updatedDate: '20230429T111641Z',
              access: adminPermissions,
              children: undefined,
            },
          ],
        }),
      );
      sut.navigateToFolder('parentId');
      fixture.detectChanges();

      expect(moveBtn().disabled).toBeTrue();
    });

    it('should disable move btn WHEN a new folder is being named', () => {
      const onMoveSpy = createSpyObserver();
      sut.onMove.subscribe(onMoveSpy);

      const folderToSelect = {
        path: '/path/to/item/child',
        displayName: 'child item',
        itemId: 'childItemId',
        name: 'child item',
        version: 1,
        hasChildren: false,
        thumbnailUrl: 'thumbnail-url',
        hasPresentation: true,
        isFolder: true,
        insertOptions: [],
        createdDate: '20230428T111641Z',
        updatedDate: '20230429T111641Z',
        access: adminPermissions,
        children: undefined,
      };

      pageTemplatesServiceSpy.getItemChildrenWithAncestors.and.returnValue(of(folderToSelect));
      sut.cardBeingEdited = 'childItemId';
      fixture.detectChanges();

      expect(moveBtn().disabled).toBeTrue();
    });

    it('should disable move btn WHEN user does not have the right permissions', async () => {
      const onMoveSpy = createSpyObserver();
      sut.onMove.subscribe(onMoveSpy);

      const folderToSelect = {
        path: '/path/to/item/child',
        displayName: 'child item',
        itemId: 'childItemId',
        name: 'child item',
        version: 1,
        hasChildren: false,
        thumbnailUrl: 'thumbnail-url',
        hasPresentation: true,
        isFolder: true,
        insertOptions: [],
        createdDate: '20230428T111641Z',
        updatedDate: '20230429T111641Z',
        access: adminPermissions,
        children: undefined,
      };

      pageTemplatesServiceSpy.getItemChildrenWithAncestors.and.returnValue(of(folderToSelect));
      pageTemplatesServiceSpy.getMoveToPermissions.and.returnValue(of(false));
      sut.navigateToFolder('childItemId');
      await nextTick();
      fixture.detectChanges();

      expect(moveBtn().disabled).toBeTrue();
    });

    it('should disable move btn WHEN folder name already exist on target level', async () => {
      sut.itemName = 'child item';
      sut.ngOnInit();
      await nextTick();

      expect(moveBtn().disabled).toBeTrue();
    });

    it('should move item to the selected folder', () => {
      const onMoveSpy = createSpyObserver();
      sut.onMove.subscribe(onMoveSpy);

      const folderToSelect = {
        path: '/path/to/item/child',
        displayName: 'child item',
        itemId: 'childItemId',
        name: 'child item',
        version: 1,
        hasChildren: false,
        thumbnailUrl: 'thumbnail-url',
        hasPresentation: true,
        isFolder: true,
        insertOptions: [],
        createdDate: '20230428T111641Z',
        updatedDate: '20230429T111641Z',
        access: adminPermissions,
        children: undefined,
      };

      pageTemplatesServiceSpy.getItemChildrenWithAncestors.and.returnValue(of(folderToSelect));
      sut.navigateToFolder('childItemId');
      fixture.detectChanges();

      moveBtn().click();

      expect(pageTemplatesServiceSpy.moveItem).toHaveBeenCalledWith('itemId', 'childItemId');
    });

    it('should show available child folders', () => {
      const shownFolders = folders();

      expect(shownFolders.length).toBe(1);
    });

    it('should select child folder', () => {
      const shownFolders = folders();
      (shownFolders[0].nativeElement as ItemCardComponent).click();

      expect(pageTemplatesServiceSpy.getItemChildrenWithAncestors).toHaveBeenCalledWith('childItemId', 'lang1');
    });

    it('temporary folder should not be selectable', () => {
      createFolderBtn().click();

      const tempFolder = folders()[0];
      (tempFolder.nativeElement as ItemCardComponent).click();

      expect(tempFolder.classes).not.toContain('clickable');
      expect(pageTemplatesServiceSpy.getItemChildrenWithAncestors).toHaveBeenCalledWith('parentId', 'lang1');
    });
  });
});
