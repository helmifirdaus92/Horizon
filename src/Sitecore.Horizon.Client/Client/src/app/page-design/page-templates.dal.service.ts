/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { extractGqlErrorCode } from 'app/shared/utils/graphql.utils';
import { normalizeGuid } from 'app/shared/utils/utils';
import gql from 'graphql-tag';
import { catchError, map, Observable, of } from 'rxjs';
import {
  AssignPageDesignInput,
  AssignPageDesignOutput,
  AssignPageDesignPartialsInput,
  AssignPageDesignPartialsOutput,
  ConfigurePageDesignsInput,
  ConfigurePageDesignsOutput,
  CopyItemInput,
  CreateItemInput,
  DeleteItemInput,
  DesignRoots,
  InsertOptionsUpdateInput,
  ItemBulkOperationOutputResponse,
  ItemOperationOutputResponse,
  ItemResponse,
  ItemTemplate,
  ItemTemplateBulkOperationOutput,
  MoveItemInput,
  PageBranchesRootResponse,
  PageDesignPartialsOutput,
  PageDesignResponse,
  PageDesignRootResponse,
  PAGE_BRANCHES_FOLDER_TEMPLATE_ID,
  PAGE_BRANCH_TEMPLATE_ID,
  PAGE_DESIGN_FOLDER_TEMPLATE_ID,
  PAGE_DESIGN_TEMPLATE_ID,
  PartialDesignResponse,
  PartialDesignRootResponse,
  PARTIAL_DESIGN_FOLDER_TEMPLATE_ID,
  PARTIAL_DESIGN_TEMPLATE_ID,
  RenameItemInput,
  SearchResult,
  TenantPageTemplateResponse,
} from './page-templates.types';

export const PAGE_TEMPLATES_PAGE_DESIGNS_ROOTS_WITH_CHILDREN_QUERY = gql`
  query GetPageDesignsRoots($siteName: String!, $versionLanguage: String!, $includeTemplateIDs: [ID!]!) {
    pageDesignsRoots(where: { siteName: $siteName }) {
      root {
        path
        itemId(format: D)
        name
        version
        displayName
        hasChildren
        thumbnailUrl
        access {
          canCreate
          canRename
          canDelete
          canWrite
          canDuplicate
        }
        hasPresentation
        createdAt: field(name: "__Created") {
          value
        }
        updatedAt: field(name: "__Updated") {
          value
        }
        template {
          baseTemplates {
            nodes {
              templateId(format: D)
            }
          }
        }
        insertOptions {
          templateId
          baseTemplates {
            nodes {
              templateId
            }
          }
        }
        children(hasVersionInLanguages: [$versionLanguage], includeTemplateIDs: $includeTemplateIDs) {
          nodes {
            access {
              canCreate
              canRename
              canDelete
              canWrite
              canDuplicate
            }
            path
            itemId(format: D)
            name
            version
            displayName
            hasChildren
            thumbnailUrl
            hasPresentation
            createdAt: field(name: "__Created") {
              value
            }
            updatedAt: field(name: "__Updated") {
              value
            }
            template {
              baseTemplates {
                nodes {
                  templateId(format: D)
                }
              }
            }
          }
        }
      }
      siteName
    }
  }
`;

export const PAGE_TEMPLATES_PARTIAL_DESIGNS_ROOTS_WITH_CHILDREN_QUERY = gql`
  query GetPartialDesignsRoots($siteName: String!, $versionLanguage: String!, $includeTemplateIDs: [ID!]!) {
    partialDesignsRoots(where: { siteName: $siteName }) {
      root {
        path
        itemId(format: D)
        name
        version
        displayName
        hasChildren
        thumbnailUrl
        access {
          canCreate
          canRename
          canDelete
          canWrite
          canDuplicate
        }
        hasPresentation
        createdAt: field(name: "__Created") {
          value
        }
        updatedAt: field(name: "__Updated") {
          value
        }
        template {
          baseTemplates {
            nodes {
              templateId(format: D)
            }
          }
        }
        insertOptions {
          templateId
          baseTemplates {
            nodes {
              templateId
            }
          }
        }
        children(hasVersionInLanguages: [$versionLanguage], includeTemplateIDs: $includeTemplateIDs) {
          nodes {
            access {
              canCreate
              canRename
              canDelete
              canWrite
              canDuplicate
            }
            path
            itemId(format: D)
            name
            version
            displayName
            hasChildren
            thumbnailUrl
            hasPresentation
            createdAt: field(name: "__Created") {
              value
            }
            updatedAt: field(name: "__Updated") {
              value
            }
            template {
              baseTemplates {
                nodes {
                  templateId(format: D)
                }
              }
            }
          }
        }
      }
      siteName
    }
  }
`;

export const PAGE_TEMPLATES_PAGE_BRANCHES_ROOTS_WITH_CHILDREN_QUERY = gql`
  query GetPageBranchesRoots($siteName: String!, $versionLanguage: String!, $includeTemplateIDs: [ID!]!) {
    pageBranchesRoots(where: { siteName: $siteName }) {
      root {
        path
        itemId(format: D)
        name
        version
        displayName
        hasChildren
        access {
          canCreate
          canRename
          canDelete
          canWrite
          canDuplicate
        }
        hasPresentation
        createdAt: field(name: "__Created") {
          value
        }
        updatedAt: field(name: "__Updated") {
          value
        }
        template {
          templateId
          baseTemplates {
            nodes {
              templateId(format: D)
            }
          }
        }
        insertOptions {
          templateId
          baseTemplates {
            nodes {
              templateId
            }
          }
        }
        children(hasVersionInLanguages: [$versionLanguage], includeTemplateIDs: $includeTemplateIDs) {
          nodes {
            access {
              canCreate
              canRename
              canDelete
              canWrite
              canDuplicate
            }
            path
            itemId(format: D)
            name
            version
            displayName
            hasChildren
            thumbnailUrl
            hasPresentation
            createdAt: field(name: "__Created") {
              value
            }
            updatedAt: field(name: "__Updated") {
              value
            }
            template {
              templateId
              baseTemplates {
                nodes {
                  templateId(format: D)
                }
              }
            }
            children {
              nodes {
                itemId(format: D)
                name
                version
                thumbnailUrl
              }
            }
          }
        }
      }
      siteName
    }
  }
`;

// Page design roots without children
export const PAGE_TEMPLATES_PAGE_DESIGNS_ROOTS_QUERY = gql`
  query GetPageDesignsRootsOnly($siteName: String!) {
    pageDesignsRoots(where: { siteName: $siteName }) {
      root {
        itemId(format: D)
        name
        displayName
        access {
          canCreate
          canRename
          canDelete
          canWrite
          canDuplicate
        }
        template {
          baseTemplates {
            nodes {
              templateId(format: D)
            }
          }
        }
        insertOptions {
          templateId
          baseTemplates {
            nodes {
              templateId
            }
          }
        }
      }
      siteName
    }
  }
`;

// Partial design roots without children
export const PAGE_TEMPLATES_PARTIAL_DESIGNS_ROOTS_QUERY = gql`
  query GetPartialDesignsRootsOnly($siteName: String!) {
    partialDesignsRoots(where: { siteName: $siteName }) {
      root {
        itemId(format: D)
        name
        displayName
        access {
          canCreate
          canRename
          canDelete
          canWrite
          canDuplicate
        }
        template {
          baseTemplates {
            nodes {
              templateId(format: D)
            }
          }
        }
        insertOptions {
          templateId
          baseTemplates {
            nodes {
              templateId
            }
          }
        }
      }
      siteName
    }
  }
`;

// Partial design roots without children
export const PAGE_TEMPLATES_PAGE_BRANCHES_ROOTS_QUERY = gql`
  query GetPageBranchesRootsOnly($siteName: String!) {
    pageBranchesRoots(where: { siteName: $siteName }) {
      root {
        itemId(format: D)
        name
        displayName
        access {
          canCreate
          canRename
          canDelete
          canWrite
          canDuplicate
        }
        template {
          baseTemplates {
            nodes {
              templateId(format: D)
            }
          }
        }
        insertOptions {
          templateId
          baseTemplates {
            nodes {
              templateId
            }
          }
        }
      }
      siteName
    }
  }
`;

export const PAGE_TEMPLATES_ITEM_CHILDREN_QUERY = gql`
  query GetItemChildren($itemId: ID!, $versionLanguage: ID, $includeTemplateIDs: [ID!], $includeSubChildren: Boolean!) {
    item(where: { itemId: $itemId }) {
      itemId(format: D)
      displayName
      version
      access {
        canCreate
        canRename
        canDelete
        canWrite
        canDuplicate
      }
      ancestors {
        displayName
        itemId(format: D)
        version
      }
      children(hasVersionInLanguages: [$versionLanguage], includeTemplateIDs: $includeTemplateIDs) {
        nodes {
          access {
            canCreate
            canRename
            canDelete
            canWrite
            canDuplicate
          }
          path
          itemId(format: D)
          name
          version
          displayName
          hasChildren
          thumbnailUrl
          hasPresentation
          createdAt: field(name: "__Created") {
            value
          }
          updatedAt: field(name: "__Updated") {
            value
          }
          template {
            templateId
            baseTemplates {
              nodes {
                templateId(format: D)
              }
            }
          }
          children @include(if: $includeSubChildren) {
            nodes {
              itemId(format: D)
              name
              version
              thumbnailUrl
            }
          }
        }
      }
    }
  }
`;

export const PAGE_TEMPLATES_USAGE_COUNT_QUERY = gql`
  query SearchItemsByFields($includeFieldValue: String!, $excludeFieldValue: String!) {
    search(
      query: {
        filterStatement: {
          criteria: [
            { field: "_template", value: $includeFieldValue }
            { field: "_name", value: $excludeFieldValue, operator: NOT }
          ]
        }
      }
    ) {
      totalCount
    }
  }
`;

export const PAGE_TEMPLATES_PAGE_DESIGNS_QUERY = gql`
  query GetPageDesigns($siteName: String!) {
    pageDesigns(where: { siteName: $siteName }) {
      pageDesign {
        access {
          canCreate
          canRename
          canDelete
          canWrite
          canDuplicate
        }
        path
        itemId(format: D)
        name
        displayName
        hasChildren
        thumbnailUrl
        hasPresentation
        createdAt: field(name: "__Created") {
          value
        }
        updatedAt: field(name: "__Updated") {
          value
        }
        template {
          baseTemplates {
            nodes {
              templateId(format: D)
            }
          }
        }
      }
      siteName
    }
  }
`;

export const PAGE_TEMPLATES_PARTIALS_DESIGNS_QUERY = gql`
  query GetPartialDesigns($siteName: String!) {
    partialDesigns(where: { siteName: $siteName }) {
      partialDesign {
        access {
          canCreate
          canRename
          canDelete
          canWrite
          canDuplicate
        }
        itemId(format: D)
        name
        version
        displayName
        thumbnailUrl
      }
      siteName
    }
  }
`;

export const PAGE_TEMPLATES_PAGE_DESIGN_PARTIALS_QUERY = gql`
  query GetPageDesignPartials($pageDesignId: ID!) {
    item(where: { itemId: $pageDesignId }) {
      field(name: "PartialDesigns") {
        value
      }
    }
  }
`;

export const PAGE_TEMPLATES_TENANT_TEMPLATES_QUERY = gql`
  query GetTenantTemplates(
    $siteName: String!
    $includeTemplateAccessField: Boolean!
    $includeStandardValuesItem: Boolean!
  ) {
    tenantTemplates(where: { siteName: $siteName }) {
      template {
        templateId(format: D)
        name
        standardValuesItem(language: "en") @include(if: $includeStandardValuesItem) {
          itemId(format: D)
          insertOptions {
            templateId(format: D)
            name
          }
          access {
            canCreate
            canRename
            canDelete
            canWrite
            canDuplicate
          }
        }
        access @include(if: $includeTemplateAccessField) {
          canCreate
          canRename
          canDelete
          canWrite
          canDuplicate
        }
      }
      pageDesign {
        access {
          canCreate
          canRename
          canDelete
          canWrite
          canDuplicate
        }
        path
        itemId(format: D)
        name
        displayName
        hasChildren
        thumbnailUrl
        hasPresentation
        createdAt: field(name: "__Created") {
          value
        }
        updatedAt: field(name: "__Updated") {
          value
        }
        template {
          baseTemplates {
            nodes {
              templateId(format: D)
            }
          }
        }
      }
    }
  }
`;

export const GET_ITEM_DETAILS_QUERY = gql`
  query GetItemDetails($itemId: ID!, $language: String) {
    item(where: { itemId: $itemId, language: $language }) {
      access {
        canCreate
        canRename
        canDelete
        canWrite
        canDuplicate
      }
      path
      itemId(format: D)
      name
      displayName
      hasChildren
      thumbnailUrl
      hasPresentation
      createdAt: field(name: "__Created") {
        value
      }
      updatedAt: field(name: "__Updated") {
        value
      }
      template {
        templateId
        name
        baseTemplates {
          nodes {
            templateId(format: D)
          }
        }
      }
      parent {
        itemId(format: D)
      }
      pageDesignId: field(name: "Page Design") {
        value
      }
    }
  }
`;

export const GET_MOVE_TO_PERMISSIONS_QUERY = gql`
  query GetMoveToPermissions($itemId: ID!, $language: String, $destinationId: ID!) {
    item(where: { itemId: $itemId, language: $language }) {
      access {
        canMoveTo(destinationId: $destinationId)
      }
    }
  }
`;

export const PAGE_TEMPLATES_CONFIGURE_PAGE_DESIGNS_MUTATION = gql`
  mutation ConfigurePageDesigns($input: ConfigurePageDesignsInput!) {
    configurePageDesigns(input: $input)
  }
`;

export const ASSIGN_PAGE_DESIGN_PARTIALS_MUTATION = gql`
  mutation AssignPageDesignPartials($input: UpdateItemInput!) {
    updateItem(input: $input) {
      item {
        itemId(format: D)
        name
        displayName
        field(name: "PartialDesigns") {
          value
        }
      }
    }
  }
`;

export const ASSIGN_PAGE_DESIGN_MUTATION = gql`
  mutation AssignPageDesign($input: UpdateItemInput!) {
    updateItem(input: $input) {
      item {
        itemId(format: D)
        name
        displayName
        field(name: "Page Design") {
          value
        }
      }
    }
  }
`;

export const CREATE_ITEM_MUTATION = gql`
  mutation CreateItem($input: CreateItemInput!) {
    createItem(input: $input) {
      item {
        access {
          canCreate
          canRename
          canDelete
          canWrite
          canDuplicate
        }
        path
        itemId(format: D)
        name
        version
        displayName
        hasChildren
        thumbnailUrl
        hasPresentation
        createdAt: field(name: "__Created") {
          value
        }
        updatedAt: field(name: "__Updated") {
          value
        }
        template {
          baseTemplates {
            nodes {
              templateId(format: D)
            }
          }
        }
        insertOptions {
          templateId
          baseTemplates {
            nodes {
              templateId
            }
          }
        }
      }
    }
  }
`;

export const COPY_ITEM_MUTATION = gql`
  mutation CopyItem($input: CopyItemInput!, $isTemplate: Boolean!) {
    copyItem(input: $input) {
      item {
        access {
          canCreate
          canRename
          canDelete
          canWrite
          canDuplicate
        }
        path
        itemId(format: D)
        name
        displayName
        hasChildren
        thumbnailUrl
        hasPresentation
        createdAt: field(name: "__Created") {
          value
        }
        updatedAt: field(name: "__Updated") {
          value
        }
        template {
          baseTemplates {
            nodes {
              templateId(format: D)
            }
          }
        }
        insertOptions {
          templateId
          baseTemplates {
            nodes {
              templateId
            }
          }
        }
        standardValueItemId: field(name: "__Standard values") @include(if: $isTemplate) {
          value
        }
      }
    }
  }
`;

export const MOVE_ITEM_MUTATION = gql`
  mutation MoveItem($input: MoveItemInput!) {
    moveItem(input: $input) {
      item {
        access {
          canCreate
          canRename
          canDelete
          canWrite
          canDuplicate
        }
        path
        itemId(format: D)
        name
        displayName
        hasChildren
        thumbnailUrl
        hasPresentation
        createdAt: field(name: "__Created") {
          value
        }
        updatedAt: field(name: "__Updated") {
          value
        }
        template {
          baseTemplates {
            nodes {
              templateId(format: D)
            }
          }
        }
        insertOptions {
          templateId
          baseTemplates {
            nodes {
              templateId
            }
          }
        }
      }
    }
  }
`;

export const RENAME_ITEM_MUTATION = gql`
  mutation RenameItem($input: RenameItemInput!) {
    renameItem(input: $input) {
      item {
        access {
          canCreate
          canRename
          canDelete
          canWrite
          canDuplicate
        }
        path
        itemId(format: D)
        name
        displayName
        hasChildren
        thumbnailUrl
        hasPresentation
        createdAt: field(name: "__Created") {
          value
        }
        updatedAt: field(name: "__Updated") {
          value
        }
        template {
          baseTemplates {
            nodes {
              templateId(format: D)
            }
          }
        }
        insertOptions {
          templateId
          baseTemplates {
            nodes {
              templateId
            }
          }
        }
      }
    }
  }
`;

export const DELETE_ITEM_MUTATION = gql`
  mutation DeleteItem($input: DeleteItemInput!) {
    deleteItem(input: $input) {
      successful
    }
  }
`;

export const UPDATE_ITEM_INSERT_OPTIONS_MUTATION = gql`
  mutation UpdateItemInsertOptions($input: UpdateItemInput!) {
    updateItem(input: $input) {
      item {
        itemId(format: D)
        name
        displayName
        field(name: "__Masters") {
          value
        }
      }
    }
  }
`;

export const TEMPLATES_STANDARD_VALUES_MUTATION = (templateIds: string[]) => {
  const mutation = templateIds
    .map(
      (templateId, index) => `
        template${index + 1}:
        updateItemTemplate(input: { templateId: "${templateId}" , createStandardValuesItem: true }) {
          itemTemplate {
            templateId(format: D)
            standardValuesItem(language: "en") {
              itemId(format: D)
              insertOptions {
                name
                templateId(format: D)
              }
            }
          }
        }
      `,
    )
    .join('\n');

  return gql`
  mutation GetTemplatesStandardValues {
    ${mutation}
  }
`;
};

export const UPDATE_STANDARD_VALUES_INSERT_OPTIONS_MUTATION = (insertOptionsUpdates: InsertOptionsUpdateInput[]) => {
  const mutation = insertOptionsUpdates
    .map(
      (update, index) => `
        item${index + 1}: updateItem(input: { itemId:"${update.itemId}", fields:[{name:"__Masters", value:"${
        update.insertOptions
      }"}]}) {
          item {
            itemId(format: D)
            insertOptions{
              name
              templateId(format: D)
            }
          }
        }
        `,
    )
    .join('\n');

  return gql`
    mutation UpdateStandardValuesInsertOptions {
      ${mutation}
    }
  `;
};

@Injectable({ providedIn: 'root' })
export class PageTemplatesDalService {
  constructor(private readonly apollo: Apollo) {}

  getTenantPageTemplates(
    siteName: string,
    includeTemplateAccessField: boolean,
    includeStandardValuesItem: boolean,
  ): Observable<TenantPageTemplateResponse[]> {
    return this.apollo
      .use('global')
      .query<{
        tenantTemplates: TenantPageTemplateResponse[];
      }>({
        query: PAGE_TEMPLATES_TENANT_TEMPLATES_QUERY,
        fetchPolicy: 'no-cache',
        variables: {
          siteName,
          includeTemplateAccessField,
          includeStandardValuesItem,
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) =>
          data?.tenantTemplates.map((tenantTemplates: TenantPageTemplateResponse) => ({
            template: tenantTemplates.template,
            pageDesign: tenantTemplates.pageDesign,
          })),
        ),
      );
  }

  getPageDesignsRoots(siteName: string, versionLanguage: string): Observable<PageDesignRootResponse[]> {
    return this.apollo
      .use('global')
      .query<{
        pageDesignsRoots: PageDesignRootResponse[];
      }>({
        query: PAGE_TEMPLATES_PAGE_DESIGNS_ROOTS_WITH_CHILDREN_QUERY,
        fetchPolicy: 'no-cache',
        variables: {
          siteName,
          versionLanguage,
          includeTemplateIDs: [PAGE_DESIGN_TEMPLATE_ID, PAGE_DESIGN_FOLDER_TEMPLATE_ID],
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) =>
          data?.pageDesignsRoots.map((pageDesignsRoots: PageDesignRootResponse) => ({
            root: pageDesignsRoots.root,
            siteName: pageDesignsRoots.siteName,
          })),
        ),
      );
  }

  getPartialDesignsRoots(siteName: string, versionLanguage: string): Observable<PartialDesignRootResponse[]> {
    return this.apollo
      .use('global')
      .query<{
        partialDesignsRoots: PartialDesignRootResponse[];
      }>({
        query: PAGE_TEMPLATES_PARTIAL_DESIGNS_ROOTS_WITH_CHILDREN_QUERY,
        fetchPolicy: 'no-cache',
        variables: {
          siteName,
          versionLanguage,
          includeTemplateIDs: [PARTIAL_DESIGN_FOLDER_TEMPLATE_ID, PARTIAL_DESIGN_TEMPLATE_ID],
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) =>
          data?.partialDesignsRoots.map((partialDesignRoot: PartialDesignRootResponse) => ({
            root: partialDesignRoot.root,
            siteName: partialDesignRoot.siteName,
          })),
        ),
      );
  }

  getPageBranchesRoots(siteName: string, versionLanguage: string): Observable<PageBranchesRootResponse[]> {
    return this.apollo
      .use('global')
      .query<{
        pageBranchesRoots: PageBranchesRootResponse[];
      }>({
        query: PAGE_TEMPLATES_PAGE_BRANCHES_ROOTS_WITH_CHILDREN_QUERY,
        fetchPolicy: 'no-cache',
        variables: {
          siteName,
          versionLanguage,
          includeTemplateIDs: [PAGE_BRANCHES_FOLDER_TEMPLATE_ID, PAGE_BRANCH_TEMPLATE_ID],
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) =>
          data?.pageBranchesRoots.map((pageBranchesRoot: PageBranchesRootResponse) => ({
            root: pageBranchesRoot.root,
            siteName: pageBranchesRoot.siteName,
          })),
        ),
      );
  }

  // Partial design roots without children
  getPartialDesignsRootsWithoutChildren(siteName: string): Observable<DesignRoots[]> {
    return this.apollo
      .use('global')
      .query<{
        partialDesignsRoots: DesignRoots[];
      }>({
        query: PAGE_TEMPLATES_PARTIAL_DESIGNS_ROOTS_QUERY,
        fetchPolicy: 'no-cache',
        variables: {
          siteName,
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) =>
          data?.partialDesignsRoots.map((partialDesignRoot: DesignRoots) => ({
            root: partialDesignRoot.root,
            siteName: partialDesignRoot.siteName,
          })),
        ),
      );
  }

  // Page design roots without children
  getPageDesignsRootsWithoutChildren(siteName: string): Observable<DesignRoots[]> {
    return this.apollo
      .use('global')
      .query<{
        pageDesignsRoots: DesignRoots[];
      }>({
        query: PAGE_TEMPLATES_PAGE_DESIGNS_ROOTS_QUERY,
        fetchPolicy: 'no-cache',
        variables: {
          siteName,
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) =>
          data?.pageDesignsRoots.map((pageDesignsRoots: DesignRoots) => ({
            root: pageDesignsRoots.root,
            siteName: pageDesignsRoots.siteName,
          })),
        ),
      );
  }

  // Page branches roots without children
  getPageBranchesRootsWithoutChildren(siteName: string): Observable<DesignRoots[]> {
    return this.apollo
      .use('global')
      .query<{
        pageBranchesRoots: DesignRoots[];
      }>({
        query: PAGE_TEMPLATES_PAGE_BRANCHES_ROOTS_QUERY,
        fetchPolicy: 'no-cache',
        variables: {
          siteName,
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) =>
          data?.pageBranchesRoots.map((pageBranchesRoot: DesignRoots) => ({
            root: pageBranchesRoot.root,
            siteName: pageBranchesRoot.siteName,
          })),
        ),
      );
  }

  getPageDesignFlatList(siteName: string): Observable<PageDesignResponse[]> {
    return this.apollo
      .use('global')
      .query<{
        pageDesigns: PageDesignResponse[];
      }>({
        query: PAGE_TEMPLATES_PAGE_DESIGNS_QUERY,
        fetchPolicy: 'no-cache',
        variables: {
          siteName,
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) =>
          data?.pageDesigns.map((pageDesign: PageDesignResponse) => ({
            pageDesign: pageDesign.pageDesign,
            siteName: pageDesign.siteName,
          })),
        ),
      );
  }

  getPartialDesignFlatList(siteName: string): Observable<PartialDesignResponse[]> {
    return this.apollo
      .use('global')
      .query<{
        partialDesigns: PartialDesignResponse[];
      }>({
        query: PAGE_TEMPLATES_PARTIALS_DESIGNS_QUERY,
        fetchPolicy: 'no-cache',
        variables: {
          siteName,
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) =>
          data?.partialDesigns.map((partialDesignResponse: PartialDesignResponse) => ({
            partialDesign: partialDesignResponse.partialDesign,
            siteName: partialDesignResponse.siteName,
          })),
        ),
      );
  }

  getPageDesignPartials(pageDesignId: string): Observable<string[]> {
    return this.apollo
      .use('global')
      .query<{ item: PageDesignPartialsOutput }>({
        query: PAGE_TEMPLATES_PAGE_DESIGN_PARTIALS_QUERY,
        fetchPolicy: 'no-cache',
        variables: {
          pageDesignId,
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) =>
          data.item.field.value
            .split('|')
            .filter((value) => value)
            .map((value) => normalizeGuid(value)),
        ),
      );
  }

  getTemplatesUsageCount(templateId: string): Observable<number> {
    return this.apollo
      .use('global')
      .query<{
        search: SearchResult;
      }>({
        query: PAGE_TEMPLATES_USAGE_COUNT_QUERY,
        fetchPolicy: 'no-cache',
        variables: {
          includeFieldValue: templateId,
          excludeFieldValue: '__Standard Values',
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => data.search.totalCount),
      );
  }

  getItemChildrenWithAncestors(
    itemId: string,
    language: string,
    includeTemplateIDs?: string[],
    includeSubChildren = false,
  ): Observable<ItemResponse> {
    return this.apollo
      .use('global')
      .query<{ item: ItemResponse }>({
        query: PAGE_TEMPLATES_ITEM_CHILDREN_QUERY,
        fetchPolicy: 'no-cache',
        variables: {
          itemId,
          versionLanguage: language,
          includeTemplateIDs,
          includeSubChildren,
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => data.item),
      );
  }

  getItemDetails(itemId: string, language: string): Observable<ItemResponse> {
    return this.apollo
      .use('global')
      .query<{
        item: ItemResponse;
      }>({
        query: GET_ITEM_DETAILS_QUERY,
        fetchPolicy: 'no-cache',
        variables: {
          itemId,
          language,
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => data.item),
      );
  }

  getMoveToPermissions(itemId: string, language: string, destinationId: string): Observable<boolean> {
    return this.apollo
      .use('global')
      .query<{
        item: ItemResponse;
      }>({
        query: GET_MOVE_TO_PERMISSIONS_QUERY,
        fetchPolicy: 'no-cache',
        variables: {
          itemId,
          language,
          destinationId,
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => !!data.item.access.canMoveTo),
      );
  }

  createTemplatesStandardValuesItems(templateIds: string[]): Observable<ItemTemplateBulkOperationOutput> {
    return this.apollo
      .use('global')
      .mutate<{ [key: string]: { itemTemplate: ItemTemplate } }>({
        mutation: TEMPLATES_STANDARD_VALUES_MUTATION(templateIds),
        fetchPolicy: 'no-cache',
      })
      .pipe(
        map(({ data, errors }) => ({
          successful: errors ? false : true,
          errorMessage: errors ? errors[0].message : null,
          templates: data
            ? Object.values(data)
                .map((d) => d.itemTemplate)
                .filter((item) => item !== null)
            : null,
        })),
        catchError(extractGqlErrorCode),
      );
  }

  updateStandardValuesInsertOptions(
    insertOptionsUpdates: InsertOptionsUpdateInput[],
  ): Observable<ItemBulkOperationOutputResponse> {
    return this.apollo
      .use('global')
      .mutate<{ [key: string]: { item: ItemResponse } }>({
        mutation: UPDATE_STANDARD_VALUES_INSERT_OPTIONS_MUTATION(insertOptionsUpdates),
        fetchPolicy: 'no-cache',
      })
      .pipe(
        map(({ data, errors }) => ({
          successful: errors ? false : true,
          errorMessage: errors ? errors[0].message : null,
          items: data
            ? Object.values(data)
                .map((d) => d.item)
                .filter((item) => item !== null)
            : null,
        })),
        catchError(extractGqlErrorCode),
      );
  }

  createItem(createItemInput: CreateItemInput): Observable<ItemOperationOutputResponse> {
    return this.apollo
      .use('global')
      .mutate<{ createItem: ItemOperationOutputResponse }>({
        mutation: CREATE_ITEM_MUTATION,
        variables: {
          input: {
            name: createItemInput.name,
            parent: createItemInput.parent,
            templateId: createItemInput.templateId,
            language: createItemInput.language,
          },
        },
      })
      .pipe(
        map(({ data }) => ({ successful: true, errorMessage: null, item: data ? data.createItem.item : null })),
        catchError((err) => of({ successful: false, errorMessage: err.graphQLErrors[0].message, item: null })),
      );
  }

  copyItem(copyItemInput: CopyItemInput, isTemplate: boolean): Observable<ItemOperationOutputResponse> {
    return this.apollo
      .use('global')
      .mutate<{ copyItem: ItemOperationOutputResponse }>({
        mutation: COPY_ITEM_MUTATION,
        variables: {
          input: {
            copyItemName: copyItemInput.copyItemName,
            deepCopy: true,
            itemId: copyItemInput.itemId,
            targetParentId: copyItemInput.targetParentId,
          },
          isTemplate,
        },
      })
      .pipe(
        map(({ data }) => ({ successful: true, errorMessage: null, item: data ? data.copyItem.item : null })),
        catchError((err) => of({ successful: false, errorMessage: err.graphQLErrors[0].message, item: null })),
      );
  }

  moveItem(moveItemInput: MoveItemInput): Observable<ItemOperationOutputResponse> {
    return this.apollo
      .use('global')
      .mutate<{ moveItem: ItemOperationOutputResponse }>({
        mutation: MOVE_ITEM_MUTATION,
        variables: {
          input: {
            itemId: moveItemInput.itemId,
            sortOrder: 1,
            targetParentId: moveItemInput.targetParentId,
          },
        },
      })
      .pipe(
        map(({ data }) => ({ successful: true, errorMessage: null, item: data ? data.moveItem.item : null })),
        catchError((err) => of({ successful: false, errorMessage: err.graphQLErrors[0].message, item: null })),
      );
  }

  renameItem(renameItemInput: RenameItemInput): Observable<ItemOperationOutputResponse> {
    return this.apollo
      .use('global')
      .mutate<{ renameItem: ItemOperationOutputResponse }>({
        mutation: RENAME_ITEM_MUTATION,
        variables: {
          input: {
            itemId: renameItemInput.itemId,
            newName: renameItemInput.newName,
          },
        },
      })
      .pipe(
        map(({ data }) => ({ successful: true, errorMessage: null, item: data ? data.renameItem.item : null })),
        catchError((err) => of({ successful: false, errorMessage: err.graphQLErrors[0].message, item: null })),
      );
  }

  deleteItem(deleteItemInput: DeleteItemInput): Observable<ItemOperationOutputResponse> {
    return this.apollo
      .use('global')
      .mutate<{ deleteItem: ItemOperationOutputResponse }>({
        mutation: DELETE_ITEM_MUTATION,
        variables: {
          input: {
            itemId: deleteItemInput.itemId,
            permanently: deleteItemInput.permanently,
          },
        },
      })
      .pipe(
        map(({ data }) => ({
          successful: !!data?.deleteItem.successful,
          errorMessage: null,
          item: null,
        })),
        catchError((err) => of({ successful: false, errorMessage: err.graphQLErrors[0].message, item: null })),
      );
  }

  configurePageDesign(configurePageDesignsInput: ConfigurePageDesignsInput): Observable<ConfigurePageDesignsOutput> {
    return this.apollo
      .use('global')
      .mutate<{ configurePageDesigns: ConfigurePageDesignsOutput }>({
        mutation: PAGE_TEMPLATES_CONFIGURE_PAGE_DESIGNS_MUTATION,
        variables: {
          input: {
            mapping: configurePageDesignsInput.mapping,
            siteName: configurePageDesignsInput.siteName,
          },
        },
      })
      .pipe(
        map(() => ({ success: true, errorMessage: null })),
        catchError((err) => of({ success: false, errorMessage: err.graphQLErrors[0].message })),
      );
  }

  assignPageDesignPartials(
    assignPageDesignPartialsInput: AssignPageDesignPartialsInput,
  ): Observable<AssignPageDesignPartialsOutput> {
    return this.apollo
      .use('global')
      .mutate<{ pageDesignPartials: AssignPageDesignPartialsOutput }>({
        mutation: ASSIGN_PAGE_DESIGN_PARTIALS_MUTATION,
        variables: {
          input: {
            itemId: assignPageDesignPartialsInput.pageDesignId,
            fields: [{ name: 'PartialDesigns', value: assignPageDesignPartialsInput.partialDesignIds.join('|') }],
          },
        },
      })
      .pipe(
        map(() => ({ success: true, errorMessage: null })),
        catchError((err) => of({ success: false, errorMessage: err.graphQLErrors[0].message })),
      );
  }

  assignPageDesign(assignPageDesignInput: AssignPageDesignInput): Observable<AssignPageDesignOutput> {
    return this.apollo
      .use('global')
      .mutate<{ pageDesign: AssignPageDesignOutput }>({
        mutation: ASSIGN_PAGE_DESIGN_MUTATION,
        variables: {
          input: {
            itemId: assignPageDesignInput.itemId,
            fields: [{ name: 'Page Design', value: assignPageDesignInput.pageDesignId }],
          },
        },
      })
      .pipe(
        map(() => ({ success: true, errorMessage: null })),
        catchError((err) => of({ success: false, errorMessage: err.graphQLErrors[0].message })),
      );
  }

  updatePageInsertOptions(insertOptionsUpdateInput: InsertOptionsUpdateInput): Observable<ItemOperationOutputResponse> {
    return this.apollo
      .use('global')
      .mutate<{ updateItem: ItemOperationOutputResponse }>({
        mutation: UPDATE_ITEM_INSERT_OPTIONS_MUTATION,
        variables: {
          input: {
            itemId: insertOptionsUpdateInput.itemId,
            fields: [{ name: '__Masters', value: insertOptionsUpdateInput.insertOptions }],
          },
        },
      })
      .pipe(
        map(({ data }) => ({ successful: true, errorMessage: null, item: data ? data.updateItem.item : null })),
        catchError((err) => of({ successful: false, errorMessage: err.graphQLErrors[0].message, item: null })),
      );
  }
}
