/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, fakeAsync, flush, TestBed, waitForAsync } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { By, SafeUrl } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
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
import { CmUrlModule } from 'app/shared/pipes/platform-url/cm-url.module';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { BehaviorSubject, of } from 'rxjs';
import { DragndropService } from '../dragndrop.service';
import { FEaaSComponent, FEaaSComponentsCollection, FEaaSExternalComponent } from './feaas-component-types';
import { FEaaSComponentsGalleryComponent } from './feaas-components-gallery.component';
import { FEaaSComponentsService } from './feaas-components.service';

describe(FEaaSComponentsGalleryComponent.name, () => {
  let component: FEaaSComponentsGalleryComponent;
  let fixture: ComponentFixture<FEaaSComponentsGalleryComponent>;
  const componentsCollections$ = new BehaviorSubject<FEaaSComponentsCollection[]>([]);

  const getFEaasComponents = (): FEaaSComponent[] => {
    const components = [
      {
        name: 'name001',
        thumbnail: Promise.resolve({ url: 'https://thumbnailUrl001' as SafeUrl }),
        published: true,
        isExternal: false,
        datasourceIds: ['dataSource1'],
      },
      {
        name: 'name002',
        thumbnail: Promise.resolve({ url: 'https://thumbnailUrl002' as SafeUrl }),
        published: false,
        isExternal: false,
        datasourceIds: ['dataSource1', 'dataSource2'],
      },
    ] as FEaaSComponent[];

    return [...components];
  };

  const getExtFEaasComponents = (): FEaaSExternalComponent[] => {
    const components = [
      {
        name: 'name003',
        title: 'hero',
        isExternal: true,
      },
      {
        name: 'name004',
        isExternal: true,
      },
      {
        name: 'name005',
        isExternal: true,
      },
    ] as FEaaSExternalComponent[];

    return [...components];
  };

  const getFEaaSCollection = (): FEaaSComponentsCollection => {
    return {
      name: 'collection001',
      components: getFEaasComponents(),
    };
  };

  const getExtFEaaSCollection = (): FEaaSComponentsCollection => {
    return {
      name: 'collection002',
      components: getExtFEaasComponents(),
    };
  };

  const componentCards = () => fixture.debugElement.queryAll(By.css('.card-container'));

  beforeEach(waitForAsync(async () => {
    TestBed.configureTestingModule({
      declarations: [FEaaSComponentsGalleryComponent],
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
        TranslateServiceStubModule,
        NoopAnimationsModule,
      ],
      providers: [
        {
          provide: FEaaSComponentsService,
          useValue: jasmine.createSpyObj<FEaaSComponentsService>(
            {},
            {
              componentsCollections$,
              isLoading$: of(false),
            },
          ),
        },
        {
          provide: DragndropService,
          useValue: jasmine.createSpyObj<DragndropService>(['dragstart']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FEaaSComponentsGalleryComponent);
    componentsCollections$.next([]);

    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  new Array<[boolean, boolean, number]>([true, false, 2], [false, true, 3], [true, true, 5]).forEach(
    ([renderFEaaSComponents, renderFEaaSExternalComponents, totalComponents]) => {
      it(`it should render total number of component: ${totalComponents} when renderFEaaSComponents: ${renderFEaaSComponents} and renderFEaaSExternalComponents:${renderFEaaSExternalComponents}`, fakeAsync(async () => {
        component.renderFEaaSComponents = renderFEaaSComponents;
        component.renderFEaaSExternalComponents = renderFEaaSExternalComponents;
        componentsCollections$.next([getFEaaSCollection()].concat([getExtFEaaSCollection()]));

        component.ngOnInit();
        fixture.detectChanges();

        expect(componentCards().length).toBe(totalComponents);
        flush();
      }));
    },
  );

  it('should render components info', async () => {
    component.renderFEaaSComponents = true;
    componentsCollections$.next([getFEaaSCollection()].concat([getExtFEaaSCollection()]));

    component.ngOnInit();
    fixture.detectChanges();

    expect(componentCards().length).toBe(getFEaaSCollection().components.length);

    for (let i = 0; i < componentCards.length; i++) {
      const componentCard = componentCards()[i].nativeElement;

      const componentName = componentCard.querySelector('.card-text').textContent.trim();
      expect(componentName).toBe(getFEaaSCollection().components[i].name);

      const toBePublishedTag = componentCard.querySelector('.to-be-published-tag');
      expect(toBePublishedTag == null).toBe((getFEaaSCollection().components[i] as FEaaSComponent).published);
    }
  });

  describe('ngOnChanges', () => {
    it('should not filter components when searchText is null', () => {
      component.renderFEaaSComponents = true;
      componentsCollections$.next([getFEaaSCollection()].concat([getExtFEaaSCollection()]));

      component.ngOnInit();
      fixture.detectChanges();

      component.searchText = null;
      component.ngOnChanges({
        searchText: { currentValue: null, previousValue: null, firstChange: true, isFirstChange: () => true },
      });

      expect(componentCards().length).toBe(getFEaaSCollection().components.length);
    });

    it('should filter components when searchText is not null', async () => {
      component.renderFEaaSComponents = true;
      componentsCollections$.next([getFEaaSCollection()].concat([getExtFEaaSCollection()]));

      component.ngOnInit();
      component.searchText = 'name001';
      fixture.detectChanges();

      component.ngOnChanges({
        searchText: { currentValue: 'name001', previousValue: null, firstChange: true, isFirstChange: () => true },
      });

      fixture.detectChanges();
      await fixture.whenStable();

      expect(componentCards().length).toBe(1);
    });

    it('should filter component based on component title if it is externl component collection', async () => {
      component.renderFEaaSExternalComponents = true;
      componentsCollections$.next([getExtFEaaSCollection()]);

      component.ngOnInit();
      component.searchText = 'hero';
      fixture.detectChanges();

      component.ngOnChanges({
        searchText: { currentValue: 'hero', previousValue: null, firstChange: true, isFirstChange: () => true },
      });

      fixture.detectChanges();
      await fixture.whenStable();

      expect(componentCards().length).toBe(1);
    });

    it('should filter components based on selectedDataSourceIds', async () => {
      component.renderFEaaSComponents = true;
      componentsCollections$.next([getFEaaSCollection()]);

      component.ngOnInit();
      component.selectedDataSourceIds = ['dataSource1'];
      fixture.detectChanges();

      component.ngOnChanges({
        selectedDataSourceIds: {
          currentValue: ['dataSource1'],
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true,
        },
      });

      fixture.detectChanges();
      await fixture.whenStable();

      expect(componentCards().length).toBe(2);
    });

    it('should search and filter components based on searchText and selectedDataSourceIds', async () => {
      component.renderFEaaSComponents = true;
      componentsCollections$.next([getFEaaSCollection()]);

      component.ngOnInit();
      component.searchText = 'name001';
      component.selectedDataSourceIds = ['dataSource1'];
      fixture.detectChanges();

      component.ngOnChanges({
        searchText: { currentValue: 'name001', previousValue: null, firstChange: true, isFirstChange: () => true },
        selectedDataSourceIds: {
          currentValue: ['dataSource1'],
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true,
        },
      });

      fixture.detectChanges();
      await fixture.whenStable();

      expect(componentCards().length).toBe(1);
    });
  });
});
