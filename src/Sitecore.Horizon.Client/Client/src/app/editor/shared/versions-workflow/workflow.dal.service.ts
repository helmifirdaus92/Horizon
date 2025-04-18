/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { inject, Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Context } from 'app/shared/client-state/context.service';
import { extractGqlErrorCode } from 'app/shared/utils/graphql.utils';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export type ValidatorResult = 'Unknown' | 'Valid' | 'Suggestion' | 'Warning' | 'Error' | 'CriticalError' | 'FatalError';

export interface ItemValidationRecord {
  validatorResult: ValidatorResult;
  validatorTitle: string;
  validatorDescription: string;
  validatorText: string;
  errors: string[];
}

export interface FieldValidationResult {
  fieldName: string;
  fieldItemId: string;
  records: ItemValidationRecord[];
}

export interface ItemValidationResult {
  itemId: string;
  itemName: string;
  itemRulesResult: ItemValidationRecord[];
  fieldRulesResult: FieldValidationResult[];
}

export interface ValidationResult {
  pageItemResult?: ItemValidationResult;
  defaultDatasourceItemsResult: ItemValidationResult[];
  personalizedDatasourceItemsResult?: [ItemValidationResult];
}

export interface ExecuteWorkflowCommandOutput {
  completed: boolean;
  error: string;
  datasourcesCommandResult: Array<{
    completed: boolean;
    error: string;
  }>;
  pageWorkflowValidationResult?: ValidationResult;
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const queries = require('graphql-tag/loader!./workflow.graphql');

export const EXECUTE_COMMAND_MUTATION = queries['ExecuteCommand'];

@Injectable({ providedIn: 'root' })
export abstract class BaseWorkflowDalService {
  constructor() {}

  abstract executeCommand(
    commandId: string,
    comments: string,
    { itemId, itemVersion, language, siteName }: Context,
  ): Observable<ExecuteWorkflowCommandOutput | undefined>;
}

@Injectable()
export class WorkflowDalService extends BaseWorkflowDalService {
  private readonly apollo = inject(Apollo);
  constructor() {
    super();
  }

  executeCommand(
    commandId: string,
    comments: string,
    { itemId, itemVersion, language, siteName }: Context,
  ): Observable<ExecuteWorkflowCommandOutput | undefined> {
    return this.apollo
      .mutate<{ executeWorkflowCommand: ExecuteWorkflowCommandOutput }>({
        mutation: EXECUTE_COMMAND_MUTATION,
        variables: {
          input: {
            itemId,
            itemVersion,
            commandId,
            comments,
            language,
            site: siteName,
          },
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => (data ? data.executeWorkflowCommand : undefined)),
      );
  }
}
