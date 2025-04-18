/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import {
  ItemWithSite,
  PAGE_DESIGN_FOLDER_TEMPLATE_ID,
  PAGE_DESIGN_TEMPLATE_ID,
  PARTIAL_DESIGN_FOLDER_TEMPLATE_ID,
  PARTIAL_DESIGN_TEMPLATE_ID,
} from '../page-templates.types';

export const adminPermissions = {
  canCreate: true,
  canRename: true,
  canDelete: true,
  canWrite: true,
  canDuplicate: true,
};

export const mockThumbnailUrl = 'http://:0/test.jpg';

export function getItemWithSites(): ItemWithSite[] {
  return [
    {
      ancestors: [
        {
          displayName: 'design',
          itemId: '1a27243c-2d19-4285-925c-ff73ffbefc32',
        },
        {
          displayName: 'folder-1',
          itemId: '1a27243c-2d19-4285-925c',
        },
      ],
      children: [],
      createdDate: '',
      displayName: 'Partial Designs',
      hasChildren: false,
      hasPresentation: false,
      insertOptions: [
        {
          templateId: 'partialDesignFolderTemplateId',
          baseTemplates: {
            nodes: [
              {
                templateId: PARTIAL_DESIGN_FOLDER_TEMPLATE_ID,
              },
              {
                templateId: '',
              },
            ],
          },
        },
        {
          templateId: 'partialDesignItemTemplateId',
          baseTemplates: {
            nodes: [
              {
                templateId: PARTIAL_DESIGN_TEMPLATE_ID,
              },
              {
                templateId: '123',
              },
            ],
          },
        },
      ],
      isFolder: false,
      itemId: '69d85e8e-d5e3-434c-895a-d839562bc6b3',
      name: 'Partial Designs',
      path: '',
      siteName: 'website1',
      thumbnailUrl: '',
      updatedDate: '',
      access: adminPermissions,
      version: 1,
    },
  ];
}

export function getPartialDesignsMocks(): ItemWithSite[] {
  return [
    {
      path: '/path/to/root1',
      displayName: 'root1',
      itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
      name: 'root1',
      version: 1,
      hasChildren: true,
      thumbnailUrl: mockThumbnailUrl,
      hasPresentation: false,
      isFolder: false,
      insertOptions: [],
      createdDate: '20230428T111641Z',
      updatedDate: '20230429T111641Z',
      access: adminPermissions,
      children: [
        {
          path: '/path/to/root1/partial-design/child1',
          displayName: 'Child 1',
          itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
          name: 'Child1',
          version: 1,
          hasChildren: false,
          thumbnailUrl: mockThumbnailUrl,
          hasPresentation: true,
          isFolder: false,
          insertOptions: [],
          createdDate: '20230428T111641Z',
          updatedDate: '20230429T111641Z',
          access: adminPermissions,
          children: [],
        },
      ],
      siteName: 'sharedSite',
    },

    {
      path: '/path/to/root1/partial-design',
      displayName: 'Partial Design',
      itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
      name: 'PartialDesign',
      version: 1,
      hasChildren: false,
      thumbnailUrl: mockThumbnailUrl,
      hasPresentation: true,
      isFolder: true,
      insertOptions: [],
      createdDate: '20230428T111641Z',
      updatedDate: '20230429T111641Z',
      access: adminPermissions,
      children: [
        {
          path: '/path/to/root1/partial-design/folder-item',
          displayName: 'folder',
          itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
          name: 'folderItem',
          version: 1,
          hasChildren: false,
          thumbnailUrl: mockThumbnailUrl,
          hasPresentation: true,
          isFolder: true,
          insertOptions: [],
          createdDate: '20230428T111641Z',
          updatedDate: '20230429T111641Z',
          access: adminPermissions,
          children: [],
        },
      ],
      siteName: 'sharedSite',
    },

    {
      path: '/path/to/item',
      displayName: 'Item Display Name' + 'pt-BR',
      itemId: 'rootId',
      name: 'Item Name',
      version: 1,
      hasChildren: true,
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      hasPresentation: true,
      isFolder: false,
      insertOptions: [
        {
          templateId: 'partialDesignFolderTemplateId',
          baseTemplates: {
            nodes: [
              {
                templateId: PARTIAL_DESIGN_FOLDER_TEMPLATE_ID,
              },
              {
                templateId: '',
              },
            ],
          },
        },
        {
          templateId: 'partialDesignItemTemplateId',
          baseTemplates: {
            nodes: [
              {
                templateId: PARTIAL_DESIGN_TEMPLATE_ID,
              },
              {
                templateId: '123',
              },
            ],
          },
        },
      ],
      createdDate: '20230428T111641Z',
      updatedDate: '20230429T111641Z',
      access: adminPermissions,
      children: [
        {
          path: '/path/to/child-item',
          displayName: 'Child Item Display Name',
          itemId: '456',
          name: 'Child Item Name',
          version: 1,
          hasChildren: false,
          thumbnailUrl: 'https://example.com/child-thumbnail.jpg',
          hasPresentation: false,
          isFolder: true,
          insertOptions: [],
          createdDate: '20230428T111641Z',
          updatedDate: '20230429T111641Z',
          access: adminPermissions,
          children: [],
        },
      ],

      siteName: 'website1',
    },
  ];
}

export function getPageDesignsMocks(): ItemWithSite[] {
  return [
    {
      path: '/path/to/root1/page-design',
      displayName: 'Partial Design',
      itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
      name: 'page-design-context',
      version: 1,
      hasChildren: false,
      thumbnailUrl: mockThumbnailUrl,
      hasPresentation: true,
      isFolder: false,
      insertOptions: [],
      createdDate: '20230428T111641Z',
      updatedDate: '20230429T111641Z',
      access: adminPermissions,
      children: [
        {
          path: '/path/to/root1/page-design/footer',
          displayName: 'Footer',
          itemId: 'testId',
          name: 'Footer',
          version: 1,
          hasChildren: false,
          thumbnailUrl: mockThumbnailUrl,
          hasPresentation: true,
          isFolder: false,
          insertOptions: [],
          createdDate: '20230428T111641Z',
          updatedDate: '20230429T111641Z',
          access: adminPermissions,
          children: [],
        },
      ],
      siteName: 'sharedSite',
    },
    {
      path: '/path/to/root1/page-design/folder1',
      displayName: 'design2',
      itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
      name: 'page-design-shared',
      version: 1,
      hasChildren: true,
      thumbnailUrl: mockThumbnailUrl,
      hasPresentation: true,
      isFolder: true,
      insertOptions: [],
      createdDate: '20230428T111641Z',
      updatedDate: '20230429T111641Z',
      access: adminPermissions,
      children: [
        {
          path: '/path/to/root1/page-design/folder-item',
          displayName: 'header',
          itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
          name: 'header',
          version: 1,
          hasChildren: false,
          thumbnailUrl: mockThumbnailUrl,
          hasPresentation: true,
          isFolder: true,
          insertOptions: [],
          createdDate: '20230428T111641Z',
          updatedDate: '20230429T111641Z',
          access: adminPermissions,
          children: [],
        },
      ],
      siteName: 'sharedSite',
    },

    {
      path: '/path/to/item',
      displayName: 'Item Display Name' + 'pt-BR',
      itemId: 'rootId',
      name: 'Item Name',
      version: 1,
      hasChildren: true,
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      hasPresentation: true,
      isFolder: false,
      access: adminPermissions,
      insertOptions: [
        {
          templateId: 'pageDesignFolderTemplateId',
          baseTemplates: {
            nodes: [
              {
                templateId: PAGE_DESIGN_FOLDER_TEMPLATE_ID,
              },
              {
                templateId: '',
              },
            ],
          },
        },
        {
          templateId: 'pageDesignItemTemplateId',
          baseTemplates: {
            nodes: [
              {
                templateId: PAGE_DESIGN_TEMPLATE_ID,
              },
              {
                templateId: '123',
              },
            ],
          },
        },
      ],
      createdDate: '20230428T111641Z',
      updatedDate: '20230429T111641Z',
      children: [
        {
          path: '/path/to/child-item',
          displayName: 'Child Item Display Name',
          itemId: '456',
          name: 'Child Item Name',
          version: 1,
          hasChildren: false,
          thumbnailUrl: 'https://example.com/child-thumbnail.jpg',
          hasPresentation: false,
          isFolder: true,
          insertOptions: [],
          createdDate: '20230428T111641Z',
          updatedDate: '20230429T111641Z',
          access: adminPermissions,
          children: [],
        },
      ],
      siteName: 'website1',
    },
  ];
}
