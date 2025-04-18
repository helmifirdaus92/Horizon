/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
  AccordionModule,
  ButtonModule,
  EmptyStateModule,
  IconButtonModule,
  ImageThumbnailModule,
  LoadingIndicatorModule,
} from '@sitecore/ng-spd-lib';
import { SlideInPanelModule } from 'app/component-lib/slide-in-panel/slide-in-panel.module';
import { BYOC_RENDERING_ID } from 'app/editor/right-hand-side/feaas-rhs-region/feaas-extension-filter';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { CmUrlModule } from 'app/shared/pipes/platform-url/cm-url.module';
import { RenderingHostFeaturesService } from 'app/shared/rendering-host/rendering-host-features.service';
import { Writable } from 'app/shared/utils/lang.utils';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of, Subject } from 'rxjs';
import { DesigningService } from '../designing.service';
import { DragndropService } from '../dragndrop.service';
import { FORM_WRAPPER_RENDERING_ID } from './form-wrapper-filter';
import { FormsComponentsGalleryComponent } from './forms-components-gallery.component';
import { FormsComponentsDalService, FormsEntity, FormsEntityResponse } from './forms-components.dal.service';
import { FormsComponentsService } from './forms-components.service';

describe(FormsComponentsGalleryComponent.name, () => {
  let sut: FormsComponentsGalleryComponent;
  let fixture: ComponentFixture<FormsComponentsGalleryComponent>;
  let formsComponentsDalService: jasmine.SpyObj<FormsComponentsDalService>;
  let formsComponentsService: jasmine.SpyObj<FormsComponentsService>;
  let dragndropService: jasmine.SpyObj<DragndropService>;
  let context: ContextServiceTesting;
  let timedNotificationService: jasmine.SpyObj<TimedNotificationsService>;
  let renderingHostFeaturesService: jasmine.SpyObj<RenderingHostFeaturesService>;
  let featureFlagsService: jasmine.SpyObj<FeatureFlagsService>;
  let designingService: jasmine.SpyObj<DesigningService>;
  let designingServiceRenderingIds: Subject<readonly string[]>;

  const mockFormsEntities: FormsEntity[] = [
    { id: '1', name: 'Form 1', thumbnail: 'thumbnail1.png' },
    { id: '2', name: 'Form 2', thumbnail: 'thumbnail2.png' },
  ];

  const mockFormsEntityResponse: FormsEntityResponse = {
    FormsEntities: mockFormsEntities,
    apiError: false,
  };

  beforeEach(async(() => {
    designingService = jasmine.createSpyObj<DesigningService>('designingService', ['init']);
    designingServiceRenderingIds = new Subject();
    (designingService as Writable<DesigningService>).droppableRenderingIds = designingServiceRenderingIds;

    TestBed.configureTestingModule({
      imports: [
        AccordionModule,
        IconButtonModule,
        SlideInPanelModule,
        CommonModule,
        EmptyStateModule,
        ImageThumbnailModule,
        CmUrlModule,
        LoadingIndicatorModule,
        TranslateModule,
        ButtonModule,
        ContextServiceTestingModule,
        HttpClientTestingModule,
        TranslateServiceStubModule,
      ],
      providers: [
        {
          provide: DragndropService,
          useValue: jasmine.createSpyObj<DragndropService>(['dragstart', 'dragend']),
        },
        {
          provide: FormsComponentsService,
          useValue: jasmine.createSpyObj<FormsComponentsService>(['startInsertComponent']),
        },

        {
          provide: FormsComponentsDalService,
          useValue: jasmine.createSpyObj<FormsComponentsDalService>(['getEntities']),
        },
        {
          provide: TimedNotificationsService,
          useValue: jasmine.createSpyObj('TimedNotificationsService', ['pushNotification', 'hideNotificationById']),
        },
        {
          provide: RenderingHostFeaturesService,
          useValue: jasmine.createSpyObj<RenderingHostFeaturesService>([
            'watchComponents',
            'watchFeaturesLoading',
            'isFeatureEnabled',
          ]),
        },
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>(['isFeatureEnabled']),
        },
        { provide: DesigningService, useValue: designingService },
      ],
      declarations: [FormsComponentsGalleryComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    timedNotificationService = TestBedInjectSpy(TimedNotificationsService);
    formsComponentsDalService = TestBedInjectSpy(FormsComponentsDalService);
    formsComponentsDalService.getEntities.and.returnValue(of(mockFormsEntityResponse));
    formsComponentsService = TestBedInjectSpy(FormsComponentsService);
    dragndropService = TestBedInjectSpy(DragndropService);
    context = TestBed.inject(ContextServiceTesting);
    context.setTestSite('test-site');

    renderingHostFeaturesService = TestBedInjectSpy(RenderingHostFeaturesService);
    renderingHostFeaturesService.watchComponents.and.returnValue(of({ components: [], bypass: true }));
    featureFlagsService = TestBedInjectSpy(FeatureFlagsService);
    featureFlagsService.isFeatureEnabled.and.returnValue(true);

    designingServiceRenderingIds.next(['62DD1639-9F28-4040-8738-C886480B2127', 'DDC43BE7-D77A-4CE3-9282-03DD036EEC6D']);
    fixture = TestBed.createComponent(FormsComponentsGalleryComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should load forms components', () => {
    sut.formsComponents$.subscribe((components) => {
      expect(components).toEqual(mockFormsEntities);
    });
  });

  it('should filter components based on search text', () => {
    sut.searchText = 'Form 1';
    sut.ngOnChanges({
      searchText: { currentValue: 'Form 1', previousValue: '', firstChange: true, isFirstChange: () => true },
    });
    fixture.detectChanges();

    sut.filteredFormsComponents$.subscribe((components) => {
      expect(components).toEqual([{ id: '1', name: 'Form 1', thumbnail: 'thumbnail1.png' }]);
    });
  });

  it('should emit hasFilteredComponents event when components are filtered', () => {
    const hasFilteredComponentsSpy = spyOn(sut.hasFilteredComponents, 'emit');
    sut.searchText = 'Form 1';
    sut.ngOnChanges({
      searchText: { currentValue: 'Form 1', previousValue: '', firstChange: true, isFirstChange: () => true },
    });
    fixture.detectChanges();

    sut.filteredFormsComponents$.subscribe(() => {
      expect(hasFilteredComponentsSpy).toHaveBeenCalledWith(true);
    });
  });

  it('should filter out components with FORMS_WRAPPER_RENDERING_ID', () => {
    sut.filteredFormsComponents$.subscribe((components) => {
      expect(components.some((component) => component.id === FORM_WRAPPER_RENDERING_ID)).toBeFalse();
    });
  });

  it('should use FORMS_WRAPPER_RENDERING_ID when not byoc supported editing host', () => {
    const mockEvent = new DragEvent('dragstart');
    const mockComponent = { id: '1', name: 'Form 1', thumbnail: 'thumbnail1.png' };
    sut.isByocSupportedEditingHost = false;

    sut.componentDragstart(mockEvent, mockComponent);

    expect(formsComponentsService.startInsertComponent).toHaveBeenCalledWith(mockComponent);
    expect(dragndropService.dragstart).toHaveBeenCalledWith(FORM_WRAPPER_RENDERING_ID);
  });

  it('should use FORMS_WRAPPER_RENDERING_ID when Byoc Supported editing host and form component is available', () => {
    renderingHostFeaturesService.watchComponents.and.returnValue(of({ components: ['form'], bypass: true }));
    featureFlagsService.isFeatureEnabled.and.returnValue(true);
    sut.isByocSupportedEditingHost = true;

    fixture.detectChanges();

    const mockEvent = new DragEvent('dragstart');
    const mockComponent = { id: '1', name: 'Form 1', thumbnail: 'thumbnail1.png' };
    sut.componentDragstart(mockEvent, mockComponent);

    expect(formsComponentsService.startInsertComponent).toHaveBeenCalledWith(mockComponent);
    expect(dragndropService.dragstart).toHaveBeenCalledWith(FORM_WRAPPER_RENDERING_ID);
  });

  it('should use BYOC_RENDERING_ID when Byoc Supported editing host and form component is not available', () => {
    renderingHostFeaturesService.watchComponents.and.returnValue(of({ components: ['test'], bypass: true }));
    sut.isByocSupportedEditingHost = true;

    fixture.detectChanges();
    const mockEvent = new DragEvent('dragstart');
    const mockComponent = { id: '1', name: 'Form 1', thumbnail: 'thumbnail1.png' };
    sut.componentDragstart(mockEvent, mockComponent);

    expect(formsComponentsService.startInsertComponent).toHaveBeenCalledWith(mockComponent);
    expect(dragndropService.dragstart).toHaveBeenCalledWith(BYOC_RENDERING_ID);
  });

  it('should use BYOC_RENDERING_ID when Byoc Supported editing host and form wrapper feature not enabled', () => {
    renderingHostFeaturesService.watchComponents.and.returnValue(of({ components: ['form'], bypass: true }));
    featureFlagsService.isFeatureEnabled.and.returnValue(false);
    sut.isByocSupportedEditingHost = true;

    fixture.detectChanges();
    const mockEvent = new DragEvent('dragstart');
    const mockComponent = { id: '1', name: 'Form 1', thumbnail: 'thumbnail1.png' };
    sut.componentDragstart(mockEvent, mockComponent);

    expect(formsComponentsService.startInsertComponent).toHaveBeenCalledWith(mockComponent);
    expect(dragndropService.dragstart).toHaveBeenCalledWith(BYOC_RENDERING_ID);
  });

  it('should end drag on drag end', () => {
    sut.componentDragend();

    expect(dragndropService.dragend).toHaveBeenCalled();
  });

  it('should use FORMS_WRAPPER_RENDERING_ID when not byoc supported editing host on component select', () => {
    spyOn(sut.componentSelect, 'emit');
    const mockComponent = { id: '1', name: 'Form 1', thumbnail: 'thumbnail1.png' };
    featureFlagsService.isFeatureEnabled.and.returnValue(true);
    sut.isByocSupportedEditingHost = false;
    sut.mode = 'selectable';

    sut.selectComponent(mockComponent);

    expect(formsComponentsService.startInsertComponent).toHaveBeenCalledWith(mockComponent);
    expect(sut.componentSelect.emit).toHaveBeenCalledWith(FORM_WRAPPER_RENDERING_ID);
  });

  it('should use FORMS_WRAPPER_RENDERING_ID when Byoc Supported editing host and forms component is available on component select', () => {
    spyOn(sut.componentSelect, 'emit');
    renderingHostFeaturesService.watchComponents.and.returnValue(of({ components: ['form'], bypass: true }));
    sut.isByocSupportedEditingHost = true;
    sut.mode = 'selectable';

    fixture.detectChanges();

    const mockComponent = { id: '1', name: 'Form 1', thumbnail: 'thumbnail1.png' };

    sut.selectComponent(mockComponent);

    expect(formsComponentsService.startInsertComponent).toHaveBeenCalledWith(mockComponent);
    expect(sut.componentSelect.emit).toHaveBeenCalledWith(FORM_WRAPPER_RENDERING_ID);
  });

  it('should use BYOC_RENDERING_ID when Byoc Supported editing host and forms component is not available on component select', () => {
    spyOn(sut.componentSelect, 'emit');
    renderingHostFeaturesService.watchComponents.and.returnValue(of({ components: ['test'], bypass: true }));
    sut.isByocSupportedEditingHost = true;
    sut.mode = 'selectable';

    fixture.detectChanges();

    const mockComponent = { id: '1', name: 'Form 1', thumbnail: 'thumbnail1.png' };
    sut.selectComponent(mockComponent);

    expect(formsComponentsService.startInsertComponent).toHaveBeenCalledWith(mockComponent);
    expect(sut.componentSelect.emit).toHaveBeenCalledWith(BYOC_RENDERING_ID);
  });
});
