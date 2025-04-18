/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { Rule, RuleAction } from 'app/editor/shared/layout/page-layout-definition';
import { firstValueFrom } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { PersonalizationDalService } from './personalization.dal.service';

export interface PersonalizationRuleInfo {
  defaultRuleName: string;
  defaultRuleUniqueId: string;
  conditions: {
    alwaysTrueConditionTemplate: string;
    alwaysTrueRuleId: string;
    audienceVisitorFilterConditionTemplate: string;
    ruleIdAttributeName: string;
    uniqueIdPlaceholder: string;
    variantAttributeName: string;
    variantValuePlaceholder: string;
    audienceVisitorInVariantRuleId: string;
  };
  actions: {
    hideRenderingActionId: string;
    setDatasourceActionId: string;
    setRenderingActionId: string;
    setRenderingParametersActionId: string;
  };
}

export function getXmlCondition(condition: string | undefined) {
  return new DOMParser().parseFromString(condition ?? '', 'text/xml').querySelector('condition');
}

@Injectable()
export class PersonalizationRulesService {
  private _ruleInfo?: PersonalizationRuleInfo;

  constructor(private personalizationDalService: PersonalizationDalService) {}

  async getRuleInfo(): Promise<PersonalizationRuleInfo> {
    if (!this._ruleInfo) {
      this._ruleInfo = await firstValueFrom(this.personalizationDalService.getRuleInfo());
    }
    return this._ruleInfo;
  }

  async buildDefaultRule(actions: RuleAction[]): Promise<Rule> {
    const ruleInfo = await this.getRuleInfo();
    const rule: Rule = {
      uniqueId: ruleInfo.defaultRuleUniqueId,
      name: ruleInfo.defaultRuleName,
      conditions: ruleInfo.conditions.alwaysTrueConditionTemplate.replace(
        ruleInfo.conditions.uniqueIdPlaceholder,
        `${uuid().replace(/-/g, '').toUpperCase()}`,
      ),
      actions,
    };
    return rule;
  }

  async buildVariantRule(variant: string, actions: RuleAction[]): Promise<Rule> {
    const ruleInfo = await this.getRuleInfo();
    return this.buildAudienceVisitorFilterRule(ruleInfo, variant, actions);
  }

  async buildSetDataSourceAction(dataSourceId: string): Promise<RuleAction> {
    const ruleInfo = await this.getRuleInfo();
    const action: RuleAction = {
      uniqueId: `{${uuid().toUpperCase()}}`,
      id: ruleInfo.actions.setDatasourceActionId,
      dataSource: dataSourceId,
    };
    return action;
  }

  async buildSetRenderingAction(renderingId: string): Promise<RuleAction> {
    const ruleInfo = await this.getRuleInfo();
    const action: RuleAction = {
      uniqueId: `{${uuid().toUpperCase()}}`,
      id: ruleInfo.actions.setRenderingActionId,
      renderingItem: renderingId,
    };
    return action;
  }

  async buildHideRenderingAction(): Promise<RuleAction> {
    const ruleInfo = await this.getRuleInfo();
    const action: RuleAction = {
      uniqueId: `{${uuid().toUpperCase()}}`,
      id: ruleInfo.actions.hideRenderingActionId,
    };
    return action;
  }

  async buildSetRenderingParametersAction(parameters: Record<string, string>): Promise<RuleAction> {
    const ruleInfo = await this.getRuleInfo();
    const action: RuleAction = {
      uniqueId: `{${uuid().toUpperCase()}}`,
      id: ruleInfo.actions.setRenderingParametersActionId,
      renderingParameters: parameters,
    };
    return action;
  }

  async getConditionVariantCompareFn(): Promise<(condition: string | undefined, segmentFriendlyId: string) => boolean> {
    const ruleInfo = await this.getRuleInfo();
    const isSameVariant = (condition: string | undefined, variant: string) => {
      const xmlCondition = getXmlCondition(condition);
      const conditionVariant = xmlCondition?.getAttribute(ruleInfo.conditions.variantAttributeName);

      return conditionVariant === variant;
    };

    return isSameVariant;
  }

  async getConditionsCompareFn(): Promise<(left: string | undefined, right: string | undefined) => boolean> {
    const ruleInfo = await this.getRuleInfo();

    const conditionsComparerFn = (leftCondition: string | undefined, rightCondition: string | undefined) => {
      const xmlLeftCondition = getXmlCondition(leftCondition);
      const xmlRightCondition = getXmlCondition(rightCondition);
      if (!xmlLeftCondition || !xmlRightCondition) {
        return leftCondition === rightCondition;
      }

      const getConditionRuleId = (element: Element) => element.getAttribute(ruleInfo.conditions.ruleIdAttributeName);
      const leftConditionRuleId = getConditionRuleId(xmlLeftCondition);
      const rightConditionRuleId = getConditionRuleId(xmlRightCondition);

      const audienceVisitorInVariant = (ruleId: string | null) =>
        ruleId?.toLowerCase() === ruleInfo.conditions.audienceVisitorInVariantRuleId.toLowerCase();
      if (audienceVisitorInVariant(leftConditionRuleId) && audienceVisitorInVariant(rightConditionRuleId)) {
        const getVariant = (element: Element) => element.getAttribute(ruleInfo.conditions.variantAttributeName);
        return getVariant(xmlLeftCondition) === getVariant(xmlRightCondition);
      }

      const isAlwaysTrueCondition = (ruleId: string | null) =>
        ruleId?.toLowerCase() === ruleInfo.conditions.alwaysTrueRuleId.toLowerCase();
      if (isAlwaysTrueCondition(leftConditionRuleId) && isAlwaysTrueCondition(rightConditionRuleId)) {
        return true;
      }

      return leftCondition === rightCondition;
    };
    return conditionsComparerFn;
  }

  private buildAudienceVisitorFilterRule(ruleInfo: PersonalizationRuleInfo, variant: string, actions: RuleAction[]) {
    const rule: Rule = {
      uniqueId: `{${uuid().toUpperCase()}}`,
      name: variant,
      conditions: ruleInfo.conditions.audienceVisitorFilterConditionTemplate
        .replace(ruleInfo.conditions.uniqueIdPlaceholder, `${uuid().replace(/-/g, '').toUpperCase()}`)
        .replace(ruleInfo.conditions.variantValuePlaceholder, variant),
      actions,
    };
    return rule;
  }
}
