/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { ContextValidator, ValidContextResult } from 'app/shared/client-state/context-validator';
import {
  ContextServiceTesting,
  ContextServiceTestingModule,
  DEFAULT_TEST_CONTEXT,
} from 'app/shared/client-state/context.service.testing';
import { LanguageDalService } from 'app/shared/graphql/language.dal.service';
import { SiteDalService } from 'app/shared/graphql/sites/solutionSite.dal.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { NEVER } from 'rxjs';
import { LanguageSwitcherService, SiteSwitcherService } from './site-language-switcher.service';

describe(SiteSwitcherService.name, () => {
  let sut: SiteSwitcherService;
  let ctxValidator: jasmine.SpyObj<ContextValidator>;
  let context: ContextServiceTesting;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ContextServiceTestingModule],
      providers: [
        {
          provide: ContextValidator,
          useValue: jasmine.createSpyObj<ContextValidator>('appService', ['getValidContext']),
        },
        {
          provide: SiteDalService,
          useValue: jasmine.createSpyObj<SiteDalService>('site-service', ['getSites', 'getDefaultSite']),
        },
      ],
    });

    sut = TestBed.inject(SiteSwitcherService);
    ctxValidator = TestBedInjectSpy(ContextValidator);
    context = TestBed.inject(ContextServiceTesting);
  });

  describe('site', () => {
    it('should proxy the value from context', () => {
      const spy = jasmine.createSpy();

      // act
      sut.site.subscribe(spy);
      expect(spy).not.toHaveBeenCalled();
      context.provideDefaultTestContext();

      // assert
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(DEFAULT_TEST_CONTEXT.siteName);

      // act
      const newSite = 'site2';
      context.setTestSite(newSite);

      // assert
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith(newSite);
    });
  });

  describe('selectSite()', () => {
    it(`should validate the new value and update the context with the validated result`, async () => {
      const newSite = 'nicecats';
      const validatedCtx: ValidContextResult = {
        context: { ...DEFAULT_TEST_CONTEXT, siteName: newSite },
        resolvedValues: {
          itemId: { value: 'itemId', wasCoerced: false },
          siteName: { value: 'siteName', wasCoerced: false },
          language: { value: 'language', wasCoerced: false },
        },
      };
      ctxValidator.getValidContext.and.returnValue(Promise.resolve(validatedCtx));
      context.provideDefaultTestContext();
      const updateCtxSpy = spyOn(context, 'updateContext');

      sut.selectSite(newSite);

      expect(ctxValidator.getValidContext).toHaveBeenCalledWith({
        siteName: newSite,
        language: DEFAULT_TEST_CONTEXT.language,
        itemId: '',
      });

      await Promise.resolve();

      expect(updateCtxSpy).toHaveBeenCalledWith(validatedCtx.context);
    });
  });
});

describe(LanguageSwitcherService.name, () => {
  let sut: LanguageSwitcherService;
  let context: ContextServiceTesting;
  let languageServiceSpy: jasmine.SpyObj<LanguageDalService>;

  beforeEach(() => {
    languageServiceSpy = jasmine.createSpyObj<LanguageDalService>({
      fetchLanguages: NEVER,
    });

    TestBed.configureTestingModule({
      imports: [ContextServiceTestingModule],
      providers: [
        {
          provide: LanguageDalService,
          useValue: languageServiceSpy,
        },
      ],
    });

    sut = TestBed.inject(LanguageSwitcherService);
    context = TestBed.inject(ContextServiceTesting);
  });

  describe('language', () => {
    it('should proxy the value from context', () => {
      const spy = jasmine.createSpy();

      // act
      sut.language.subscribe(spy);
      expect(spy).not.toHaveBeenCalled();
      context.provideDefaultTestContext();

      // assert
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(DEFAULT_TEST_CONTEXT.language);

      // act
      const newLang = 'mylanguage';
      context.setTestLang(newLang);

      // assert
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith(newLang);
    });
  });

  describe('selectLanguage()', () => {
    it(`should set the language to context`, () => {
      const newLang = 'mylanguage';
      const updateCtxSpy = spyOn(context, 'updateContext');

      sut.selectLanguage(newLang);

      expect(updateCtxSpy).toHaveBeenCalledWith({ language: newLang });
    });
  });
});
