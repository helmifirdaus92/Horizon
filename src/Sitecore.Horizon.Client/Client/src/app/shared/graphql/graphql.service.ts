/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';

import { HttpLink } from 'apollo-angular/http';

import { InMemoryCache, PossibleTypesMap } from '@apollo/client/cache';
import { ConfigurationService } from '../configuration/configuration.service';

// EXCLUDED FROM TEST COVERAGE. See angular.json. Cannot be tested.
@Injectable({ providedIn: 'root' })
export class GraphQlService {
  constructor(
    private apollo: Apollo,
    private httpLink: HttpLink,
  ) {}

  initApollo() {
    this.createHorizonApolloClient();
    this.createGlobalApolloClient();
  }

  createGlobalApolloClient() {
    const httpLink = this.httpLink.create({
      uri: ConfigurationService.xmCloudTenant?.url + 'sitecore/api/authoring/graphql/v1',
    });

    this.apollo.createNamed('global', {
      link: httpLink,
      cache: new InMemoryCache({
        addTypename: true,
      }),
      ssrForceFetchDelay: 100,
    });
  }

  private createHorizonApolloClient(): void {
    const httpEndpointUrl = ConfigurationService.xmCloudTenant?.gqlEndpointUrl;

    const fragmentTypes: {
      __schema: {
        types: Array<{
          kind: string;
          name: string;
          possibleTypes: null | Array<{ name: string }>;
        }>;
      };
      // eslint-disable-next-line @typescript-eslint/no-require-imports
    } = require('../../../../schema/horizon.schema.server.fragment-types.json');
    const possibleTypes: PossibleTypesMap = {};

    fragmentTypes.__schema.types.forEach((supertype) => {
      if (supertype.possibleTypes) {
        possibleTypes[supertype.name] = supertype.possibleTypes.map((subtype) => subtype.name);
      }
    });

    const cache = new InMemoryCache({
      possibleTypes,
      addTypename: true,
    });

    const httpLink = this.httpLink.create({
      uri: httpEndpointUrl,
    });

    this.apollo.createDefault({
      link: httpLink,
      cache,
      ssrForceFetchDelay: 100,
    });
  }
}
