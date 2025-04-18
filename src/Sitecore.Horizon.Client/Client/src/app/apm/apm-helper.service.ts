/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { Span, Transaction } from '@elastic/apm-rum';
import { ApmService } from '@elastic/apm-rum-angular';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { RenderingHostResolverService } from 'app/shared/rendering-host/rendering-host-resolver.service';

@Injectable({
  providedIn: 'root',
})
export class ApmHelperService {
  private CANVAS_PAGE_LOAD_TRANSACTION_TYPE = 'canvas-page-load';

  private canvasPageLoadTransaction: Transaction | undefined;
  private canvasPageLoadSpan: Span | undefined;

  constructor(
    private readonly apmService: ApmService,
    private readonly renderingHostResolverService: RenderingHostResolverService,
  ) {}

  reportCanvasPageLoadStart(url: string) {
    const renderingHostUrl = this.renderingHostResolverService.hostUrl?.toLocaleLowerCase();
    const psoEnabled = !!renderingHostUrl && url.toLowerCase().includes(renderingHostUrl);
    const transactionName = `${psoEnabled ? '[PSO] ' : ''}Canvas page load. Tenant Id: ${ConfigurationService.tenantId}`;
    this.canvasPageLoadTransaction = this.apmService.apm.startTransaction(
      transactionName,
      this.CANVAS_PAGE_LOAD_TRANSACTION_TYPE,
    );
    this.canvasPageLoadTransaction?.addLabels({ canvasUrl: url });
    this.canvasPageLoadTransaction?.addLabels({ psoEnabled: psoEnabled });
    this.canvasPageLoadSpan = this.canvasPageLoadTransaction?.startSpan('Canvas page load span');
  }

  reportCanvasPageLoadComplete() {
    this.canvasPageLoadSpan?.end();
    this.canvasPageLoadTransaction?.end();
  }
}
