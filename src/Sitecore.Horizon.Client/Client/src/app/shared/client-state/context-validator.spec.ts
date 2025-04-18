/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { of, throwError } from 'rxjs';
import { BaseItemDalService } from '../graphql/item.dal.service';
import { LanguageDalBaseService } from '../graphql/language.dal.service';
import { LoggingService } from '../logging.service';
import { Site, SiteService } from '../site-language/site-language.service';
import { ContextValidator } from './context-validator';
import { ContextHelper } from './context.helper';
import { Context } from './context.service';

const completeContext: Context = {
  itemId: 'foo',
  itemVersion: 1,
  language: 'foo',
  siteName: 'foo',
};

const contextWithoutVersion: Context = {
  itemId: 'foo',
  language: 'foo',
  siteName: 'foo',
};

const invalidContext: Context = {
  itemId: 'im-wrong!',
  language: 'bar',
  siteName: 'bar',
};

const wrongItemId = 'im-wrong!';
const siteItemId = 'siteitemid';
const itemVersion = 1;
const wrongKindItemId = 'im-not-page';

const siteId = '227bc0ff-6237-42b6-851f-49e68c1998e8';
const sites: Site[] = [
  {
    id: '227bc0ff-6237-42b6-851f-49e68c1998e8',
    hostId: 'hostId 1',
    collectionId: '337bc0ff-6237-42b6-851f-49e68c1998e8',
    name: 'foo',
    displayName: 'foo',
    language: 'en',
    appName: '',
    layoutServiceConfig: '',
    renderingEngineEndpointUrl: '',
    renderingEngineApplicationUrl: '',
    pointOfSale: [],
    startItemId: '',
    supportedLanguages: ['en'],
    properties: {
      isSxaSite: true,
      tagsFolderId: 'id001',
      isLocalDatasourcesEnabled: true,
    },
  },
  {
    id: '337bc0ff-6237-42b6-851f-49e68c1998e8',
    hostId: 'hostId 2',
    collectionId: '337bc0ff-6237-42b6-851f-49e68c1998e8',
    name: 'site2',
    displayName: 'site2',
    language: 'en',
    appName: '',
    layoutServiceConfig: '',
    renderingEngineEndpointUrl: '',
    renderingEngineApplicationUrl: '',
    pointOfSale: [],
    startItemId: '',
    supportedLanguages: ['en'],
    properties: {
      isSxaSite: true,
      tagsFolderId: 'id001',
      isLocalDatasourcesEnabled: true,
    },
  },
];

describe(ContextValidator.name, () => {
  let service: ContextValidator;
  let itemService: jasmine.SpyObj<BaseItemDalService>;
  let siteService: jasmine.SpyObj<SiteService>;
  let languageService: jasmine.SpyObj<LanguageDalBaseService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ContextValidator,
        {
          provide: SiteService,
          useValue: jasmine.createSpyObj<SiteService>('siteService', {
            getStartItem: of({ id: siteItemId, version: itemVersion }),
            getSites: sites,
            getSiteByName: sites[0],
          }),
        },
        {
          provide: LanguageDalBaseService,
          useValue: jasmine.createSpyObj<LanguageDalBaseService>('languageService', {
            fetchLanguages: of([
              { name: 'foo', displayName: 'foo', nativeName: 'foo', iso: 'foo', englishName: 'foo bar' },
            ]),
          }),
        },
        {
          provide: BaseItemDalService,
          useValue: jasmine.createSpyObj<BaseItemDalService>('itemService', ['getItemType']),
        },
        {
          provide: LoggingService,
          useValue: jasmine.createSpyObj<LoggingService>({
            warn: undefined,
            error: undefined,
          }),
        },
      ],
    });
    service = TestBed.inject(ContextValidator);

    itemService = TestBedInjectSpy(BaseItemDalService);
    itemService.getItemType.and.callFake((itemId: string, _language: string, _siteName: string, _siteId: string) => {
      if (itemId === wrongKindItemId) {
        return of({
          id: itemId,
          version: 1,
          displayName: 'name',
          kind: 'Item',
          baseTemplateIds: ['test1'],
          ancestors: [
            {
              template: { id: 'test2' },
            },
          ],
        });
      }

      return itemId === wrongItemId
        ? throwError(() => 'failed to validate item')
        : of({
            id: itemId,
            version: 1,
            displayName: 'name',
            kind: 'Page',
            baseTemplateIds: ['test1'],
            ancestors: [
              {
                template: { id: 'test2' },
              },
            ],
          });
    });

    siteService = TestBedInjectSpy(SiteService);
    languageService = TestBedInjectSpy(LanguageDalBaseService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });

  describe('initClientState()', () => {
    describe('AND supplied context is empty', () => {
      it(`should get default context and return the result`, async () => {
        const expectedContext: Context = { ...completeContext, itemId: siteItemId, itemVersion };

        const result = await service.getValidContext(ContextHelper.empty);

        expect(siteService.getSites).toHaveBeenCalledTimes(1);
        expect(languageService.fetchLanguages).toHaveBeenCalled();
        expect(siteService.getStartItem).toHaveBeenCalledWith(expectedContext.siteName, expectedContext.language);
        expect(result.context).toEqual(expectedContext);
        expect(result.resolvedValues.itemId.wasCoerced).toBeFalse();
        expect(result.resolvedValues.itemVersion?.wasCoerced).toBeFalse();
        expect(result.resolvedValues.language.wasCoerced).toBeFalse();
        expect(result.resolvedValues.siteName.wasCoerced).toBeFalse();
      });
    });

    describe('AND backend returns empty list of languages', () => {
      it('should use site language if possible', async () => {
        languageService.fetchLanguages.and.returnValue(of([]));
        const expectedContext: Context = { ...completeContext, itemId: siteItemId, itemVersion, language: 'en' };

        const result = await service.getValidContext(ContextHelper.empty);

        expect(result.context).toEqual(expectedContext);
      });
    });

    describe('AND supplied context is complete', () => {
      describe('AND suplied values are valid', () => {
        it(`should fetch the supplied itemId, iteversion, language and site in order to validate
        and return the result`, async () => {
          const result = await service.getValidContext(completeContext);

          expect(siteService.getSites).toHaveBeenCalledTimes(1);
          expect(languageService.fetchLanguages).toHaveBeenCalled();
          expect(itemService.getItemType).toHaveBeenCalledWith(
            completeContext.itemId,
            completeContext.language,
            completeContext.siteName,
            siteId,
            completeContext.itemVersion,
          );
          expect(result.context).toEqual(completeContext);
          expect(result.resolvedValues.itemId.wasCoerced).toBeFalse();
          expect(result.resolvedValues.itemVersion?.wasCoerced).toBeFalse();
          expect(result.resolvedValues.language.wasCoerced).toBeFalse();
          expect(result.resolvedValues.siteName.wasCoerced).toBeFalse();
        });

        it(`should fetch the supplied itemId, iteversion, language and site without providing itemVersion
         in order to validate and return the result`, async () => {
          const result = await service.getValidContext(contextWithoutVersion);

          expect(siteService.getSites).toHaveBeenCalledTimes(1);
          expect(languageService.fetchLanguages).toHaveBeenCalled();
          expect(itemService.getItemType).toHaveBeenCalledWith(
            completeContext.itemId,
            completeContext.language,
            completeContext.siteName,
            siteId,
            undefined,
          );
          expect(result.context).toEqual(completeContext);
          expect(result.resolvedValues.itemId.wasCoerced).toBeFalse();
          expect(result.resolvedValues.itemVersion?.wasCoerced).toBeFalse();
          expect(result.resolvedValues.language.wasCoerced).toBeFalse();
          expect(result.resolvedValues.siteName.wasCoerced).toBeFalse();
        });

        it('should resolve site as case-insensative', async () => {
          const result = await service.getValidContext({ ...completeContext, siteName: 'FOO' });

          expect(siteService.getSites).toHaveBeenCalledTimes(1);
          expect(languageService.fetchLanguages).toHaveBeenCalled();
          expect(itemService.getItemType).toHaveBeenCalledWith(
            completeContext.itemId,
            completeContext.language,
            completeContext.siteName,
            siteId,
            completeContext.itemVersion,
          );
          expect(result.context).toEqual(completeContext);
          expect(result.resolvedValues.itemId.wasCoerced).toBeFalse();
          expect(result.resolvedValues.itemVersion?.wasCoerced).toBeFalse();
          expect(result.resolvedValues.language.wasCoerced).toBeFalse();
          expect(result.resolvedValues.siteName.wasCoerced).toBeFalse();
        });
      });

      describe('AND the supplied itemId has invalid kind', () => {
        it(`should fetch the supplied itemId and kind to validate, use site root id as a fallback
          and finally return the result`, async () => {
          const expectedContext: Context = { ...completeContext, itemId: siteItemId, itemVersion };

          const result = await service.getValidContext({
            ...completeContext,
            itemId: wrongKindItemId,
            itemVersion,
          });

          expect(itemService.getItemType).toHaveBeenCalledWith(
            wrongKindItemId,
            expectedContext.language,
            expectedContext.siteName,
            siteId,
            completeContext.itemVersion,
          );
          expect(result.context).toEqual(expectedContext);
          expect(result.resolvedValues.itemId.wasCoerced).toBeTrue();
          expect(result.resolvedValues.itemVersion?.wasCoerced).toBeTrue();
          expect(result.resolvedValues.language.wasCoerced).toBeFalse();
          expect(result.resolvedValues.siteName.wasCoerced).toBeFalse();
        });
      });

      describe('AND the supplied itemId is not valid', () => {
        it(`should fetch the supplied itemId to validate, use site root id as a fallback
          and finally return the result`, async () => {
          const expectedContext: Context = { ...completeContext, itemId: siteItemId, itemVersion: 1 };

          const result = await service.getValidContext({
            ...completeContext,
            itemId: wrongItemId,
            itemVersion: 1,
          });

          expect(itemService.getItemType).toHaveBeenCalledWith(
            wrongItemId,
            expectedContext.language,
            expectedContext.siteName,
            siteId,
            expectedContext.itemVersion,
          );
          expect(result.context).toEqual(expectedContext);
          expect(result.resolvedValues.itemId.wasCoerced).toBeTrue();
          expect(result.resolvedValues.itemVersion?.wasCoerced).toBeTrue();
          expect(result.resolvedValues.language.wasCoerced).toBeFalse();
          expect(result.resolvedValues.siteName.wasCoerced).toBeFalse();
        });
      });

      describe('AND the supplied site is not valid', () => {
        it(`should fetch the supplied site to validate, fetch the list of sites and get a fallback
          and finally return the result`, async () => {
          const result = await service.getValidContext({ ...completeContext, siteName: 'invalid' });

          expect(siteService.getSites).toHaveBeenCalled();
          expect(result.context).toEqual(completeContext);
          expect(result.resolvedValues.itemId.wasCoerced).toBeFalse();
          expect(result.resolvedValues.language.wasCoerced).toBeFalse();
          expect(result.resolvedValues.siteName.wasCoerced).toBeTrue();
        });
      });

      describe('AND the supplied language is not valid', () => {
        it(`should fetch the supplied language to validate, fetch the list of languages and get a fallback
          and finally return the result`, async () => {
          const result = await service.getValidContext({ ...completeContext, language: 'invalid' });

          expect(languageService.fetchLanguages).toHaveBeenCalled();
          expect(result.context).toEqual(completeContext);
          expect(result.resolvedValues.itemId.wasCoerced).toBeFalse();
          expect(result.resolvedValues.language.wasCoerced).toBeTrue();
          expect(result.resolvedValues.siteName.wasCoerced).toBeFalse();
        });
      });

      describe('AND the supplied itemId, language and site are not valid', () => {
        it(`should fetch the supplied itemId, language and site to validate,
        then use site start id, first available language and first available site as a fallback
          and finally return the result`, async () => {
          const expectedContext: Context = { ...completeContext, itemId: siteItemId, itemVersion };

          const result = await service.getValidContext({ ...invalidContext, itemVersion });

          expect(siteService.getSites).toHaveBeenCalledTimes(1);
          expect(languageService.fetchLanguages).toHaveBeenCalled();
          expect(itemService.getItemType).toHaveBeenCalledWith(
            invalidContext.itemId,
            expectedContext.language,
            expectedContext.siteName,
            siteId,
            expectedContext.itemVersion,
          );
          expect(result.context).toEqual(expectedContext);
          expect(result.resolvedValues.itemId.wasCoerced).toBeTrue();
          expect(result.resolvedValues.itemVersion?.wasCoerced).toBeTrue();
          expect(result.resolvedValues.language.wasCoerced).toBeTrue();
          expect(result.resolvedValues.siteName.wasCoerced).toBeTrue();
        });
      });
    });
  });
});
