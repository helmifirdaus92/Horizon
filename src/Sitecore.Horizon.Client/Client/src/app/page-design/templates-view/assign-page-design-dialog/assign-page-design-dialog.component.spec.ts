/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseHandle, DialogModule, InputLabelModule } from '@sitecore/ng-spd-lib';
import { PageTemplatesService } from 'app/page-design/page-templates.service';
import { ItemWithSite, TenantPageTemplate } from 'app/page-design/page-templates.types';
import { DirectivesModule } from 'app/shared/directives/directives/directives.module';
import { DialogCloseHandleStubModule } from 'app/testing/dialog-close-handle-stub.module';
import { createSpyObserver, TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { BehaviorSubject, of } from 'rxjs';

import { Router } from '@angular/router';
import { PageDesignModule } from 'app/page-design/page-design.module';
import { adminPermissions, mockThumbnailUrl } from 'app/page-design/shared/page-templates-test-data';
import { CanvasUrlBuilder } from 'app/shared/canvas/url-builder';
import { RequiredContext } from 'app/shared/client-state/context.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { BaseItemDalService, ItemDalService } from 'app/shared/graphql/item.dal.service';
import { Item } from 'app/shared/graphql/item.interface';
import { AssignPageDesignDialogComponent } from './assign-page-design-dialog.component';

const tenantTemplateList: TenantPageTemplate[] = [
  {
    template: { templateId: 'test-template', name: 'Test Template', access: adminPermissions },
    pageDesign: {
      path: '/path/to/page-design2',
      displayName: 'page design 2',

      itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
      name: 'page design 2',
      version: 1,
      hasChildren: false,
      thumbnailUrl: '',
      hasPresentation: true,
      isFolder: false,
      createdDate: '20230428T111641Z',
      updatedDate: '20230429T111641Z',
      children: undefined,
      access: adminPermissions,
    },
  },
];

const pageDesignList: ItemWithSite[] = [
  {
    path: '/path/to/page-design1',
    displayName: 'page design 1',
    itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
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
];

describe(AssignPageDesignDialogComponent.name, () => {
  let sut: AssignPageDesignDialogComponent;
  let fixture: ComponentFixture<AssignPageDesignDialogComponent>;
  let closeHandle: jasmine.SpyObj<DialogCloseHandle>;
  let router: jasmine.SpyObj<Router>;

  let contextService: ContextServiceTesting;
  let pageTemplatesServiceSpy: jasmine.SpyObj<PageTemplatesService>;

  let canvasUrlBuilder: jasmine.SpyObj<CanvasUrlBuilder>;

  const closeBtn = (): HTMLButtonElement => {
    return fixture.debugElement.query(By.css('ng-spd-dialog-close-button button')).nativeElement;
  };

  const cancelBtn = (): HTMLButtonElement => {
    return fixture.debugElement.query(By.css('ng-spd-dialog-actions button:not(.primary)')).nativeElement;
  };

  const assignBtn = (): HTMLButtonElement => {
    return fixture.debugElement.query(By.css('ng-spd-dialog-actions [ngspdbutton="primary"]')).nativeElement;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssignPageDesignDialogComponent],
      imports: [
        CommonModule,
        ContextServiceTestingModule,
        TranslateModule,
        TranslateServiceStubModule,
        CommonModule,
        DialogCloseHandleStubModule,
        DialogModule,
        DirectivesModule,
        InputLabelModule,
        PageDesignModule,
      ],
      providers: [
        {
          provide: DialogCloseHandle,
          useValue: jasmine.createSpyObj<DialogCloseHandle>('DialogCloseHandle', ['close']),
        },
        {
          provide: PageTemplatesService,
          useValue: jasmine.createSpyObj<PageTemplatesService>('PageTemplatesService', [
            'getPageDesignsList',
            'getTenantPageTemplates',
            'configurePageDesign',
          ]),
        },
        {
          provide: CanvasUrlBuilder,
          useValue: jasmine.createSpyObj<CanvasUrlBuilder>('CanvasUrlBuilder', ['buildPreviewModeUrl']),
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj<Router>({
            navigate: Promise.resolve(true),
          }),
        },
        {
          provide: BaseItemDalService,
          useValue: jasmine.createSpyObj<ItemDalService>({ getItem: of({ route: 'route132' } as Item) }),
        },
      ],
    }).compileComponents();

    pageTemplatesServiceSpy = TestBedInjectSpy(PageTemplatesService);

    contextService = TestBed.inject(ContextServiceTesting);
    router = TestBedInjectSpy(Router);

    pageTemplatesServiceSpy = TestBedInjectSpy(PageTemplatesService);
    canvasUrlBuilder = TestBedInjectSpy(CanvasUrlBuilder);
    closeHandle = TestBedInjectSpy(DialogCloseHandle);

    fixture = TestBed.createComponent(AssignPageDesignDialogComponent);
    sut = fixture.componentInstance;

    pageTemplatesServiceSpy.getTenantPageTemplates.and.returnValue(of(tenantTemplateList));
    pageTemplatesServiceSpy.getPageDesignsList.and.returnValue(of(pageDesignList));
    contextService.provideDefaultTestContext();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('close dialog', () => {
    it(`should close dialog and complete onAssign emitter subscribtions`, () => {
      const onAssignSpy = createSpyObserver();
      sut.onAssign.subscribe(onAssignSpy);

      sut.close();

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

    it('should disable the button if selected page design matches already assigned design', () => {
      sut.alreadyAssignedDesignId = 'already-assigned-design-id';

      const pageDesign = {
        path: '/path/to/page-design1',
        displayName: 'page design 1',
        itemId: 'already-assigned-design-id',
        name: 'page design 1',
        version: 1,
        hasChildren: false,
        thumbnailUrl: mockThumbnailUrl,
        hasPresentation: true,
        isFolder: false,
        createdDate: '20230428T111641Z',
        updatedDate: '20230429T111641Z',
        children: undefined,
        siteName: 'website1',
        access: adminPermissions,
      };
      sut.selectedPageDesign$ = new BehaviorSubject<ItemWithSite | undefined>(pageDesign);

      fixture.detectChanges();

      expect(assignBtn().disabled).toBeTrue();
    });

    it('should enable the button if page design is selected and does not match already assigned design', () => {
      sut.alreadyAssignedDesignId = 'already-assigned-design-id';

      const pageDesign = {
        path: '/path/to/page-design1',
        displayName: 'page design 1',
        itemId: 'new-design-id',
        name: 'page design 1',
        version: 1,
        hasChildren: false,
        thumbnailUrl: mockThumbnailUrl,
        hasPresentation: true,
        isFolder: false,
        createdDate: '20230428T111641Z',
        updatedDate: '20230429T111641Z',
        children: undefined,
        siteName: 'website1',
        access: adminPermissions,
      };
      sut.selectedPageDesign$ = new BehaviorSubject<ItemWithSite | undefined>(pageDesign);

      fixture.detectChanges();

      expect(assignBtn().disabled).toBeFalse();
    });
  });

  describe('assign Page design', () => {
    it('should assign selected page design to template', fakeAsync(() => {
      // Arrange
      const selectedPageDesignItem = {
        path: '/path/to/page-design1',
        displayName: 'page design 1',
        itemId: 'new-design-id',
        name: 'page design 1',
        version: 1,
        hasChildren: false,
        thumbnailUrl: mockThumbnailUrl,
        hasPresentation: true,
        isFolder: false,
        createdDate: '20230428T111641Z',
        updatedDate: '20230429T111641Z',
        children: undefined,
        siteName: 'website1',
        access: adminPermissions,
      };

      sut.selectedPageDesign$ = new BehaviorSubject<ItemWithSite | undefined>(selectedPageDesignItem);
      pageTemplatesServiceSpy.configurePageDesign.and.returnValue(
        of({
          success: true,
          errorMessage: null,
        }),
      );

      const onAssignSpy = createSpyObserver();
      sut.onAssign.subscribe(onAssignSpy);

      // Act
      sut.assignPageDesign();
      tick();

      // Assert
      expect(pageTemplatesServiceSpy.configurePageDesign).toHaveBeenCalledWith({
        siteName: 'sitecore1',
        mapping: [
          {
            templateId: sut.templateId,
            pageDesignId: selectedPageDesignItem.itemId,
          },
        ],
      });

      expect(onAssignSpy.next).toHaveBeenCalledWith(true);
      expect(closeHandle.close).toHaveBeenCalled();
      flush();
    }));

    it('should clear selected page design on deselectPageDesign()', () => {
      const selectedPageDesignItem = {
        path: '/path/to/page-design1',
        displayName: 'page design 1',
        itemId: 'new-design-id',
        name: 'page design 1',
        version: 1,
        hasChildren: false,
        thumbnailUrl: mockThumbnailUrl,
        hasPresentation: true,
        isFolder: false,
        createdDate: '20230428T111641Z',
        updatedDate: '20230429T111641Z',
        children: undefined,
        siteName: 'website1',
        access: adminPermissions,
      };

      sut.selectedPageDesign$.next(selectedPageDesignItem);
      sut.deselectPageDesign();

      sut.selectedPageDesign$.subscribe((value) => {
        expect(value).toBeUndefined();
      });
    });
  });

  describe('open page design preview', () => {
    it('should open preview window when pageDesignId is provided', fakeAsync(() => {
      // Arrange
      spyOn(window, 'open');
      const pageDesignId = '123';
      const expectedPreviewUrl = 'https://cm.com/?sc_horizon=preview&sc_itemid=123&sc_lang=en&sc_site=example';

      canvasUrlBuilder.buildPreviewModeUrl.and.resolveTo(expectedPreviewUrl);

      // Act
      sut.openPageDesignPreview(pageDesignId);
      tick();

      // Assert
      const context: RequiredContext = {
        itemId: pageDesignId,
        language: contextService.language,
        siteName: contextService.siteName,
      };
      expect(canvasUrlBuilder.buildPreviewModeUrl).toHaveBeenCalledWith(context, 'route132');
      expect(window.open).toHaveBeenCalledWith(expectedPreviewUrl, '_blank');
      flush();
    }));
  });

  describe('open page designs', () => {
    it('should navigate to page designs', () => {
      sut.openPageDesigns();

      expect(closeHandle.close).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/templates/pagedesigns']);
    });
  });
});
