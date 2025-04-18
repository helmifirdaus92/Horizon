/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { ApmService } from '@elastic/apm-rum-angular';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';

@Injectable({
  providedIn: 'root',
})
export class ApmAuthRedirectReporterService {
  private REDIRECTED_TO_AUTHENTICATE_TRANSACTION_TYPE = 'redirected-to-authenticate';

  constructor(private readonly apmService: ApmService) {}

  reportPageLoadAuthRedirect() {
    const pageLoadTransaction = this.apmService.apm.getCurrentTransaction();
    if (pageLoadTransaction) {
      pageLoadTransaction.name = 'Redirected to authenticate';
      pageLoadTransaction.type = this.REDIRECTED_TO_AUTHENTICATE_TRANSACTION_TYPE;
      pageLoadTransaction.end();
    }
  }

  addTenantLabels() {
    this.apmService.apm.addLabels({ xmcTenantId: ConfigurationService.tenantId ?? '' });
  }
}
