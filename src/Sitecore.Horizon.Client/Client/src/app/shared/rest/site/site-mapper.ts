/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Site, SiteCollection } from 'app/shared/site-language/site-language.service';
import { SiteCollectionsResponse, SiteResponse } from './site.types';

export const LOCAL_DATASOURCES_ENABLED_KEY = 'XA.Foundation.LocalDatasources.Enabled';

export class SiteMapper {
  public static mapResponseToSite(siteResponse: SiteResponse): Site {
    const host = siteResponse.hosts?.length ? siteResponse.hosts[siteResponse.hosts.length - 1] : undefined;
    if (!host) {
      throw new Error('No host data found in siteResponse.');
    }

    const pointOfSale = Object.entries(host.analyticsIdentifiers || {}).map(([language, name]) => ({
      language,
      name,
    }));

    return {
      id: siteResponse.id,
      hostId: host.id,
      name: host.name,
      displayName: siteResponse.displayName || siteResponse.name,
      language: host.languageSettings?.defaultLanguage,
      appName: host.renderingHost?.appName,
      layoutServiceConfig: host.renderingHost?.layoutServiceConfiguration,
      renderingEngineEndpointUrl: host.renderingHost?.serverSideRenderingEngineEndpointUrl,
      renderingEngineApplicationUrl: host.renderingHost?.serverSideRenderingEngineApplicationUrl,
      pointOfSale,
      startItemId: host.homePageId,
      supportedLanguages: siteResponse.supportedLanguages,
      collectionId: siteResponse.collectionId,
      brandKitId: siteResponse.brandKitId ?? undefined,
      properties: {
        isSxaSite: host.properties?.IsSxaSite === 'true',
        tagsFolderId: siteResponse.properties.tagsFolderId ?? undefined,
        isLocalDatasourcesEnabled:
          LOCAL_DATASOURCES_ENABLED_KEY in siteResponse.properties
            ? siteResponse.properties[LOCAL_DATASOURCES_ENABLED_KEY] === 'true'
            : true,
      },
    };
  }

  public static mapResponseToCollection(collectionResponse: SiteCollectionsResponse): SiteCollection {
    return {
      id: collectionResponse.id,
      name: collectionResponse.name,
      displayName: collectionResponse.displayName,
    };
  }
}
