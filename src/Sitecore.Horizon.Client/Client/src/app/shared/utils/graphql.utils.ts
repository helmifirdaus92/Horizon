/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { GraphQLError } from 'graphql';
import { throwError } from 'rxjs';

interface HorizonGraphQLError extends GraphQLError {
  readonly extensions: {
    code: string;
    [key: string]: any;
  };
}

/**
 * It takes the first graphql error (if present) an re-throws its error code, otherwise throw 'UnknownError' code
 * This gets an error as a simple code string
 */
export function extractGqlErrorCode(error: any) {
  const gqlError: HorizonGraphQLError | undefined = error.graphQLErrors && error.graphQLErrors[0];
  return throwError(() => (gqlError && gqlError.extensions ? gqlError.extensions.code : 'UnknownError'));
}
