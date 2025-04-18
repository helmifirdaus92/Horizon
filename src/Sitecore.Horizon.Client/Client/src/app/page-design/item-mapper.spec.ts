/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ItemMapper } from './item-mapper';
import { Item, ItemResponse } from './page-templates.types';
import { adminPermissions } from './shared/page-templates-test-data';

describe(ItemMapper.name, () => {
  describe('mapItemResponseToItem', () => {
    it('should map ItemResponse to Item', () => {
      const itemResponse: ItemResponse = {
        path: '/sitecore/content/Home',
        displayName: 'Home',
        itemId: '{110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9}',
        name: 'home',
        version: 1,
        hasChildren: true,
        thumbnailUrl: '/~/icon/Office/32x32/home.png',
        hasPresentation: false,
        access: adminPermissions,
        insertOptions: [],
        createdAt: {
          value: '20230428T111641Z',
        },
        updatedAt: {
          value: '20230429T111641Z',
        },
        template: {
          templateId: 'template001',
          name: 'template 001',
          baseTemplates: {
            nodes: [
              {
                templateId: 'a87a00b1-e6db-45ab-8b54-636fec3b5523',
              },
            ],
          },
        },
        children: {
          nodes: [
            {
              path: '/sitecore/content/Home/Child1',
              displayName: 'Child1',
              itemId: '{3F8F699D-75FE-4DCE-A0C0-8C97F9CACE77}',
              name: 'child1',
              version: 1,
              hasChildren: false,
              thumbnailUrl: '/~/icon/Office/32x32/document_plain.png',
              hasPresentation: false,
              access: adminPermissions,
              insertOptions: [],
              createdAt: {
                value: '20230428T111641Z',
              },
              updatedAt: {
                value: '20230429T111641Z',
              },
              template: {
                templateId: 'template001',
                name: 'template 001',
                baseTemplates: {
                  nodes: [
                    {
                      templateId: '76036f5e-cbce-46d1-af0a-4143f9b557aa',
                    },
                  ],
                },
              },
              ancestors: [],
              parent: { itemId: 'child1ParentId' },
              pageDesignId: {
                value: 'pageDesignId2',
              },
            },
          ],
        },
        ancestors: [],
        parent: { itemId: 'parentId1' },
        pageDesignId: {
          value: 'pageDesignId1',
        },
      };

      const expectedItem: Item = {
        path: '/sitecore/content/Home',
        displayName: 'Home',
        itemId: '{110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9}',
        name: 'home',
        version: 1,
        hasChildren: true,
        thumbnailUrl: '/~/icon/Office/32x32/home.png',
        hasPresentation: false,
        isFolder: true,
        insertOptions: [],
        createdDate: '20230428T111641Z',
        updatedDate: '20230429T111641Z',
        access: adminPermissions,
        children: [
          {
            path: '/sitecore/content/Home/Child1',
            displayName: 'Child1',
            itemId: '{3F8F699D-75FE-4DCE-A0C0-8C97F9CACE77}',
            name: 'child1',
            version: 1,
            hasChildren: false,
            thumbnailUrl: '/~/icon/Office/32x32/document_plain.png',
            hasPresentation: false,
            isFolder: false,
            insertOptions: [],
            createdDate: '20230428T111641Z',
            updatedDate: '20230429T111641Z',
            access: adminPermissions,
            children: undefined,
            ancestors: [],
            parentId: 'child1ParentId',
            pageDesignId: 'pagedesignid2',
            template: {
              templateId: 'template001',
              name: 'template 001',
              baseTemplates: {
                nodes: [
                  {
                    templateId: '76036f5e-cbce-46d1-af0a-4143f9b557aa',
                  },
                ],
              },
            },
            standardValueItemId: undefined,
          },
        ],
        ancestors: [],
        parentId: 'parentId1',
        pageDesignId: 'pagedesignid1',
        template: {
          templateId: 'template001',
          name: 'template 001',
          baseTemplates: {
            nodes: [
              {
                templateId: 'a87a00b1-e6db-45ab-8b54-636fec3b5523',
              },
            ],
          },
        },
        standardValueItemId: undefined,
      };

      const result = ItemMapper.mapItemResponseToItem(itemResponse);

      expect(result).toEqual(expectedItem);
    });
  });
});
