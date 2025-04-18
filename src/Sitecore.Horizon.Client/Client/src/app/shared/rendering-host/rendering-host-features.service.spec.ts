/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { firstValueFrom, ReplaySubject, Subject } from 'rxjs';
import { ContextService } from '../client-state/context.service';
import { SiteService } from '../site-language/site-language.service';
import { ApiResponse } from '../utils/utils';
import { Version } from '../utils/version.utils';
import { RenderingHostConfig, RenderingHostConfigDalService } from './rendering-host-config.dal.service';
import { packageVersionEqualOrHigher, RH_FEATURE_DEFINITIONS, RHFeatureDefinition } from './rendering-host-features';
import { RenderingHostFeaturesService } from './rendering-host-features.service';

describe('RenderingHostFeaturesService', () => {
  let service: RenderingHostFeaturesService;
  let contextServiceSpy: jasmine.SpyObj<ContextService>;
  let siteServiceSpy: jasmine.SpyObj<SiteService>;
  let renderingHostConfigDalServiceSpy: jasmine.SpyObj<RenderingHostConfigDalService>;
  let siteName$: ReplaySubject<string>;
  let rhConfigResponse$: Subject<ApiResponse<RenderingHostConfig>>;

  beforeEach(() => {
    siteName$ = new ReplaySubject<string>(1);
    siteName$.next('testSite');
    rhConfigResponse$ = new Subject<ApiResponse<RenderingHostConfig>>();
    contextServiceSpy = jasmine.createSpyObj('ContextService', [], { siteName$ });
    siteServiceSpy = jasmine.createSpyObj('SiteService', ['getContextSite']);
    renderingHostConfigDalServiceSpy = jasmine.createSpyObj('RenderingHostConfigDalService', [
      'getRenderingHostConfig',
    ]);

    siteServiceSpy.getContextSite.and.returnValue({
      renderingEngineApplicationUrl: 'https://example.com/rhconfig',
    } as any);
    renderingHostConfigDalServiceSpy.getRenderingHostConfig.and.returnValue(rhConfigResponse$);

    const testRHFeatureDefinitions: RHFeatureDefinition[] = [
      {
        name: 'testFeature1' as any,
        enabled: (config: RenderingHostConfig) => packageVersionEqualOrHigher(config, 'testPackage1', '10.0.0'),
      },
      {
        name: 'fallbackFeature' as any,
        fallback: true,
        enabled: (config: RenderingHostConfig) => packageVersionEqualOrHigher(config, 'testPackage2', '3.0.0'),
      },
    ];

    TestBed.configureTestingModule({
      providers: [
        RenderingHostFeaturesService,
        { provide: ContextService, useValue: contextServiceSpy },
        { provide: SiteService, useValue: siteServiceSpy },
        { provide: RenderingHostConfigDalService, useValue: renderingHostConfigDalServiceSpy },
        { provide: RH_FEATURE_DEFINITIONS, useValue: testRHFeatureDefinitions },
      ],
    });

    service = TestBed.inject(RenderingHostFeaturesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return loading state when config request is pending', async () => {
    const result = await firstValueFrom(service.watchFeaturesLoading());

    expect(result).toBeTrue();
  });

  it('should return not-loading when config request is finished', async () => {
    rhConfigResponse$.next({
      apiIsBroken: false,
      requestIsInvalid: false,
      data: {
        components: ['Component1'],
        packages: {},
      },
    });
    const result = await firstValueFrom(service.watchFeaturesLoading());

    expect(result).toBeFalse();
  });

  it('should indicate disabled feature when config does not match condition', async () => {
    rhConfigResponse$.next({
      apiIsBroken: false,
      requestIsInvalid: false,
      data: {
        components: ['Component1'],
        packages: {
          testPackage1: new Version('9.0.0'),
        },
      },
    });

    const result = await firstValueFrom(service.watchFeatureEnabled('testFeature1' as any));
    expect(result.enabled).toBeFalse();
  });

  it('should indicate enabled feature when config does not match condition', async () => {
    rhConfigResponse$.next({
      apiIsBroken: false,
      requestIsInvalid: false,
      data: {
        components: ['Component1'],
        packages: {
          testPackage1: new Version('10.1.0'),
        },
      },
    });

    const result = await firstValueFrom(service.watchFeatureEnabled('testFeature1' as any));
    expect(result.enabled).toBeTrue();
  });

  it('should indicate diabled feature when config request failed', async () => {
    rhConfigResponse$.next({
      apiIsBroken: true,
      requestIsInvalid: true,
      data: null,
    });

    const result = await firstValueFrom(service.watchFeatureEnabled('testFeature1' as any));
    expect(result.enabled).toBeFalse();
  });

  it('should indicate enabled feature when config request failed but fallback is set to true', async () => {
    rhConfigResponse$.next({
      apiIsBroken: true,
      requestIsInvalid: true,
      data: null,
    });

    const result = await firstValueFrom(service.watchFeatureEnabled('fallbackFeature' as any));
    expect(result.enabled).toBeTrue();
  });

  it('should return list feature flags', async () => {
    rhConfigResponse$.next({
      apiIsBroken: false,
      requestIsInvalid: false,
      data: {
        components: ['Component1'],
        packages: {
          testPackage1: new Version('10.1.0'),
        },
      },
    });
    const expectedFlags = [
      {
        name: 'testFeature1',
        enabled: true,
      },
      {
        name: 'fallbackFeature',
        enabled: false,
      },
    ];

    const flags = await service.getFeatureFlags();

    expect(flags).toEqual(expectedFlags);
  });

  it('should return components from rendering host config response', async () => {
    rhConfigResponse$.next({
      apiIsBroken: false,
      requestIsInvalid: false,
      data: {
        components: ['ComponentA', 'ComponentB'],
        packages: {},
      },
    });

    const componentResult = await firstValueFrom(service.watchComponents());
    expect(componentResult.components).toEqual(['ComponentA', 'ComponentB']);
  });

  it('should return bypass for components when config response is failed', async () => {
    rhConfigResponse$.next({
      apiIsBroken: true,
      requestIsInvalid: false,
      data: null,
    });

    const componentResult = await firstValueFrom(service.watchComponents());
    expect(componentResult.bypass).toBeTrue();
  });

  it('should return bypass for components when config response is not parsed', async () => {
    rhConfigResponse$.next({
      apiIsBroken: false,
      requestIsInvalid: false,
      data: null,
    });

    const componentResult = await firstValueFrom(service.watchComponents());
    expect(componentResult.bypass).toBeTrue();
  });
});
