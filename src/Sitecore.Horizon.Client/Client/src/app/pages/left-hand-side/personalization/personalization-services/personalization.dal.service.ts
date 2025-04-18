/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { Item } from 'app/shared/graphql/item.interface';
import { extractGqlErrorCode } from 'app/shared/utils/graphql.utils';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PersonalizationRuleInfo } from './personalization.rules.service';

export const GET_RULES_INFO = gql`
  {
    personalizationRuleInfo {
      defaultRuleName
      defaultRuleUniqueId
      conditions {
        alwaysTrueConditionTemplate
        alwaysTrueRuleId
        audienceVisitorFilterConditionTemplate
        audienceVisitorInVariantRuleId
        ruleIdAttributeName
        uniqueIdPlaceholder
        variantAttributeName
        variantValuePlaceholder
      }
      actions {
        hideRenderingActionId
        setDatasourceActionId
        setRenderingActionId
      }
    }
  }
`;

export const GET_RULES_INFO_WITH_PARAMETERS_ACTION = gql`
  {
    personalizationRuleInfo {
      defaultRuleName
      defaultRuleUniqueId
      conditions {
        alwaysTrueConditionTemplate
        alwaysTrueRuleId
        audienceVisitorFilterConditionTemplate
        audienceVisitorInVariantRuleId
        ruleIdAttributeName
        uniqueIdPlaceholder
        variantAttributeName
        variantValuePlaceholder
      }
      actions {
        hideRenderingActionId
        setDatasourceActionId
        setRenderingActionId
        setRenderingParametersActionId
      }
    }
  }
`;

export const DELETE_LAYOUT_RULES_MUTATION = gql`
  mutation DeleteLayoutRules($input: DeleteLayoutRulesInput!) {
    deleteLayoutRules(input: $input) {
      item {
        id
      }
      success
    }
  }
`;

export interface DeleteLayoutRulesInput {
  path: string;
  language: string;
  siteName: string;
  VariantId: string;
}

@Injectable({ providedIn: 'root' })
export class PersonalizationDalService {
  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly apollo: Apollo,
  ) {}

  getRuleInfo(): Observable<PersonalizationRuleInfo> {
    return this.apollo
      .query<{ personalizationRuleInfo: PersonalizationRuleInfo }>({
        query: this.configurationService.isParametersPersonalizationEnabled()
          ? GET_RULES_INFO_WITH_PARAMETERS_ACTION
          : GET_RULES_INFO,
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => data.personalizationRuleInfo),
      );
  }

  deleteLayoutRulesForAllVersions(deleteLayoutRulesInput: DeleteLayoutRulesInput): Observable<Item> {
    return this.apollo
      .mutate<{ deleteLayoutRules: { item: Item } }>({
        mutation: DELETE_LAYOUT_RULES_MUTATION,
        variables: {
          input: {
            path: deleteLayoutRulesInput.path,
            language: deleteLayoutRulesInput.language,
            site: deleteLayoutRulesInput.siteName,
            variantId: deleteLayoutRulesInput.VariantId,
          },
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => data!.deleteLayoutRules.item),
      );
  }
}
