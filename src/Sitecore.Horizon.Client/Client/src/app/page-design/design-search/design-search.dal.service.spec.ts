/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { createSpyObserver } from 'app/testing/test.utils';
import { SearchResult } from '../page-templates.types';
import { adminPermissions } from '../shared/page-templates-test-data';
import { DesignSearchDalService, SEARCH_IN_DESIGN } from './design-search.dal.service';

describe(DesignSearchDalService.name, () => {
  let sut: DesignSearchDalService;
  let apolloTestingController: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule.withClients(['global'])],
    });
    sut = TestBed.inject(DesignSearchDalService);
    apolloTestingController = TestBed.inject(ApolloTestingController);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('search', () => {
    it('should call the search query with the search input', fakeAsync(() => {
      const searchInput = 'design1';
      const designRoots = ['c32a5dd1-d51a-49ba-8e83-cee96950e2be'];

      const mockSearchResult: SearchResult = {
        totalCount: 1,
        results: [
          {
            innerItem: {
              path: '',
              displayName: 'design1',
              itemId: 'c32a5dd1-d51a-49ba-8e83-cee96950e2be',
              name: 'design1',
              version: 1,
              hasChildren: true,
              thumbnailUrl: '',
              hasPresentation: true,
              access: adminPermissions,
              createdAt: {
                value: '20230428T111641Z',
              },
              template: {
                templateId: '2222temId',
                name: 'template 001',
                baseTemplates: {
                  nodes: [
                    {
                      templateId: 'c32a5dd1-d51a-49ba-8e83-cee96950e2be',
                    },
                  ],
                },
              },
            },
          },
        ],
      };

      const resultSpy = createSpyObserver();
      sut.search(searchInput, designRoots, 'pagedesign').subscribe(resultSpy);
      tick();

      const query = apolloTestingController.expectOne(SEARCH_IN_DESIGN);
      query.flush({
        data: {
          search: mockSearchResult,
        },
      });
      tick();

      expect(query.operation.variables).toEqual({
        searchInput: 'design1',
        pathCriteria: [{ field: '_path', value: 'c32a5dd1d51a49ba8e83cee96950e2be', criteriaType: 'CONTAINS' }],
        itemTypeCriteria: [
          { field: '_templates', value: '0407560f387b4a90adbe398b077890e9', criteriaType: 'CONTAINS' },
          { field: '_templates', value: 'a87a00b1e6db45ab8b54636fec3b5523', criteriaType: 'CONTAINS' },
        ],
      });
      expect(resultSpy.next).toHaveBeenCalledTimes(1);
      const [result] = resultSpy.next.calls.mostRecent().args;
      expect(result).toEqual({ isSuccessful: true, items: mockSearchResult.results.map((r) => r.innerItem) });
      flush();
    }));
  });
});
