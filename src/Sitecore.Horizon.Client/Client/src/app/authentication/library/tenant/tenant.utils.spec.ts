/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { StreamTenantsAnnotations, StreamTenantsLabels, TenantsAnnotation, TenantsLabels } from './tenant.types';
import { parseCdpCloudTenantAnnotations, parseStreamTenant, parseXmCloudTenantAnnotations } from './tenant.utils';

describe(parseXmCloudTenantAnnotations.name, () => {
  it('should return null IF tenant is null', () => {
    expect(parseXmCloudTenantAnnotations(null)).toBe(null);
  });

  it('should return null If there is no Url and ProjectId', () => {
    expect(
      parseXmCloudTenantAnnotations({
        id: 'id',
        name: 'name',
        displayName: 'displayName',
        organizationId: 'organizationId',
        labels: {},
        annotations: {},
        systemId: 'systemId',
        state: 'Activating',
      }),
    ).toBe(null);
  });

  it('should return null If there is no Url', () => {
    expect(
      parseXmCloudTenantAnnotations({
        id: 'id',
        name: 'name',
        displayName: 'displayName',
        organizationId: 'organizationId',
        labels: {},
        annotations: {
          [TenantsAnnotation.url]: 'http://url.my',
        },
        systemId: 'systemId',
        state: 'Activating',
      }),
    ).toBe(null);
  });

  it('should return null If there is no ProjectId', () => {
    expect(
      parseXmCloudTenantAnnotations({
        id: 'id',
        name: 'name',
        displayName: 'displayName',
        organizationId: 'organizationId',
        labels: {},
        annotations: {
          [TenantsAnnotation.projectId]: 'id',
        },
        systemId: 'systemId',
        state: 'Activating',
      }),
    ).toBe(null);
  });

  it('should parse annotations', () => {
    expect(
      parseXmCloudTenantAnnotations({
        id: 'id',
        name: 'name',
        displayName: 'displayName',
        organizationId: 'organizationId',
        labels: {},
        annotations: {
          [TenantsAnnotation.url]: 'http://url.my',
          [TenantsAnnotation.projectId]: 'projectId',
          [TenantsAnnotation.cdpEmbeddedTenantId]: 'cdpEmbeddedTenantId',
          [TenantsAnnotation.aiEmbeddedTenantID]: 'aiEmbeddedTenantID',
          [TenantsAnnotation.customerEnvironmentType]: 'customerEnvironmentType',
          [TenantsAnnotation.environmentId]: 'environmentId',
          [TenantsAnnotation.environmentName]: 'environmentName',
          [TenantsAnnotation.projectName]: 'projectName',
        },
        systemId: 'systemId',
        state: 'Activating',
      }),
    ).toEqual({
      id: 'id',
      name: 'name',
      displayName: 'displayName',
      organizationId: 'organizationId',
      url: 'http://url.my/',
      gqlEndpointUrl: 'http://url.my',
      cdpEmbeddedTenantId: 'cdpEmbeddedTenantId',
      aiEmbeddedTenantID: 'aiEmbeddedTenantID',
      customerEnvironmentType: 'customerEnvironmentType',
      environmentId: 'environmentId',
      environmentName: 'environmentName',
      projectId: 'projectId',
      projectName: 'projectName',
      regionCode: undefined,
    });
  });

  it('should parse info AND ignore labels properties', () => {
    expect(
      parseXmCloudTenantAnnotations({
        id: 'id',
        name: 'name',
        displayName: 'displayName',
        organizationId: 'organizationId',
        labels: {
          one: '1',
          two: '2',
          [TenantsLabels.RegionCode]: 'regionCode',
        },
        annotations: {
          [TenantsAnnotation.url]: 'http://url.my',
          [TenantsAnnotation.projectId]: 'projectId',
        },
        systemId: 'systemId',
        state: 'Activating',
      }),
    ).toEqual({
      id: 'id',
      name: 'name',
      displayName: 'displayName',
      organizationId: 'organizationId',
      url: 'http://url.my/',
      gqlEndpointUrl: 'http://url.my',
      cdpEmbeddedTenantId: undefined,
      aiEmbeddedTenantID: undefined,
      customerEnvironmentType: undefined,
      environmentId: undefined,
      environmentName: undefined,
      projectId: 'projectId',
      projectName: undefined,
      regionCode: 'regionCode',
    });
  });

  it('should parse info AND set gqlEndpointUrl', () => {
    expect(
      parseXmCloudTenantAnnotations(
        {
          id: 'id',
          name: 'name',
          displayName: 'displayName',
          organizationId: 'organizationId',
          labels: {
            [TenantsLabels.RegionCode]: 'regionCode',
          },
          annotations: {
            [TenantsAnnotation.url]: 'http://url.my',
            [TenantsAnnotation.projectId]: 'projectId',
          },
          systemId: 'systemId',
          state: 'Activating',
        },
        '/gql/endpoint',
      ),
    ).toEqual({
      id: 'id',
      name: 'name',
      displayName: 'displayName',
      organizationId: 'organizationId',
      url: 'http://url.my/',
      gqlEndpointUrl: 'http://url.my/gql/endpoint',
      cdpEmbeddedTenantId: undefined,
      aiEmbeddedTenantID: undefined,
      customerEnvironmentType: undefined,
      environmentId: undefined,
      environmentName: undefined,
      projectId: 'projectId',
      projectName: undefined,
      regionCode: 'regionCode',
    });
  });
});

describe(parseCdpCloudTenantAnnotations.name, () => {
  it('should return null IF tenant is null', () => {
    expect(parseCdpCloudTenantAnnotations(null)).toBe(null);
  });

  it('should return null If there is no ApiUrl and AppUrl', () => {
    expect(
      parseCdpCloudTenantAnnotations({
        id: 'id',
        name: 'name',
        displayName: 'displayName',
        organizationId: 'organizationId',
        labels: {},
        annotations: {},
        systemId: 'systemId',
        state: 'Activating',
      }),
    ).toBe(null);
  });

  it('should return null If there is no ApiUrl', () => {
    expect(
      parseCdpCloudTenantAnnotations({
        id: 'id',
        name: 'name',
        displayName: 'displayName',
        organizationId: 'organizationId',
        labels: {
          [TenantsLabels.RegionCode]: 'regionCode',
        },
        annotations: {
          [TenantsAnnotation.url]: 'http://app.url',
        },
        systemId: 'systemId',
        state: 'Activating',
      }),
    ).toBe(null);
  });

  it('should return null If there is no AppUrl', () => {
    expect(
      parseCdpCloudTenantAnnotations({
        id: 'id',
        name: 'name',
        displayName: 'displayName',
        organizationId: 'organizationId',
        labels: {
          [TenantsLabels.RegionCode]: 'regionCode',
        },
        annotations: {
          [TenantsAnnotation.cdpApiURL]: 'http://api.uri',
        },
        systemId: 'systemId',
        state: 'Activating',
      }),
    ).toBe(null);
  });

  it('should parse annotations', () => {
    expect(
      parseCdpCloudTenantAnnotations({
        id: 'id',
        name: 'name',
        displayName: 'displayName',
        organizationId: 'organizationId',
        labels: {
          [TenantsLabels.RegionCode]: 'regionCode',
        },
        annotations: {
          [TenantsAnnotation.cdpApiURL]: 'http://api.uri',
          [TenantsAnnotation.url]: 'http://app.url',
        },
        systemId: 'systemId',
        state: 'Activating',
      }),
    ).toEqual({
      id: 'id',
      name: 'name',
      displayName: 'displayName',
      organizationId: 'organizationId',
      apiUrl: 'http://api.uri',
      appUrl: 'http://app.url',
      analyticsAppUrl: 'http://app.url',
    });
  });

  describe(parseStreamTenant.name, () => {
    it('should return null IF tenant is null', () => {
      expect(parseStreamTenant(null)).toBe(null);
    });

    it('should parse annotations', () => {
      expect(
        parseStreamTenant({
          id: 'id',
          name: 'name',
          displayName: 'displayName',
          organizationId: 'organizationId',
          labels: {
            [StreamTenantsLabels.aiEdition]: 'premium',
            [StreamTenantsLabels.aiType]: 'type',
            [StreamTenantsLabels.aiTier]: 'tier',
            [TenantsLabels.RegionCode]: 'regionCode',
          },
          annotations: {
            [StreamTenantsAnnotations.url]: 'http://stream.url',
          },
          systemId: 'systemId',
          state: 'Activating',
        }),
      ).toEqual({
        id: 'id',
        name: 'name',
        displayName: 'displayName',
        organizationId: 'organizationId',
        url: 'http://stream.url',
        aiEdition: 'premium',
        aiType: 'type',
        aiTier: 'tier',
        regionCode: 'regionCode',
      });
    });

    it('should parse annotations with default aiEdition', () => {
      expect(
        parseStreamTenant({
          id: 'id',
          name: 'name',
          displayName: 'displayName',
          organizationId: 'organizationId',
          labels: {
            [StreamTenantsLabels.aiType]: 'type',
            [StreamTenantsLabels.aiTier]: 'tier',
            [TenantsLabels.RegionCode]: 'regionCode',
          },
          annotations: {
            [StreamTenantsAnnotations.url]: 'http://stream.url',
          },
          systemId: 'systemId',
          state: 'Activating',
        }),
      ).toEqual({
        id: 'id',
        name: 'name',
        displayName: 'displayName',
        organizationId: 'organizationId',
        url: 'http://stream.url',
        aiEdition: 'free',
        aiType: 'type',
        aiTier: 'tier',
        regionCode: 'regionCode',
      });
    });
  });
});
