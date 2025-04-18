/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule, ButtonModule, DroplistModule, ItemCardModule, PopoverModule } from '@sitecore/ng-spd-lib';
import { PageTemplatesService } from 'app/page-design/page-templates.service';
import { AssignPageDesignOutput, Item, ItemWithSite, TenantPageTemplate } from 'app/page-design/page-templates.types';
import { adminPermissions } from 'app/page-design/shared/page-templates-test-data';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { Item as PageItem } from 'app/shared/graphql/item.interface';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { PageDesignComponent } from './page-design.component';

const pageDesignList: ItemWithSite[] = [
  {
    path: '/path/to/page-design1',
    displayName: 'page design 1',
    itemId: 'page-design-id-1',
    name: 'page design 1',
    version: 1,
    hasChildren: false,
    thumbnailUrl: '',
    hasPresentation: true,
    isFolder: false,
    createdDate: '20230428T111641Z',
    updatedDate: '20230429T111641Z',
    children: undefined,
    siteName: 'website1',
    access: adminPermissions,
  },
  {
    path: '/path/to/page-design2',
    displayName: 'page design 2',
    itemId: 'page-design-id-2',
    name: 'page design 2',
    version: 1,
    hasChildren: false,
    thumbnailUrl: '',
    hasPresentation: true,
    isFolder: false,
    createdDate: '20230428T111641Z',
    updatedDate: '20230429T111641Z',
    children: undefined,
    siteName: 'website1',
    access: adminPermissions,
  },
];

const item: Item = {
  path: '/path/to/page1',
  displayName: 'page 1',
  itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
  name: 'page 1',
  version: 1,
  hasChildren: false,
  thumbnailUrl: '',
  hasPresentation: true,
  isFolder: false,
  createdDate: '20230428T111641Z',
  updatedDate: '20230429T111641Z',
  children: undefined,
  pageDesignId: 'page-design-id-1',
  access: adminPermissions,
};

const pageTemplate: TenantPageTemplate = {
  template: {
    name: 'template',
    templateId: 'template-id',
    access: adminPermissions,
  },
  pageDesign: item,
};

const mockItem = {
  template: {
    id: 'template-id',
  },
} as PageItem;

const mockSelectedDesign: ItemWithSite = {
  path: '/path/to/page-design1',
  displayName: 'page design 1',
  itemId: 'page-design-id-1',
  name: 'page design 1',
  version: 1,
  hasChildren: false,
  thumbnailUrl: '',
  hasPresentation: true,
  isFolder: false,
  createdDate: '20230428T111641Z',
  updatedDate: '20230429T111641Z',
  children: undefined,
  siteName: 'website1',
  access: adminPermissions,
};

@Component({
  selector: 'ng-spd-checkbox',
})
class CheckBoxTestComponent {
  @Input() disabled?: boolean;
  @Input() checked?: boolean;
}

describe(PageDesignComponent.name, () => {
  let sut: PageDesignComponent;
  let fixture: ComponentFixture<PageDesignComponent>;
  let contextService: ContextServiceTesting;
  let pageTemplatesServiceSpy: jasmine.SpyObj<PageTemplatesService>;
  let getItemSpy: jasmine.Spy;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PageDesignComponent, CheckBoxTestComponent],
      imports: [
        TranslateModule,
        TranslateServiceStubModule,
        ContextServiceTestingModule,
        StaticConfigurationServiceStubModule,
        PopoverModule,
        NoopAnimationsModule,
        ItemCardModule,
        AccordionModule,
        ButtonModule,
        DroplistModule,
      ],
      providers: [
        {
          provide: PageTemplatesService,
          useValue: jasmine.createSpyObj<PageTemplatesService>('PageTemplatesService', [
            'getPageDesignsList',
            'assignPageDesign',
            'getItemDetails',
            'getTenantPageTemplates',
            'assignPageDesign',
          ]),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    contextService = TestBedInjectSpy(ContextServiceTesting);
    contextService.provideDefaultTestItem();

    pageTemplatesServiceSpy = TestBedInjectSpy(PageTemplatesService);
    pageTemplatesServiceSpy.getPageDesignsList.and.returnValue(of(pageDesignList));
    pageTemplatesServiceSpy.getItemDetails.and.returnValue(of(item));
    pageTemplatesServiceSpy.getTenantPageTemplates.and.returnValue(of([pageTemplate]));
    pageTemplatesServiceSpy = TestBed.inject(PageTemplatesService) as jasmine.SpyObj<PageTemplatesService>;

    fixture = TestBed.createComponent(PageDesignComponent);
    sut = fixture.componentInstance;
    sut.useDesignFromTemplate = true;
    sut.templatePageDesign = null;
    sut.useDesignFromTemplateDropDown = true;
    sut.dropDownToggle = false;
    sut.isAccordionOpen = true;

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should initialize page designs on ngOnInit', async () => {
    getItemSpy = spyOn(contextService, 'getItem');
    getItemSpy.and.resolveTo(mockItem);

    await sut.getPageDesign(true);
    await fixture.whenStable();

    expect(pageTemplatesServiceSpy.getPageDesignsList).toHaveBeenCalled();
    sut.pageDesigns$.subscribe((pageDesigns) => expect(pageDesigns).toBe(pageDesignList));
  });

  it('should enable the Save button when dropdown selection is changed', async () => {
    await sut.getPageDesign(true);
    fixture.detectChanges();

    sut.selectedPageDesign = mockSelectedDesign;
    sut.templatePageDesign = mockSelectedDesign;
    sut.buttonsVisible = true;
    fixture.detectChanges();

    const saveButton = fixture.debugElement.query(By.css('button[ngSpdButton="solidPrimary"]'));
    expect(saveButton.nativeElement.disabled).toBeTrue();

    const newSelectedDesign = {
      path: '/path/to/new-design',
      displayName: 'New Design',
      itemId: 'design124',
      name: 'New Design',
      version: 1,
      hasChildren: false,
      thumbnailUrl: '',
      hasPresentation: true,
      isFolder: false,
      createdDate: '20230428T111641Z',
      updatedDate: '20230429T111641Z',
      children: undefined,
      siteName: 'website1',
      access: adminPermissions,
    };
    sut.selectPageDesign(newSelectedDesign.itemId, [newSelectedDesign]);
    fixture.detectChanges();

    expect(sut.canWrite).toBeTrue();
    expect(saveButton.nativeElement.disabled).toBeFalse();
  });

  it('should reset state and restore current page design when cancel button is clicked', async () => {
    sut.buttonsVisible = true;
    pageTemplatesServiceSpy.getItemDetails.and.returnValue(of(item));
    sut.pageDesigns$ = of(pageDesignList);

    fixture.detectChanges();

    const cancelButton = fixture.debugElement.query(By.css('button[ngSpdButton="outline"]'));
    cancelButton.triggerEventHandler('click', null);
    await fixture.whenStable();

    expect(sut.buttonsVisible).toBeFalse();
    expect(sut.currentPageDesign).toEqual(pageDesignList[0]);
    sut.pageDesigns$.subscribe((pageDesigns) => expect(pageDesigns).toEqual(pageDesignList));
  });

  it('should select page design', () => {
    sut.selectPageDesign('page-design-id-1', pageDesignList);

    expect(sut.selectedPageDesign).toEqual(pageDesignList[0]);
  });

  it('should save page design', async () => {
    const assignPageDesignResponse: AssignPageDesignOutput = {
      success: true,
    };
    pageTemplatesServiceSpy.assignPageDesign.and.returnValue(of(assignPageDesignResponse));

    sut.useDesignFromTemplate = false;
    sut.selectedPageDesign = pageDesignList[0];

    fixture.detectChanges();
    await sut.savePageDesign();

    expect(pageTemplatesServiceSpy.assignPageDesign).toHaveBeenCalledWith('', '{PAGE-DESIGN-ID-1}');
  });

  it('should remove page design', async () => {
    const assignPageDesignResponse: AssignPageDesignOutput = {
      success: true,
    };
    pageTemplatesServiceSpy.assignPageDesign.and.returnValue(of(assignPageDesignResponse));

    await sut.savePageDesign();

    expect(pageTemplatesServiceSpy.assignPageDesign).toHaveBeenCalledWith('', '');
  });
});
