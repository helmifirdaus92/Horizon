/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, ParamMap, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  BreadcrumbComponent,
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
import { AssetsPipeMockModule } from 'app/testing/assets-pipe-mock.module';
import { nextTick, TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { BehaviorSubject, of } from 'rxjs';
import { DesignSearchDalService } from '../design-search/design-search.dal.service';
import { PageDesignModule } from '../page-design.module';
import { PageTemplatesService } from '../page-templates.service';
import { AncestorWithSite, ItemWithSite } from '../page-templates.types';
import { CreateItemDialogService } from '../shared/create-item-dialog/create-item-dialog.service';
import { MoveItemDialogService } from '../shared/move-item-dialog/move-item-dialog.service';
import { adminPermissions, mockThumbnailUrl } from '../shared/page-templates-test-data';
import { RenameItemDialogService } from '../shared/rename-item-dialog/rename-item-dialog.service';
import { TemplatesSharedSitesTabsComponent } from '../shared/templates-shared-sites-tabs/templates-shared-sites-tabs.component';
import { CreatePageBranchDialogService } from './create-page-branch-dialog/create-page-branch-dialog.service';
import { PageBranchesNavigationService } from './page-branches-navigations.sevrice';
import { PageBranchesComponent } from './page-branches.component';

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
const pageBrunchSubject = new BehaviorSubject<ItemWithSite[] | undefined>(undefined);

describe(PageBranchesComponent.name, () => {
  let sut: PageBranchesComponent;
  let fixture: ComponentFixture<PageBranchesComponent>;
  let pageBranchesNavigationService: jasmine.SpyObj<PageBranchesNavigationService>;
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

  const getPageBranches = () => fixture.debugElement.queryAll(By.css('.design-list ng-spd-item-card'));

  const getContextMenu = () => fixture.debugElement.query(By.css('ng-spd-popover'));

  const getTabs = () => fixture.debugElement.query(By.directive(TemplatesSharedSitesTabsComponent));

  const getEditButton = () => fixture.debugElement.query(By.css('.partial-design-card-actions button:nth-child(1)'));

  const getCreateButton = () => fixture.debugElement.query(By.css('.sub-header-actions button:nth-child(1)'));

  const getPageBranchContextMenuButtons = (itemIndex: number, buttonIndex: number) => {
    const itemCard = getPageBranches()[itemIndex];

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

  beforeEach(
    waitForAsync(() => {
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
        declarations: [PageBranchesComponent],
        providers: [
          {
            provide: CreatePageBranchDialogService,
            useValue: jasmine.createSpyObj<CreatePageBranchDialogService>('CreatePageBranchDialogService', ['show']),
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
        ],
      })
        .overrideComponent(PageBranchesComponent, {
          set: {
            providers: [
              {
                provide: PageBranchesNavigationService,
                useValue: jasmine.createSpyObj('PageBranchesNavigationService', [
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

      fixture = TestBed.createComponent(PageBranchesComponent);
      sut = fixture.componentInstance;

      sut.ancestors$ = of(breadcrumbItems);
      sut.isNavLoading$ = new BehaviorSubject<boolean>(true);
      sut.siteType$ = of('current');
      sut.pageBranchesAllItems$ = pageBrunchSubject.asObservable();
      pageBrunchSubject.next(mockItems);
      sut.hasSharedSite$ = of(false);

      pageBranchesNavigationService = fixture.debugElement.injector.get<PageBranchesNavigationService>(
        PageBranchesNavigationService,
      ) as any;

      pageBranchesNavigationService.currentRootItem$ = of(partialFolderItem(currentRootItemId));
      pageBranchesNavigationService.siteItemTemplateId$ = of(sitePartialDesignTemplateId);
      pageBranchesNavigationService.siteFolderTemplateId$ = of(sitePartialDesignFolderTemplateId);
      pageBranchesNavigationService.designRoots$ = of([{ itemId: 'test-id', siteName: 'site1' }]);

      spyOn(contextService, 'getItem').and.returnValue(Promise.resolve({ permissions } as Item));

      detectChanges();
    }),
  );

  it('should create', () => {
    expect(sut).toBeTruthy();
  });
});
