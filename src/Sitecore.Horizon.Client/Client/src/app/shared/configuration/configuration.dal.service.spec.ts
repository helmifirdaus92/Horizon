/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { createSpyObserver } from 'app/testing/test.utils';
import { ObservableType } from '../utils/lang.utils';
import {
  ConfigurationDalService,
  FETCH_CONFIGURATION_QUERY,
  FETCH_TENANT_BASED_SETTINGS_QUERY,
} from './configuration.dal.service';

type Configuration = ObservableType<ReturnType<ConfigurationDalService['fetchConfiguration']>>;

describe(ConfigurationDalService.name, () => {
  let sut: ConfigurationDalService;
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
    });

    sut = TestBed.inject(ConfigurationDalService);
    controller = TestBed.inject(ApolloTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  it('should return value from dal service', fakeAsync(() => {
    const resultObserver = createSpyObserver<Configuration>();

    sut.fetchConfiguration().subscribe(resultObserver);
    const op = controller.expectOne(FETCH_CONFIGURATION_QUERY);
    op.flush({
      data: {
        configuration: {
          additionalPlatformUrls: ['http://additional.com'],
          hostVerificationToken: 'SECRET_TOKEN',
          contentRootItemId: 'root-item-id',
          clientLanguage: 'da',
          layoutServiceApiKey: 'API_KEY',
          jssEditingSecret: 'JSS_EDITING_SECRET',
        },
      },
    });
    tick();

    expect(resultObserver.next).toHaveBeenCalled();
    const [result] = resultObserver.next.calls.mostRecent().args;
    expect(result.additionalPlatformUrls).toEqual(['http://additional.com']);
    expect(result.hostVerificationToken).toBe('SECRET_TOKEN');
    expect(result.contentRootItemId).toBe('root-item-id');
    expect(result.clientLanguage).toBe('da');
    flush();
  }));

  it('should return tenant configuration from dal service', fakeAsync(() => {
    const resultObserver = createSpyObserver<Pick<Configuration, 'environmentFeatures' | 'personalizeScope'>>();

    sut.fetchTenantConfiguration().subscribe(resultObserver);
    const op = controller.expectOne(FETCH_TENANT_BASED_SETTINGS_QUERY);
    op.flush({
      data: {
        configuration: {
          environmentFeatures: [
            {
              name: 'feature1',
              enabled: true,
            },
            {
              name: 'feature2',
              enabled: false,
            },
          ],
          personalizeScope: 'tenantScope',
        },
      },
    });
    tick();

    expect(resultObserver.next).toHaveBeenCalled();
    const [result] = resultObserver.next.calls.mostRecent().args;
    expect(result.environmentFeatures).toEqual([
      { name: 'feature1', enabled: true },
      { name: 'feature2', enabled: false },
    ]);
    expect(result.personalizeScope).toBe('tenantScope');
    flush();
  }));
});
