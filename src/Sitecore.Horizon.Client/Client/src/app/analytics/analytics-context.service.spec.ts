/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SiteSwitcherService } from 'app/editor/shared/site-language-switcher/site-language-switcher.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { Site, SiteService } from 'app/shared/site-language/site-language.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { firstValueFrom, of } from 'rxjs';
import { AnalyticsContextService } from './analytics-context.service';
import { AnalyticsTimeFilterOption, AnalyticsVariantFilterValue } from './analytics.types';

const Initial_Context = {
  itemId: 'itemId1',
  language: 'lang1',
  siteName: 'website1',
};

describe('AnalyticsContextService', () => {
  let sut: AnalyticsContextService;
  let contextService: ContextServiceTesting;
  let siteService: jasmine.SpyObj<SiteService>;

  const defaultVariant: AnalyticsVariantFilterValue = {
    variantOne: { variantName: null, variantId: 'default' },
  };

  const oneSelectedVariant: AnalyticsVariantFilterValue = {
    variantOne: { variantName: 'Variant1', variantId: 'variantId1' },
  };

  const twoSelectedVariants: AnalyticsVariantFilterValue = {
    variantOne: { variantName: 'Variant2', variantId: 'variantId2' },
    variantTwo: { variantName: 'Variant1', variantId: 'variantId1' },
  };

  beforeEach(() => {
    const siteSwitcherSpy = jasmine.createSpyObj('SiteSwitcherService', [], {
      site: of('website'), // Mock the observable value directly
    });

    TestBed.configureTestingModule({
      imports: [ContextServiceTestingModule],
      providers: [
        {
          provide: SiteService,
          useValue: jasmine.createSpyObj<SiteService>('SiteService', ['getPointOfSale', 'getSites']),
        },
        { provide: SiteSwitcherService, useValue: siteSwitcherSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    sut = TestBed.inject(AnalyticsContextService);

    contextService = TestBed.inject(ContextServiceTesting);
    siteService = TestBedInjectSpy(SiteService);

    contextService.provideTestValue(Initial_Context);
    siteService.getPointOfSale.and.returnValue(Promise.resolve('pointOfSale'));
  });

  describe('watchActiveRoute()', () => {
    it('should return "site" by default', async () => {
      const activeRoute = await firstValueFrom(sut.watchActiveRoute());
      expect(activeRoute).toEqual('site');
    });

    it('should return "site" WHEN setActiveRoute("site") has been called', async () => {
      sut.setActiveRoute('page');

      // Assert
      const activeRoute = await firstValueFrom(sut.watchActiveRoute());
      expect(activeRoute).toEqual('page');
    });

    it('should return "page" WHEN setActiveRoute("page") has been called', async () => {
      sut.setActiveRoute('page');

      // Assert
      const activeRoute = await firstValueFrom(sut.watchActiveRoute());
      expect(activeRoute).toEqual('page');
    });
  });

  describe('watchDuration()', () => {
    it('should return "7d" by default', async () => {
      const duration = await firstValueFrom(sut.watchDuration());
      expect(duration).toEqual({ id: '7D', value: '7d' });
    });

    it('should return "3h" WHEN setDuration("3h") has been called', async () => {
      sut.setDuration('3h');

      // Assert
      const duration = await firstValueFrom(sut.watchDuration());
      expect(duration).toEqual({ id: '3H', value: '3h' });
    });

    it('should keep previous duration option WHEN setDuration() has been called with invalid input', async () => {
      sut.setDuration('3h');
      sut.setDuration('tt' as AnalyticsTimeFilterOption['value']);

      // Assert
      const duration = await firstValueFrom(sut.watchDuration());
      expect(duration).toEqual({ id: '3H', value: '3h' });
    });
  });

  describe('watchVariantFilterChanges()', () => {
    it('should return default variant by default', async () => {
      const variants = await firstValueFrom(sut.watchVariantFilterChanges());
      expect(variants).toEqual(defaultVariant);
    });

    it('should return default variant WHEN itemId changes', async () => {
      sut.setVariantFilterValue(twoSelectedVariants);
      contextService.setTestItemId('testId');

      // Assert
      const variants = await firstValueFrom(sut.watchVariantFilterChanges());
      expect(variants).toEqual(defaultVariant);
    });

    it('should return default variant WHEN siteName changes', async () => {
      sut.setVariantFilterValue(twoSelectedVariants);
      contextService.setTestSite('testSiteName');

      // Assert
      const variants = await firstValueFrom(sut.watchVariantFilterChanges());
      expect(variants).toEqual(defaultVariant);
    });

    it('should return default variant WHEN language changes', async () => {
      sut.setVariantFilterValue(twoSelectedVariants);
      contextService.setTestLang('testLanguage');

      // Assert
      const variants = await firstValueFrom(sut.watchVariantFilterChanges());
      expect(variants).toEqual(defaultVariant);
    });

    it('should return default variant WHEN setVariantFilterValue() has been called', async () => {
      sut.setVariantFilterValue();

      // Assert
      const variants = await firstValueFrom(sut.watchVariantFilterChanges());
      expect(variants).toEqual(defaultVariant);
    });

    it('should return single variant WHEN setVariantFilterValue(oneSelectedVariant) has been called', async () => {
      sut.setVariantFilterValue(oneSelectedVariant);

      // Assert
      const variants = await firstValueFrom(sut.watchVariantFilterChanges());
      expect(variants).toEqual(oneSelectedVariant);
    });

    it('should return two variants WHEN setVariantFilterValue(twoSelectedVariants) has been called', async () => {
      sut.setVariantFilterValue(twoSelectedVariants);

      // Assert
      const variants = await firstValueFrom(sut.watchVariantFilterChanges());
      expect(variants).toEqual(twoSelectedVariants);
    });
  });

  describe('getSiteInformation()', () => {
    it('should return siteId and rootItemId for active site', (done) => {
      const mockSites: Site[] = [
        {
          id: '227bc0ff-6237-42b6-851f-49e68c1998e8',
          hostId: 'hostId 1',
          collectionId: '337bc0ff-6237-42b6-851f-49e68c1998e8',
          name: 'website',
          displayName: 'website-displayName',
          language: 'language',
          appName: 'appName',
          layoutServiceConfig: 'layoutServiceConfig',
          renderingEngineEndpointUrl: 'renderingEngineEndpointUrl',
          renderingEngineApplicationUrl: 'renderingEngineApplicationUrl',
          pointOfSale: [{ language: '*', name: 'pointOfSale' }],
          startItemId: 'startItemId1',
          supportedLanguages: ['en'],
          properties: {
            isSxaSite: true,
            tagsFolderId: 'id001',
            isLocalDatasourcesEnabled: true,
          },
        },
      ];
      siteService.getSites.and.returnValue(mockSites);

      // Assert
      sut.getSiteInformation().subscribe((result) => {
        expect(result).toEqual({
          collectionId: '337bc0ff-6237-42b6-851f-49e68c1998e8',
          id: '227bc0ff-6237-42b6-851f-49e68c1998e8',
          hostId: 'hostId 1',
        });
        done();
      });
    });

    it('should return fallback values when the site is not found', (done) => {
      const mockSites: Site[] = [
        {
          id: 'siteId456',
          hostId: 'hostId 1',
          collectionId: '337bc0ff-6237-42b6-851f-49e68c1998e8',
          name: 'anotherSite',
          displayName: 'anotherSite-displayName',
          language: 'language',
          appName: 'appName',
          layoutServiceConfig: 'layoutServiceConfig',
          renderingEngineEndpointUrl: 'renderingEngineEndpointUrl',
          renderingEngineApplicationUrl: 'renderingEngineApplicationUrl',
          pointOfSale: [{ language: '*', name: 'pointOfSale' }],
          startItemId: 'startItemId1',
          supportedLanguages: ['en'],
          properties: {
            isSxaSite: true,
            tagsFolderId: 'id001',
            isLocalDatasourcesEnabled: true,
          },
        },
      ];

      siteService.getSites.and.returnValue(mockSites);

      sut.getSiteInformation().subscribe((result) => {
        expect(result).toEqual({ collectionId: '', id: '', hostId: '' });
        done();
      });
    });
  });
});
