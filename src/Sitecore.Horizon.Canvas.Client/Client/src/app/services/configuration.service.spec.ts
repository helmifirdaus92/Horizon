/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannel } from '@sitecore/horizon-messaging/dist/testing';
import { ConfigurationChannelDef } from '../messaging/horizon-canvas.contract.defs';
import {
  ConfigurationCanvasEvents,
  ConfigurationCanvasRpcServices,
  ConfigurationHorizonEvents,
  ConfigurationHorizonRpcServices,
} from '../messaging/horizon-canvas.contract.parts';
import { MessagingService } from '../messaging/messaging-service';
import { ConfigurationService } from './configuration.service';

describe(ConfigurationService.name, () => {
  let sut: ConfigurationService;

  let getIsLocalXMSpy: jasmine.Spy;
  let getPagesHostEnvironmentSpy: jasmine.Spy;
  let getActiveVariantSpy: jasmine.Spy;
  let getXmCloudTenantUrlSpy: jasmine.Spy;
  let getStreamTenantIdSpy: jasmine.Spy;
  let messaging: TestMessagingP2PChannel<
    ConfigurationHorizonEvents,
    ConfigurationCanvasEvents,
    ConfigurationHorizonRpcServices,
    ConfigurationCanvasRpcServices
  >;

  beforeEach(() => {
    getIsLocalXMSpy = jasmine.createSpy('getIsLocalXMSpy');
    getIsLocalXMSpy.and.callFake(async () => false);

    getPagesHostEnvironmentSpy = jasmine.createSpy('getPagesHostEnvironment');
    getPagesHostEnvironmentSpy.and.callFake(async () => 'production');

    getXmCloudTenantUrlSpy = jasmine.createSpy('getIsLocalXMSpy');
    getXmCloudTenantUrlSpy.and.callFake(async () => 'https://tenant001');

    getActiveVariantSpy = jasmine.createSpy('getIsLocalXMSpy');
    getActiveVariantSpy.and.callFake(async () => 'variant1');

    getStreamTenantIdSpy = jasmine.createSpy('getStreamTenantIdSpy');
    getStreamTenantIdSpy.and.callFake(async () => '123');

    messaging = makeTestMessagingP2PChannelFromDef(ConfigurationChannelDef, {
      isLocalXM: getIsLocalXMSpy,
      getPagesHostEnvironment: getPagesHostEnvironmentSpy,
      getXmCloudTenantUrl: getXmCloudTenantUrlSpy,
      getStreamTenantId: getStreamTenantIdSpy,
      getActiveVariant: getActiveVariantSpy,
    });

    sut = new ConfigurationService({ configurationMessagingChannel: messaging } as unknown as MessagingService);
  });

  describe('init', async () => {
    it('should fetch config data', async () => {
      await sut.init();

      expect(getIsLocalXMSpy).toHaveBeenCalled();
      expect(getPagesHostEnvironmentSpy).toHaveBeenCalled();
      expect(getXmCloudTenantUrlSpy).toHaveBeenCalled();
      expect(getXmCloudTenantUrlSpy).toHaveBeenCalled();
      expect(getStreamTenantIdSpy).toHaveBeenCalled();
    });
  });
});
