/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import {
  DialogCloseHandle,
  DialogModule,
  InputLabelModule,
  ItemCardModule,
  LoadingIndicatorModule,
} from '@sitecore/ng-spd-lib';
import { EmptyStateComponent } from 'app/page-design/empty-state/empty-state.component';
import { PageDesignModule } from 'app/page-design/page-design.module';
import { PageTemplatesService } from 'app/page-design/page-templates.service';
import { TenantPageTemplate } from 'app/page-design/page-templates.types';
import { adminPermissions } from 'app/page-design/shared/page-templates-test-data';
import { ContentTreeService } from 'app/pages/content-tree/content-tree.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { DirectivesModule } from 'app/shared/directives/directives/directives.module';
import { BaseItemDalService } from 'app/shared/graphql/item.dal.service';
import { ItemInsertOption } from 'app/shared/graphql/item.interface';
import { DialogCloseHandleStubModule } from 'app/testing/dialog-close-handle-stub.module';
import { createSpyObserver, TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { TemplateSelectionDialogComponent } from './template-selection-dialog.component';

describe(TemplateSelectionDialogComponent.name, () => {
  let sut: TemplateSelectionDialogComponent;
  let fixture: ComponentFixture<TemplateSelectionDialogComponent>;
  let closeHandle: jasmine.SpyObj<DialogCloseHandle>;
  let pageTemplatesService: jasmine.SpyObj<PageTemplatesService>;
  let itemDalService: jasmine.SpyObj<BaseItemDalService>;
  let contentTreeService: ContentTreeService;
  let context: ContextServiceTesting;
  let de: DebugElement;

  const emptyStateElement = () => {
    return de.query(By.css('app-empty-state'));
  };

  const insertOption: ItemInsertOption[] = [{ displayName: 'test', id: 'testId' }];

  const closeBtn = (): HTMLButtonElement => {
    return de.query(By.css('ng-spd-dialog-close-button button')).nativeElement;
  };

  const cancelBtn = (): HTMLButtonElement => {
    return de.query(By.css('ng-spd-dialog-actions button:not(.primary)')).nativeElement;
  };

  const selectBtn = (): HTMLButtonElement => {
    return de.query(By.css('ng-spd-dialog-actions [ngspdbutton="primary"]')).nativeElement;
  };

  beforeEach(waitForAsync(async () => {
    await TestBed.configureTestingModule({
      declarations: [TemplateSelectionDialogComponent],
      imports: [
        CommonModule,
        ContextServiceTestingModule,
        TranslateModule,
        TranslateServiceStubModule,
        DialogCloseHandleStubModule,
        DialogModule,
        DirectivesModule,
        InputLabelModule,
        LoadingIndicatorModule,
        PageDesignModule,
        ItemCardModule,
        EmptyStateComponent,
      ],
      providers: [
        {
          provide: DialogCloseHandle,
          useValue: jasmine.createSpyObj<DialogCloseHandle>('DialogCloseHandle', ['close']),
        },
        {
          provide: PageTemplatesService,
          useValue: jasmine.createSpyObj<PageTemplatesService>('PageTemplatesService', ['getTenantPageTemplates']),
        },
        {
          provide: ContentTreeService,
          useValue: jasmine.createSpyObj<ContentTreeService>('ContentTreeService', ['addTempCreatedItem']),
        },
      ],
    }).compileComponents();

    pageTemplatesService = TestBedInjectSpy(PageTemplatesService);
    pageTemplatesService.getTenantPageTemplates.and.returnValue(of([]));

    itemDalService = TestBedInjectSpy(BaseItemDalService);

    context = TestBed.inject(ContextServiceTesting);
    context.provideDefaultTestContext();

    closeHandle = TestBedInjectSpy(DialogCloseHandle);
    contentTreeService = TestBedInjectSpy(ContentTreeService);
    fixture = TestBed.createComponent(TemplateSelectionDialogComponent);
    de = fixture.debugElement;
    sut = fixture.componentInstance;
    sut.isLoading = false;
    sut.itemId = 'sitecore1';
  }));

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should map insert options properly', fakeAsync(() => {
      const itemId = 'exampleItemId';
      const templates: TenantPageTemplate[] = [
        {
          template: { templateId: 'template1', name: 'Template 1', access: adminPermissions },
          pageDesign: {
            path: 'template1',
            displayName: 'Template 1',
            itemId: 'template1Id',
            name: 'Template 1',
            version: 1,
            hasChildren: false,
            thumbnailUrl: 'template1-thumbnail-url',
            hasPresentation: true,
            createdDate: '2023-06-23T12:00:00',
            updatedDate: '2023-06-23T12:00:00',
            isFolder: false,
            access: adminPermissions,
          },
        },
      ];

      pageTemplatesService.getTenantPageTemplates.and.returnValue(of(templates));
      itemDalService.getItemInsertOptions.and.returnValue(of([{ id: 'template1', displayName: 'Template 1' }]));

      sut.itemId = itemId;
      sut.itemName = 'Example Item';

      sut.ngOnInit();
      tick();

      expect(pageTemplatesService.getTenantPageTemplates).toHaveBeenCalledWith('sitecore1');
      expect(itemDalService.getItemInsertOptions).toHaveBeenCalledWith(itemId, 'page', 'pt-BR', 'sitecore1');
      sut.pageTemplates$.subscribe((pageTemplates) => {
        expect(pageTemplates).toEqual(templates);
      });
      sut.insertOptions$.subscribe((insertOptions) => {
        expect(insertOptions).toEqual([
          {
            displayName: 'Template 1',
            templateId: 'template1',
            parentId: itemId,
            thumbnailUrl: 'template1-thumbnail-url',
          },
        ]);
      });
      expect(sut.isLoading).toBe(false);
      flush();
    }));

    describe('close dialog', () => {
      it(`should close dialog and complete onSelection emitter subscribtions`, () => {
        const onSelectSpy = createSpyObserver();
        sut.onSelection.subscribe(onSelectSpy);

        sut.close();

        expect(closeHandle.close).toHaveBeenCalled();
      });

      it('should close the dialog on "X" button click', () => {
        closeBtn().click();

        expect(closeHandle.close).toHaveBeenCalled();
      });

      it('should close the dialog when `Cancel` button is clicked', () => {
        cancelBtn().click();

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

      it('should disable the button if no item selected', () => {
        sut.selectedItem$.next(undefined);
        fixture.detectChanges();

        expect(selectBtn().disabled).toBeTrue();
      });

      it('should enable the button when an item selected', async () => {
        const selectedInsertOption = {
          templateId: 'template',
          displayName: 'News',
          parentId: 'home',
          thumbnailUrl: undefined,
        };
        sut.selectedItem$.next(selectedInsertOption);

        await fixture.whenStable();

        expect(selectBtn().disabled).toBeFalse();
      });
    });

    describe('select template', () => {
      it('should add selected template to temporary created item in tree', async () => {
        const selectedInsertOption = {
          templateId: 'template 1',
          displayName: 'News',
          parentId: 'home',
          thumbnailUrl: undefined,
        };
        sut.selectedItem$.next(selectedInsertOption);

        const onSelectSpy = createSpyObserver();
        sut.onSelection.subscribe(onSelectSpy);

        sut.selectTemplate();
        await fixture.whenStable();

        expect(contentTreeService.addTempCreatedItem).toHaveBeenCalledWith(
          selectedInsertOption.templateId,
          'page',
          selectedInsertOption.parentId,
        );

        expect(onSelectSpy.next).toHaveBeenCalledWith(true);
        expect(closeHandle.close).toHaveBeenCalled();
      });
    });

    describe('empty state placeholder ', () => {
      it('should show empty-state component when insert options are empty', () => {
        itemDalService.getItemInsertOptions.and.returnValue(of([]));
        sut.isLoading = false;
        sut.itemId = '123';

        sut.ngOnInit();
        fixture.detectChanges();

        expect(emptyStateElement()).toBeTruthy();
      });

      it('should not show empty-state component when insert options are not empty', () => {
        itemDalService.getItemInsertOptions.and.returnValue(of(insertOption));
        sut.isLoading = false;

        sut.ngOnInit();
        fixture.detectChanges();

        expect(emptyStateElement()).toBeFalsy();
      });

      it('should not show empty-state component when loading', async () => {
        const itemInsertOption: ItemInsertOption[] = [{ displayName: 'test', id: 'testId' }];
        itemDalService.getItemInsertOptions.and.returnValue(of(itemInsertOption));
        sut.isLoading = true;

        sut.ngOnInit();
        await fixture.whenStable();

        expect(emptyStateElement()).toBeFalsy();
      });
    });
  });
});
