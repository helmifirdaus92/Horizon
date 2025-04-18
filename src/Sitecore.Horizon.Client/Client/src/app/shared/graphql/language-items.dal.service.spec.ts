/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { createGqlError, createSpyObserver, TestBedInjectSpy } from 'app/testing/test.utils';
import { GET_LANGUAGE_ITEMS_QUERY, LanguageItemsDalService } from './language-items.dal.service';

describe(LanguageItemsDalService.name, () => {
  let sut: LanguageItemsDalService;
  let apolloTestingController: ApolloTestingController;
  let featureFlagsService: jasmine.SpyObj<FeatureFlagsService>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule.withClients(['global'])],
      providers: [
        {
          provide: LanguageItemsDalService,
          useClass: LanguageItemsDalService,
        },
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>(['isFeatureEnabled']),
        },
      ],
    });
  }));

  beforeEach(() => {
    sut = TestBed.inject(LanguageItemsDalService);
    featureFlagsService = TestBedInjectSpy(FeatureFlagsService);
    featureFlagsService.isFeatureEnabled.and.returnValue(true);
    apolloTestingController = TestBed.inject(ApolloTestingController);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should fetch the list of supported languages from GQL using pagination', fakeAsync(() => {
    const gqlSupportedLanguages1 = [
      {
        itemId: '1',
        name: 'en-US',
        iso: { value: 'en' },
        regionalIsoCode: { value: 'en-US' },
        baseIsoCultureCode: { value: 'en' },
        fallbackRegionDisplayName: { value: 'English' },
        fallbackLanguage: { value: 'English' },
      },
    ];
    const gqlSupportedLanguages2 = [
      {
        itemId: '2',
        name: 'da-DK',
        iso: { value: 'da' },
        regionalIsoCode: { value: 'da-DK' },
        baseIsoCultureCode: { value: 'da' },
        fallbackRegionDisplayName: { value: 'Danish' },
        fallbackLanguage: { value: 'Danish' },
      },
    ];
    const pageInfoHasNextPage = {
      hasNextPage: true,
      endCursor: 'cursor1',
    };
    const pageInfoNoNextPage = {
      hasNextPage: false,
      endCursor: 'cursor2',
    };

    const resultSpy = createSpyObserver();

    sut.getSupportedLanguages().subscribe(resultSpy);

    let query = apolloTestingController.expectOne(GET_LANGUAGE_ITEMS_QUERY);
    query.flush({ data: { item: { children: { nodes: gqlSupportedLanguages1, pageInfo: pageInfoHasNextPage } } } });
    tick();

    query = apolloTestingController.expectOne(GET_LANGUAGE_ITEMS_QUERY);
    query.flush({ data: { item: { children: { nodes: gqlSupportedLanguages2, pageInfo: pageInfoNoNextPage } } } });
    tick();

    expect(resultSpy.next).toHaveBeenCalledTimes(1);
    const [result] = resultSpy.next.calls.mostRecent().args;

    const expectedSupportedLanguages = [...gqlSupportedLanguages1, ...gqlSupportedLanguages2];

    expect(result).toEqual(expectedSupportedLanguages);
    flush();
  }));

  it('should fetch a maximum of 10 pages of supported languages', fakeAsync(() => {
    const gqlSupportedLanguages = [
      {
        itemId: '1',
        name: 'en-US',
        iso: { value: 'en' },
        regionalIsoCode: { value: 'en-US' },
        baseIsoCultureCode: { value: 'en' },
        fallbackRegionDisplayName: { value: 'English' },
        fallbackLanguage: { value: 'English' },
      },
    ];
    const pageInfo = {
      hasNextPage: true,
      endCursor: 'NA==',
    };

    const resultSpy = createSpyObserver();

    sut.getSupportedLanguages().subscribe(resultSpy);

    for (let i = 0; i < 10; i++) {
      const query = apolloTestingController.expectOne(GET_LANGUAGE_ITEMS_QUERY);
      query.flush({ data: { item: { children: { nodes: gqlSupportedLanguages, pageInfo } } } });
      tick();
    }

    expect(resultSpy.next).toHaveBeenCalledTimes(1);
    const [result] = resultSpy.next.calls.mostRecent().args;

    expect(result.length).toBe(10 * gqlSupportedLanguages.length);
    flush();
  }));

  it('should extract extension code from GQL error', fakeAsync(() => {
    const resultSpy = createSpyObserver();

    sut.getSupportedLanguages().subscribe(resultSpy);
    const query = apolloTestingController.expectOne(GET_LANGUAGE_ITEMS_QUERY);
    query.graphqlErrors([createGqlError('test error just happened', 'TEST_ERR_CODE')]);
    tick();

    expect(resultSpy.error).toHaveBeenCalledWith('TEST_ERR_CODE');
    flush();
  }));
});
