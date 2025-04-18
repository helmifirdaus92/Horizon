/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { DEFAULT_TEST_CONTEXT } from '../client-state/context.service.testing';
import { ConfigurationService } from '../configuration/configuration.service';
import { RenderingHostFeaturesService } from '../rendering-host/rendering-host-features.service';
import { RenderingHostResolverService } from '../rendering-host/rendering-host-resolver.service';
import { Site, SiteService } from '../site-language/site-language.service';
import { CanvasUrlBuilder } from './url-builder';

const testContext = { ...DEFAULT_TEST_CONTEXT, variant: 'testvariant' };
const platformUrl = 'test-platform-url';
const secret = 'secret';
const renderingHostUrl = 'https://rendering-host-app-url?param1=value1&param2=value2';
const siteContextTest: Site = {
  id: '227bc0ff-6237-42b6-851f-49e68c1998e8',
  hostId: 'hostId 1',
  collectionId: '337bc0ff-6237-42b6-851f-49e68c1998e8',
  appName: 'app_name',
  layoutServiceConfig: 'default',
  renderingEngineEndpointUrl: 'rendering-host-api-url',
  renderingEngineApplicationUrl: renderingHostUrl,
  language: 'en',
  name: 'site',
  displayName: 'site',
  pointOfSale: [],
  startItemId: '',
  supportedLanguages: ['en'],
  properties: {
    isSxaSite: true,
    tagsFolderId: 'id001',
    isLocalDatasourcesEnabled: true,
  },
};

describe(CanvasUrlBuilder.name, () => {
  let siteServiceSpy: jasmine.SpyObj<SiteService>;
  let renderingHostResolverServiceSpy: jasmine.SpyObj<RenderingHostResolverService>;
  let renderingHostFeaturesServiceSpy: jasmine.SpyObj<RenderingHostFeaturesService>;
  let sut: CanvasUrlBuilder;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        {
          provide: SiteService,
          useValue: jasmine.createSpyObj<SiteService>('SiteService', ['getContextSite']),
        },
        {
          provide: RenderingHostResolverService,
          useValue: jasmine.createSpyObj<RenderingHostResolverService>({}, { hostUrl: renderingHostUrl }),
        },
        {
          provide: RenderingHostFeaturesService,
          useValue: jasmine.createSpyObj<RenderingHostFeaturesService>({
            isFeatureEnabled: Promise.resolve(false),
          }),
        },
      ],
    });

    const configSpy = jasmine.createSpyObj<ConfigurationService>({}, { jssEditingSecret: secret });

    ConfigurationService.xmCloudTenant = {
      id: '123',
      name: 'tenant',
      displayName: 'tenant1',
      organizationId: 'test-org',
      url: platformUrl,
      gqlEndpointUrl: 'http://cm.com/graph',
      cdpEmbeddedTenantId: '123',
      customerEnvironmentType: 'prd',
      environmentId: '321',
      environmentName: 'prodev',
      projectId: '12',
      projectName: 'proj',
    };

    siteServiceSpy = TestBedInjectSpy(SiteService);
    siteServiceSpy.getContextSite.and.returnValue(siteContextTest);

    renderingHostResolverServiceSpy = TestBedInjectSpy(RenderingHostResolverService);
    renderingHostFeaturesServiceSpy = TestBedInjectSpy(RenderingHostFeaturesService);
    renderingHostFeaturesServiceSpy.isFeatureEnabled.and.returnValue(Promise.resolve(false));

    sut = new CanvasUrlBuilder(configSpy, renderingHostResolverServiceSpy, renderingHostFeaturesServiceSpy);
  });

  afterEach(() => {
    ConfigurationService.xmCloudTenant = null;
  });

  describe('buildXmcEditModeUrl()', () => {
    it('should include the host param with a current origin', async () => {
      const encodedOrigin = encodeURIComponent(window.location.origin);

      const url = await sut.buildXmcEditModeUrl(testContext, { metadataMode: false });
      expect(url).toContain('sc_horizonhost=' + encodedOrigin);
    });

    it('should include the host', async () => {
      const url = await sut.buildXmcEditModeUrl(testContext, { metadataMode: false });
      expect(url).toContain(platformUrl);
    });

    it('should include the context query params', () => {
      const result = sut.buildXmcEditModeUrl(testContext, { metadataMode: false });
      expect(result).toContain(`sc_itemid=${testContext.itemId}`);
      expect(result).toContain(`sc_lang=${testContext.language}`);
      expect(result).toContain(`sc_site=${testContext.siteName}`);
      expect(result).toContain(`sc_version=${testContext.itemVersion}`);
    });

    it('should include editMode  query param when metadata mode is enabled', () => {
      const result = sut.buildXmcEditModeUrl(testContext, { metadataMode: true });
      expect(result).toContain(`sc_editMode=true`);
    });
  });

  describe('buildPreviewModeUrl()', () => {
    it('should build url to editing host', async () => {
      renderingHostFeaturesServiceSpy.isFeatureEnabled.and.returnValue(Promise.resolve(true));
      const url = await sut.buildPreviewModeUrl(testContext, 'testroute');

      expect(url).toContain('rendering-host-app-url');
      expect(url).toContain('param1=value1&param2=value2');
      expect(url).toContain(`sc_itemid=%7Bfoo1BAR2-BaZ3-0000-AAAA-bbbbCCCC1234%7D`);
      expect(url).toContain(`sc_site=${testContext.siteName}`);
      expect(url).toContain(`sc_lang=${testContext.language}`);
      expect(url).toContain(`sc_version=${testContext.itemVersion}`);
      expect(url).toContain(`sc_variant=${testContext.variant}`);
      expect(url).toContain(`route=testroute`);
      expect(url).toContain(`mode=preview`);
      expect(url).toContain(`secret=${secret}`);
      expect(url).toContain(`sc_layoutKind=final`);
      expect(url).toContain(`tenant_id=${ConfigurationService.xmCloudTenant?.id}`);
    });

    it('should include the corresponding preview mode param', async () => {
      const url = await sut.buildPreviewModeUrl(testContext, '');
      expect(url).toContain('sc_horizon=preview');
    });

    it('should include the host', async () => {
      const url = await sut.buildPreviewModeUrl(testContext, '');
      expect(url).toContain(platformUrl);
    });

    it('should include the context query params', async () => {
      const result = await sut.buildPreviewModeUrl(testContext, '');
      expect(result).toContain(`sc_itemid=${testContext.itemId}`);
      expect(result).toContain(`sc_lang=${testContext.language}`);
      expect(result).toContain(`sc_site=${testContext.siteName}`);
    });
  });

  describe('buildEditModeUrl()', () => {
    it('should build url to editing host', () => {
      const url = sut.buildEditModeUrl(testContext, 'testroute', 'FINAL');

      expect(url).toContain('rendering-host-app-url');
      expect(url).toContain('param1=value1&param2=value2');
      expect(url).toContain(`sc_itemid=%7Bfoo1BAR2-BaZ3-0000-AAAA-bbbbCCCC1234%7D`);
      expect(url).toContain(`sc_site=${testContext.siteName}`);
      expect(url).toContain(`sc_lang=${testContext.language}`);
      expect(url).toContain(`sc_version=${testContext.itemVersion}`);
      expect(url).toContain(`sc_variant=${testContext.variant}`);
      expect(url).toContain(`route=testroute`);
      expect(url).toContain(`mode=edit`);
      expect(url).toContain(`secret=${secret}`);
      expect(url).toContain(`sc_layoutKind=final`);
      expect(url).toContain(`tenant_id=${ConfigurationService.xmCloudTenant?.id}`);
    });
  });
});
