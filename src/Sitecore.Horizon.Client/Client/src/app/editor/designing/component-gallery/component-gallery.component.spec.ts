/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import {
  AccordionModule,
  EmptyStateModule,
  IconButtonModule,
  ImageThumbnailModule,
  LoadingIndicatorModule,
  PopoverModule,
} from '@sitecore/ng-spd-lib';
import { DragndropService } from 'app/editor/designing/dragndrop.service';
import { EditorWorkspaceService } from 'app/editor/editor-workspace/editor-workspace.service';
import { FEAAS_RENDERING_ID } from 'app/editor/right-hand-side/feaas-rhs-region/feaas-extension-filter';
import { FeatureFlagsModule } from 'app/feature-flags/feature-flags.module';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { PersonalizationService } from 'app/pages/left-hand-side/personalization/personalization-services/personalization.service';
import { ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { RenderingChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { CmUrlTestingModule } from 'app/shared/pipes/platform-url/cm-url.module.testing';
import { RenderingHostFeaturesService } from 'app/shared/rendering-host/rendering-host-features.service';
import { RenderingHostService } from 'app/shared/rendering-host/rendering-host.service';
import { normalizeGuid } from 'app/shared/utils/utils';
import { TestBedInjectSpy, TESTING_URL } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { ComponentGalleryComponent } from './component-gallery.component';
import { ComponentGalleryService, ComponentInfo, ComponentsResult } from './component-gallery.service';
import { GalleryItemComponent } from './gallery-item.component';

@Component({
  selector: 'test-component',
  template: `<app-component-gallery
    [phAllowedRenderingIds]="phAllowedRenderingIds"
    [rendering]="renderingInfo"
    (selectRendering)="replaceRendering($event)"
  >
  </app-component-gallery>`,
})
class TestComponent {
  phAllowedRenderingIds: readonly string[] = [];
  renderingInfo?: RenderingChromeInfo;
  renderingId?: string;
  replaceRendering(id: string) {
    this.renderingId = id;
  }
}

describe(ComponentGalleryComponent.name, () => {
  let testComponent: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let sut: ComponentGalleryComponent;

  let componentService: jasmine.SpyObj<ComponentGalleryService>;
  let editorService: jasmine.SpyObj<EditorWorkspaceService>;
  let personalizationService: jasmine.SpyObj<PersonalizationService>;
  let featureFlagsService: jasmine.SpyObj<FeatureFlagsService>;
  let renderingHostFeaturesService: jasmine.SpyObj<RenderingHostFeaturesService>;
  let renderingHostService: jasmine.SpyObj<RenderingHostService>;

  const components: ComponentInfo[] = [
    {
      displayName: 'CompA',
      iconUrl: 'iconA',
      id: '1',
      category: 'cat1',
      componentName: 'compa',
    },
    {
      displayName: 'CompB',
      iconUrl: 'iconB',
      id: '2',
      category: 'cat1',
      componentName: 'compb',
    },
    {
      displayName: 'CompC',
      iconUrl: 'iconC',
      id: '3',
      category: 'cat2',
    },
  ];

  const componentGalleryServiceSpy = jasmine.createSpyObj<ComponentGalleryService>([
    'watchComponents',
    'getPlaceholderAllowedComponents',
    'getCompatibleComponents',
  ]);

  const testRenderingInfo: RenderingChromeInfo = {
    chromeId: 'rnd_1',
    chromeType: 'rendering',
    displayName: 'displayName',
    renderingDefinitionId: 'aab',
    renderingInstanceId: 'test_instance_id',
    contextItem: { id: '', language: '', version: 1 },
    inlineEditorProtocols: [],
    isPersonalized: false,
    appliedPersonalizationActions: [],
    compatibleRenderings: ['rendering1', 'rendering2'],
    parentPlaceholderChromeInfo: {} as any,
  };

  const testComponentList: ComponentsResult = {
    ungrouped: [],
    groups: [
      {
        title: 'cat1',
        components: [components[0], components[1]],
      },
      {
        title: 'cat2',
        components: [components[0]],
      },
    ],
  };

  const dragndropServiceSpy = jasmine.createSpyObj<DragndropService>(['dragstart', 'dragend']);
  const emptyStateComp = () => fixture.debugElement.query(By.css('.search-result-empty'));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AccordionModule,
        CmUrlTestingModule,
        EmptyStateModule,
        ImageThumbnailModule,
        LoadingIndicatorModule,
        TranslateModule,
        TranslateServiceStubModule,
        NoopAnimationsModule,
        FeatureFlagsModule,
        IconButtonModule,
        PopoverModule,
        ContextServiceTestingModule,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [TestComponent, ComponentGalleryComponent, GalleryItemComponent],
      providers: [
        {
          provide: ComponentGalleryService,
          useValue: componentGalleryServiceSpy,
        },
        {
          provide: DragndropService,
          useValue: dragndropServiceSpy,
        },
        {
          provide: EditorWorkspaceService,
          useValue: jasmine.createSpyObj<EditorWorkspaceService>({
            watchCanvasLoadState: of({ isLoading: false, itemId: 'itemId001', language: 'en' }),
          }),
        },
        {
          provide: PersonalizationService,
          useValue: jasmine.createSpyObj<PersonalizationService>(['getIsInPersonalizationMode']),
        },
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>([
            'isFeatureEnabled',
            'isAngularRenderinghostFormsSupported',
          ]),
        },
        {
          provide: RenderingHostService,
          useValue: jasmine.createSpyObj<RenderingHostService>(['isReactRenderingHost', 'isAngularRenderingHost']),
        },
        {
          provide: RenderingHostFeaturesService,
          useValue: jasmine.createSpyObj<RenderingHostFeaturesService>([
            'watchComponents',
            'watchFeaturesLoading',
            'isFeatureEnabled',
          ]),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    sut = fixture.debugElement.query(By.directive(ComponentGalleryComponent)).componentInstance;

    componentService = TestBedInjectSpy(ComponentGalleryService);
    editorService = TestBedInjectSpy(EditorWorkspaceService);
    personalizationService = TestBedInjectSpy(PersonalizationService);
    featureFlagsService = TestBedInjectSpy(FeatureFlagsService);
    renderingHostService = TestBedInjectSpy(RenderingHostService);
    renderingHostFeaturesService = TestBedInjectSpy(RenderingHostFeaturesService);
    renderingHostFeaturesService.watchComponents.and.returnValue(of({ components: [], bypass: true }));
    renderingHostFeaturesService.watchFeaturesLoading.and.returnValue(of(false));
    renderingHostService.isReactRenderingHost.and.returnValue(Promise.resolve(true));
    featureFlagsService.isAngularRenderinghostFormsSupported.and.returnValue(true);
  });

  it('should be created', () => {
    fixture.detectChanges();
    expect(testComponent).toBeTruthy();
    expect(sut).toBeTruthy();
  });

  describe('WHEN rendering and placeholder are undefined', () => {
    it('should get component results for allowed rendering ids of all placeholders', fakeAsync(async () => {
      // act
      editorService.watchCanvasLoadState.and.returnValue(of({ isLoading: false, itemId: 'itemId001', language: 'en' }));
      testComponent.phAllowedRenderingIds = [];
      testComponent.renderingInfo = undefined;
      fixture.detectChanges();
      tick();

      // assert
      expect(componentService.watchComponents).toHaveBeenCalled();
    }));

    it('should render the draggble GalleryItem', async () => {
      // arrange
      testComponent.phAllowedRenderingIds = [];
      testComponent.renderingInfo = undefined;
      const componentData: ComponentsResult = {
        ungrouped: components,
        groups: [],
      };
      componentGalleryServiceSpy.watchComponents.and.returnValue(of(componentData));
      fixture.autoDetectChanges();
      await fixture.whenStable();

      const renderedItems = fixture.debugElement.queryAll(By.css('app-gallery-item'));
      const firstItem: HTMLButtonElement = renderedItems[0].nativeElement;

      // act
      firstItem.dispatchEvent(new DragEvent('dragstart'));
      firstItem.dispatchEvent(new DragEvent('dragend'));

      // assert
      expect(dragndropServiceSpy.dragstart).toHaveBeenCalledWith('1');
      expect(dragndropServiceSpy.dragend).toHaveBeenCalled();
    });
  });

  describe('WHEN  placeholder is defined but compatible rendering is not defined', () => {
    it('should get component list for allowed rendering ids of the specified placeholder', async () => {
      // act
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      (testComponent.phAllowedRenderingIds = ['rendering1', 'rendering2']), (testComponent.renderingInfo = undefined);

      fixture.detectChanges();

      // assert
      expect(componentService.getPlaceholderAllowedComponents).toHaveBeenCalledWith(['rendering1', 'rendering2']);
    });
  });

  describe('WHEN placeholder, rendering and compatible rendering are defined', () => {
    it('should get component list for compatible rendering ids of the specified rendering', () => {
      // act
      testComponent.phAllowedRenderingIds = ['rendering1', 'rendering2'];
      testComponent.renderingInfo = testRenderingInfo;

      fixture.detectChanges();

      // assert
      expect(componentService.getCompatibleComponents).toHaveBeenCalledWith(['rendering1', 'rendering2']);
    });

    it('should render the clickable GalleryItem', () => {
      // arrange
      testComponent.phAllowedRenderingIds = ['rendering1', 'rendering2'];
      testComponent.renderingInfo = testRenderingInfo;
      const componentData: ComponentsResult = {
        ungrouped: components,
        groups: [],
      };
      componentGalleryServiceSpy.getCompatibleComponents.and.returnValue(of(componentData));
      fixture.detectChanges();

      // act
      const renderedItems = fixture.debugElement.queryAll(By.css('app-gallery-item'));
      const firstItem: HTMLButtonElement = renderedItems[0].nativeElement;
      firstItem.click();

      // assert
      expect(testComponent.renderingId).toBe('1');
    });
  });

  it('should render a GalleryItem ungrouped component for each component provided by the service', () => {
    const componentData: ComponentsResult = {
      ungrouped: components,
      groups: [],
    };
    componentGalleryServiceSpy.watchComponents.and.returnValue(of(componentData));

    fixture.detectChanges();
    const renderedItems = fixture.debugElement.queryAll(By.directive(GalleryItemComponent));
    const firstItem = renderedItems[0];
    const firstImg = firstItem.query(By.css('img'));

    expect(renderedItems.length).toBe(3);
    expect((firstItem.nativeElement as HTMLElement).innerText).toContain(componentData.ungrouped[0].displayName);
    expect((firstImg.nativeElement as HTMLImageElement).src).toBe(TESTING_URL + componentData.ungrouped[0].iconUrl);
  });

  it('should render an section with GalleryItems for each group provided by the service', () => {
    const componentData: ComponentsResult = {
      ungrouped: [],
      groups: [
        {
          title: 'cat1',
          components: [components[0], components[1]],
        },
      ],
    };
    componentGalleryServiceSpy.watchComponents.and.returnValue(of(componentData));
    fixture.detectChanges();

    const headers = fixture.debugElement.queryAll(By.css('ng-spd-accordion-header'));
    fixture.detectChanges();

    expect(headers).toHaveSize(1);
    expect(headers[0].nativeElement.textContent).toContain(componentData.groups[0].title);
  });

  it('should render sections with groups including uncategorised', () => {
    const componentData: ComponentsResult = {
      ungrouped: [components[2]],
      groups: [
        {
          title: 'cat1',
          components: [components[0], components[1]],
        },
      ],
    };
    componentGalleryServiceSpy.watchComponents.and.returnValue(of(componentData));
    fixture.detectChanges();
    const headers = fixture.debugElement.queryAll(By.css('ng-spd-accordion-header'));
    fixture.detectChanges();

    expect(headers).toHaveSize(2);
    expect(headers[0].nativeElement.textContent).toContain(componentData.groups[0].title);
    expect(headers[1].nativeElement.textContent).toContain('EDITOR.UNCATEGORISED');
  });

  it('should render empty state when there is no allowed renderings to be used', () => {
    const componentData: ComponentsResult = {
      ungrouped: [],
      groups: [],
    };
    componentGalleryServiceSpy.watchComponents.and.returnValue(of(componentData));
    fixture.detectChanges();

    const emptyState = fixture.debugElement.query(By.css('ng-spd-empty-state'));
    expect(emptyState).toBeTruthy();
  });

  it('should mark components as disabled when they are not registered in the rendering host', () => {
    const componentData: ComponentsResult = {
      ungrouped: components,
      groups: [],
    };
    componentGalleryServiceSpy.watchComponents.and.returnValue(of(componentData));
    renderingHostFeaturesService.watchComponents.and.returnValue(of({ components: ['compa'], bypass: false }));
    fixture.detectChanges();

    const componentsList = fixture.debugElement.queryAll(By.css('app-gallery-item'));

    expect(componentsList[0].classes['disabled']).toBeFalsy();
    expect(componentsList[1].classes['disabled']).toBeTruthy();
    expect(componentsList[2].classes['disabled']).toBeFalsy();
  });

  it('should not mark components as disabled when component name is not defined', async () => {
    const componentData: ComponentsResult = {
      ungrouped: components.map((c) => ({ ...c, componentName: undefined })),
      groups: [],
    };
    componentGalleryServiceSpy.watchComponents.and.returnValue(of(componentData));
    renderingHostFeaturesService.watchComponents.and.returnValue(of({ components: ['compa'], bypass: false }));
    fixture.detectChanges();

    const componentsList = fixture.debugElement.queryAll(By.css('app-gallery-item'));

    expect(componentsList[0].classes['disabled']).toBeFalsy();
    expect(componentsList[1].classes['disabled']).toBeFalsy();
    expect(componentsList[2].classes['disabled']).toBeFalsy();
  });

  describe('loading', () => {
    let componentData: ComponentsResult;
    beforeEach(() => {
      componentData = {
        ungrouped: components,
        groups: [],
      };
    });

    new Array<[boolean, boolean, boolean]>([false, true, false], [false, true, false], [true, false, true]).forEach(
      ([listIsReady, showLoader, showList]) => {
        it(`[listIsReady: ${listIsReady}, show loader: ${showLoader}, show list of components: ${showList}] should properly resolve loading state`, () => {
          if (listIsReady) {
            componentService.watchComponents.and.returnValue(of(componentData));
          } else {
            componentService.watchComponents.and.returnValue(of());
          }
          editorService.watchCanvasLoadState.and.returnValue(
            of({ isLoading: false, itemId: 'itemId001', language: 'en' }),
          );
          sut.fEaaSComponentsFetched = true;
          fixture.detectChanges();

          const loader = fixture.debugElement.query(By.css('ng-spd-loading-indicator'));
          const cmptList = fixture.debugElement.query(By.css('app-gallery-item'));
          expect(!!loader).toBe(showLoader);
          expect(!!cmptList).toBe(showList);
        });
      },
    );
  });

  describe('FEaaS components gallery', async () => {
    new Array<[boolean, boolean, boolean, boolean, boolean]>(
      [false, false, true, true, false],
      [true, true, true, true, false],
      [true, false, false, true, false],
      [true, false, true, false, false],
      [true, false, true, true, true],
    ).forEach(
      ([
        isFeatureEnabled,
        isPersonalizationMode,
        isAllowedRendering,
        isFEaaSSupportedEditingHost,
        showFEaaSGallery,
      ]) => {
        it(`when isFeatureEnabled: ${isFeatureEnabled}, isPersonalizationMode:${isPersonalizationMode}, isAllowedRendering:${isAllowedRendering} should showFEaaSGallery:${showFEaaSGallery} `, () => {
          featureFlagsService.isFeatureEnabled.and.returnValue(isFeatureEnabled);
          personalizationService.getIsInPersonalizationMode.and.returnValue(isPersonalizationMode);
          if (isAllowedRendering) {
            testComponent.phAllowedRenderingIds = [normalizeGuid(FEAAS_RENDERING_ID)];
          } else {
            testComponent.phAllowedRenderingIds = ['rendering1'];
          }
          sut.isFEaaSSupportedEditingHost = isFEaaSSupportedEditingHost;
          fixture.detectChanges();

          const feaasGallery = fixture.debugElement.query(By.css('app-feaas-components-gallery'));
          expect(!!feaasGallery).toBe(showFEaaSGallery);
        });
      },
    );
  });

  describe('search', () => {
    it('should return group with all components if search string match group name', () => {
      // Arrange
      componentGalleryServiceSpy.watchComponents.and.returnValue(of(testComponentList));
      sut.onSearchValueChanged('cat1');
      fixture.detectChanges();

      const headers = fixture.debugElement.queryAll(By.css('ng-spd-accordion-header'));
      const componentsList = fixture.debugElement.queryAll(By.css('app-gallery-item'));
      fixture.detectChanges();

      expect(headers).toHaveSize(1);
      expect(headers[0].nativeElement.textContent).toContain(testComponentList.groups[0].title);
      expect(componentsList).toHaveSize(2);
    });

    it('should return group with matching component only if search string match component name', () => {
      // Arrange
      componentGalleryServiceSpy.watchComponents.and.returnValue(of(testComponentList));
      sut.onSearchValueChanged('CompB');
      fixture.detectChanges();

      const headers = fixture.debugElement.queryAll(By.css('ng-spd-accordion-header'));
      const componentsList = fixture.debugElement.queryAll(By.css('app-gallery-item'));

      fixture.detectChanges();

      expect(headers).toHaveSize(1);
      expect(headers[0].nativeElement.textContent).toContain(testComponentList.groups[0].title);
      expect(componentsList).toHaveSize(1);
    });

    it('should show empty state component when search result is empty', () => {
      editorService.watchCanvasLoadState.and.returnValue(of({ isLoading: false, itemId: 'itemId001', language: 'en' }));
      sut.hasSearchedFEaasComponents = false;
      sut.hasSearchedSxaComponents$ = of(false);
      sut.normalizedSearchText$ = of('test');

      fixture.detectChanges();
      sut.ngOnInit();

      expect(emptyStateComp()).toBeTruthy();
    });

    it('should not show empty state component if it is not loading, has search string and search result', async () => {
      editorService.watchCanvasLoadState.and.returnValue(of({ isLoading: false, itemId: 'itemId001', language: 'en' }));
      sut.hasSearchedFEaasComponents = false;
      sut.hasSearchedSxaComponents$ = of(false);

      sut.ngOnInit();
      fixture.detectChanges();

      expect(emptyStateComp()).toBeFalsy();
    });
  });
});
