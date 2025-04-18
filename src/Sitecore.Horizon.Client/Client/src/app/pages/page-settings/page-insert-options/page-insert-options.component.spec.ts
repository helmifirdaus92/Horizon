/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule, LoadingIndicatorModule, PopoverModule } from '@sitecore/ng-spd-lib';
import { PageTemplatesService } from 'app/page-design/page-templates.service';
import { TenantPageTemplate } from 'app/page-design/page-templates.types';
import { adminPermissions } from 'app/page-design/shared/page-templates-test-data';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { BaseItemDalService } from 'app/shared/graphql/item.dal.service';
import { Item, ItemInsertOption } from 'app/shared/graphql/item.interface';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { PageInsertOptionsComponent } from './page-insert-options.component';

@Component({
  selector: 'ng-spd-checkbox',
})
class CheckBoxTestComponent {
  @Input() disabled?: boolean;
  @Input() checked?: boolean;
}

describe(PageInsertOptionsComponent.name, () => {
  let sut: PageInsertOptionsComponent;
  let fixture: ComponentFixture<PageInsertOptionsComponent>;
  let contextService: ContextServiceTesting;
  let pageTemplatesServiceSpy: jasmine.SpyObj<PageTemplatesService>;
  let itemDalServiceSpy: jasmine.SpyObj<BaseItemDalService>;
  let getItemSpy: jasmine.Spy;

  const templatesList: TenantPageTemplate[] = [
    {
      template: {
        name: 'template1',
        templateId: 'template-id1',
        access: adminPermissions,
        standardValuesItem: {
          itemId: 'sv-id1',
          insertOptions: [
            { templateId: 'template-id1', name: 'template1' },
            { templateId: 'not-page-template-id', name: 'not-page-template' },
          ],
        },
      },
      pageDesign: null,
    },
    {
      template: {
        name: 'template2',
        templateId: 'template-id2',
        access: adminPermissions,
        standardValuesItem: {
          itemId: 'sv-id2',
          insertOptions: [],
        },
      },
      pageDesign: null,
    },
  ];

  const pageInsertOptions: ItemInsertOption[] = [
    {
      displayName: 'template1',
      id: 'template-id1',
    },
  ];

  const page = {
    id: 'page-id',
    template: {
      id: 'template-id1',
    },
  } as Item;

  const dispatchMouseEvent = (className: string) => {
    const elementRef = fixture.debugElement.query(By.css(className)).nativeElement as HTMLElement;
    const event = new MouseEvent('mouseenter');
    elementRef.dispatchEvent(event);
  };
  const messageEl = () => fixture.debugElement.query(By.css('.popover-dialog span')).nativeElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PageInsertOptionsComponent, CheckBoxTestComponent],
      imports: [
        TranslateModule,
        TranslateServiceStubModule,
        ContextServiceTestingModule,
        LoadingIndicatorModule,
        PopoverModule,
        NoopAnimationsModule,
        AccordionModule,
        RouterModule,
      ],
      providers: [
        {
          provide: PageTemplatesService,
          useValue: jasmine.createSpyObj<PageTemplatesService>('PageTemplatesService', [
            'updatePageInsertOptions',
            'getTenantPageTemplates',
          ]),
        },
        {
          provide: BaseItemDalService,
          useValue: jasmine.createSpyObj<BaseItemDalService>('ItemDalService', ['getItemInsertOptions']),
        },
        provideRouter([]),
      ],
    }).compileComponents();

    contextService = TestBedInjectSpy(ContextServiceTesting);
    getItemSpy = spyOn(contextService, 'getItem');
    getItemSpy.and.resolveTo(page);

    pageTemplatesServiceSpy = TestBedInjectSpy(PageTemplatesService);
    pageTemplatesServiceSpy.getTenantPageTemplates.and.returnValue(of(templatesList));
    pageTemplatesServiceSpy.updatePageInsertOptions.and.returnValue(
      of({ successful: true, errorMessage: null, item: null }),
    );

    itemDalServiceSpy = TestBedInjectSpy(BaseItemDalService);
    itemDalServiceSpy.getItemInsertOptions.and.returnValue(of(pageInsertOptions));

    fixture = TestBed.createComponent(PageInsertOptionsComponent);
    sut = fixture.componentInstance;
    sut.isAccordionOpen = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize page insert options', async () => {
      const expectedPageInsertOptions = pageInsertOptions;

      // act
      await sut.getItemInsetOptions(true);

      // assert
      expect(getItemSpy).toHaveBeenCalled();
      expect(itemDalServiceSpy.getItemInsertOptions).toHaveBeenCalledWith(
        page.id,
        'page',
        contextService.language,
        contextService.siteName,
      );
      expect(pageTemplatesServiceSpy.getTenantPageTemplates).toHaveBeenCalledWith(contextService.siteName);
      expect(sut.pageInsertOptions).toEqual(expectedPageInsertOptions);
      expect(sut.updatedPageInsertOptions).toEqual(expectedPageInsertOptions);
    });
  });

  it('should initialize page template insert options and filters non-page templates', async () => {
    const expectedPageTemplateInsertOptions: ItemInsertOption[] = [
      {
        displayName: 'template1',
        id: 'template-id1',
      },
    ];

    // act
    await sut.getItemInsetOptions(true);

    // assert
    expect(sut.pageTemplate?.template.name).toBe('template1');
    expect(sut.pageTemplateInsertOptions).toEqual(expectedPageTemplateInsertOptions);
  });

  describe('updatePageInsertOptions', () => {
    it('should update the updated page insert options list and set the isChange to true', async () => {
      await sut.getItemInsetOptions(true);
      const expectedUpdates = [
        {
          displayName: 'template1',
          id: 'template-id1',
        },
        {
          displayName: 'template2',
          id: 'template-id2',
        },
      ];

      // act
      sut.updatePageInsertOptions(true, 'template-id2', 'template2');

      // assert
      expect(sut.pageInsertOptions).toEqual(pageInsertOptions);
      expect(sut.updatedPageInsertOptions).toEqual(expectedUpdates);
      expect(sut.isChanged).toBeTrue();
    });

    it('should not set the is change true if the updates insert options list has same content as original list', () => {
      // act
      sut.updatePageInsertOptions(true, 'template-id2', 'template2');
      expect(sut.isChanged).toBeTrue();
      sut.updatePageInsertOptions(false, 'template-id2', 'template2');

      // assert
      expect(sut.isChanged).toBeFalse();
    });
  });

  describe('saveChanges', () => {
    it('should call updatedPageInsertOptions and set isChange to false', async () => {
      await sut.getItemInsetOptions(true);
      sut.updatePageInsertOptions(true, 'template-id2', 'template2');
      expect(sut.isChanged).toBeTrue();

      // act
      await sut.saveChanges();

      // assert
      expect(pageTemplatesServiceSpy.updatePageInsertOptions).toHaveBeenCalledWith(page.id, [
        { templateId: 'template-id1' },
        { templateId: 'template-id2' },
      ]);
      expect(sut.isChanged).toBeFalse();
    });

    it('should show the error message if updating page insert options failed', async () => {
      pageTemplatesServiceSpy.updatePageInsertOptions.and.returnValue(
        of({ successful: false, errorMessage: 'Error', item: null }),
      );

      // act
      await sut.saveChanges();

      // assert
      expect(sut.apiErrorMessage).toBe('Error');
    });
  });

  describe('noWritePermission', () => {
    beforeEach(() => {
      sut.page = {
        ...page,
        permissions: { canWrite: false, canCreate: true, canRename: true, canDelete: true, canPublish: true },
      };
      fixture.detectChanges();
    });

    it('should disable checkbox and have proper message when user has no write permission', async () => {
      sut.templatesList = templatesList;
      fixture.detectChanges();

      dispatchMouseEvent('.checkbox-list div');

      const checkboxComponentRef = fixture.debugElement.query(By.directive(CheckBoxTestComponent)).componentInstance;

      expect(checkboxComponentRef.disabled).toBeTrue();
      expect(messageEl().textContent).toContain('PAGE_DESIGNS.WORKSPACE.NO_WRITE_ACCESS');
    });
  });

  describe('restore', () => {
    it('should set the default page insert option', async () => {
      const spy = spyOn(sut, 'saveChanges');

      // act
      sut.restoreDefaultInsertOptions();
      fixture.detectChanges();

      // assert
      expect(sut.updatedPageInsertOptions).toEqual(null);
      expect(spy).toHaveBeenCalled();
    });

    it('should hide restore button when user has no write permission', async () => {
      sut.page = {
        ...page,
        permissions: { canWrite: false, canCreate: true, canRename: true, canDelete: true, canPublish: true },
      };
      fixture.detectChanges();

      const restoreButton = fixture.debugElement.query(By.css('.restore-template'));

      expect(restoreButton.attributes['hidden']).toBeDefined();
    });
  });
});
