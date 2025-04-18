/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { ConfigurationService } from '../configuration/configuration.service';
import { GET_XM_META_VERSION_QUERY, XmCloudFeatureCheckerService } from './xm-cloud-feature-checker.service';

describe(XmCloudFeatureCheckerService.name, () => {
  let sut: XmCloudFeatureCheckerService;
  let apolloTestingController: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule.withClients(['global']), StaticConfigurationServiceStubModule],
      providers: [XmCloudFeatureCheckerService],
    });

    sut = TestBed.inject(XmCloudFeatureCheckerService);
    apolloTestingController = TestBed.inject(ApolloTestingController);

    ConfigurationService.xmCloudTenant = {
      id: '123',
      name: 'tenant',
      displayName: 'tenant1',
      organizationId: 'test-org',
      url: 'http://cm.com',
      gqlEndpointUrl: 'http://cm.com/graph',
      cdpEmbeddedTenantId: '123',
      customerEnvironmentType: 'prd',
      environmentId: 'environmentId-for-tenant',
      environmentName: 'prodev',
      projectId: '12',
      projectName: 'proj',
    };
  });

  afterEach(() => {
    ConfigurationService.xmCloudTenant = null;
    apolloTestingController.verify();
  });

  describe('XM Cloud feature support', () => {
    it('should retrieve the current XM version', fakeAsync(() => {
      const expectedVersion = '1.0.0';

      sut.getCurrentXMVersion().then((version) => {
        expect(version).toBe(expectedVersion);
      });
      tick();

      const op = apolloTestingController.expectOne(GET_XM_META_VERSION_QUERY);
      op.flush({
        data: {
          meta: {
            xMVersion: expectedVersion,
          },
        },
      });
      tick();
      flush();
    }));

    it('should return false if page design editing feature is not available', async () => {
      const currentVersion = '1.4.200';
      spyOn(sut, 'getCurrentXMVersion').and.returnValue(Promise.resolve(currentVersion));

      const result = await sut.isPageDesignEditingFeatureAvailable();

      expect(result).toBeFalse();
    });

    it('should return true if page design editing feature is  available', async () => {
      const currentVersion = '1.4.264';
      spyOn(sut, 'getCurrentXMVersion').and.returnValue(Promise.resolve(currentVersion));

      const result = await sut.isPageDesignEditingFeatureAvailable();

      expect(result).toBeTrue();
    });
  });
});
