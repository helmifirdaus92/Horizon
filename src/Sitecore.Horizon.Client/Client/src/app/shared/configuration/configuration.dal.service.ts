/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { extractGqlErrorCode } from '../utils/graphql.utils';

interface Configuration {
  additionalPlatformUrls: string[];
  hostVerificationToken: string;
  contentRootItemId: string;
  clientLanguage: string;
  sessionTimeoutSeconds: number;
  integrationVersion: string;
  jssEditingSecret: string;
  personalizeScope: string | undefined;
  globalTagsRepository: string | undefined;
  environmentFeatures: Array<{
    name: string;
    enabled: boolean;
  }>;
}

export const FETCH_CONFIGURATION_QUERY = gql`
  {
    configuration {
      additionalPlatformUrls
      hostVerificationToken
      contentRootItemId
      clientLanguage
      integrationVersion
      sessionTimeoutSeconds
      jssEditingSecret
    }
  }
`;

export const FETCH_TENANT_BASED_SETTINGS_QUERY = gql`
  {
    configuration {
      environmentFeatures {
        name
        enabled
      }
      personalizeScope
    }
  }
`;

export const FETCH_SAME_ORIGIN_RENDERING_CONFIGURATION_QUERY = gql`
  {
    configuration {
      sessionTimeoutSeconds
      jssEditingSecret
    }
  }
`;

export const FETCH_GLOBAL_TAGS_FOLDER_CONFIGURATION_QUERY = gql`
  {
    configuration {
      globalTagsRepository
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class ConfigurationDalService {
  constructor(private readonly apollo: Apollo) {}

  fetchConfiguration(): Observable<Configuration> {
    return this.apollo
      .query<{ configuration: Configuration }>({
        query: FETCH_CONFIGURATION_QUERY,
        fetchPolicy: 'no-cache',
      })
      .pipe(
        map(({ data }) => data.configuration),
        catchError(extractGqlErrorCode),
      );
  }

  fetchTenantConfiguration() {
    return this.apollo
      .query<{ configuration: Pick<Configuration, 'environmentFeatures' | 'personalizeScope'> }>({
        query: FETCH_TENANT_BASED_SETTINGS_QUERY,
        fetchPolicy: 'no-cache',
      })
      .pipe(
        map(({ data }) => data.configuration),
        catchError(extractGqlErrorCode),
      );
  }

  fetchGlobalTagsConfiguration(): Observable<string | undefined> {
    return this.apollo
      .query<{ configuration: Configuration }>({
        query: FETCH_GLOBAL_TAGS_FOLDER_CONFIGURATION_QUERY,
        fetchPolicy: 'no-cache',
      })
      .pipe(
        map(({ data }) => data.configuration.globalTagsRepository),
        catchError(extractGqlErrorCode),
      );
  }

  fetchSameOriginRenderingConfiguration(): Observable<Configuration> {
    return this.apollo
      .query<{ configuration: Configuration }>({
        query: FETCH_SAME_ORIGIN_RENDERING_CONFIGURATION_QUERY,
        fetchPolicy: 'no-cache',
      })
      .pipe(
        map(({ data }) => data.configuration),
        catchError(extractGqlErrorCode),
      );
  }
}
