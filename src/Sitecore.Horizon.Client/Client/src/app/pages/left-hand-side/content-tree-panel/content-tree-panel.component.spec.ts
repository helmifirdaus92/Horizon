/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule, HeaderWithButtonModule, IconButtonModule } from '@sitecore/ng-spd-lib';
import { ContentTreeSearchDalService } from 'app/pages/content-tree-search/content-tree-search.dal.service';
import { ContentTreeSearchModule } from 'app/pages/content-tree-search/content-tree-search.module';
import { ContentTreeService } from 'app/pages/content-tree/content-tree.service';
import { ContextNavigationService } from 'app/shared/client-state/context-navigation.sevice';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { Item } from 'app/shared/graphql/item.interface';
import { CreateFolderServiceTesting } from 'app/testing/create-folder-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { CreateFolderService } from '../create-page/create-folder.service';
import { TemplateSelectionDialogService } from '../create-page/template-selection-dialog/template-selection-dialog.service';
import { ContentTreePanelComponent } from './content-tree-panel.component';

describe(ContentTreePanelComponent.name, () => {
  let sut: ContentTreePanelComponent;
  let fixture: ComponentFixture<ContentTreePanelComponent>;

  let templateSelectionDialogService: jasmine.SpyObj<TemplateSelectionDialogService>;
  let contextService: ContextServiceTesting;
  let createBtn: DebugElement;
  let createFolderService: CreateFolderServiceTesting;
  const permissions = { canCreate: true, canWrite: true };
  let getItemSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule,
        TranslateServiceStubModule,
        CommonModule,
        ContextServiceTestingModule,
        NoopAnimationsModule,
        HeaderWithButtonModule,
        ContentTreeSearchModule,
        IconButtonModule,
        ButtonModule,
      ],
      declarations: [ContentTreePanelComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: CreateFolderService,
          useClass: CreateFolderServiceTesting,
        },
        {
          provide: TemplateSelectionDialogService,
          useValue: jasmine.createSpyObj<TemplateSelectionDialogService>('TemplateSelectionDialogService', ['show']),
        },
        {
          provide: ContentTreeSearchDalService,
          useValue: jasmine.createSpyObj<ContentTreeSearchDalService>(['search']),
        },
        {
          provide: ContentTreeService,
          useValue: jasmine.createSpyObj<ContentTreeService>(['getChildeNodes']),
        },
        {
          provide: ContextNavigationService,
          useValue: jasmine.createSpyObj<ContextNavigationService>({}, { mostInnerRouteSegment$: of('editor') }),
        },
      ],
    });

    fixture = TestBed.createComponent(ContentTreePanelComponent);
    sut = fixture.componentInstance;
    createFolderService = TestBed.inject(CreateFolderService) as any;

    templateSelectionDialogService = TestBedInjectSpy(TemplateSelectionDialogService);
    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideDefaultTestContext();
    getItemSpy = spyOn(contextService, 'getItem');
    getItemSpy.and.resolveTo({ permissions, name: 'item', id: '123' } as Item);
    templateSelectionDialogService.show.and.returnValue(of(true));

    fixture.detectChanges();

    createBtn = fixture.debugElement.query(By.css('button'));
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should not render the create page panel by default', () => {
    const createPanel = fixture.debugElement.query(By.css('app-create-folder'));
    expect(createPanel).toBeNull();
  });

  describe('WHEN create page btn is clicked', () => {
    it('should open the template selection dialog', fakeAsync(async () => {
      await contextService.updateContext({ itemId: 'id1' });
      createBtn.triggerEventHandler('click', {});
      tick();

      expect(templateSelectionDialogService.show).toHaveBeenCalledWith('id1', 'item');
      flush();
    }));
  });

  it('should render search component and hide the tree', () => {
    const searchButton = fixture.debugElement.query(By.css('.header-search')).nativeElement;
    searchButton.click();
    fixture.detectChanges();

    const searchComponent = fixture.debugElement.query(By.css('app-content-tree-search'));
    expect(searchComponent).toBeTruthy();

    const treePanelElement = fixture.debugElement.query(By.css('.tree-panel')).nativeElement;
    expect(getComputedStyle(treePanelElement).display).toBe('none');
  });

  describe('WHEN CreateFolderService emits on startCreateOperation$', () => {
    it('should open the create folder panel', fakeAsync(() => {
      spyOn(createFolderService, 'getInsertOptions').and.returnValue(
        of([
          {
            id: 'testOption',
            name: 'Test Option',
            displayName: 'Test Option Display Name',
          },
        ]),
      );
      createFolderService.startCreateOperation$.next({ parentId: 'item123' });
      tick();
      fixture.detectChanges();

      const createPanel = fixture.debugElement.query(By.css('app-create-folder'));
      expect(createPanel).toBeTruthy();
      flush();
    }));

    it('should not open the create folder panel and show a notification when no insert options', fakeAsync(() => {
      spyOn(createFolderService, 'getInsertOptions').and.returnValue(of([]));
      const notificationSpy = spyOn(sut as any, 'showCreateFolderWarningNotifiction').and.callThrough();

      createFolderService.startCreateOperation$.next({ parentId: 'item123' });
      tick();
      fixture.detectChanges();
      const createPanel = fixture.debugElement.query(By.css('app-create-folder'));

      expect(notificationSpy).toHaveBeenCalled();
      expect(createPanel).toBeFalsy();
      flush();
    }));
  });

  describe('create permission', () => {
    it('should disable the create page buton if no create permission', async () => {
      const noCreatePermissions = { canCreate: false, canWrite: false };
      getItemSpy.and.resolveTo({ permissions: noCreatePermissions, name: 'item', id: '1234' } as Item);
      contextService.updateContext({ itemId: '1234' });

      fixture.detectChanges();

      expect((createBtn.nativeElement as HTMLButtonElement).disabled).toBeTrue();
    });
  });

  describe('storeScroll', () => {
    it('should handle a scrolling event', () => {
      sut.setScrollState({ target: { scrollTop: 10 } } as any);
      expect(sut.hasScroll).toBe(true);

      sut.setScrollState({ target: { scrollTop: 0 } } as any);
      expect(sut.hasScroll).toBe(false);
    });
  });
});
