/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { inject, Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { normalizeGuidCharactersOnly } from 'app/shared/utils/utils';
import gql from 'graphql-tag';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Site, SiteCollection } from '../../site-language/site-language.service';
import { LanguageItemsDalService } from '../language-items.dal.service';

export interface ItemVersions {
  itemId: string;
  versions: {
    version: number;
    language: {
      name: string;
    };
  };
}

export interface ItemVersionsPayload {
  itemId: string;
  displayName: {
    value: string;
  };
  versions?: [{ language: { name: string }; version: number }];
  children: {
    nodes: [
      {
        children: {
          nodes: [
            {
              itemId: string;
            },
          ];
        };
      },
    ];
  };
}

export interface SupportedLanguage {
  itemId: string;
  name: string;
}

export interface SolutionSitePayload {
  id: string;
  name: string;
  siteCollection: {
    id: string;
    name: string;
  };
  language: {
    name: string;
  };
  settings: {
    supportedLanguages: {
      value: string;
    };
  };
  posMappings?: [
    {
      language: string;
      name: string;
    },
  ];
  rootItem: ItemVersionsPayload;
  startItem: ItemVersionsPayload;
  renderingHost?: {
    appName: string;
    layoutServiceConfiguration: string;
    serverSideRenderingEngineEndpointUrl: string;
    serverSideRenderingEngineApplicationUrl: string;
  };
  properties: Array<{ key: string; value: string }>;
}

export interface SolutionSiteCollectionPayload {
  id: string;
  name: string;
  displayName: string;
  collectionName: string;
}

export const GET_SITES_QUERY = gql`
  query GetSites($includeNonSxaSites: Boolean!) {
    solutionSites(input: { includeNonSxaSites: $includeNonSxaSites }) {
      id(format: D)
      name
      siteCollection {
        id(format: D)
        name
      }
      language {
        name
      }
      rootItem {
        itemId(format: D)
        displayName: field(name: "{85A7501A-86D9-4243-9075-0B727C3A6DB4}") {
          value
        }
        children(includeTemplateIDs: "{A29D272E-9D48-453C-9E9D-B47585FA7F20}") {
          nodes {
            children(includeTemplateIDs: "{25A6B824-672F-4C15-9B98-0B231C80F81C}") {
              nodes {
                itemId(format: D)
              }
            }
          }
        }
      }
      startItem {
        itemId
      }
      settings {
        supportedLanguages: field(name: "{d0ce707c-342f-4c02-ac0a-edb21346dde4}") {
          value
        }
      }
      posMappings {
        language
        name
      }
      properties {
        key
        value
      }
      renderingHost {
        appName
        layoutServiceConfiguration
        serverSideRenderingEngineEndpointUrl
        serverSideRenderingEngineApplicationUrl
      }
    }
  }
`;

export const GET_SITES_COLLECTION_QUERY = gql`
  query SiteCollections {
    siteCollections {
      id(format: D)
      displayName
      name
      description
    }
  }
`;

export const GET_START_ITEM_ID_QUERY_BY_NAME = gql`
  query GetStartItemId($name: String, $includeNonSxaSites: Boolean!) {
    solutionSites(input: { siteName: $name, includeNonSxaSites: $includeNonSxaSites }) {
      id(format: D)
      startItem {
        itemId
        versions(allLanguages: true) {
          language {
            name
          }
          version
        }
      }
    }
  }
`;

export const GET_SITE_QUERY_BY_NAME = gql`
  query GetSite($name: String, $includeNonSxaSites: Boolean!) {
    solutionSites(input: { siteName: $name, includeNonSxaSites: $includeNonSxaSites }) {
      id(format: D)
      name
      rootItem {
        itemId
        displayName: field(name: "{85A7501A-86D9-4243-9075-0B727C3A6DB4}") {
          value
        }
        versions(allLanguages: true) {
          language {
            name
          }
          version
        }
      }
    }
  }
`;

@Injectable({ providedIn: 'root' })
export abstract class SiteDalService {
  abstract getSites(): Observable<Site[]>;
  abstract getCollections(): Observable<SiteCollection[]>;
  abstract getStartItem(
    siteId: string,
    siteName: string,
    language: string,
  ): Observable<{ id: string; version: number }>;
  abstract getDefaultSite(siteId?: string, siteName?: string, language?: string): Observable<Pick<Site, 'id' | 'name'>>;
}

@Injectable()
export class SolutionSiteDalService extends SiteDalService {
  private readonly apollo = inject(Apollo);
  private readonly languageItemsDalService = inject(LanguageItemsDalService);

  constructor() {
    super();
  }

  getCollections(): Observable<SiteCollection[]> {
    return this.apollo
      .use('global')
      .query<{ siteCollections: SolutionSiteCollectionPayload[] }>({
        query: GET_SITES_COLLECTION_QUERY,
      })
      .pipe(
        map(({ data }) => {
          return data.siteCollections.map((siteCollection) => ({
            id: siteCollection.id,
            name: siteCollection.name,
            displayName: siteCollection.displayName,
          }));
        }),
      );
  }

  /**
   * Get the list of configured sites.
   */
  getSites(): Observable<Site[]> {
    return this.languageItemsDalService.getSupportedLanguages().pipe(
      catchError((error) => {
        // Do not block site fetching if loading supported language items fails.
        // If it fails, it will fallback to showing all languages.
        console.error('Error fetching supported languages:', error);
        return of([]);
      }),
      switchMap((languages) => {
        return this.apollo
          .use('global')
          .query<{
            solutionSites: SolutionSitePayload[];
          }>({
            query: GET_SITES_QUERY,
            variables: { includeNonSxaSites: true },
          })
          .pipe(
            map(({ data }) => {
              return data.solutionSites.map((solutionSite) => ({
                id: solutionSite.rootItem.itemId,
                hostId: solutionSite.id,
                collectionId: solutionSite.siteCollection?.id,
                name: solutionSite.name,
                displayName: solutionSite?.rootItem?.displayName?.value || solutionSite.name,
                language: solutionSite.language.name,
                appName: solutionSite.renderingHost?.appName,
                layoutServiceConfig: solutionSite.renderingHost?.layoutServiceConfiguration,
                renderingEngineEndpointUrl: solutionSite.renderingHost?.serverSideRenderingEngineEndpointUrl,
                renderingEngineApplicationUrl: solutionSite.renderingHost?.serverSideRenderingEngineApplicationUrl,
                pointOfSale: solutionSite.posMappings,
                startItemId: solutionSite.startItem.itemId,
                supportedLanguages: this.getSupportedLanguageNames(solutionSite, languages),
                properties: {
                  tagsFolderId: solutionSite.rootItem.children?.nodes[0]?.children.nodes[0]?.itemId,
                  isSxaSite:
                    solutionSite.properties
                      .find((prop: { key: string; value: string }) => prop.key === 'IsSxaSite')
                      ?.value.toLowerCase() === 'true',
                  isLocalDatasourcesEnabled: true,
                },
              }));
            }),
          );
      }),
    );
  }

  getStartItem(_siteId: string, siteName: string, language: string): Observable<{ id: string; version: number }> {
    return this.apollo
      .use('global')
      .query<{ solutionSites: [Pick<SolutionSitePayload, 'startItem'>] }>({
        query: GET_START_ITEM_ID_QUERY_BY_NAME,
        variables: { name: siteName, includeNonSxaSites: true },
      })
      .pipe(map(({ data }) => this.getLatestVersionInLanguage(language, data.solutionSites[0].startItem)));
  }

  /**
   * Get the default site context from gql.
   * If site and/or language is provided then it will try to get the site context for that specific site/language pair.
   */
  getDefaultSite(_siteId?: string, siteName?: string): Observable<Pick<Site, 'id' | 'name'>> {
    return this.apollo
      .use('global')
      .query<{ solutionSites: SolutionSitePayload[] }>({
        query: GET_SITE_QUERY_BY_NAME,
        variables: {
          name: siteName,
          includeNonSxaSites: true,
        },

        // Using 'network-only' to ensure update values from BE.
        fetchPolicy: 'network-only',
      })
      .pipe(
        map(({ data }) => ({
          id: data.solutionSites[0].rootItem.itemId,
          name: data.solutionSites[0].name,
        })),
      );
  }

  /**
   * Gets the latest version that matches provided language.
   * If version not found return 1 to match legacy behavior of Pages backend
   */
  private getLatestVersionInLanguage(language: string | null, itemVersions: ItemVersionsPayload) {
    return {
      id: itemVersions.itemId,
      version:
        itemVersions.versions?.filter((v) => v.language.name === language).sort((a, b) => b.version - a.version)[0]
          ?.version ?? 1,
    };
  }

  private getSupportedLanguageNames(site: SolutionSitePayload, languages: SupportedLanguage[]): string[] {
    const supportedLanguagesValue = site.settings?.supportedLanguages?.value?.trim();
    const languageItemIds = supportedLanguagesValue
      ? supportedLanguagesValue.split('|').filter((id) => id.trim() !== '')
      : [];

    // Return all languages if no specific languages are configured for the site
    if (languageItemIds.length === 0) {
      return languages.map((language) => language.name);
    }

    const normalizedLanguageIds = new Set(languageItemIds.map(normalizeGuidCharactersOnly));

    return languages
      .filter(({ itemId }) => normalizedLanguageIds.has(normalizeGuidCharactersOnly(itemId)))
      .map((language) => language.name);
  }
}
