/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { catchError, firstValueFrom, map, Observable, of } from 'rxjs';
import { extractGqlErrorCode } from '../utils/graphql.utils';
import { Version } from '../utils/version.utils';

export const GET_XM_META_VERSION_QUERY = gql`
  query GetMetaVersion {
    meta {
      xMVersion
    }
  }
`;

export interface MetaVersionResponse {
  xMVersion: string;
}

@Injectable({
  providedIn: 'root',
})
export class XmCloudFeatureCheckerService {
  private readonly xmDefaultBaseVersion = '1.4.0';
  private tenantXmCurrentVersion?: string = undefined;

  constructor(private readonly apollo: Apollo) {}

  async isPageDesignEditingFeatureAvailable(): Promise<boolean> {
    return this.isFeatureAvailable('1.4.264');
  }

  async isTemplateAccessFieldAvailable(): Promise<boolean> {
    return this.isFeatureAvailable('1.4.623');
  }

  async isTemplateStandardValuesAvailable(): Promise<boolean> {
    return this.isFeatureAvailable('1.5.125');
  }

  async isErrorSeveritySupported(): Promise<boolean> {
    return this.isFeatureAvailable('1.6.712');
  }

  private async isFeatureAvailable(requiredVersion: string): Promise<boolean> {
    const version = new Version(await this.getCurrentXMVersion());
    const requiredFeatureVersion = new Version(requiredVersion);
    return version.isEqualOrGreaterThan(requiredFeatureVersion);
  }

  async getCurrentXMVersion(): Promise<string> {
    if (this.tenantXmCurrentVersion) {
      return this.tenantXmCurrentVersion;
    }

    this.tenantXmCurrentVersion = await firstValueFrom(
      this.fetchCurrentXMVersion().pipe(
        catchError((error) => {
          console.warn('Unable to get XM Cloud version' + error);
          return of(this.xmDefaultBaseVersion);
        }),
        map((response) => response),
      ),
    );
    return this.tenantXmCurrentVersion;
  }

  private fetchCurrentXMVersion(): Observable<string> {
    return this.apollo
      .use('global')
      .query<{ meta: MetaVersionResponse }>({
        query: GET_XM_META_VERSION_QUERY,
        fetchPolicy: 'no-cache',
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => data.meta.xMVersion),
      );
  }
}
