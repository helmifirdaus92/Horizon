/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { environment } from 'environments/environment.dev';
import { ContextService } from '../client-state/context.service';
import { StaticConfigurationService } from '../configuration/static-configuration.service';
import { ConfigurationMessagingService } from './configuration-messaging.service';
import { MessagingService } from './messaging.service';

describe(ConfigurationMessagingService.name, () => {
  let sut: ConfigurationMessagingService;
  let messagingService: jasmine.SpyObj<MessagingService>;
  let contextService: jasmine.SpyObj<ContextService>;
  let staticConfigurationService: jasmine.SpyObj<StaticConfigurationService>;

  let setRpcServicesImplSpy: jasmine.Spy;

  beforeEach(() => {
    setRpcServicesImplSpy = jasmine.createSpy();
    messagingService = jasmine.createSpyObj<MessagingService>(['getConfigurationChannel']);

    messagingService.getConfigurationChannel.and.callFake((() => {
      return { setRpcServicesImpl: setRpcServicesImplSpy };
    }) as any);

    contextService = jasmine.createSpyObj<ContextService>([], {
      variant: 'variant1',
    });

    staticConfigurationService = jasmine.createSpyObj<StaticConfigurationService>([], {
      environment: 'staging',
    });

    sut = new ConfigurationMessagingService(messagingService, contextService, staticConfigurationService);
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('init', () => {
    it('should set implementation for isLocal method', async () => {
      environment.isLocalXM = true;

      await sut.init();

      const [implementation] = setRpcServicesImplSpy.calls.mostRecent().args;
      expect(await implementation.isLocalXM()).toEqual(true);
    });

    it('should set implementation for getActiveVariant method', async () => {
      await sut.init();

      const [implementation] = setRpcServicesImplSpy.calls.mostRecent().args;
      expect(await implementation.getActiveVariant()).toEqual('variant1');
    });
  });
});
