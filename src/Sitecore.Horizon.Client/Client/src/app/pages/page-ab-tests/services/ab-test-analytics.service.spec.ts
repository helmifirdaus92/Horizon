/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { HostingEnvironmentService } from 'app/shared/hosting-environment/hosting-environment.service';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { AbTestAnalyticsService } from './ab-test-analytics.service';

describe(AbTestAnalyticsService.name, () => {
  let sut: AbTestAnalyticsService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StaticConfigurationServiceStubModule, ContextServiceTestingModule],
      providers: [
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>('FeatureFlagsService', ['isFeatureEnabled']),
        },
        {
          provide: HostingEnvironmentService,
          useValue: jasmine.createSpyObj<HostingEnvironmentService>(['addEnvironmentInfo']),
        },
        {
          provide: SiteService,
          useValue: jasmine.createSpyObj<SiteService>(['getContextSite']),
        },
      ],
    });

    sut = TestBed.inject(AbTestAnalyticsService);
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });
});
