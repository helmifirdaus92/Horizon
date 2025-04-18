/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Item } from 'app/shared/graphql/item.interface';
import { PageToItemMapper } from './page-to-item-mapper';
import { ExecuteWorkflowCommandResult, PageHierarchy, SavePageResponse } from './page.types';

describe(PageToItemMapper.name, () => {
  describe('mapPageHierarchyToItem', () => {
    it('should correctly map a page hierarchy to an item', () => {
      // Arrange
      const pageHierarchy: PageHierarchy = {
        page: {
          name: 'Test Page',
          id: '1',
          version: 1,
          versionName: 'v1',
          revision: 'r1',
          updatedAt: '2024-05-11',
          displayName: 'Test Page',
          icon: 'icon',
          url: '/test-page',
          route: '/test-page',
          templateId: '123',
          hasChildren: true,
          language: 'en',
          parentId: '123',
          workflow: undefined,
          template: {
            id: 'template1',
            name: 'Template 1',
            path: '/template1',
            displayName: 'Template 1',
            baseTemplateIds: ['2bb25752-b3bc-4f13-b9cb-38b906d21a33', '77b1399f-5f30-4643-a054-59bbb1c7c62c'],
          },
          permissions: {
            canAdmin: true,
            canWrite: true,
            canCreate: true,
            canDelete: true,
            canRename: true,
            canRead: true,
            canPublish: true,
          },
          locking: {
            canUnlock: true,
            isLocked: false,
            lockedBy: '',
            lockedByCurrentUser: false,
          },
          publishing: {
            isPublishable: true,
            hasPublishableVersion: true,
            isAvailableToPublish: true,
            validFromDate: '2024-05-11',
            validToDate: '2024-06-11',
          },
          finalLayout: 'layout',
          sharedLayout: 'page-shared-layout',
          layoutEditingKind: 'FINAL',
          createdAt: '2024-05-11',
          createdBy: 'User1',
          hasPresentation: false,
          insertOptions: [],
          hasVersions: true,
          updatedBy: '',
          path: '/test-page',
        },
        children: [],
        ancestors: [],
        siblings: [],
      };

      // Expected result
      const expectedResult: Item = {
        name: 'Test Page',
        id: '1',
        version: 1,
        versionName: 'v1',
        revision: 'r1',
        updatedBy: '',
        updatedDate: '2024-05-11',
        displayName: 'Test Page',
        icon: 'icon',
        path: '/test-page',
        hasChildren: true,
        children: [],
        ancestors: [],
        language: 'en',
        parent: undefined,
        workflow: null,
        template: {
          name: 'Template 1',
          id: 'template1',
          displayName: 'Template 1',
          path: '/template1',
          baseTemplateIds: ['2bb25752-b3bc-4f13-b9cb-38b906d21a33', '77b1399f-5f30-4643-a054-59bbb1c7c62c'],
        },
        fields: [],
        isFolder: true,
        isLatestPublishableVersion: true,
        creationDate: '2024-05-11',
        createdBy: 'User1',
        insertOptions: [],
        permissions: {
          canWrite: true,
          canCreate: true,
          canDelete: true,
          canRename: true,
          canPublish: true,
        },
        locking: {
          lockedByCurrentUser: false,
          isLocked: false,
        },
        publishing: {
          hasPublishableVersion: true,
          isPublishable: true,
          validFromDate: '2024-05-11',
          validToDate: '2024-06-11',
          isAvailableToPublish: true,
        },
        presentationDetails: 'layout',
        layoutEditingKind: 'FINAL',
        versions: [],
        route: '/test-page',
        hasVersions: true,
      };

      // Act
      const result = PageToItemMapper.mapPageHierarchyToItem(pageHierarchy);

      // Assertion
      expect(result).toEqual(expectedResult);
    });
  });

  describe('mapSavePageResponseToSaveResult', () => {
    it('should correctly map save page response to save result', () => {
      // Arrange
      const savePageResponse: SavePageResponse = {
        language: 'en',
        site: 'site1',
        pageVersion: 1,
        revision: 'r1',
        fields: [],
        errors: [],
        savedPage: {
          id: '1',
          language: 'en',
          revision: 'r1',
          version: 1,
          fields: [],
        },
        validationErrors: [],
        warnings: [],
        newCreatedVersion: {
          pageId: '2',
          displayName: 'New Version',
          versionNumber: 2,
        },
      };

      // Expected result
      const expectedResult = {
        errors: [],
        savedItems: [
          {
            fields: [],
            id: '1',
            language: 'en',
            revision: 'r1',
            version: 1,
          },
        ],
        validationErrors: [],
        warnings: [],
        newCreatedVersions: [
          {
            itemId: '2',
            displayName: 'New Version',
            versionNumber: 2,
          },
        ],
      };

      // Act
      const result = PageToItemMapper.mapSavePageResponseToSaveResult(savePageResponse);

      // Assert
      expect(result).toEqual(expectedResult);
    });
  });

  describe('mapExecuteWorkflowResult', () => {
    it('should correctly map execute workflow result to execute workflow command output', () => {
      // Arrange
      const executeWorkflowCommandResult: ExecuteWorkflowCommandResult = {
        completed: true,
        error: '',
        datasourcesCommandResult: [],
        pageWorkflowValidationResult: {
          pageValidationResult: {
            pageId: '1',
            pageName: 'Test Page',
            pageRulesResult: [],
            fieldRulesResult: [],
          },
          defaultDatasourceItemsResult: [],
          personalizedDatasourceItemsResult: [],
        },
      };

      // Expected result
      const expectedResult = {
        completed: true,
        error: '',
        datasourcesCommandResult: [],
        pageWorkflowValidationResult: {
          pageItemResult: {
            itemId: '1',
            itemName: 'Test Page',
            itemRulesResult: [],
            fieldRulesResult: [],
          },
          defaultDatasourceItemsResult: [],
          personalizedDatasourceItemsResult: undefined,
        },
      };

      // Act
      const result = PageToItemMapper.mapExecuteWorkflowResult(executeWorkflowCommandResult);

      // Assert
      expect(result).toEqual(expectedResult);
    });
  });
});
