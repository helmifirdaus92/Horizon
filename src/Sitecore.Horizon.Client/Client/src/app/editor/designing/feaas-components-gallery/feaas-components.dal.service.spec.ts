/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed, waitForAsync } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import type * as FEAAS from '@sitecore-feaas/clientside';
import SDK, { CollectionModel, ComponentModel, ExternalComponentModel, VersionModel } from '@sitecore-feaas/sdk';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { createSpyObserver, spyObservable, TestBedInjectSpy } from 'app/testing/test.utils';
import { NEVER, of } from 'rxjs';
import { FEaaSComponent, FEaaSComponentsCollection } from './feaas-component-types';
import { ExternalComponentModeltWithSites, FEaaSComponentsDalService } from './feaas-components.dal.service';

describe(FEaaSComponentsDalService.name, () => {
  let sut: FEaaSComponentsDalService;
  let featureFlagsServiceSpy: jasmine.SpyObj<FeatureFlagsService>;
  let sanitizerSpy: jasmine.SpyObj<DomSanitizer>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let siteServiceSpy: jasmine.SpyObj<SiteService>;
  let contextService: ContextServiceTesting;

  let sdk: SDK;
  let mockedFEaaS: typeof FEAAS;

  let fEaaSCollections: CollectionModel[];
  let externalFEaaSComponents: ExternalComponentModel[];
  const observerSpy = createSpyObserver();

  beforeEach(waitForAsync(() => {
    fEaaSCollections = [
      {
        id: 'collection1',
        name: 'Collection 1',
        components: [
          {
            id: 'component1',
            name: 'Component 1',
            getDataSettings: () => null,
            published: true,
            status: 'published',
            stagedAt: 'longTimeAgo',
          },
          {
            id: 'component1-1',
            name: 'Component 1-1',
            getDataSettings: () => null,
            getDatasources: () => [{ type: 'xmTemplate' } as any],
            published: true,
            status: 'published',
            stagedAt: 'longTimeAgo',
          },
        ],
      },
      {
        id: 'collection2',
        name: 'Collection 2',
        components: [
          {
            id: 'component2',
            stagedAt: undefined,
          },
        ],
      },
      {
        id: 'default',
        name: 'Default',
        components: [],
        isDefault: true,
      },
    ] as unknown as CollectionModel[];

    externalFEaaSComponents = [
      {
        id: 'component3',
        name: 'Component 3',
      },
      {
        id: 'component4',
        name: 'Component 4',
        group: 'group1',
        sites: [
          { id: 'site1', name: 'sitecore1' },
          { id: 'site2', name: 'testSite2' },
        ],
      },
      {
        id: 'component5',
        name: 'Component 5',
        group: 'group1',
        sites: [{ id: 'site1', name: 'sitecore1' }],
      },
      {
        id: 'component6',
        name: 'Component 6',
        group: 'Collection 1',
      },
    ] as ExternalComponentModeltWithSites[];

    (externalFEaaSComponents as any).observe = (observer: (c: any) => {}) => {
      observer(externalFEaaSComponents);
    };

    sdk = {
      library: Promise.resolve({
        collections: fEaaSCollections,
      }),
      externalComponents: externalFEaaSComponents,
      auth: {
        tenant: {
          datasources: [
            {
              id: 'ds1',
            },
          ],
        },
      },
      datasources: [{ id: 'ds1' }, { id: 'ds2' }, { id: 'ds3' }],
      cdn: Promise.resolve('https://cdn.example.com'),
      getFrontendURL: () => 'https://frontend.com',
      nanoid: () => 'someUniqueId001',
    } as unknown as SDK;

    mockedFEaaS = {
      Thumbnail: {
        get: (_comp: ComponentModel, _ver: VersionModel, callback: (img: HTMLImageElement) => {}) => {
          const thumbnail = document.createElement('img');
          thumbnail.src = 'http://:0/img.jpg';
          thumbnail.width = 20;
          thumbnail.height = 30;
          callback(thumbnail);
        },
      },
    } as any;

    featureFlagsServiceSpy = jasmine.createSpyObj<FeatureFlagsService>('FeatureFlagsService', ['isFeatureEnabled']);
    sanitizerSpy = jasmine.createSpyObj<DomSanitizer>(
      'DomSanitizer',
      {},
      { bypassSecurityTrustUrl: (val: any) => val },
    );

    translateService = jasmine.createSpyObj<TranslateService>({ get: NEVER });
    translateService.get.and.callFake((key) => of(key));
    siteServiceSpy = jasmine.createSpyObj<SiteService>('SiteService', { getSiteByName: undefined });

    TestBed.configureTestingModule({
      imports: [ContextServiceTestingModule],
      providers: [
        { provide: FeatureFlagsService, useValue: featureFlagsServiceSpy },
        { provide: DomSanitizer, useValue: sanitizerSpy },
        { provide: TranslateService, useValue: translateService },
        {
          provide: SiteService,
          useValue: siteServiceSpy,
        },
      ],
    });

    featureFlagsServiceSpy.isFeatureEnabled.and.returnValue(true);
    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideDefaultTestContext();

    sut = TestBed.inject(FEaaSComponentsDalService);
    sut.componentsCollections$.subscribe(observerSpy);

    const customEvent = new CustomEvent<{ sdk: SDK; clientside: typeof FEAAS }>('feaasContext', {
      detail: {
        sdk,
        clientside: mockedFEaaS,
      },
    });

    document.dispatchEvent(customEvent);

    siteServiceSpy = TestBedInjectSpy(SiteService);
    siteServiceSpy.getSiteByName.and.returnValue({ id: 'site1' } as any);
  }));

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should initialize with empty values when the feature flag is disabled ', async () => {
    featureFlagsServiceSpy.isFeatureEnabled.and.returnValue(false);
    const observer = createSpyObserver();
    sut = new FEaaSComponentsDalService(
      featureFlagsServiceSpy,
      translateService,
      siteServiceSpy,
      contextService,
      sanitizerSpy,
    );
    sut.componentsCollections$.subscribe(observer);

    const cdnHostName = (await sut.configuration).cdnHostName;
    const collections = observer.next.calls.mostRecent().args[0];

    expect(collections).toEqual([]);
    expect(cdnHostName).toEqual('');
  });

  describe('get collections', () => {
    it('should receive sdk from custom event', async () => {
      const collections = observerSpy.next.calls.mostRecent().args[0];

      expect(collections.length).toBe(4);
    });

    it('should read sitecore collections from sdk', async () => {
      const collections: FEaaSComponentsCollection[] = observerSpy.next.calls.mostRecent().args[0];

      expect(collections[0].name).toBe('Collection 1');
      expect(collections[0].components[0].name).toBe('Component 1');
    });

    it('should map data to xmCloudDataSources if the datasources is xmCloud', () => {
      const spyDs = spyObservable(sut._dataSources$);

      const { dataSources } = spyDs.next.calls.mostRecent().args[0];

      expect(dataSources.xmCloudDataSources.length).toBe(1);
    });

    it('should map data to externalDataSources if the datasources is not xmCloud', () => {
      const spyDs = spyObservable(sut._dataSources$);

      const { dataSources } = spyDs.next.calls.mostRecent().args[0];

      expect(dataSources.externalDataSources.length).toBe(2);
    });

    it('should includes only sitecore components that were staged', async () => {
      const collections = observerSpy.next.calls.mostRecent().args[0];

      expect(collections[1].name).toBe('Collection 2');
      expect(collections[1].components.length).toBe(0);
    });

    it('should combine sitecore collections and external groups with same name', async () => {
      const collections: FEaaSComponentsCollection[] = observerSpy.next.calls.mostRecent().args[0];

      expect(collections[0].name).toBe('Collection 1');
      expect(collections[0].components.length).toBe(3);
      expect(collections[0].components[0].name).toBe('Component 1');
      expect(collections[0].components[2].name).toBe('Component 6');
    });

    it('should add external components without group to the default collection', async () => {
      const collections: FEaaSComponentsCollection[] = observerSpy.next.calls.mostRecent().args[0];

      expect(collections[2].name).toBe('Default');
      expect(collections[2].components.length).toBe(1);
      expect(collections[2].components[0].name).toBe('Component 3');
    });

    it('should get thumbnail for the component', async () => {
      const collections: FEaaSComponentsCollection[] = observerSpy.next.calls.mostRecent().args[0];
      const component = collections[0].components[0];
      const thumbnail = await component.thumbnail;

      expect(thumbnail?.url).toBe('http://:0/img.jpg' as any);
      expect(thumbnail?.width).toBe(20);
      expect(thumbnail?.height).toBe(30);
    });

    it('should map canUseXMDatasources', () => {
      const collections: FEaaSComponentsCollection[] = observerSpy.next.calls.mostRecent().args[0];
      expect((collections[0].components[0] as FEaaSComponent).canUseXMDatasources).toBe(false);
      expect((collections[0].components[1] as FEaaSComponent).canUseXMDatasources).toBe(true);
    });
  });

  describe('external components', () => {
    it('should read components from sdk based on configured sites', () => {
      const collections: FEaaSComponentsCollection[] = observerSpy.next.calls.mostRecent().args[0];

      expect(collections[3].name).toBe('group1');
      expect(collections[3].components.length).toBe(2);
    });
  });
});
