/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { inject, Injectable } from '@angular/core';
import { Context } from 'app/shared/client-state/context.service';
import { PageToItemMapper } from 'app/shared/rest/page/page-to-item-mapper';
import { PageApiService } from 'app/shared/rest/page/page.api.service';
import { ExecuteWorkflowCommandRequest, ExecuteWorkflowCommandResult } from 'app/shared/rest/page/page.types';
import { map, Observable } from 'rxjs';
import { BaseWorkflowDalService, ExecuteWorkflowCommandOutput } from '../workflow.dal.service';

@Injectable()
export class WorkflowDalRestService extends BaseWorkflowDalService {
  private readonly pageApiService = inject(PageApiService);
  constructor() {
    super();
  }

  executeCommand(
    commandId: string,
    comments: string,
    { itemId, itemVersion, language, siteName }: Context,
  ): Observable<ExecuteWorkflowCommandOutput | undefined> {
    const executeWorkflowCommandRequest: ExecuteWorkflowCommandRequest = {
      pageVersion: itemVersion,
      site: siteName,
      language,
      commandId,
      comments,
    };

    return this.pageApiService
      .executeWorkflow(itemId, executeWorkflowCommandRequest)
      .pipe(
        map((pageResponse: ExecuteWorkflowCommandResult | undefined) =>
          PageToItemMapper.mapExecuteWorkflowResult(pageResponse),
        ),
      );
  }
}
