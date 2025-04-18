/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ConfigurationService } from '../services/configuration.service';
import { FeatureFlagsService } from '../services/feature-flags.service';

export class FeatureChecker {
  static isCkeditorEnabled(): boolean {
    return (
      FeatureFlagsService.isFeatureEnabled('pages_use-ckeditor') &&
      (this.isStagingEnvironment || ConfigurationService.isLocalXM || FeatureFlagsService.isFeatureEnabled('xmTenant_use-ckeditor'))
    );
  }

  static isComponentTestingEnabled(): boolean {
    return (
      FeatureFlagsService.isFeatureEnabled('pages_components-testing') && FeatureFlagsService.isFeatureEnabled('rh_components-testing')
    );
  }

  static isShallowChromesEnabled(): boolean {
    return FeatureFlagsService.isFeatureEnabled('rh_use-shallow-chromes') && FeatureFlagsService.isFeatureEnabled('pages_shallow-chromes');
  }

  static isOptimizationEnabled(): boolean {
    return FeatureFlagsService.isFeatureEnabled('pages_content-optimization-rhs');
  }

  static isContentEditingEnabled(): boolean {
    return (
      FeatureFlagsService.isFeatureEnabled('pages_context-panel-field-editing') &&
      (this.isStagingEnvironment || ConfigurationService.isLocalXM)
    );
  }

  private static get isStagingEnvironment(): boolean {
    return ConfigurationService.pagesHostEnvironment === 'staging';
  }
}
