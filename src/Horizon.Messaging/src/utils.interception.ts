/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ConnectionEndpoint } from './connection/connection-endpoint';

export function makeCallInterceptor(channelName: string, endpoint: ConnectionEndpoint): any {
  return new Proxy(
    {},
    {
      get: (_target: {}, property: PropertyKey) => {
        return (...args: any[]) => endpoint.performRpcCall(channelName, property.toString(), args);
      },
    },
  );
}
