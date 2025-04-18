/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { ConfigurationService } from '../../configuration/configuration.service';
import { makeAbsoluteUrl } from '../../utils/url.utils';

@Pipe({ name: 'cmUrl', pure: false })
export class CmUrlPipe implements PipeTransform {
  private cachedResult: { input: string; result: string } | null = null;

  transform(relativeUrl: string): string {
    if (this.cachedResult?.input === relativeUrl) {
      return this.cachedResult.result;
    }

    if (!relativeUrl) {
      return '';
    }

    this.cachedResult = {
      input: relativeUrl,
      result: makeAbsoluteUrl(relativeUrl, ConfigurationService.xmCloudTenant?.url || ''),
    };
    return this.cachedResult.result;
  }
}
