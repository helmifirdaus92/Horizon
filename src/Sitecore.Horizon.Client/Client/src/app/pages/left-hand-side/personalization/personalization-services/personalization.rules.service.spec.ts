/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { RuleAction } from 'app/editor/shared/layout/page-layout-definition';
import { of } from 'rxjs';
import { PersonalizationDalService } from './personalization.dal.service';
import { PersonalizationRuleInfo, PersonalizationRulesService } from './personalization.rules.service';

describe(PersonalizationRulesService.name, () => {
  let sut: PersonalizationRulesService;
  let personalizationDalService: jasmine.SpyObj<PersonalizationDalService>;

  const personalizationRuleInfoResponse: PersonalizationRuleInfo = {
    defaultRuleName: 'defaultRuleName001',
    defaultRuleUniqueId: 'defaultRuleUniqueId001',
    conditions: {
      alwaysTrueConditionTemplate:
        '<conditions><condition uid="ConditionUniqueIdPlaceholder" id="{4888ABBB-F17D-4485-B14B-842413F88732}" /></conditions>',
      audienceVisitorFilterConditionTemplate:
        '<conditions><condition uid="ConditionUniqueIdPlaceholder" id="{069E341B-1AD7-4733-8C9F-48B754F81C6D}" VariantName="VariantValuePlaceholder" /></conditions>',
      uniqueIdPlaceholder: 'ConditionUniqueIdPlaceholder',
      ruleIdAttributeName: 'id',
      alwaysTrueRuleId: '{4888ABBB-F17D-4485-B14B-842413F88732}',
      audienceVisitorInVariantRuleId: '{8E7426A4-12ED-4C44-8625-E7191860E726}',
      variantAttributeName: 'VariantName',
      variantValuePlaceholder: 'VariantValuePlaceholder',
    },
    actions: {
      hideRenderingActionId: 'hideRenderingActionId001',
      setDatasourceActionId: 'setDatasourceActionId001',
      setRenderingActionId: 'setRenderingActionId001',
      setRenderingParametersActionId: 'setRenderingParametersActionId001',
    },
  };

  beforeEach(() => {
    personalizationDalService = jasmine.createSpyObj<PersonalizationDalService>({
      getRuleInfo: of(personalizationRuleInfoResponse),
    });

    TestBed.configureTestingModule({
      providers: [
        PersonalizationRulesService,
        {
          provide: PersonalizationDalService,
          useValue: personalizationDalService,
        },
      ],
    });
    sut = TestBed.inject(PersonalizationRulesService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('getRuleInfo', async () => {
    expect(await sut.getRuleInfo()).toBe(personalizationRuleInfoResponse);
  });

  it('buildHideRenderingRule', async () => {
    const variantId = 'variantId001';
    const actions: RuleAction[] = [
      { id: 'actionId001', uniqueId: 'uniqueId001' },
      { id: 'actionId002', uniqueId: 'uniqueId002' },
    ];
    const rule = await sut.buildVariantRule(variantId, actions);

    expect(rule.conditions).toContain(variantId);
    expect(rule.actions).toBe(actions);
  });

  it('buildDefaultRule', async () => {
    const actions: RuleAction[] = [
      { id: 'actionId001', uniqueId: 'uniqueId001' },
      { id: 'actionId002', uniqueId: 'uniqueId002' },
    ];
    const rule = await sut.buildDefaultRule(actions);

    expect(rule.name).toBe(personalizationRuleInfoResponse.defaultRuleName);
    expect(rule.uniqueId).toBe(personalizationRuleInfoResponse.defaultRuleUniqueId);
    expect(rule.conditions).toContain('{4888ABBB-F17D-4485-B14B-842413F88732}');
    expect(rule.actions).toBe(actions);
  });

  it('buildSetDataSourceAction', async () => {
    const dataSourceId = 'dataSourceId001';
    const action = await sut.buildSetDataSourceAction(dataSourceId);

    expect(action.id).toBe(personalizationRuleInfoResponse.actions.setDatasourceActionId);
    expect(action.dataSource).toBe(dataSourceId);
  });

  it('buildSetRenderingAction', async () => {
    const renderingId = 'renderingId001';
    const action = await sut.buildSetRenderingAction(renderingId);

    expect(action.id).toBe(personalizationRuleInfoResponse.actions.setRenderingActionId);
    expect(action.renderingItem).toBe(renderingId);
  });

  it('buildHideRenderingAction', async () => {
    const action = await sut.buildHideRenderingAction();

    expect(action.id).toBe(personalizationRuleInfoResponse.actions.hideRenderingActionId);
    expect(action.dataSource).toBe(undefined);
  });

  it('buildSetRenderingParametersAction', async () => {
    const renderingParameters = { param1: 'value1', param2: 'value2' };
    const action = await sut.buildSetRenderingParametersAction(renderingParameters);

    expect(action.id).toBe(personalizationRuleInfoResponse.actions.setRenderingParametersActionId);
    expect(action.renderingParameters).toBe(renderingParameters);
  });

  it('getConditionsCompareFn', async () => {
    const variantCondition1 =
      '<conditions><condition uid="uid1" id="{8E7426A4-12ED-4C44-8625-E7191860E726}" VariantName="variantID1" /></conditions>';
    const variantCondition2 =
      '<conditions><condition uid="uid2" id="{8E7426A4-12ED-4C44-8625-E7191860E726}" VariantName="variantID1" /></conditions>';
    const variantCondition3 =
      '<conditions><condition uid="uid3" id="{8E7426A4-12ED-4C44-8625-E7191860E726}" VariantName="variantID2" /></conditions>';
    const alwaysTrueCondition1 =
      '<conditions><condition uid="uid4" id="{4888ABBB-F17D-4485-B14B-842413F88732}" /></conditions>';
    const alwaysTrueCondition2 =
      '<conditions><condition uid="uid5" id="{4888ABBB-F17D-4485-B14B-842413F88732}" /></conditions>';

    const isSameCondition = await sut.getConditionsCompareFn();

    expect(isSameCondition(variantCondition1, variantCondition2)).toBe(true);
    expect(isSameCondition(variantCondition1, variantCondition3)).toBe(false);
    expect(isSameCondition(variantCondition1, alwaysTrueCondition1)).toBe(false);
    expect(isSameCondition(alwaysTrueCondition1, alwaysTrueCondition2)).toBe(true);
  });

  it('getConditionVariantCompareFn', async () => {
    const variantCondition =
      '<conditions><condition uid="uid1" id="{8E7426A4-12ED-4C44-8625-E7191860E726}" VariantName="VariantID1" /></conditions>';
    const alwaysTrueCondition =
      '<conditions><condition uid="uid4" id="{4888ABBB-F17D-4485-B14B-842413F88732}" /></conditions>';

    const isSameVariant = await sut.getConditionVariantCompareFn();

    expect(isSameVariant(variantCondition, 'VariantID1')).toBe(true);
    expect(isSameVariant(alwaysTrueCondition, 'VariantID1')).toBe(false);
  });
});
