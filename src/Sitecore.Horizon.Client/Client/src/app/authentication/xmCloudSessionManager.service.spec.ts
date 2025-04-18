/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';

import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { AuthenticationService } from './authentication.service';
import { XmCloudSessionManagerService } from './xmCloudSessionManager.service';

describe(XmCloudSessionManagerService.name, () => {
  let sut: XmCloudSessionManagerService;
  let timedNotificationsServiceSpy: jasmine.SpyObj<TimedNotificationsService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StaticConfigurationServiceStubModule, TranslateServiceStubModule],
      providers: [
        {
          provide: ConfigurationService,
          useValue: jasmine.createSpyObj<ConfigurationService>(ConfigurationService.name, {}, {
            xmCloudTenant: null,
          } as any),
        },
        {
          provide: TimedNotificationsService,
          useValue: jasmine.createSpyObj<TimedNotificationsService>({ push: {} as any }),
        },
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>(FeatureFlagsService.name, { isFeatureEnabled: true }),
        },
        {
          provide: AuthenticationService,
          useValue: jasmine.createSpyObj<AuthenticationService>(AuthenticationService.name, {
            getBearerToken: Promise.resolve('token001'),
          }),
        },
      ],
    });

    sut = TestBed.inject(XmCloudSessionManagerService);
    timedNotificationsServiceSpy = TestBedInjectSpy(TimedNotificationsService);

    ConfigurationService.xmCloudTenant = { url: 'https://xmCloudTenant001' } as any;
    jasmine.clock().install();
  });

  afterEach(() => {
    ConfigurationService.xmCloudTenant = null;
    jasmine.clock().uninstall();
  });

  describe('setup session to XM Cloud', () => {
    it('should show timed notification when session to XM Cloud was not established', async () => {
      sut.setupSession();

      jasmine.clock().tick(sut['tryEstablishSessionTimeout'] + 100);

      await sut.waitForSession();
      expect(timedNotificationsServiceSpy.push).toHaveBeenCalled();
    });

    it('should successfully setup session to XM Cloud', async () => {
      sut.setupSession();

      window.postMessage('hrzEmptyPageLoaded');

      await sut.waitForSession();
      expect(timedNotificationsServiceSpy.push).not.toHaveBeenCalled();
    });
  });
});
