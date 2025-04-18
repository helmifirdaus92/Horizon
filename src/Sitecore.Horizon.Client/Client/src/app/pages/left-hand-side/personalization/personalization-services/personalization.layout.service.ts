/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { NgCommandManager } from '@sitecore/ng-page-composer';
import { CanvasServices } from 'app/editor/shared/canvas.services';
import { PersonalizationRules, RenderingDefinition } from 'app/editor/shared/layout/page-layout';
import { Rule, RuleAction } from 'app/editor/shared/layout/page-layout-definition';
import { EditorCommands, RenderingInitializationContext } from 'sdk';
import { PersonalizationRulesService } from './personalization.rules.service';

export interface PersonlizedRenderingInfo {
  renderingId?: string;
  renderingParameters?: Record<string, string>;
  dataSource?: string | null;
}

@Injectable()
export class PersonalizationLayoutService {
  constructor(
    private readonly canvasServices: CanvasServices,
    private readonly personalizationRulesService: PersonalizationRulesService,
    private readonly commandManager: NgCommandManager<EditorCommands>,
  ) {}

  async applyVariantAsDefaultSetup(renderingInstanceId: string, variant: string | undefined, reloadCanvas: boolean) {
    const layout = this.canvasServices.getCurrentLayout();
    const rendering = layout.getRendering(renderingInstanceId);

    if (!variant || !(await this.isVariantUsedInAnyRenderingRule(rendering, variant))) {
      await this.clearPersonalizationForRendering(renderingInstanceId, reloadCanvas, true);
      return;
    }

    const isPersonalizedRenderingHidden = await this.isPersonalizedRenderingHidden(renderingInstanceId, variant);
    if (isPersonalizedRenderingHidden) {
      await layout.removeRendering(renderingInstanceId, true);
      return;
    }

    const variantRuleInfo = await this.getPersonalizedRenderingInfo(renderingInstanceId, variant);
    const newRenderingId = variantRuleInfo?.renderingId ?? rendering.id;
    const newDataSource = variantRuleInfo?.dataSource ?? rendering.dataSource;
    const newRenderingParameters = variantRuleInfo?.renderingParameters ?? rendering.parameters;
    await layout.updateRenderings(
      [
        {
          renderingInstanceId,
          update: {
            dataSource: newDataSource,
            id: newRenderingId,
            parameters: newRenderingParameters,
            personalization: {},
          },
        },
      ],
      { reloadCanvas, skipHistory: true },
    );
  }

  async clearPersonalizationForRendering(renderingInstanceId: string, reloadCanvas: boolean, skipHistory: boolean) {
    await this.canvasServices.getCurrentLayout().updateRenderings(
      [
        {
          renderingInstanceId,
          update: {
            personalization: {},
          },
        },
      ],
      { reloadCanvas, skipHistory },
    );
  }

  async addSetDataSourcePersonalizationRule(
    renderingInstanceId: string,
    variant: string | undefined,
    datasourceId: string,
    reloadCanvas: boolean = true,
  ) {
    const action = await this.personalizationRulesService.buildSetDataSourceAction(datasourceId);
    const newRule = variant
      ? await this.personalizationRulesService.buildVariantRule(variant, [action])
      : await this.personalizationRulesService.buildDefaultRule([action]);

    return this.addPersonalizationRule(renderingInstanceId, newRule, reloadCanvas);
  }

  async addSetRenderingPersonalizationRule(
    renderingInstanceId: string,
    variant: string | undefined,
    renderingId: string,
  ) {
    const action = await this.personalizationRulesService.buildSetRenderingAction(renderingId);
    const newRule = variant
      ? await this.personalizationRulesService.buildVariantRule(variant, [action])
      : await this.personalizationRulesService.buildDefaultRule([action]);

    this.addPersonalizationRule(renderingInstanceId, newRule);
  }

  async addSetRenderingParametersPersonalizationRule(
    renderingInstanceId: string,
    variant: string | undefined,
    parameters: Record<string, string>,
    reloadCanvas: boolean = true,
  ) {
    const action = await this.personalizationRulesService.buildSetRenderingParametersAction(parameters);
    const newRule = variant
      ? await this.personalizationRulesService.buildVariantRule(variant, [action])
      : await this.personalizationRulesService.buildDefaultRule([action]);

    this.addPersonalizationRule(renderingInstanceId, newRule, reloadCanvas);
  }

  async addHideRenderingPersonalizationRule(renderingInstanceId: string, variant: string | undefined) {
    const action = await this.personalizationRulesService.buildHideRenderingAction();
    const newRule = variant
      ? await this.personalizationRulesService.buildVariantRule(variant, [action])
      : await this.personalizationRulesService.buildDefaultRule([action]);

    this.addPersonalizationRule(renderingInstanceId, newRule);
  }

  async addRenderingDetailsPersonalizationRule(
    renderingInstanceId: string,
    variant: string,
    renderingRulesUpdate: PersonlizedRenderingInfo,
    reloadCanvas: boolean = true,
  ) {
    const actions: RuleAction[] = [];

    if (renderingRulesUpdate.dataSource) {
      actions.push(await this.personalizationRulesService.buildSetDataSourceAction(renderingRulesUpdate.dataSource));
    }

    if (renderingRulesUpdate.renderingId) {
      actions.push(await this.personalizationRulesService.buildSetRenderingAction(renderingRulesUpdate.renderingId));
    }

    if (renderingRulesUpdate.renderingParameters) {
      const setRenderingParametersAction = await this.personalizationRulesService.buildSetRenderingParametersAction(
        renderingRulesUpdate.renderingParameters,
      );
      actions.push(setRenderingParametersAction);
    }

    const newRule = await this.personalizationRulesService.buildVariantRule(variant, actions);

    await this.addPersonalizationRule(renderingInstanceId, newRule, reloadCanvas);
  }

  async invokeInsertRenderingAction(context: RenderingInitializationContext): Promise<RenderingInitializationContext> {
    return await this.commandManager.invoke('pages:editor:rendering:insert', context);
  }

  async removeHideRenderingPersonalizationRule(renderingInstanceId: string, variant: string | undefined) {
    const hideRenderingActionId = (await this.personalizationRulesService.getRuleInfo()).actions.hideRenderingActionId;
    const defaultRuleUniqueId = (await this.personalizationRulesService.getRuleInfo()).defaultRuleUniqueId;
    const rules = this.canvasServices.getCurrentLayout().getRenderingPersonalizationRules(renderingInstanceId);
    const activeRule = await this.getPersonalizationRule(renderingInstanceId, variant);

    let rulesUpdates: Rule[];

    if (!rules.length || !activeRule) {
      return;
    }

    rulesUpdates = rules;
    activeRule.actions = activeRule?.actions?.filter((action) => action.id !== hideRenderingActionId);
    if (!activeRule.actions?.length && activeRule.uniqueId !== defaultRuleUniqueId) {
      rulesUpdates = rulesUpdates.filter((rule) => rule.uniqueId !== activeRule.uniqueId);
    }

    await this.canvasServices
      .getCurrentLayout()
      .setRenderingsPersonalizationRules([{ renderingInstanceId, rules: rulesUpdates }]);
  }

  async removePersonalizationRulesFromLayout(variant: string): Promise<void> {
    const renderings = this.canvasServices.getCurrentLayout().getAllRenderings();
    const renderingsRulesUpdates: PersonalizationRules[] = [];
    const isSameVariant = await this.personalizationRulesService.getConditionVariantCompareFn();

    renderings.forEach((r) => {
      const rules = r.personalization?.ruleSet?.rules.filter((rule) => !isSameVariant(rule.conditions, variant));
      if (rules) {
        renderingsRulesUpdates.push({ renderingInstanceId: r.instanceId, rules });
      }
    });

    if (renderingsRulesUpdates.length) {
      await this.canvasServices.getCurrentLayout().setRenderingsPersonalizationRules(renderingsRulesUpdates, false);
    }
  }

  async removePersonalizationRuleFromRendering(
    renderingInstanceId: string,
    variant: string | undefined,
    reloadCanvas = true,
  ): Promise<void> {
    const rules = this.canvasServices.getCurrentLayout().getRenderingPersonalizationRules(renderingInstanceId);

    let rulesUpdates: Rule[];

    if (!rules.length) {
      return;
    }

    if (variant) {
      const isSameVariant = await this.personalizationRulesService.getConditionVariantCompareFn();

      rulesUpdates = rules.filter((rule) => !isSameVariant(rule.conditions, variant));
    } else {
      const defaultRuleUniqueId = (await this.personalizationRulesService.getRuleInfo()).defaultRuleUniqueId;
      const defaultRule = rules.find((rule) => rule.uniqueId === defaultRuleUniqueId);

      rulesUpdates = rules;

      if (defaultRule) {
        defaultRule.actions = undefined;
      }
    }

    await this.canvasServices
      .getCurrentLayout()
      .setRenderingsPersonalizationRules([{ renderingInstanceId, rules: rulesUpdates }], reloadCanvas);
  }

  async getPersonalizedRenderingDataSource(
    renderingInstanceId: string,
    variant: string | undefined,
  ): Promise<string | undefined> {
    const activeRule = await this.getPersonalizationRule(renderingInstanceId, variant);
    const { setDatasourceActionId } = (await this.personalizationRulesService.getRuleInfo()).actions;

    const datasourceId = this.getActionFromRule(activeRule, setDatasourceActionId)?.dataSource;

    return datasourceId;
  }

  async getPersonalizedReplacedRenderingId(
    renderingInstanceId: string,
    variant: string | undefined,
  ): Promise<string | undefined> {
    const activeRule = await this.getPersonalizationRule(renderingInstanceId, variant);

    const { setRenderingActionId } = (await this.personalizationRulesService.getRuleInfo()).actions;

    const replacedRenderingId = this.getActionFromRule(activeRule, setRenderingActionId)?.renderingItem;

    return replacedRenderingId;
  }

  async getPersonalizedRenderingParameters(
    renderingInstanceId: string,
    variant: string | undefined,
  ): Promise<Record<string, string> | undefined> {
    const activeRule = await this.getPersonalizationRule(renderingInstanceId, variant);
    const { setRenderingParametersActionId } = (await this.personalizationRulesService.getRuleInfo()).actions;

    const renderingParameters = this.getActionFromRule(activeRule, setRenderingParametersActionId)?.renderingParameters;

    return renderingParameters;
  }

  async getPersonalizedRenderingInfo(
    renderingInstanceId: string,
    variant: string | undefined,
  ): Promise<PersonlizedRenderingInfo | undefined> {
    const activeRule = await this.getPersonalizationRule(renderingInstanceId, variant);
    const { setRenderingParametersActionId, setDatasourceActionId, setRenderingActionId } = (
      await this.personalizationRulesService.getRuleInfo()
    ).actions;

    const renderingParameters = this.getActionFromRule(activeRule, setRenderingParametersActionId)?.renderingParameters;
    const renderingId = this.getActionFromRule(activeRule, setRenderingActionId)?.renderingItem;
    const dataSource = this.getActionFromRule(activeRule, setDatasourceActionId)?.dataSource;

    return {
      renderingId,
      renderingParameters,
      dataSource,
    };
  }

  async isPersonalizedRenderingHidden(renderingInstanceId: string, variant: string | undefined): Promise<boolean> {
    const activeRule = await this.getPersonalizationRule(renderingInstanceId, variant);
    const { hideRenderingActionId } = (await this.personalizationRulesService.getRuleInfo()).actions;

    return !!activeRule?.actions?.find((action) => action.id === hideRenderingActionId);
  }

  async isVariantUsedInAnyRule(variant: string): Promise<boolean> {
    const renderings = this.canvasServices.getCurrentLayout().getAllRenderings();

    const results = await Promise.all(
      renderings.map((rendering) => this.isVariantUsedInAnyRenderingRule(rendering, variant)),
    );
    return results.some((result) => result);
  }

  private async isVariantUsedInAnyRenderingRule(rendering: RenderingDefinition, variant: string): Promise<boolean> {
    const isSameVariant = await this.personalizationRulesService.getConditionVariantCompareFn();
    const defaultRuleUniqueId = (await this.personalizationRulesService.getRuleInfo()).defaultRuleUniqueId;

    if (!rendering.personalization?.ruleSet?.rules) {
      return false;
    }

    const rule = this.findPersonalizationRule(
      rendering.personalization?.ruleSet?.rules,
      variant,
      isSameVariant,
      defaultRuleUniqueId,
    );

    return rule != undefined;
  }

  private async getPersonalizationRule(
    renderingInstanceId: string,
    variant: string | undefined,
  ): Promise<Rule | undefined> {
    const isSameVariant = await this.personalizationRulesService.getConditionVariantCompareFn();
    const defaultRuleUniqueId = (await this.personalizationRulesService.getRuleInfo()).defaultRuleUniqueId;
    const rules = this.canvasServices.getCurrentLayout().getRenderingPersonalizationRules(renderingInstanceId);

    return this.findPersonalizationRule(rules, variant, isSameVariant, defaultRuleUniqueId);
  }

  private findPersonalizationRule(
    rules: Rule[],
    variant: string | undefined,
    isSameVariant: (condition: string | undefined, variant: string) => boolean,
    defaultRuleUniqueId: string,
  ): Rule | undefined {
    let activeRule: Rule | undefined;

    if (variant) {
      activeRule = rules.find((rule: Rule) => isSameVariant(rule.conditions, variant));
    } else {
      activeRule = rules.find((rule: Rule) => rule.uniqueId === defaultRuleUniqueId);
    }

    return activeRule;
  }

  private async addPersonalizationRule(renderingInstanceId: string, newRule: Rule, reloadCanvas: boolean = true) {
    let rulesToSave: Rule[];

    const existentRules = this.canvasServices.getCurrentLayout().getRenderingPersonalizationRules(renderingInstanceId);

    if (existentRules.length) {
      rulesToSave = await this.mergeWithExistentRules(existentRules, newRule);
    } else {
      const defaultRule = await this.personalizationRulesService.buildDefaultRule([]);
      const isDefaultRule = (rule: Rule): boolean => rule.uniqueId === defaultRule.uniqueId;

      rulesToSave = isDefaultRule(newRule) ? [newRule] : [newRule, defaultRule];
    }

    await this.canvasServices
      .getCurrentLayout()
      .setRenderingsPersonalizationRules([{ renderingInstanceId, rules: rulesToSave }], reloadCanvas);
  }

  private async mergeWithExistentRules(existentRules: Rule[], newRule: Rule): Promise<Rule[]> {
    const isSameCondition = await this.personalizationRulesService.getConditionsCompareFn();
    const ruleWithSameCondition = existentRules?.find((rule) => isSameCondition(rule.conditions, newRule.conditions));

    if (!ruleWithSameCondition) {
      existentRules.unshift(newRule);
      return existentRules;
    }

    const newActions = newRule.actions ?? [];
    if (newActions.length === 0) {
      return existentRules;
    }

    if (!ruleWithSameCondition.actions) {
      ruleWithSameCondition.actions = newActions;
      return existentRules;
    }

    ruleWithSameCondition.actions = [
      // filter out actions with same id
      ...ruleWithSameCondition.actions.filter((action) => !newActions.some((newAction) => newAction.id === action.id)),
      ...newActions,
    ];

    return existentRules;
  }

  private getActionFromRule(rule: Rule | undefined, actionId: string): RuleAction | undefined {
    return rule?.actions?.find((action) => action.id === actionId);
  }
}
