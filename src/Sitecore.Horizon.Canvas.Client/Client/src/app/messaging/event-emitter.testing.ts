/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { EventSource } from './event-emitter';

export function spyOnEvent<TArg = void>(eventSource: EventSource<TArg>): jasmine.Spy<Parameters<EventSource<TArg>['on']>[0]> {
  const handler = jasmine.createSpy();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  eventSource.on(handler as any);
  return handler;
}
