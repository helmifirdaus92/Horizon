/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export interface AzureFeatureFlags {
  id: string;
  enabled: boolean;
  displayName?: string;
  description: string;
  conditions?: {
    clientFilters: Array<{ name: string; parameters?: Record<string, unknown> }>;
  };
}

export interface FeatureFlags {
  name: string;
  enabled: boolean;
}

export const fallbackFeatureFlags: AzureFeatureFlags[] = [
  {
    id: 'pages_canvas_through_horizon',
    description: 'Render editing canvas through Horizon',
    enabled: false,
  },
  {
    id: 'pages_feaas-components-regions',
    description: 'Enables render regions for FEaaS components extensions',
    enabled: false,
  },
  {
    id: 'pages_fetch-feaas-components',
    description: 'Enables in house fetching FEaaS components',
    enabled: false,
  },
  {
    id: 'pages_fetch-feaas-external-components',
    description: 'Enables in house fetching FEaaS external components',
    enabled: false,
  },
  {
    id: 'pages_gainsight',
    description: 'Gainsight',
    enabled: false,
  },
  {
    id: 'pages_show-form-analytics',
    description: 'Show Form analytics section',
    enabled: false,
  },
  {
    id: 'pages_use-ckeditor',
    description: 'Use ckeditor for RTE field',
    enabled: false,
  },
  {
    id: 'pages_use-xmapps-sites-api',
    description: 'Use xmapps API as source of sites',
    enabled: false,
  },
  {
    id: 'pages_show-templates-design-updates',
    description: 'Show the new design updates for Templates',
    enabled: false,
  },
  {
    id: 'pages_super-layout-component',
    description: 'Show an editing panel for a layout container',
    enabled: false,
  },
  {
    id: 'pages_page-insert-options',
    description: 'Show insert options tab under page settings',
    enabled: false,
  },
  {
    id: 'pages_rendering-host-flip',
    description: 'Enable direct integration of rendering hosts',
    enabled: false,
  },
  {
    id: 'pages_shallow-chromes',
    description: 'Enable rendering with shallow chromes',
    enabled: false,
  },
  {
    id: 'pages_components-testing',
    description: 'Enable a/b test on components',
    enabled: false,
  },
  {
    id: 'pages_site-supported-languages',
    description: 'Enables supported languages for site',
    enabled: false,
  },
];
