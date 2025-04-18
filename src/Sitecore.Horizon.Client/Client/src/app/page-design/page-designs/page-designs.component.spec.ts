/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, ParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
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
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { WarningDialogModule } from 'app/shared/dialogs/warning-dialog/warning-dialog.module';
import { Item } from 'app/shared/graphql/item.interface';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { CmUrlModule } from 'app/shared/pipes/platform-url/cm-url.module';
import { CmUrlTestingModule } from 'app/shared/pipes/platform-url/cm-url.module.testing';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { XmCloudFeatureCheckerService } from 'app/shared/xm-cloud/xm-cloud-feature-checker.service';
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
import { adminPermissions, getPageDesignsMocks, mockThumbnailUrl } from '../shared/page-templates-test-data';
import { combineChildren } from '../shared/page-templates-utils';
import { RenameItemDialogService } from '../shared/rename-item-dialog/rename-item-dialog.service';
import { TemplatesSharedSitesTabsComponent } from '../shared/templates-shared-sites-tabs/templates-shared-sites-tabs.component';
import { PageDesignsNavigationService } from './page-designs-navigation.service';
import { PageDesignsComponent, TEMP_NEW_FOLDER_ID } from './page-designs.component';

const Initial_Context = {
  itemId: 'itemId1',
  language: 'lang1',
  siteName: 'website1',
};

const pageDesignItem = {
  path: '/path/to/root1/page-design',
  displayName: 'Page Design',
  itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
  name: 'PageDesign',
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

const pageDesignFolder = {
  path: '/path/to/root1/folder1',
  displayName: 'folder1',
  itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
  name: 'folder1',
  version: 1,
  hasChildren: true,
  thumbnailUrl: '',
  hasPresentation: false,
  isFolder: true,
  insertOptions: [],
  createdDate: '20230428T111641Z',
  updatedDate: '20230429T111641Z',
  access: adminPermissions,
  siteName: 'website1',
};
const mockItems = [pageDesignFolder, pageDesignItem];

const currentRootItemId = 'currentRootItemId';
const sitePageDesignFolderTemplateId = 'sitePageDesignFolderTemplateId';
const sitePageDesignTemplateId = 'sitePageDesignTemplateId';
const pageDesignAllItemsSubject = new BehaviorSubject<ItemWithSite[] | undefined>(undefined);

describe(PageDesignsComponent.name, () => {
  let sut: PageDesignsComponent;
  let fixture: ComponentFixture<PageDesignsComponent>;
  let pageDesignsNavigationService: jasmine.SpyObj<PageDesignsNavigationService>;
  let pageTemplatesService: jasmine.SpyObj<PageTemplatesService>;
  let contextService: ContextServiceTesting;
  let createDesignItemDialogServiceSpy: jasmine.SpyObj<CreateItemDialogService>;
  let renameDesignItemDialogServiceSpy: jasmine.SpyObj<RenameItemDialogService>;
  let moveItemDialogServiceSpy: jasmine.SpyObj<MoveItemDialogService>;
  let xmCloudFeatureCheckerService: jasmine.SpyObj<XmCloudFeatureCheckerService>;
  let router: jasmine.SpyObj<Router>;
  let paramMapSubject: BehaviorSubject<ParamMap>;
  let featureFlagsServiceSpy: jasmine.SpyObj<FeatureFlagsService>;

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

  const getPageDesigns = () => fixture.debugElement.queryAll(By.css('.design-list ng-spd-item-card'));

  const getContextMenu = () => fixture.debugElement.query(By.css('ng-spd-popover'));

  const getTabs = () => fixture.debugElement.query(By.directive(TemplatesSharedSitesTabsComponent));

  const getCreateButton = () => fixture.debugElement.query(By.css('button.primary')).nativeElement;

  const getEditButton = () => fixture.debugElement.query(By.css('.page-design-card-actions button:nth-child(1)'));

  const getBtnFromPageDesignContextMenu = (itemIndex: number, buttonIndex: number) => {
    const itemCard = getPageDesigns()[itemIndex];

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

  const pageDesignFolderItem = (itemId = 'itemId') => {
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
  };

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
        RouterTestingModule.withRoutes([]),
      ],
      declarations: [PageDesignsComponent],
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
          provide: XmCloudFeatureCheckerService,
          useValue: jasmine.createSpyObj<XmCloudFeatureCheckerService>('XmCloudFeatureCheckerService', [
            'isPageDesignEditingFeatureAvailable',
            'isTemplateStandardValuesAvailable',
          ]),
        },
        {
          provide: PageTemplatesService,
          useValue: jasmine.createSpyObj<PageTemplatesService>('PageTemplatesService', [
            'getTenantPageTemplates',
            'createItem',
            'renameItem',
            'deleteItem',
            'isPageTemplatesFeatureAvailable',
            'validateName',
            'showErrorMessage',
            'createTemplatesStandardValuesItems',
            'updateStandardValuesInsertOptions',
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
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>('FeatureFlagsService', ['isFeatureEnabled']),
        },
      ],
    })
      .overrideComponent(PageDesignsComponent, {
        set: {
          providers: [
            {
              provide: PageDesignsNavigationService,
              useValue: jasmine.createSpyObj('PageDesignsNavigationService', [
                'watchItems',
                'showFolderDetails',
                'selectFolder',
                'fetchItemAncestors',
                'navigateToFolder',
                'clearSubscriptions',
                'currentRootItem$',
                'getItemDetails',
                'siteType$',
                'containsSharedSites$',
                'hasSharedSite',
              ]),
            },
          ],
        },
      })
      .compileComponents();

    createDesignItemDialogServiceSpy = TestBedInjectSpy(CreateItemDialogService);
    renameDesignItemDialogServiceSpy = TestBedInjectSpy(RenameItemDialogService);
    moveItemDialogServiceSpy = TestBedInjectSpy(MoveItemDialogService);
    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideTestValue(Initial_Context);
    router = TestBedInjectSpy(Router);

    pageTemplatesService = TestBedInjectSpy(PageTemplatesService);
    pageTemplatesService.getTenantPageTemplates.and.returnValue(of([]));
    pageTemplatesService.isPageTemplatesFeatureAvailable.and.returnValue(of(false));

    xmCloudFeatureCheckerService = TestBedInjectSpy(XmCloudFeatureCheckerService);

    featureFlagsServiceSpy = TestBedInjectSpy(FeatureFlagsService);
    featureFlagsServiceSpy.isFeatureEnabled.and.returnValue(true);

    fixture = TestBed.createComponent(PageDesignsComponent);
    sut = fixture.componentInstance;

    sut.ancestors$ = of(breadcrumbItems);
    sut.pageDesignAllItems$ = pageDesignAllItemsSubject.asObservable();
    pageDesignAllItemsSubject.next(mockItems);
    sut.isNavLoading$ = new BehaviorSubject<boolean>(true);
    sut.hasSharedSite$ = of(false);
    sut.siteType$ = of('current');
    sut.currentRootItemId = currentRootItemId;

    pageDesignsNavigationService = fixture.debugElement.injector.get<PageDesignsNavigationService>(
      PageDesignsNavigationService,
    ) as any;

    pageDesignsNavigationService.currentRootItem$ = of(pageDesignFolderItem(currentRootItemId));
    pageDesignsNavigationService.siteItemTemplateId$ = of(sitePageDesignTemplateId);
    pageDesignsNavigationService.siteFolderTemplateId$ = of(sitePageDesignFolderTemplateId);
    pageDesignsNavigationService.designRoots$ = of([{ itemId: 'test-id', siteName: 'site1' }]);

    spyOn(contextService, 'getItem').and.returnValue(Promise.resolve({ permissions } as Item));

    detectChanges();
  }));

  afterEach(() => {
    fixture.destroy();
  });

  describe('Page design items', () => {
    it('should populate items when navigation service emits page design items', () => {
      // Assert
      expect(sut.pageDesignItems).toEqual([pageDesignItem]);
      expect(sut.pageDesignFolders).toEqual([pageDesignFolder]);
      expect(pageDesignsNavigationService.watchItems).toHaveBeenCalled();
    });

    it('should populate shared site items when navigation service emits page design items', async () => {
      const expectedPageDesignItemSharedSite = {
        path: '/path/to/root1/page-design/footer',
        displayName: 'Footer',
        itemId: 'testId',
        name: 'Footer',
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

      const expectedPageDesignFolderSharedSite = {
        path: '/path/to/root1/page-design/folder-item',
        displayName: 'header',
        itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
        name: 'header',
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

      const mockPageDesigns = getPageDesignsMocks();
      const pageDesignsAllItems = combineChildren(mockPageDesigns, 'website', 'shared');
      fixture.detectChanges();

      pageDesignAllItemsSubject.next(pageDesignsAllItems);
      fixture.detectChanges();
      detectChanges();

      const pageDesignAllItems = await firstValueFrom(sut.pageDesignAllItems$);

      const pageDesignRootItems = pageDesignAllItems?.find((item) => item.isFolder === false);
      const pageDesignFolderItems = pageDesignAllItems?.find((item) => item.isFolder === true);

      // Assert
      expect(pageDesignsNavigationService.watchItems).toHaveBeenCalled();
      expect(pageDesignRootItems).toEqual(expectedPageDesignItemSharedSite);
      expect(pageDesignFolderItems).toEqual(expectedPageDesignFolderSharedSite);
    });

    describe('expand folder', () => {
      it('should not navigate to active route if selected itemId is `TEMP_NEW_FOLDER_ID` ', () => {
        const folderToExpand = pageDesignFolderItem(TEMP_NEW_FOLDER_ID);

        sut.expandFolder(folderToExpand);
        fixture.detectChanges();

        const selectItemSpy = spyOn(sut, 'selectItem');

        expect(pageDesignsNavigationService.navigateToFolder).not.toHaveBeenCalled();
        expect(selectItemSpy).not.toHaveBeenCalled();
      });

      it('should navigate to active route if selected itemId is not `TEMP_NEW_FOLDER_ID` ', () => {
        // Arrange
        const folderToExpand = pageDesignFolderItem();
        const selectItemSpy = spyOn(sut, 'selectItem');

        // Act
        sut.expandFolder(folderToExpand);

        expect(pageDesignsNavigationService.navigateToFolder).toHaveBeenCalledWith(folderToExpand.itemId);
        expect(selectItemSpy).toHaveBeenCalled();
      });

      it('should select the item if the folder is not already selected', () => {
        // Arrange
        const folderToExpand = pageDesignFolderItem();

        // Act
        sut.expandFolder(folderToExpand);

        // Assert
        expect(sut.selectedItem).toEqual(folderToExpand);
      });
    });

    describe('select item', () => {
      it('should show page design details', () => {
        // Arrange
        const mockPageDesignItem = {
          path: '/path/to/root1/page-design',
          displayName: 'Page Design',
          itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
          name: 'PageDesign',
          version: 1,
          hasChildren: false,
          thumbnailUrl: '/page-design-thumbnail.jpg',
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
        sut.selectItem(mockPageDesignItem);

        // Assert
        expect(sut.selectedItem).toEqual(mockPageDesignItem);
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
        expect(pageDesignsNavigationService.navigateToFolder).toHaveBeenCalledOnceWith(item.itemId);
      });

      it('should retrieve breadcrumb items', fakeAsync(() => {
        // Arrange
        pageDesignsNavigationService.breadCrumbItems$ = of(breadcrumbItems);

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
    describe('createPageDesign', () => {
      it('should open the create page design dialog with required parameters', fakeAsync(() => {
        // Act
        sut.createPageDesign();
        tick();

        // Assert
        expect(createDesignItemDialogServiceSpy.show).toHaveBeenCalledWith({
          parentId: currentRootItemId,
          templateId: sitePageDesignTemplateId,
          existingNames: [pageDesignItem.displayName],
          language: contextService.language,
          type: 'page-design',
        });
        flush();
      }));

      it('should navigate to editpagedesign page and update the context when page design is created successfully', fakeAsync(() => {
        // Arrange
        createDesignItemDialogServiceSpy.show.and.returnValue(of(pageDesignItem));

        // Act
        sut.createPageDesign();
        tick();

        // Assert
        expect(router.navigate).toHaveBeenCalledOnceWith(['/editpagedesign'], {
          queryParams: {
            sc_itemid: pageDesignItem.itemId,
            sc_version: pageDesignItem.version,
          },
          queryParamsHandling: 'merge',
        });
        flush();
      }));
    });

    describe('renamePageDesign', () => {
      it('should open the rename page design dialog with required parameters', fakeAsync(() => {
        // Act
        sut.renamePageDesign(pageDesignItem);
        tick();

        // Assert
        expect(renameDesignItemDialogServiceSpy.show).toHaveBeenCalledWith({
          itemId: pageDesignItem.itemId,
          itemName: pageDesignItem.displayName,
          existingNames: [pageDesignItem.displayName],
        });
        flush();
      }));
    });

    describe('createTempFolderItem', () => {
      it('should add a temporary folder item to the folders list in edit mode', fakeAsync(() => {
        // Act
        sut.createTempFolderItem();

        // Assert
        expect(sut.pageDesignFolders.length).toBe(2);
        expect(sut.pageDesignFolders[0].itemId).toBe(TEMP_NEW_FOLDER_ID);
        expect(sut.cardBeingEdited).toBe(TEMP_NEW_FOLDER_ID);
        flush();
      }));
    });

    describe('editPageDesign', () => {
      it('should navigate to editpagedesign page and update the context when page design is created successfully', () => {
        // Act
        sut.editPageDesign(pageDesignItem);

        // Assert
        expect(router.navigate).toHaveBeenCalledOnceWith(['/editpagedesign'], {
          queryParams: {
            sc_itemid: pageDesignItem.itemId,
            sc_version: pageDesignItem.version,
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
      describe('create folder', () => {
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
            sitePageDesignFolderTemplateId,
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
          expect(sut.pageDesignFolders).toContain(expectedPageDesignItem);
        });
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
        expect(sut.pageDesignFolders).toContain(expectedPageDesignItem);
      });

      it('should show notification error when rename folder fails', async () => {
        // Arrange
        const newName = 'new folder';
        const itemId = '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9';
        pageTemplatesService.renameItem.and.returnValue(
          of({ successful: false, errorMessage: 'errorMessage', item: null }),
        );
        pageTemplatesService.validateName.and.returnValue(Promise.resolve(true));

        // Act
        await sut.onSubmitContentEdit(newName, itemId);

        // Assert
        expect(pageTemplatesService.showErrorMessage).toHaveBeenCalled();
      });

      describe('validateName', () => {
        it('should show an error message for an invalid name', fakeAsync(async () => {
          const pageDesignItem1 = {
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

          const designFolder1 = {
            path: '/path/to/root1/partial-design-1',
            displayName: 'designFolder1',
            itemId: '3C8B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
            name: 'designFolder1',
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

          const designFolder2 = {
            path: '/path/to/root1/partial-design-2',
            displayName: 'designFolder2',
            itemId: '988B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
            name: 'designFolder2',
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
          const items = [pageDesignItem1, designFolder1, designFolder2];
          const currentFolderNames = [designFolder1.displayName, designFolder2.displayName];

          pageDesignAllItemsSubject.next(items);
          fixture.detectChanges();
          await fixture.whenStable();

          const newName = 'designFolder1';
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
    });

    describe('moveItem', () => {
      it('should open move item dialog with required parameters for  page design item', fakeAsync(() => {
        // Act
        sut.moveItem(pageDesignItem, 'pageDesign');
        tick();

        // Arrange
        expect(moveItemDialogServiceSpy.show).toHaveBeenCalledWith({
          itemId: pageDesignItem.itemId,
          parentId: 'currentRootItemId',
          rootId: 'itemId',
          itemName: pageDesignItem.name,
          templateId: 'sitePageDesignFolderTemplateId',
          language: 'lang1',
        });
        flush();
      }));

      it('should open move item dialog with required parameters for folder', fakeAsync(() => {
        // Act
        sut.moveItem(pageDesignFolder, 'folder');
        tick();

        // Arrange
        expect(moveItemDialogServiceSpy.show).toHaveBeenCalledWith({
          itemId: pageDesignFolder.itemId,
          parentId: 'currentRootItemId',
          rootId: 'itemId',
          itemName: pageDesignFolder.name,
          templateId: 'sitePageDesignFolderTemplateId',
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
          expect(sut.pageDesignFolders.find((pdFolder) => pdFolder.itemId === itemId)).toBeFalsy();
        });
      });

      describe('delete pageDesign', () => {
        it('should call deleteItem with "itemId"', async () => {
          // Arrange
          const itemId = 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5';
          pageTemplatesService.deleteItem.and.returnValue(of({ successful: true, errorMessage: null, item: null }));

          // Act
          getBtnFromPageDesignContextMenu(0, 2).click();
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
          getBtnFromPageDesignContextMenu(0, 2).click();
          await fixture.whenStable();

          cancelInDialog();
          await fixture.whenStable();

          // Assert
          expect(pageTemplatesService.deleteItem).not.toHaveBeenCalled();
        });

        it('should update the pageDesign in the list', async () => {
          // Arrange
          const itemId = 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5';
          pageTemplatesService.deleteItem.and.returnValue(of({ successful: true, errorMessage: null, item: null }));

          // Act
          getBtnFromPageDesignContextMenu(0, 2).click();
          await fixture.whenStable();

          confirmInDialog();
          await fixture.whenStable();

          // Assert
          expect(sut.pageDesignItems.find((designItem) => designItem.itemId === itemId)).toBeFalsy();
        });
      });
    });

    describe('Shared sites', () => {
      it('Should show tabs WHEN shared site(s) exists', () => {
        // Arrange
        sut.hasSharedSite$ = of(true);
        sut.siteType$ = of('shared');
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
        expect(getTabs()).toBeFalsy();
      });

      it('should display the correct description for shared site type', () => {
        sut.siteType$ = of('shared');
        fixture.detectChanges();

        const descriptionElement = fixture.debugElement.query(By.css('.sitetype-description')).nativeElement;
        expect(descriptionElement.textContent).toContain('PAGE_DESIGNS.WORKSPACE.SHARED_PAGE_DESIGNS_DESCRIPTION');
      });

      it('should hide the description for a current site type', () => {
        sut.siteType$ = of('current');
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

      it('should not show breadcrumb when on root level', () => {
        // Arrange
        sut.breadcrumbItems = [{ itemId: 'root', itemName: 'PAGE_DESIGNS.WORKSPACE.OVERVIEW' }];

        // Act
        sut.ngOnInit();
        fixture.detectChanges();

        // Assert
        const breadcrumb = getBreadcrumb();
        expect(breadcrumb).toBeFalsy();
      });
    });

    describe('Create button', () => {
      it('should disable create button if page design editing feature is not available', async () => {
        xmCloudFeatureCheckerService.isPageDesignEditingFeatureAvailable.and.returnValue(Promise.resolve(false));
        await sut.ngOnInit();
        detectChanges();

        expect(getCreateButton().disabled).toBeTrue();
      });

      it('should disable create button if in shared tab', async () => {
        xmCloudFeatureCheckerService.isPageDesignEditingFeatureAvailable.and.returnValue(Promise.resolve(true));
        sut.siteType$ = of('shared');
        detectChanges();

        expect(getCreateButton().disabled).toBeTrue();
      });

      it('should enable create button if page design editing feature is available and in current tab', async () => {
        xmCloudFeatureCheckerService.isPageDesignEditingFeatureAvailable.and.returnValue(Promise.resolve(true));
        sut.siteType$ = of('current');
        await sut.ngOnInit();
        detectChanges();

        expect(getCreateButton().disabled).toBeFalse();
      });
    });
  });

  describe('userPermissions', () => {
    it('should not disable any action buttons when user has all permissions', async () => {
      // Arrange
      sut.isPageDesignEditingSupported = true;
      pageDesignAllItemsSubject.next([
        {
          path: '/path/to/root1/page-design',
          displayName: 'Page Design',
          itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
          name: 'PageDesign',
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
      detectChanges();

      // Assert
      const renameBtn = getBtnFromPageDesignContextMenu(0, 0);
      const deleteBtn = getBtnFromPageDesignContextMenu(0, 2);
      const editBtn = getEditButton().nativeElement as HTMLButtonElement;

      expect(renameBtn.disabled).toBe(false);
      expect(deleteBtn.disabled).toBe(false);
      expect(editBtn.disabled).toBe(false);
    });

    it('should disable edit buttons when user has no edit permissions', async () => {
      // Arrange
      sut.isPageDesignEditingSupported = true;
      pageDesignAllItemsSubject.next([
        {
          path: '/path/to/root1/page-design',
          displayName: 'Page Design',
          itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
          name: 'PageDesign',
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
      detectChanges();

      // Assert
      const renameBtn = getBtnFromPageDesignContextMenu(0, 0);
      const deleteBtn = getBtnFromPageDesignContextMenu(0, 2);
      const editBtn = getEditButton().nativeElement as HTMLButtonElement;

      expect(renameBtn.disabled).toBe(false);
      expect(deleteBtn.disabled).toBe(false);
      expect(editBtn.disabled).toBe(true);
    });

    it('should disable rename buttons when user has no edit permissions', async () => {
      // Arrange
      sut.isPageDesignEditingSupported = true;
      pageDesignAllItemsSubject.next([
        {
          path: '/path/to/root1/page-design',
          displayName: 'Page Design',
          itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
          name: 'PageDesign',
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
      detectChanges();

      // Assert
      const renameBtn = getBtnFromPageDesignContextMenu(0, 0);
      const deleteBtn = getBtnFromPageDesignContextMenu(0, 2);
      const editBtn = getEditButton().nativeElement as HTMLButtonElement;

      expect(renameBtn.disabled).toBe(true);
      expect(deleteBtn.disabled).toBe(false);
      expect(editBtn.disabled).toBe(false);
    });

    it('should disable delete button when user has no delete permissions', async () => {
      // Arrange
      sut.isPageDesignEditingSupported = true;
      pageDesignAllItemsSubject.next([
        {
          path: '/path/to/root1/page-design',
          displayName: 'Page Design',
          itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
          name: 'PageDesign',
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
      detectChanges();

      // Assert
      const renameBtn = getBtnFromPageDesignContextMenu(0, 0);
      const deleteBtn = getBtnFromPageDesignContextMenu(0, 2);
      const editBtn = getEditButton().nativeElement as HTMLButtonElement;

      expect(renameBtn.disabled).toBe(false);
      expect(deleteBtn.disabled).toBe(true);
      expect(editBtn.disabled).toBe(false);
    });
  });
});
