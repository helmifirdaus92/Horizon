/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ItemWithSite } from '../page-templates.types';
import { adminPermissions } from './page-templates-test-data';
import { combineChildren } from './page-templates-utils';

describe('combineChildren', () => {
  it('should combine children with siteName', () => {
    // Arrange
    const items: ItemWithSite[] = [
      {
        siteName: 'Site 1',
        path: 'path1',
        displayName: 'Item 1',
        itemId: 'itemId1',
        name: 'item1',
        version: 1,
        hasChildren: true,
        thumbnailUrl: 'url1',
        hasPresentation: true,
        isFolder: true,
        createdDate: '2023-07-01',
        updatedDate: '2023-07-05',
        access: adminPermissions,
        children: [
          {
            path: 'path1/child1',
            displayName: 'Child 1',
            itemId: 'childItemId1',
            name: 'child1',
            version: 1,
            hasChildren: false,
            thumbnailUrl: 'childUrl1',
            hasPresentation: true,
            isFolder: false,
            access: adminPermissions,
          },
          {
            path: 'path1/child2',
            displayName: 'Child 2',
            itemId: 'childItemId2',
            name: 'child2',
            version: 1,
            hasChildren: false,
            thumbnailUrl: 'childUrl2',
            hasPresentation: true,
            isFolder: false,
            access: adminPermissions,
          },
        ],
      },
      {
        siteName: 'Site 2',
        path: 'path2',
        displayName: 'Item 2',
        itemId: 'itemId2',
        name: 'item2',
        version: 1,
        hasChildren: true,
        thumbnailUrl: 'url2',
        hasPresentation: true,
        isFolder: true,
        createdDate: '2023-07-01',
        updatedDate: '2023-07-05',
        access: adminPermissions,
        children: [
          {
            path: 'path2/child3',
            displayName: 'Child 3',
            itemId: 'childItemId3',
            name: 'child3',
            version: 1,
            hasChildren: false,
            thumbnailUrl: 'childUrl3',
            hasPresentation: true,
            isFolder: false,
            access: adminPermissions,
          },
        ],
      },
    ];

    // Act
    const result = combineChildren(items, 'Site 1', 'current');

    // Assert
    expect(result).toEqual([
      {
        path: 'path1/child1',
        displayName: 'Child 1',
        itemId: 'childItemId1',
        name: 'child1',
        version: 1,
        hasChildren: false,
        thumbnailUrl: 'childUrl1',
        hasPresentation: true,
        isFolder: false,
        siteName: 'Site 1',
        access: adminPermissions,
      },
      {
        path: 'path1/child2',
        displayName: 'Child 2',
        itemId: 'childItemId2',
        name: 'child2',
        version: 1,
        hasChildren: false,
        thumbnailUrl: 'childUrl2',
        hasPresentation: true,
        isFolder: false,
        siteName: 'Site 1',
        access: adminPermissions,
      },
    ]);
  });
});
