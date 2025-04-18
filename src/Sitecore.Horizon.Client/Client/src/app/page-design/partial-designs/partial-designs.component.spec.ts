/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, ParamMap, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
  BreadcrumbModule,
  IconButtonModule,
  ItemCardModule,
  ListModule,
  LoadingIndicatorModule,
  PopoverModule,
  TabsModule,
} from '@sitecore/ng-spd-lib';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { WarningDialogModule } from 'app/shared/dialogs/warning-dialog/warning-dialog.module';
import { Item } from 'app/shared/graphql/item.interface';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { CmUrlModule } from 'app/shared/pipes/platform-url/cm-url.module';
import { CmUrlTestingModule } from 'app/shared/pipes/platform-url/cm-url.module.testing';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { AssetsPipeMockModule } from 'app/testing/assets-pipe-mock.module';
import { nextTick, TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { BehaviorSubject, firstValueFrom, of } from 'rxjs';
import { DesignSearchDalService } from '../design-search/design-search.dal.service';
import { PageDesignModule } from '../page-design.module';
import { PageTemplatesService } from '../page-templates.service';
import { AncestorWithSite, ItemWithSite } from '../page-templates.types';
import { CreateItemDialogService } from '../shared/create-item-dialog/create-item-dialog.service';
import { MoveItemDialogService } from '../shared/move-item-dialog/move-item-dialog.service';
import { adminPermissions, getPartialDesignsMocks, mockThumbnailUrl } from '../shared/page-templates-test-data';
import { combineChildren } from '../shared/page-templates-utils';
import { RenameItemDialogService } from '../shared/rename-item-dialog/rename-item-dialog.service';
import { TemplatesSharedSitesTabsComponent } from '../shared/templates-shared-sites-tabs/templates-shared-sites-tabs.component';
import { PartialDesignsNavigationService } from './partial-designs-navigation.service';
import { PartialDesignsComponent, TEMP_NEW_FOLDER_ID } from './partial-designs.component';

const Initial_Context = {
  itemId: 'itemId1',
  language: 'lang1',
  siteName: 'website1',
};

const partialItem = {
  path: '/path/to/root1/partial-design',
  displayName: 'Partial Design',
  itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
  name: 'PartialDesign',
  version: 1,
  hasChildren: false,
  thumbnailUrl: mockThumbnailUrl,
  hasPresentation: true,
  isFolder: false,
  insertOptions: [],
  createdDate: '20230428T111641Z',
  updatedDate: '20230429T111641Z',
  access: adminPermissions,
  children: undefined,
  siteName: 'website1',
};

const partialFolder = {
  path: '/path/to/root1',
  displayName: 'root1',
  itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
  name: 'root1',
  version: 1,
  hasChildren: true,
  thumbnailUrl: mockThumbnailUrl,
  hasPresentation: false,
  isFolder: true,
  insertOptions: [],
  createdDate: '20230428T111641Z',
  updatedDate: '20230429T111641Z',
  access: adminPermissions,
  siteName: 'website1',
};
const mockItems = [partialFolder, partialItem];

const currentRootItemId = 'currentRootItemId';
const sitePartialDesignFolderTemplateId = 'sitePartialDesignFolderTemplateId';
const sitePartialDesignTemplateId = 'sitePartialDesignTemplateId';
const partialDesignSubject = new BehaviorSubject<ItemWithSite[] | undefined>(undefined);

describe(PartialDesignsComponent.name, () => {
  let sut: PartialDesignsComponent;
  let fixture: ComponentFixture<PartialDesignsComponent>;
  let partialDesignsNavigationService: jasmine.SpyObj<PartialDesignsNavigationService>;
  let pageTemplatesService: jasmine.SpyObj<PageTemplatesService>;
  let contextService: ContextServiceTesting;
  let router: jasmine.SpyObj<Router>;
  let paramMapSubject: BehaviorSubject<ParamMap>;

  let createItemDialogServiceSpy: jasmine.SpyObj<CreateItemDialogService>;
  let renameItemDialogServiceSpy: jasmine.SpyObj<RenameItemDialogService>;
  let moveItemDialogServiceSpy: jasmine.SpyObj<MoveItemDialogService>;

  async function detectChanges() {
    fixture.detectChanges();
    await nextTick();
    fixture.detectChanges();
  }

  const getBreadcrumb = () => fixture.debugElement.query(By.directive(BreadcrumbComponent));

  const confirmInDialog = () =>
    (document.querySelector('ng-spd-dialog-actions button:nth-child(2)') as HTMLButtonElement).click();

  const cancelInDialog = () => (document.querySelector('ng-spd-dialog-actions button') as HTMLButtonElement).click();

  const getFolders = () => fixture.debugElement.queryAll(By.css('.flat-list ng-spd-item-card'));

  const getPartialDesigns = () => fixture.debugElement.queryAll(By.css('.design-list ng-spd-item-card'));

  const getContextMenu = () => fixture.debugElement.query(By.css('ng-spd-popover'));

  const getTabs = () => fixture.debugElement.query(By.directive(TemplatesSharedSitesTabsComponent));

  const getEditButton = () => fixture.debugElement.query(By.css('.partial-design-card-actions button:nth-child(1)'));

  const getCreateButton = () => fixture.debugElement.query(By.css('.sub-header-actions button:nth-child(1)'));

  const getPartialDesignContextMenuButtns = (itemIndex: number, buttonIndex: number) => {
    const itemCard = getPartialDesigns()[itemIndex];

    (itemCard.queryAll(By.css('.vertical-actions button'))[1].nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();

    const buttons = getContextMenu().queryAll(By.css('button'));
    return buttons[buttonIndex].nativeElement as HTMLButtonElement;
  };

  const clickOnFolderContextMenu = (itemIndex: number, buttonIndex: number) => {
    const itemCard = getFolders()[itemIndex];

    (itemCard.query(By.css('.main-actions button')).nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();

    const buttons = getContextMenu().queryAll(By.css('button'));
    buttons[buttonIndex].nativeElement.click();
  };

  const permissions = { canCreate: true, canWrite: true, canRename: true, canDelete: true, canPublish: true };

  function partialFolderItem(itemId = 'itemId') {
    return {
      path: '/path/to/root1',
      displayName: 'root1',
      itemId,
      name: 'root1',
      version: 1,
      hasChildren: true,
      thumbnailUrl: '',
      hasPresentation: false,
      isFolder: true,
      createdDate: '20230428T111641Z',
      updatedDate: '20230429T111641Z',
      access: adminPermissions,
      insertOptions: [],
      siteName: 'website',
    };
  }

  const breadcrumbItems: AncestorWithSite[] = [
    {
      itemId: 'itemId',
      displayName: 'Item 1',
      siteName: 'website',
    },
    {
      itemId: 'itemId-2',
      displayName: 'Item 2',
      siteName: 'website1',
    },
  ];

  beforeEach(waitForAsync(() => {
    paramMapSubject = new BehaviorSubject<ParamMap>(convertToParamMap({ folder_id: null }));

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        TranslateModule,
        TranslateServiceStubModule,
        PageDesignModule,
        ContextServiceTestingModule,
        PipesModule,
        AssetsPipeMockModule,
        CmUrlTestingModule,
        LoadingIndicatorModule,
        ListModule,
        ItemCardModule,
        CmUrlModule,
        BreadcrumbModule,
        WarningDialogModule,
        PopoverModule,
        IconButtonModule,
        ItemCardModule,
        NoopAnimationsModule,
        TabsModule,
      ],
      declarations: [PartialDesignsComponent],
      providers: [
        {
          provide: CreateItemDialogService,
          useValue: jasmine.createSpyObj<CreateItemDialogService>('CreateDesignItemDialogService', ['show']),
        },
        {
          provide: RenameItemDialogService,
          useValue: jasmine.createSpyObj<RenameItemDialogService>('RenameDesignItemDialogService', ['show']),
        },
        {
          provide: MoveItemDialogService,
          useValue: jasmine.createSpyObj<MoveItemDialogService>('MoveDesignItemDialogService', ['show']),
        },
        {
          provide: PageTemplatesService,
          useValue: jasmine.createSpyObj<PageTemplatesService>('PageTemplatesService', [
            'createItem',
            'renameItem',
            'deleteItem',
            'isPageTemplatesFeatureAvailable',
            'validateName',
            'showErrorMessage',
          ]),
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj<Router>({
            navigate: Promise.resolve(true),
          }),
        },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMapSubject.asObservable(),
          },
        },
        {
          provide: DesignSearchDalService,
          useValue: jasmine.createSpyObj<DesignSearchDalService>('DesignSearchDalService', ['search']),
        },
        {
          provide: SiteService,
          useValue: jasmine.createSpyObj<SiteService>('SiteService', ['getContextSite']),
        },
      ],
    })
      .overrideComponent(PartialDesignsComponent, {
        set: {
          providers: [
            {
              provide: PartialDesignsNavigationService,
              useValue: jasmine.createSpyObj('PartialDesignsNavigationService', [
                'watchItems',
                'navigateToFolder',
                'buildBreadCrumbTree',
                'changeSiteType',
                'clearSubscriptions',
                'currentRootItemId$',
                'siteItemTemplateId$',
                'siteFolderTemplateId$',
                'siteType$',
                'breadCrumbItems$',
                'hasSharedSite',
              ]),
            },
          ],
        },
      })
      .compileComponents();

    createItemDialogServiceSpy = TestBedInjectSpy(CreateItemDialogService);
    renameItemDialogServiceSpy = TestBedInjectSpy(RenameItemDialogService);
    moveItemDialogServiceSpy = TestBedInjectSpy(MoveItemDialogService);
    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideTestValue(Initial_Context);
    router = TestBedInjectSpy(Router);

    pageTemplatesService = TestBedInjectSpy(PageTemplatesService);
    pageTemplatesService.isPageTemplatesFeatureAvailable.and.returnValue(of(false));

    fixture = TestBed.createComponent(PartialDesignsComponent);
    sut = fixture.componentInstance;

    sut.ancestors$ = of(breadcrumbItems);
    sut.isNavLoading$ = new BehaviorSubject<boolean>(true);
    sut.siteType$ = of('current');
    sut.partialDesignAllItems$ = partialDesignSubject.asObservable();
    partialDesignSubject.next(mockItems);
    sut.hasSharedSite$ = of(false);
    partialDesignsNavigationService = fixture.debugElement.injector.get<PartialDesignsNavigationService>(
      PartialDesignsNavigationService,
    ) as any;

    partialDesignsNavigationService.currentRootItem$ = of(partialFolderItem(currentRootItemId));
    partialDesignsNavigationService.siteItemTemplateId$ = of(sitePartialDesignTemplateId);
    partialDesignsNavigationService.siteFolderTemplateId$ = of(sitePartialDesignFolderTemplateId);
    partialDesignsNavigationService.designRoots$ = of([{ itemId: 'test-id', siteName: 'site1' }]);

    spyOn(contextService, 'getItem').and.returnValue(Promise.resolve({ permissions } as Item));

    detectChanges();
  }));

  afterEach(() => {
    fixture.destroy();
  });

  describe('Partial design items', () => {
    it('should populate items when navigation service emits partial design items', () => {
      // Assert
      expect(sut.partialDesignItems).toEqual([partialItem]);
      expect(sut.partialDesignFolders).toEqual([partialFolder]);
      expect(partialDesignsNavigationService.watchItems).toHaveBeenCalled();
    });

    it('should populate shared site items when navigation service emits partial design items', async () => {
      // Arrange
      const expectedPartialItemSharedSite = {
        path: '/path/to/root1/partial-design/child1',
        displayName: 'Child 1',
        itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
        name: 'Child1',
        version: 1,
        hasChildren: false,
        thumbnailUrl: mockThumbnailUrl,
        hasPresentation: true,
        isFolder: false,
        insertOptions: [],
        createdDate: '20230428T111641Z',
        updatedDate: '20230429T111641Z',
        access: adminPermissions,
        children: [],
        siteName: 'sharedSite',
      };

      const expectedPartialDesignFolderSharedSite = {
        path: '/path/to/root1/partial-design/folder-item',
        displayName: 'folder',
        itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
        name: 'folderItem',
        version: 1,
        hasChildren: false,
        thumbnailUrl: mockThumbnailUrl,
        hasPresentation: true,
        isFolder: true,
        insertOptions: [],
        createdDate: '20230428T111641Z',
        updatedDate: '20230429T111641Z',
        access: adminPermissions,
        children: [],
        siteName: 'sharedSite',
      };

      const mockParitalDesigns = getPartialDesignsMocks();
      const partialDesignsAllItems = combineChildren(mockParitalDesigns, 'website1', 'shared');
      fixture.detectChanges();

      partialDesignSubject.next(partialDesignsAllItems);
      fixture.detectChanges();
      detectChanges();

      const partialDesignAllItems = await firstValueFrom(sut.partialDesignAllItems$);

      const partialDesignRootItems = partialDesignAllItems?.find((item) => item.isFolder === false);
      const partialDesignFolderItems = partialDesignAllItems?.find((item) => item.isFolder === true);

      // Assert
      expect(partialDesignsNavigationService.watchItems).toHaveBeenCalled();
      expect(partialDesignRootItems).toEqual(expectedPartialItemSharedSite);
      expect(partialDesignFolderItems).toEqual(expectedPartialDesignFolderSharedSite);
    });

    describe('expand folder', () => {
      it('should not navigate to active route if selected itemId is `TEMP_NEW_FOLDER_ID` ', () => {
        const folderToExpand = partialFolderItem(TEMP_NEW_FOLDER_ID);

        sut.expandFolder(folderToExpand);
        const selectItemSpy = spyOn(sut, 'selectItem');

        expect(partialDesignsNavigationService.navigateToFolder).not.toHaveBeenCalled();
        expect(selectItemSpy).not.toHaveBeenCalled();
      });

      it('should navigate to active route if selected itemId is not `TEMP_NEW_FOLDER_ID` ', () => {
        // Arrange
        const folderToExpand = partialFolderItem();
        const selectItemSpy = spyOn(sut, 'selectItem');

        // Act
        sut.expandFolder(folderToExpand);

        expect(partialDesignsNavigationService.navigateToFolder).toHaveBeenCalledWith(folderToExpand.itemId);
        expect(selectItemSpy).toHaveBeenCalled();
      });

      it('should select the item if the folder is not already selected', () => {
        // Arrange
        const folderToExpand = partialFolderItem();

        // Act
        sut.expandFolder(folderToExpand);

        // Assert
        expect(sut.selectedItem).toEqual(folderToExpand);
      });
    });

    describe('select item', () => {
      it('should show partial design details', () => {
        // Arrange
        const partialDesignItem = {
          path: '/path/to/root1/partial-design',
          displayName: 'Partial Design',
          itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
          name: 'PartialDesign',
          version: 1,
          hasChildren: false,
          thumbnailUrl: mockThumbnailUrl,
          hasPresentation: true,
          isFolder: false,
          insertOptions: [],
          createdDate: '20230428T111641Z',
          updatedDate: '20230429T111641Z',
          access: adminPermissions,
          children: undefined,
          siteName: 'website1',
        };

        // Act
        sut.selectItem(partialDesignItem);

        // Assert
        expect(sut.selectedItem).toEqual(partialDesignItem);
      });
    });

    describe('loadBreadcrumbData', () => {
      it('should navigate to ancestor item and update breadcrumb items correctly', async () => {
        // Arrange
        paramMapSubject.next(convertToParamMap({ folder_id: 'itemId' }));
        fixture.detectChanges();

        const item: BreadcrumbItem = { itemId: 'itemId', itemName: 'Item 1' };

        // Act
        await sut.loadBreadcrumbData(item);

        // Assert
        expect(partialDesignsNavigationService.navigateToFolder).toHaveBeenCalledOnceWith(item.itemId);
      });

      it('should retrieve breadcrumb items', fakeAsync(() => {
        // Arrange
        partialDesignsNavigationService.breadCrumbItems$ = of(breadcrumbItems);

        // Act
        sut.ngOnInit();
        tick();

        const expectedBreadcrumbItems = breadcrumbItems.map((item) => ({
          itemId: item.itemId,
          itemName: item.displayName,
        }));
        // Assert
        expect(sut.breadcrumbItems).toBeDefined();
        expect(sut.breadcrumbItems.length).toBe(2);
        expect(sut.breadcrumbItems).toEqual(expectedBreadcrumbItems as BreadcrumbItem[]);
        flush();
      }));
    });

    describe('createPartialDesign', () => {
      it('should open the create partial design dialog with required parameters', fakeAsync(() => {
        // Act
        sut.createPartialDesign();
        tick();

        // Assert
        expect(createItemDialogServiceSpy.show).toHaveBeenCalledWith({
          parentId: currentRootItemId,
          templateId: sitePartialDesignTemplateId,
          existingNames: [partialItem.displayName],
          language: contextService.language,
          type: 'partial-design',
        });
        flush();
      }));

      it('should navigate to editpartialdesign page and update the context when partial design is created successfully', fakeAsync(() => {
        createItemDialogServiceSpy.show.and.returnValue(of(partialItem));

        // Act
        sut.createPartialDesign();
        tick();

        // Assert
        expect(router.navigate).toHaveBeenCalledOnceWith(['/editpartialdesign'], {
          queryParams: {
            sc_itemid: partialItem.itemId,
            sc_version: partialItem.version,
          },
          queryParamsHandling: 'merge',
        });
        flush();
      }));
    });

    describe('renamePartialDesign', () => {
      it('should open the rename design item dialog with required parameters', fakeAsync(() => {
        // Act
        sut.renamePartialDesign(partialItem);
        tick();

        // Arrange
        expect(renameItemDialogServiceSpy.show).toHaveBeenCalledWith({
          itemId: partialItem.itemId,
          itemName: partialItem.displayName,
          existingNames: [partialItem.displayName],
        });
        flush();
      }));
    });

    describe('createTempFolderItem', () => {
      it('should add a temporary folder item to the folders list in edit mode', () => {
        // Act
        sut.createTempFolderItem();

        // Assert
        expect(sut.partialDesignFolders.length).toBe(2);
        expect(sut.partialDesignFolders[0].itemId).toBe(TEMP_NEW_FOLDER_ID);
        expect(sut.cardBeingEdited).toBe(TEMP_NEW_FOLDER_ID);
      });
    });

    describe('editPartialDesign', () => {
      it('should navigate to editpartialdesign page and update the context when partial design is created successfully', () => {
        // Act
        sut.editPartialDesign(partialItem);

        // Assert
        expect(router.navigate).toHaveBeenCalledOnceWith(['/editpartialdesign'], {
          queryParams: {
            sc_itemid: partialItem.itemId,
            sc_version: partialItem.version,
            siteName: partialItem.siteName,
          },
          queryParamsHandling: 'merge',
        });
      });

      it('should show edit button only when site type is current', () => {
        // Arrange
        sut.siteType$ = of('current');
        fixture.detectChanges();

        // Assert
        expect(getEditButton()).toBeTruthy();
      });

      it('should not show edit button when site type is shared', () => {
        // Arrange
        sut.siteType$ = of('shared');
        fixture.detectChanges();

        // Assert
        expect(getEditButton()).toBeFalsy();
      });
    });

    describe('onSubmitContentEdit', () => {
      it('should call createTempFolderItem with "new folder" name and temporary item id', async () => {
        // Arrange
        const newFolderName = 'new folder';
        const item = {
          path: '/path/to/folder',
          displayName: newFolderName,
          itemId: 'itemId',
          name: newFolderName,
          version: 1,
          hasChildren: false,
          thumbnailUrl: 'thumbnail-url',
          hasPresentation: false,
          isFolder: true,
          insertOptions: [],
          createdDate: '20230428T111641Z',
          updatedDate: '20230429T111641Z',
          access: adminPermissions,
          children: undefined,
        };
        pageTemplatesService.createItem.and.returnValue(of({ successful: true, errorMessage: null, item }));
        pageTemplatesService.validateName.and.returnValue(Promise.resolve(true));

        // Act
        await sut.onSubmitContentEdit(newFolderName, TEMP_NEW_FOLDER_ID);

        // Assert
        expect(pageTemplatesService.createItem).toHaveBeenCalledWith(
          newFolderName,
          currentRootItemId,
          sitePartialDesignFolderTemplateId,
          Initial_Context.language,
        );
      });

      it('should add created folder to the folder list', async () => {
        // Arrange
        const newFolderName = 'new folder';
        const item = {
          path: '/path/to/folder',
          displayName: newFolderName,
          itemId: 'itemId',
          name: newFolderName,
          version: 1,
          hasChildren: false,
          thumbnailUrl: 'thumbnail-url',
          hasPresentation: false,
          isFolder: true,
          insertOptions: [],
          createdDate: '20230428T111641Z',
          updatedDate: '20230429T111641Z',
          access: adminPermissions,
          children: undefined,
        };
        const expectedPageDesignItem = {
          ...item,
          siteName: 'website1',
        };
        pageTemplatesService.createItem.and.returnValue(of({ successful: true, errorMessage: null, item }));
        pageTemplatesService.validateName.and.returnValue(Promise.resolve(true));

        // Act
        await sut.onSubmitContentEdit(newFolderName, TEMP_NEW_FOLDER_ID);

        // Assert
        expect(sut.partialDesignFolders).toContain(expectedPageDesignItem);
      });
    });

    describe('rename folder', () => {
      it('should call renameFolder with "new folder" name and "itemId"', async () => {
        // Arrange
        const newName = 'new folder';
        const itemId = '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9';
        const item = {
          path: '/path/to/folder',
          displayName: newName,
          itemId,
          name: newName,
          version: 1,
          hasChildren: false,
          thumbnailUrl: 'thumbnail-url',
          hasPresentation: false,
          isFolder: true,
          insertOptions: [],
          createdDate: '20230428T111641Z',
          updatedDate: '20230429T111641Z',
          access: adminPermissions,
          children: undefined,
        };
        pageTemplatesService.renameItem.and.returnValue(of({ successful: true, errorMessage: null, item }));
        pageTemplatesService.validateName.and.returnValue(Promise.resolve(true));

        // Act
        await sut.onSubmitContentEdit(newName, itemId);

        // Assert
        expect(pageTemplatesService.renameItem).toHaveBeenCalledWith(itemId, newName);
      });

      it('should update the folder in the list', async () => {
        // Arrange
        const newName = 'new folder';
        const itemId = '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9';
        const item = {
          path: '/path/to/folder',
          displayName: newName,
          itemId,
          name: newName,
          version: 1,
          hasChildren: false,
          thumbnailUrl: 'thumbnail-url',
          hasPresentation: false,
          isFolder: true,
          insertOptions: [],
          createdDate: '20230428T111641Z',
          updatedDate: '20230429T111641Z',
          access: adminPermissions,
          children: undefined,
        };
        const expectedPageDesignItem = {
          ...item,
          siteName: 'website1',
        };
        pageTemplatesService.renameItem.and.returnValue(of({ successful: true, errorMessage: null, item }));
        pageTemplatesService.validateName.and.returnValue(Promise.resolve(true));

        // Act
        await sut.onSubmitContentEdit(newName, itemId);

        // Assert
        expect(sut.partialDesignFolders).toContain(expectedPageDesignItem);
      });
    });

    describe('validateName', () => {
      it('should validate name', fakeAsync(async () => {
        // Arrange
        const partialItem1 = {
          path: '/path/to/root1/partial-design-1',
          displayName: 'pagedesign1',
          itemId: 'ff8B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
          name: 'pagedesign1',
          version: 1,
          hasChildren: false,
          thumbnailUrl: '',
          hasPresentation: true,
          isFolder: false,
          insertOptions: [],
          createdDate: '20230428T111641Z',
          updatedDate: '20230429T111641Z',
          access: adminPermissions,
          children: undefined,
          siteName: 'website1',
        };

        const partialFolder1 = {
          path: '/path/to/root1/partial-design-1',
          displayName: 'partialFolder1',
          itemId: '3C8B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
          name: 'partialFolder1',
          version: 1,
          hasChildren: false,
          thumbnailUrl: '',
          hasPresentation: false,
          isFolder: true,
          insertOptions: [],
          createdDate: '20230428T111641Z',
          updatedDate: '20230429T111641Z',
          access: adminPermissions,
          children: undefined,
          siteName: 'website1',
        };

        const partialFolder2 = {
          path: '/path/to/root1/partial-design-2',
          displayName: 'partialFolder2',
          itemId: '988B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
          name: 'partialFolder2',
          version: 1,
          hasChildren: false,
          thumbnailUrl: '',
          hasPresentation: false,
          isFolder: true,
          insertOptions: [],
          createdDate: '20230428T111641Z',
          updatedDate: '20230429T111641Z',
          access: adminPermissions,
          children: undefined,
          siteName: 'website1',
        };
        const items = [partialItem1, partialFolder1, partialFolder2];
        const currentFolderNames = [partialFolder1.displayName, partialFolder2.displayName];

        partialDesignSubject.next(items);
        fixture.detectChanges();
        await fixture.whenStable();

        const newName = 'partialFolder1';
        const itemId = '988B6AF1-AB87-49FD-ABE2-8A8A5979D5C5';
        const item = {
          path: '/path/to/folder',
          displayName: newName,
          itemId,
          name: newName,
          version: 1,
          hasChildren: false,
          thumbnailUrl: '',
          hasPresentation: true,
          isFolder: false,
          insertOptions: [],
          createdDate: '20230428T111641Z',
          updatedDate: '20230429T111641Z',
          access: adminPermissions,
          children: undefined,
        };
        pageTemplatesService.renameItem.and.returnValue(of({ successful: true, errorMessage: null, item }));
        pageTemplatesService.validateName.and.returnValue(Promise.resolve(true));

        // Act
        await sut.onSubmitContentEdit(newName, itemId);
        tick();

        // Assert
        expect(pageTemplatesService.validateName).toHaveBeenCalledWith(newName, currentFolderNames);
        flush();
      }));
    });

    describe('moveItem', () => {
      it('should open move item dialog with required parameters for  partial design item', fakeAsync(() => {
        // Act
        sut.moveItem(partialItem, 'partialDesign');
        tick();

        // Arrange
        expect(moveItemDialogServiceSpy.show).toHaveBeenCalledWith({
          itemId: partialItem.itemId,
          parentId: 'currentRootItemId',
          rootId: 'itemId',
          itemName: partialItem.name,
          templateId: 'sitePartialDesignFolderTemplateId',
          language: 'lang1',
        });
        flush();
      }));

      it('should open move item dialog with required parameters for folder', fakeAsync(() => {
        // Act
        sut.moveItem(partialFolder, 'folder');
        tick();

        // Arrange
        expect(moveItemDialogServiceSpy.show).toHaveBeenCalledWith({
          itemId: partialFolder.itemId,
          parentId: 'currentRootItemId',
          rootId: 'itemId',
          itemName: partialFolder.name,
          templateId: 'sitePartialDesignFolderTemplateId',
          language: 'lang1',
        });
        flush();
      }));
    });

    describe('delete item', () => {
      describe('delete folder', () => {
        it('should call deleteFolder with "itemId"', async () => {
          // Arrange
          const itemId = '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9';
          pageTemplatesService.deleteItem.and.returnValue(of({ successful: true, errorMessage: null, item: null }));

          // Act
          clickOnFolderContextMenu(0, 2);
          await fixture.whenStable();

          confirmInDialog();
          await fixture.whenStable();

          // Assert
          expect(pageTemplatesService.deleteItem).toHaveBeenCalledWith(itemId, false);
        });

        it('should not call deleteFolder with "itemId" WHEN dialog is declined', async () => {
          // Arrange
          pageTemplatesService.deleteItem.and.returnValue(of({ successful: true, errorMessage: null, item: null }));

          // Act
          clickOnFolderContextMenu(0, 2);
          await fixture.whenStable();

          cancelInDialog();
          await fixture.whenStable();

          // Assert
          expect(pageTemplatesService.deleteItem).not.toHaveBeenCalled();
        });

        it('should update the folder in the list', async () => {
          // Arrange
          const itemId = '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9';
          pageTemplatesService.deleteItem.and.returnValue(of({ successful: true, errorMessage: null, item: null }));

          // Act
          clickOnFolderContextMenu(0, 2);
          await fixture.whenStable();

          confirmInDialog();
          await fixture.whenStable();

          // Assert
          expect(sut.partialDesignFolders.find((pdItem) => pdItem.itemId === itemId)).toBeFalsy();
        });
      });

      describe('delete partialDesign', () => {
        it('should call deleteItem with "itemId"', async () => {
          // Arrange
          const itemId = 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5';
          pageTemplatesService.deleteItem.and.returnValue(of({ successful: true, errorMessage: null, item: null }));

          // Act
          getPartialDesignContextMenuButtns(0, 2).click();
          await fixture.whenStable();

          confirmInDialog();
          await fixture.whenStable();

          // Assert
          expect(pageTemplatesService.deleteItem).toHaveBeenCalledWith(itemId, false);
        });

        it('should not call deleteItem with "itemId" WHEN dialog is declined', async () => {
          // Arrange
          pageTemplatesService.deleteItem.and.returnValue(of({ successful: true, errorMessage: null, item: null }));

          // Act
          getPartialDesignContextMenuButtns(0, 2).click();
          await fixture.whenStable();

          cancelInDialog();
          await fixture.whenStable();

          // Assert
          expect(pageTemplatesService.deleteItem).not.toHaveBeenCalled();
        });

        it('should update the partialDesign in the list', async () => {
          // Arrange
          const itemId = 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5';
          pageTemplatesService.deleteItem.and.returnValue(of({ successful: true, errorMessage: null, item: null }));

          // Act
          getPartialDesignContextMenuButtns(0, 2).click();
          await fixture.whenStable();

          confirmInDialog();
          await fixture.whenStable();

          // Assert
          expect(sut.partialDesignItems.find((pdItem) => pdItem.itemId === itemId)).toBeFalsy();
        });
      });
    });

    describe('Shared sites', () => {
      it('Should show tabs WHEN shared site(s) exists', () => {
        // Arrange
        sut.hasSharedSite$ = of(true);
        sut.siteType$ = of('shared');

        // sut.ngOnInit();
        fixture.detectChanges();

        // Assert
        expect(getTabs()).toBeTruthy();
      });

      it('Should not show tabs WHEN no shared site(s) exists', () => {
        // Arrange
        sut.hasSharedSite$ = of(false);
        fixture.detectChanges();

        // Assert
        expect(getTabs()).toBeFalsy();
      });

      it('should display the correct description for shared site type', () => {
        sut.siteType$ = of('shared');
        fixture.detectChanges();

        const descriptionElement = fixture.debugElement.query(By.css('.sitetype-description')).nativeElement;
        expect(descriptionElement.textContent).toContain('PAGE_DESIGNS.WORKSPACE.SHARED_PARTIAL_DESIGNS_DESCRIPTION');
      });

      it('should hide the description for a current site type', () => {
        // sut.siteType$.next('current');
        fixture.detectChanges();

        const descriptionElement = fixture.debugElement.query(By.css('.sitetype-description'));
        expect(descriptionElement).toBeNull();
      });
    });

    describe('breadcrumb', () => {
      it('should show breadcrumb when not on root level', () => {
        // Arrange
        const mockBreadcrumWithAncestor: AncestorWithSite[] = [
          {
            itemId: 'item1',
            displayName: 'Item 1',
            siteName: 'website',
          },
          {
            itemId: 'item2',
            displayName: 'Item 2',
            siteName: 'website1',
          },
        ];

        // Act
        sut.ancestors$ = of(mockBreadcrumWithAncestor);
        fixture.detectChanges();

        // Assert
        const breadcrumb = getBreadcrumb();
        expect(breadcrumb).toBeTruthy();
      });

      it('should not show breadcrumb when breadcrum items is less than 2', async () => {
        // Arrange
        const mockBreadcrumWithAncestor: AncestorWithSite[] = [
          {
            itemId: 'item1',
            displayName: 'root',
            siteName: 'website',
          },
        ];

        // Act
        sut.ancestors$ = of(mockBreadcrumWithAncestor);
        await sut.ngOnInit();
        fixture.detectChanges();

        // Assert
        const breadcrumb = getBreadcrumb();
        expect(breadcrumb).toBeFalsy();
      });
    });
  });

  describe('userPermissions', () => {
    it('should not disable any action buttons when user has all permissions', () => {
      // Arrange
      partialDesignSubject.next([
        {
          path: '/path/to/root1/partial-design',
          displayName: 'Partial Design',
          itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
          name: 'PartialDesign',
          version: 1,
          hasChildren: false,
          thumbnailUrl: mockThumbnailUrl,
          hasPresentation: true,
          isFolder: false,
          insertOptions: [],
          createdDate: '20230428T111641Z',
          updatedDate: '20230429T111641Z',
          access: adminPermissions,
          children: undefined,
          siteName: 'website1',
        },
      ]);
      fixture.detectChanges();

      // Assert
      const renameBtn = getPartialDesignContextMenuButtns(0, 0);
      const deleteBtn = getPartialDesignContextMenuButtns(0, 2);
      const editBtn = getEditButton().nativeElement as HTMLButtonElement;
      const createButton = getCreateButton().nativeElement as HTMLButtonElement;

      expect(renameBtn.disabled).toBe(false);
      expect(deleteBtn.disabled).toBe(false);
      expect(editBtn.disabled).toBe(false);
      expect(createButton.disabled).toBe(false);
    });

    it('should disable edit buttons when user has no edit permissions', async () => {
      // Arrange
      partialDesignSubject.next([
        {
          path: '/path/to/root1/partial-design',
          displayName: 'Partial Design',
          itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
          name: 'PartialDesign',
          version: 1,
          hasChildren: false,
          thumbnailUrl: mockThumbnailUrl,
          hasPresentation: true,
          isFolder: false,
          insertOptions: [],
          createdDate: '20230428T111641Z',
          updatedDate: '20230429T111641Z',
          access: {
            canCreate: true,
            canRename: true,
            canDelete: true,
            canWrite: false,
            canDuplicate: true,
          },
          children: undefined,
          siteName: 'website1',
        },
      ]);
      fixture.detectChanges();

      // Assert
      const renameBtn = getPartialDesignContextMenuButtns(0, 0);
      const deleteBtn = getPartialDesignContextMenuButtns(0, 2);
      const editBtn = getEditButton().nativeElement as HTMLButtonElement;
      const createButton = getCreateButton().nativeElement as HTMLButtonElement;

      expect(renameBtn.disabled).toBe(false);
      expect(deleteBtn.disabled).toBe(false);
      expect(editBtn.disabled).toBe(true);
      expect(createButton.disabled).toBe(false);
    });

    it('should disable rename buttons when user has no edit permissions', async () => {
      // Arrange
      partialDesignSubject.next([
        {
          path: '/path/to/root1/partial-design',
          displayName: 'Partial Design',
          itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
          name: 'PartialDesign',
          version: 1,
          hasChildren: false,
          thumbnailUrl: mockThumbnailUrl,
          hasPresentation: true,
          isFolder: false,
          insertOptions: [],
          createdDate: '20230428T111641Z',
          updatedDate: '20230429T111641Z',
          access: {
            canCreate: true,
            canRename: false,
            canDelete: true,
            canWrite: true,
            canDuplicate: true,
          },
          children: undefined,
          siteName: 'website1',
        },
      ]);
      fixture.detectChanges();

      // Assert
      const renameBtn = getPartialDesignContextMenuButtns(0, 0);
      const deleteBtn = getPartialDesignContextMenuButtns(0, 2);
      const editBtn = getEditButton().nativeElement as HTMLButtonElement;
      const createButton = getCreateButton().nativeElement as HTMLButtonElement;

      expect(renameBtn.disabled).toBe(true);
      expect(deleteBtn.disabled).toBe(false);
      expect(editBtn.disabled).toBe(false);
      expect(createButton.disabled).toBe(false);
    });

    it('should disable create buttons when user has no create permissions', async () => {
      // Arrange
      partialDesignsNavigationService.currentRootItem$ = of({
        path: '/path/to/root1/partial-design-folder',
        displayName: 'Partial Design Folder',
        itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
        name: 'PartialDesignFolder',
        version: 1,
        hasChildren: false,
        thumbnailUrl: mockThumbnailUrl,
        hasPresentation: true,
        isFolder: false,
        insertOptions: [],
        createdDate: '20230428T111641Z',
        updatedDate: '20230429T111641Z',
        access: {
          canCreate: false,
          canRename: true,
          canDelete: true,
          canWrite: true,
          canDuplicate: true,
        },
        children: undefined,
        siteName: 'website1',
      });
      await sut.ngOnInit();
      fixture.detectChanges();

      // Assert
      const renameBtn = getPartialDesignContextMenuButtns(0, 0);
      const deleteBtn = getPartialDesignContextMenuButtns(0, 2);
      const editBtn = getEditButton().nativeElement as HTMLButtonElement;
      const createButton = getCreateButton().nativeElement as HTMLButtonElement;

      expect(renameBtn.disabled).toBe(false);
      expect(deleteBtn.disabled).toBe(false);
      expect(editBtn.disabled).toBe(false);
      expect(createButton.disabled).toBe(true);
    });

    it('should disable delete button when user has no delete permissions', async () => {
      // Arrange
      partialDesignSubject.next([
        {
          path: '/path/to/root1/partial-design',
          displayName: 'Partial Design',
          itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
          name: 'PartialDesign',
          version: 1,
          hasChildren: false,
          thumbnailUrl: mockThumbnailUrl,
          hasPresentation: true,
          isFolder: false,
          insertOptions: [],
          createdDate: '20230428T111641Z',
          updatedDate: '20230429T111641Z',
          access: {
            canCreate: true,
            canRename: true,
            canDelete: false,
            canWrite: true,
            canDuplicate: true,
          },
          children: undefined,
          siteName: 'website1',
        },
      ]);
      fixture.detectChanges();

      // Assert
      const renameBtn = getPartialDesignContextMenuButtns(0, 0);
      const deleteBtn = getPartialDesignContextMenuButtns(0, 2);
      const editBtn = getEditButton().nativeElement as HTMLButtonElement;
      const createButton = getCreateButton().nativeElement as HTMLButtonElement;

      expect(renameBtn.disabled).toBe(false);
      expect(deleteBtn.disabled).toBe(true);
      expect(editBtn.disabled).toBe(false);
      expect(createButton.disabled).toBe(false);
    });
  });
});
