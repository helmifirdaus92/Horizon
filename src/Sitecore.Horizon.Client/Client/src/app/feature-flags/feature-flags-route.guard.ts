/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';

@Injectable()
export class FeatureFlagsRouteGuard implements CanActivate {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    return this.featureFlagsService.isFeatureEnabled(route.data.featureFlag);
  }
}
