/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NgZone } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import { SchemaLink } from 'apollo-link-schema';
import { GraphQLResolveInfo } from 'graphql';
import { addMockFunctionsToSchema, makeExecutableSchema } from 'graphql-tools';

declare const Zone: { current: NgZone };

export function createApolloMock(mocks?: { [key: string]: (...args: any[]) => any }) {
  const typeDefs = require('raw-loader!../../../schema/horizon.schema.server.graphqls').default;
  const fragmentTypes = require('../../../schema/horizon.schema.server.fragment-types.json');
  const resolvers = {
    Content: {
      __resolveType(data: any, _context: any, info: GraphQLResolveInfo) {
        return info.schema.getType(data.__typename);
      },
    },
    InsightData: {
      __resolveType(data: any, _context: any, info: GraphQLResolveInfo) {
        return info.schema.getType(data.__typename);
      },
    },
    InsertOption: {
      __resolveType(data: any, _context: any, info: GraphQLResolveInfo) {
        return info.schema.getType(data.__typename);
      },
    },
  };

  const defaultMocks = {
    Date: () => new Date().toISOString(),
    DateTime: () => new Date().toISOString(),
  };

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const cache = new InMemoryCache({
    fragmentMatcher: new IntrospectionFragmentMatcher({
      introspectionQueryResultData: fragmentTypes,
    }),
  });
  addMockFunctionsToSchema({ schema, mocks: { ...defaultMocks, ...mocks } });

  return new Apollo(Zone.current, {
    link: new SchemaLink({ schema }),
    cache,
  });
}
