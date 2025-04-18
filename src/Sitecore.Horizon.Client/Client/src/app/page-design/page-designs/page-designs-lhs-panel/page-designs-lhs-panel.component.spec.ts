/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannel } from '@sitecore/horizon-messaging/dist/testing';
import {
  IconButtonModule,
  ItemCardModule,
  LoadingIndicatorModule,
  PopoverModule,
  SearchInputModule,
  TabComponent,
} from '@sitecore/ng-spd-lib';
import { PageDesignModule } from 'app/page-design/page-design.module';
import { PageTemplatesService } from 'app/page-design/page-templates.service';
import { Item } from 'app/page-design/page-templates.types';
import { adminPermissions, mockThumbnailUrl } from 'app/page-design/shared/page-templates-test-data';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { EditingChannelDef } from 'app/shared/messaging/horizon-canvas.contract.defs';
import {
  EditingCanvasRpcServices,
  EditingHorizonEvents,
  EditingHorizonRpcServices,
  PlaceholderChromeInfo,
  RenderingFieldsdData,
} from 'app/shared/messaging/horizon-canvas.contract.parts';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { CmUrlModule } from 'app/shared/pipes/platform-url/cm-url.module';
import { CmUrlTestingModule } from 'app/shared/pipes/platform-url/cm-url.module.testing';
import { nextTick, TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { EditingCanvasEvents } from 'sdk/contracts/editing-canvas.contract';
import { PageDesignsLhsPanelComponent } from './page-designs-lhs-panel.component';

const Initial_Context = {
  itemId: 'itemId1',
  language: 'lang1',
  siteName: 'website1',
};

const partial1 = {
  path: '/path/to/root1/partial-design',
  displayName: 'Partial Design 1',
  itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
  name: 'PartialDesign1',
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
};
const partial2 = {
  path: '/path/to/root1/partial-design',
  displayName: 'Partial Design 2',
  itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C4',
  name: 'PartialDesign2',
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
};
const sharedPartial1 = {
  path: '/path/to/shared/partial-design',
  displayName: 'Shared Partial Design 1',
  itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C3',
  name: 'SharedPartialDesign1',
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
};
const sharedPartial2 = {
  path: '/path/to/shared/partial-design',
  displayName: 'Sharted Partial Design 2',
  itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C2',
  name: 'SharedPartialDesign1',
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
};

const allPartials: Item[] = [partial1, partial2, sharedPartial1, sharedPartial2];
const pageDesignPartials = [partial1.itemId, sharedPartial1.itemId];

describe(PageDesignsLhsPanelComponent.name, () => {
  let sut: PageDesignsLhsPanelComponent;
  let fixture: ComponentFixture<PageDesignsLhsPanelComponent>;
  let pageTemplatesService: jasmine.SpyObj<PageTemplatesService>;
  let contextService: ContextServiceTesting;
  let editingTestChannel: TestMessagingP2PChannel<
    EditingCanvasEvents,
    EditingHorizonEvents,
    EditingCanvasRpcServices,
    EditingHorizonRpcServices
  >;

  async function detectChanges() {
    fixture.detectChanges();
    await nextTick();
    fixture.detectChanges();
  }

  async function whenInitialized() {
    await Promise.resolve();
    fixture.detectChanges();
    await fixture.whenStable();
    await Promise.resolve();
  }

  const searchInputContainer = () => fixture.debugElement.query(By.css('.search'));
  const getTabs = () => fixture.debugElement.queryAll(By.directive(TabComponent));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule,
        TranslateServiceStubModule,
        ContextServiceTestingModule,
        PopoverModule,
        CmUrlTestingModule,
        CmUrlModule,
        IconButtonModule,
        ItemCardModule,
        LoadingIndicatorModule,
        SearchInputModule,
        PipesModule,
        PageDesignModule,
      ],
      declarations: [PageDesignsLhsPanelComponent],
      providers: [
        {
          provide: PageTemplatesService,
          useValue: jasmine.createSpyObj<PageTemplatesService>('PageTemplatesService', [
            'getPartialDesignsList',
            'getPageDesignPartials',
            'assignPageDesignPartials',
            'setSelectedPartialDesignItems',
            'getTenantPageTemplates',
          ]),
        },
        {
          provide: MessagingService,
          useValue: jasmine.createSpyObj<MessagingService>('MessagingService', ['getEditingCanvasChannel']),
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj<Router>({
            navigate: Promise.resolve(true),
          }),
        },
        TimedNotificationsService,
      ],
    }).compileComponents();

    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideTestValue(Initial_Context);

    pageTemplatesService = TestBedInjectSpy(PageTemplatesService);
    pageTemplatesService.getPartialDesignsList.and.returnValue(of([...allPartials]));
    pageTemplatesService.getPageDesignPartials.and.returnValue(of([...pageDesignPartials]));
    pageTemplatesService.getTenantPageTemplates.and.returnValue(of([]));

    editingTestChannel = makeTestMessagingP2PChannelFromDef(EditingChannelDef, {
      updatePageState: () => {},
      selectChrome: () => {},
      deselectChrome: () => {},
      highlightPartialDesign: () => {},
      unhighlightPartialDesign: () => {},
      getChildRenderings: () => [],
      getChildPlaceholders: () => [{ placeholderKey: '/content/phOnRendering1' } as PlaceholderChromeInfo],
      selectRendering: () => {},
      getRenderingFields: () => ({}) as RenderingFieldsdData,
      getPageFields: () => [],
    });

    const messaging = TestBedInjectSpy(MessagingService);
    messaging.getEditingCanvasChannel.and.returnValue(editingTestChannel);

    fixture = TestBed.createComponent(PageDesignsLhsPanelComponent);
    sut = fixture.componentInstance;
    detectChanges();
  }));

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should fetch all partial designs and show selected and available partials', async () => {
      const expectedSelectedPartials: Item[] = [partial1, sharedPartial1];
      const expectedAvailablePartials: Item[] = [partial2, sharedPartial2];

      // Assert
      expect(pageTemplatesService.getPartialDesignsList).toHaveBeenCalledWith(Initial_Context.siteName);
      expect(pageTemplatesService.getPageDesignPartials).toHaveBeenCalledWith(Initial_Context.itemId);

      expect(sut.selectedPartialDesignItems).toEqual(expectedSelectedPartials);
      expect(sut.availablePartialDesignItems).toEqual(expectedAvailablePartials);
    });
    it('should fetch templates which contains selected page design', async () => {
      // Arrange
      pageTemplatesService.getTenantPageTemplates.and.returnValue(
        of([
          {
            template: { templateId: 'test-template', name: 'Test Template', access: adminPermissions },
            pageDesign: {
              path: '/path/to/page-design2',
              displayName: 'page design 2',
              itemId: 'itemid1',
              name: 'page design 2',
              version: 1,
              hasChildren: false,
              insertOptions: [],
              thumbnailUrl: '',
              hasPresentation: true,
              isFolder: false,
              createdDate: '20230428T111641Z',
              updatedDate: '20230429T111641Z',
              access: adminPermissions,
              children: undefined,
            },
          },
        ]),
      );

      // Act
      await sut.ngOnInit();
      getTabs()[1].nativeElement.click();
      fixture.detectChanges();

      const templateListElement = fixture.debugElement.queryAll(By.css('.data-templates li'));

      // Assert
      expect(pageTemplatesService.getTenantPageTemplates).toHaveBeenCalledWith(Initial_Context.siteName);
      expect(templateListElement).toBeTruthy();
      expect(templateListElement.length).toBe(1);
    });
  });

  describe('design & details tabs', () => {
    it('should show design tab', () => {
      // Arrange
      const designTab = getTabs()[0].nativeElement as HTMLButtonElement;

      // Act
      designTab.click();
      fixture.detectChanges();

      // Assert
      expect(getTabs().length).toBe(2);
      expect(getTabs()[0].nativeElement.textContent).toEqual(' PAGE_DESIGNS.LHS_PANEL.DESIGN ');
      expect((getTabs()[0].nativeElement as HTMLElement).classList).toContain('active');
    });

    it('should show details tab', () => {
      // Arrange
      const detailsTab = getTabs()[1].nativeElement as HTMLButtonElement;

      // Act
      detailsTab.click();
      fixture.detectChanges();

      // Assert
      expect(getTabs().length).toBe(2);
      expect(getTabs()[1].nativeElement.textContent).toEqual(' EDITOR.DETAILS ');
      expect((getTabs()[1].nativeElement as HTMLElement).classList).toContain('active');
    });
  });

  describe('removeItem', () => {
    it('should remove the item from selected partials and add it to available partials', fakeAsync(() => {
      // Arrange
      pageTemplatesService.assignPageDesignPartials.and.returnValue(of({ success: true, errorMessage: null }));

      const expectedSelectedPartials: Item[] = [sharedPartial1];
      const expectedAvailablePartials: Item[] = [partial1, partial2, sharedPartial2];
      const expectedPageDesignPartials: string[] = [sharedPartial1.itemId];

      // Act
      sut.removeItem(partial1.itemId);
      tick();

      expect(pageTemplatesService.assignPageDesignPartials).toHaveBeenCalledWith(
        Initial_Context.itemId,
        expectedPageDesignPartials,
      );
      expect(sut.selectedPartialDesignItems).toEqual(expectedSelectedPartials);
      expect(sut.availablePartialDesignItems).toEqual(expectedAvailablePartials);
      flush();
    }));
  });

  describe('selectItem', () => {
    it('should add the item to the end of selected partial list and remove it from available partials list', fakeAsync(() => {
      // Arrange
      pageTemplatesService.assignPageDesignPartials.and.returnValue(of({ success: true, errorMessage: null }));

      const expectedSelectedPartials: Item[] = [partial1, sharedPartial1, partial2];
      const expectedAvailablePartials: Item[] = [sharedPartial2];
      const expectedPageDesignPartials: string[] = [partial1.itemId, sharedPartial1.itemId, partial2.itemId];

      // Act
      sut.selectItem(partial2.itemId);
      tick();

      expect(pageTemplatesService.assignPageDesignPartials).toHaveBeenCalledWith(
        Initial_Context.itemId,
        expectedPageDesignPartials,
      );
      expect(sut.selectedPartialDesignItems).toEqual(expectedSelectedPartials);
      expect(sut.availablePartialDesignItems).toEqual(expectedAvailablePartials);
      flush();
    }));

    it('should show search input container if available partials list is not empty', () => {
      // Arrange
      sut.availablePartialDesignItems = [partial1];

      // Act
      fixture.detectChanges();

      // Assert
      expect(searchInputContainer()).toBeDefined();
    });

    it('should hide search input container if available partials list is empty', () => {
      // Arrange
      sut.availablePartialDesignItems = [];

      // Act
      fixture.detectChanges();

      // Assert
      expect(searchInputContainer().nativeElement.classList).toContain('hidden');
    });

    it('should update available partials list when search input value match design name', fakeAsync(() => {
      // Arrange
      sut.availablePartialDesignItems = [partial1, partial2];
      const input = searchInputContainer().query(By.css('input')).nativeElement;

      // Act
      input.value = 'Partial Design 1';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const partialDesignList = fixture.debugElement.queryAll(By.css('.available-partial-design-item'));

      // Assert
      expect(partialDesignList.length).toBe(1);
      flush();
    }));

    it('should show empty state component when search input value does not match any design name', () => {
      // Arrange
      sut.availablePartialDesignItems = [partial1, partial2];
      const input = searchInputContainer().query(By.css('input')).nativeElement;

      // Act
      input.value = 'Partial Design 3';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Assert
      expect(fixture.debugElement.query(By.css('.app-empty-state'))).toBeDefined();
    });
  });

  describe('highlight selected partial designs', () => {
    it('should highlight partial design when hovered in the list of selected partial designs', async () => {
      const spy = spyOn(sut, 'highlightPartialDesign');

      const selectedPartialDesigns = fixture.debugElement.queryAll(By.css('.selected-partial-design-item'));
      (selectedPartialDesigns[0].nativeElement as HTMLDivElement).dispatchEvent(
        new MouseEvent('mouseenter', {
          composed: true,
        }),
      );
      await whenInitialized();

      expect(spy).toHaveBeenCalledWith(partial1);
    });

    it('should unhighlight partial design on mouse leave from the list of selected partial designs', async () => {
      const spy = spyOn(sut, 'unhighlightPartialDesignInCanvas');

      const selectedPartialDesigns = fixture.debugElement.queryAll(By.css('.selected-partial-design-item'));
      (selectedPartialDesigns[0].nativeElement as HTMLDivElement).dispatchEvent(
        new MouseEvent('mouseenter', {
          composed: true,
        }),
      );
      (selectedPartialDesigns[0].nativeElement as HTMLDivElement).dispatchEvent(
        new MouseEvent('mouseleave', {
          composed: true,
        }),
      );
      await whenInitialized();

      expect(spy).toHaveBeenCalled();
    });

    it('should highlight the selected partial design on mouse leave from the list of selected partial designs', async () => {
      const spy = spyOn(sut, 'highlightPartialDesign');

      const selectedPartialDesigns = fixture.debugElement.queryAll(By.css('.selected-partial-design-item'));
      (selectedPartialDesigns[0].nativeElement as HTMLDivElement).dispatchEvent(
        new MouseEvent('mouseenter', {
          composed: true,
        }),
      );
      (selectedPartialDesigns[0].nativeElement as HTMLDivElement).click();
      (selectedPartialDesigns[0].nativeElement as HTMLDivElement).dispatchEvent(
        new MouseEvent('mouseleave', {
          composed: true,
        }),
      );
      (selectedPartialDesigns[1].nativeElement as HTMLDivElement).dispatchEvent(
        new MouseEvent('mouseenter', {
          composed: true,
        }),
      );
      (selectedPartialDesigns[1].nativeElement as HTMLDivElement).dispatchEvent(
        new MouseEvent('mouseleave', {
          composed: true,
        }),
      );
      await whenInitialized();

      expect(spy).toHaveBeenCalledWith(partial1);
    });

    it('should select highlighted partial design when clicked in the list of selected partial designs', () => {
      const selectedPartialDesigns = fixture.debugElement.queryAll(By.css('.selected-partial-design-item'));
      (selectedPartialDesigns[0].nativeElement as HTMLDivElement).click();
      detectChanges();

      expect(sut.selectedHighlightedItem).toBe(partial1);
    });
  });
});
