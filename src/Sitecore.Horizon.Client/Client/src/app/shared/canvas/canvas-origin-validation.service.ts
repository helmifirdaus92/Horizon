/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { first } from 'rxjs/operators';
import { Configuration, ConfigurationService } from '../configuration/configuration.service';
import { LoggingService } from '../logging.service';
import { RenderingHostResolverService } from '../rendering-host/rendering-host-resolver.service';
import { isSameHost, isSameUrl } from '../utils/url.utils';

@Injectable({ providedIn: 'root' })
export class CanvasOriginValidationService {
  static readonly HOST_VERIFICATION_TOKEN_KEY = 'HOST_VERIFICATION_TOKEN';

  private configuration: Configuration | null = null;

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly logger: LoggingService,
    private readonly renderingHostResolverService: RenderingHostResolverService,
  ) {
    this.configurationService.configuration$.pipe(first()).subscribe((val) => (this.configuration = val));
  }

  reviewConnectionRequest({
    clientId,
    origin,
    extras,
  }: {
    clientId: string;
    origin: string;
    extras?: Record<string, string>;
  }): 'IGNORE_ATTEMPT' | 'ACCEPT' | 'REJECT' {
    // Skip the connection while we don't have host configuration.
    // Assume that configuration is ready on subsequent attempts.
    if (this.configuration === null) {
      return 'IGNORE_ATTEMPT';
    }

    if (isSameUrl(origin, ConfigurationService.xmCloudTenant?.url)) {
      return 'ACCEPT';
    }

    if (isSameHost(origin, this.renderingHostResolverService.hostUrl)) {
      return 'ACCEPT';
    }

    const canvasHostVerificationKey = extras?.[CanvasOriginValidationService.HOST_VERIFICATION_TOKEN_KEY];
    if (
      !!this.configuration.hostVerificationToken &&
      canvasHostVerificationKey === this.configuration.hostVerificationToken
    ) {
      return 'ACCEPT';
    }

    this.logger.error(
      `Rejected incoming connection from canvas because its identity cannot be verified. ` +
        `ClientId: '${clientId}', Origin: '${origin}', Contains host verification token: ${!!canvasHostVerificationKey}.`,
    );
    return 'REJECT';
  }
}
