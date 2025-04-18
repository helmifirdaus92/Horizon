/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { createGqlError, createSpyObserver } from 'app/testing/test.utils';
import { GET_LANGUAGES_PAGE_QUERY, LanguageDalService } from './language.dal.service';

describe(LanguageDalService.name, () => {
  let sut: LanguageDalService;
  let apolloTestingController: ApolloTestingController;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule.withClients(['global'])],
      providers: [
        {
          provide: LanguageDalService,
          useClass: LanguageDalService,
        },
      ],
    });
  }));

  beforeEach(() => {
    sut = TestBed.inject(LanguageDalService);
    apolloTestingController = TestBed.inject(ApolloTestingController);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should fetch the list of languages from GQL using pagination', fakeAsync(() => {
    const gqlLanguages1 = [
      { name: 'en-US', englishName: 'English', displayName: 'English', nativeName: 'English', iso: 'en' },
    ];
    const gqlLanguages2 = [
      { name: 'da-DK', englishName: 'Danish', displayName: 'Danish', nativeName: 'dansk', iso: 'da' },
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

    sut.fetchLanguages().subscribe(resultSpy);

    let query = apolloTestingController.expectOne(GET_LANGUAGES_PAGE_QUERY);
    query.flush({ data: { languages: { nodes: gqlLanguages1, pageInfo: pageInfoHasNextPage } } });
    tick();

    query = apolloTestingController.expectOne(GET_LANGUAGES_PAGE_QUERY);
    query.flush({ data: { languages: { nodes: gqlLanguages2, pageInfo: pageInfoNoNextPage } } });
    tick();

    expect(resultSpy.next).toHaveBeenCalledTimes(1);
    const [result] = resultSpy.next.calls.mostRecent().args;

    const expectedLanguages = [...gqlLanguages1, ...gqlLanguages2];

    expect(result).toEqual(expectedLanguages);
    flush();
  }));

  it('should fetch a maximum of 10 pages of languages', fakeAsync(() => {
    const gqlLanguages = [
      { name: 'en-US', englishName: 'English', displayName: 'English', nativeName: 'English', iso: 'en' },
    ];
    const pageInfo = {
      hasNextPage: true,
      endCursor: 'NA==',
    };

    const resultSpy = createSpyObserver();

    sut.fetchLanguages().subscribe(resultSpy);

    for (let i = 0; i < 10; i++) {
      const query = apolloTestingController.expectOne(GET_LANGUAGES_PAGE_QUERY);
      query.flush({ data: { languages: { nodes: gqlLanguages, pageInfo } } });
      tick();
    }

    expect(resultSpy.next).toHaveBeenCalledTimes(1);
    const [result] = resultSpy.next.calls.mostRecent().args;

    expect(result.length).toBe(10 * gqlLanguages.length);
    flush();
  }));

  it('should extract extension code from GQL error', fakeAsync(() => {
    const resultSpy = createSpyObserver();

    sut.fetchLanguages().subscribe(resultSpy);
    const query = apolloTestingController.expectOne(GET_LANGUAGES_PAGE_QUERY);
    query.graphqlErrors([createGqlError('test error just happened', 'TEST_ERR_CODE')]);
    tick();

    expect(resultSpy.error).toHaveBeenCalledWith('TEST_ERR_CODE');
    flush();
  }));
});
