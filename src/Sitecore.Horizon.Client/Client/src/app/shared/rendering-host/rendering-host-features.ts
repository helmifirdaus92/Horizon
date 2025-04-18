/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { InjectionToken } from '@angular/core';
import { Version } from '../utils/version.utils';
import { RenderingHostConfig } from './rendering-host-config.dal.service';

export function packageVersionEqualOrHigher(
  rhConfig: RenderingHostConfig,
  packageName: string,
  version: string,
): boolean {
  const versionToCheck = new Version(version);

  return rhConfig.packages[packageName]?.isEqualOrGreaterThan(versionToCheck) ?? false;
}

export const renderingHostFeatureDefinitions = [
  {
    name: 'rh_preview_mode',
    fallback: false,
    enabled: (config: RenderingHostConfig) =>
      Object.entries(config.packages).filter(([key]) => key.startsWith('@sitecore-content-sdk')).length > 0,
  },
  {
    name: 'rh_use-shallow-chromes',
    fallback: false,
    enabled: (config: RenderingHostConfig) => config.editMode === 'metadata',
  },
  {
    name: 'rh_components-testing',
    fallback: false,
    enabled: (config: RenderingHostConfig) =>
      packageVersionEqualOrHigher(config, '@sitecore-jss/sitecore-jss-react', '22.1.0') ||
      packageVersionEqualOrHigher(config, '@sitecore-jss/sitecore-jss-nextjs', '22.1.0') ||
      packageVersionEqualOrHigher(config, '@sitecore-jss/sitecore-jss-angular', '22.3.0') ||
      !!config.packages['@sitecore-content-sdk/nextjs'],
  },
  {
    name: 'rh_angular_rendering-host',
    fallback: false,
    enabled: (config: RenderingHostConfig) =>
      packageVersionEqualOrHigher(config, '@sitecore-jss/sitecore-jss-angular', '22.1.0'),
  },
  {
    name: 'rh_react_rendering-host',
    fallback: true,
    enabled: (config: RenderingHostConfig) => {
      return !!(
        config.packages['@sitecore-jss/sitecore-jss-react'] ||
        config.packages['@sitecore-jss/sitecore-jss-nextjs'] ||
        config.packages['@sitecore-content-sdk/nextjs']
      );
    },
  },
] as const;

export type RHFeatureKeys = (typeof renderingHostFeatureDefinitions)[number]['name'];

export interface RHFeatureDefinition {
  name: RHFeatureKeys;
  fallback?: boolean;
  enabled: (rhConfig: RenderingHostConfig) => boolean;
}

export const RH_FEATURE_DEFINITIONS = new InjectionToken<readonly RHFeatureDefinition[]>('RH_FEATURE_DEFINITIONS', {
  providedIn: 'root',
  factory: () => renderingHostFeatureDefinitions,
});
