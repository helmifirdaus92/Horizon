/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { createSpyObserver, TestBedInjectSpy } from 'app/testing/test.utils';
import { NEVER, Observable, of, throwError } from 'rxjs';
import { first } from 'rxjs/operators';
import { ConfigurationDalService } from './configuration.dal.service';
import { ConfigurationService } from './configuration.service';

const TEST_PRIMARY_PLATFORM_URL = 'http://primary.com';
const TEST_CONFIGURATION = {
  additionalPlatformUrls: ['http://additional.com'],
  hostVerificationToken: 'SECRET_TOKEN',
  contentRootItemId: 'root-item-id',
  clientLanguage: 'en',
  sessionTimeoutSeconds: 1200,
  integrationVersion: '7.2.44',
  layoutServiceApiKey: '',
  jssEditingSecret: '',
  personalizeScope: undefined,
  globalTagsRepository: undefined,
  environmentFeatures: [],
};

const TEST_TENANT_CONFIGURATION = {
  personalizeScope: 'testScope',
  environmentFeatures: [
    {
      name: 'f1',
      enabled: true,
    },
  ],
};

describe(ConfigurationService.name, () => {
  let dalServiceSpy: jasmine.SpyObj<ConfigurationDalService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StaticConfigurationServiceStubModule],
      providers: [
        {
          provide: ConfigurationDalService,
          useValue: jasmine.createSpyObj<ConfigurationDalService>({
            fetchConfiguration: NEVER,
            fetchSameOriginRenderingConfiguration: NEVER,
            fetchTenantConfiguration: NEVER,
          }),
        },
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>(['isFeatureEnabled']),
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj<Router>(['navigateByUrl']),
        },
      ],
    });

    ConfigurationService.xmCloudTenant = {
      id: '123',
      name: 'tenant',
      displayName: 'tenant1',
      organizationId: 'test-org',
      url: 'http://primary.com',
      gqlEndpointUrl: 'https://primary.com/graph',
      cdpEmbeddedTenantId: '123',
      customerEnvironmentType: 'prd',
      environmentId: '321',
      environmentName: 'prodev',
      projectId: '12',
      projectName: 'proj',
    };

    dalServiceSpy = TestBedInjectSpy(ConfigurationDalService);
    dalServiceSpy.fetchSameOriginRenderingConfiguration.and.returnValue(of(TEST_CONFIGURATION));
    dalServiceSpy.fetchTenantConfiguration.and.returnValue(of(TEST_CONFIGURATION));

    routerSpy = TestBedInjectSpy(Router);
    routerSpy.navigateByUrl.and.returnValue(Promise.resolve(true));
  });

  afterEach(() => {
    ConfigurationService.xmCloudTenant = null;
  });

  it('should not request value before first subscriber', () => {
    const subscribeObserver = jasmine.createSpy();
    dalServiceSpy.fetchConfiguration.and.returnValue(new Observable(subscribeObserver));

    TestBed.inject(ConfigurationService);

    expect(subscribeObserver).not.toHaveBeenCalled();
  });

  it('should return nothing till init called', () => {
    const resultObserver = createSpyObserver();
    const sut = TestBed.inject(ConfigurationService);

    sut.configuration$.subscribe(resultObserver);

    expect(resultObserver.next).not.toHaveBeenCalled();
    expect(resultObserver.complete).not.toHaveBeenCalled();
    expect(resultObserver.error).not.toHaveBeenCalled();
  });

  it('should return value from dal service after init() call', async () => {
    const resultObserver = createSpyObserver();
    dalServiceSpy.fetchConfiguration.and.returnValue(of(TEST_CONFIGURATION));
    const sut = TestBed.inject(ConfigurationService);

    sut.configuration$.subscribe(resultObserver);
    await sut.init();

    expect(resultObserver.next).toHaveBeenCalledWith({
      ...TEST_CONFIGURATION,
      primaryPlatformUrl: TEST_PRIMARY_PLATFORM_URL,
    });
  });

  it('should not re-subscribe for value again', async () => {
    const subscribeObserver = jasmine.createSpy();
    dalServiceSpy.fetchConfiguration.and.returnValue(
      new Observable((subscriber) => {
        subscribeObserver(subscriber);
        subscriber.next(TEST_CONFIGURATION);
      }),
    );
    const result1Observer = createSpyObserver();
    const result2Observer = createSpyObserver();
    const sut = TestBed.inject(ConfigurationService);
    await sut.init();

    sut.configuration$.pipe(first()).subscribe(result1Observer);
    sut.configuration$.subscribe(result2Observer);

    expect(subscribeObserver).toHaveBeenCalledTimes(1);
    expect(result1Observer.next).toHaveBeenCalledWith(jasmine.objectContaining(TEST_CONFIGURATION));
    expect(result2Observer.next).toHaveBeenCalledWith(jasmine.objectContaining(TEST_CONFIGURATION));
  });

  it('should return contentRootItemId value from dal service', async () => {
    dalServiceSpy.fetchConfiguration.and.returnValue(of(TEST_CONFIGURATION));
    const sut = TestBed.inject(ConfigurationService);
    await sut.init();

    expect(sut.contentRootItemId).toEqual(TEST_CONFIGURATION.contentRootItemId);
  });

  it('should throw if contentRootItemId called before initialization', () => {
    dalServiceSpy.fetchConfiguration.and.returnValue(of(TEST_CONFIGURATION));
    const sut = TestBed.inject(ConfigurationService);

    expect(() => sut.contentRootItemId).toThrow();
  });

  it('should return clientLanguage value from dal service', async () => {
    dalServiceSpy.fetchConfiguration.and.returnValue(of(TEST_CONFIGURATION));
    const sut = TestBed.inject(ConfigurationService);
    await sut.init();

    expect(sut.clientLanguage).toEqual(TEST_CONFIGURATION.clientLanguage);
  });

  it('should throw if clientLanguage called before initialization', () => {
    dalServiceSpy.fetchConfiguration.and.returnValue(of(TEST_CONFIGURATION));
    const sut = TestBed.inject(ConfigurationService);

    expect(() => sut.clientLanguage).toThrow();
  });

  it('should merge tenant configuration into the main configuration if tenant settings are available', async () => {
    const sut = TestBed.inject(ConfigurationService);
    const testConfigurationWithNewIntegration = { ...TEST_CONFIGURATION, integrationVersion: '8.1.230' };
    dalServiceSpy.fetchTenantConfiguration.and.returnValue(of(TEST_TENANT_CONFIGURATION));
    dalServiceSpy.fetchConfiguration.and.returnValue(of(testConfigurationWithNewIntegration));

    const resultObserver = createSpyObserver();
    sut.configuration$.subscribe(resultObserver);
    await sut.init();

    expect(resultObserver.next).toHaveBeenCalledWith(
      jasmine.objectContaining({
        ...testConfigurationWithNewIntegration,
        ...TEST_TENANT_CONFIGURATION,
      }),
    );
  });

  it('should proceed without tenant configuration if isTenantSettingsAvailable returns false', async () => {
    const sut = TestBed.inject(ConfigurationService);
    const testConfigurationWithNewIntegration = { ...TEST_CONFIGURATION, integrationVersion: '8.1.1' };
    dalServiceSpy.fetchConfiguration.and.returnValue(of(testConfigurationWithNewIntegration));

    const resultObserver = createSpyObserver();
    sut.configuration$.subscribe(resultObserver);
    await sut.init();

    expect(resultObserver.next).toHaveBeenCalledWith(
      jasmine.objectContaining({
        ...testConfigurationWithNewIntegration,
      }),
    );
    expect(dalServiceSpy.fetchTenantConfiguration).not.toHaveBeenCalled();
  });

  it('should navigate to error page if configuration is not available', async () => {
    dalServiceSpy.fetchConfiguration.and.returnValue(throwError(() => 'UnknownError'));
    const sut = TestBed.inject(ConfigurationService);

    await sut.init();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/error/no-organization');
  });
});
