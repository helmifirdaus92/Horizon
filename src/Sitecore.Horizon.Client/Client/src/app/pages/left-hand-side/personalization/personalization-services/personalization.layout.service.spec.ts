/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { NgCommandManager } from '@sitecore/ng-page-composer';
import { CanvasLayoutServices, CanvasServices } from 'app/editor/shared/canvas.services';
import { PersonalizationRules } from 'app/editor/shared/layout/page-layout';
import { Rule, RuleAction } from 'app/editor/shared/layout/page-layout-definition';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { EditorCommands } from 'sdk';
import { PersonalizationLayoutService } from './personalization.layout.service';
import { PersonalizationRuleInfo, PersonalizationRulesService } from './personalization.rules.service';

describe(PersonalizationLayoutService.name, () => {
  let sut: PersonalizationLayoutService;
  let personalizationRulesServiceSpy: jasmine.SpyObj<PersonalizationRulesService>;
  let canvasServices: jasmine.SpyObj<CanvasServices>;
  let canvasLayoutServices: jasmine.SpyObj<CanvasLayoutServices>;
  let ngCommandManagerSpy: jasmine.SpyObj<NgCommandManager<EditorCommands>>;

  const testRenderings = [
    {
      instanceId: 'rendering1',
      personalization: {
        ruleSet: {
          rules: [buildRule('id1', 'Rule1', 'Condition1')],
        },
      },
    },
    {
      instanceId: 'rendering2',
      personalization: {
        ruleSet: {
          rules: [buildRule('id1', 'Rule1', 'Condition1'), buildRule('id2', 'Rule2', 'Condition2')],
        },
      },
    },
  ];

  function buildRule(uniqueId: string, ruleName: string, ruleConditions: string): Rule {
    const rule: Rule = {
      uniqueId,
      name: ruleName,
      conditions: ruleConditions,
      actions: [
        {
          uniqueId: 'uniqueId1',
          id: 'id1',
          dataSource: 'datasourceid1',
          renderingItem: 'renderingItemId',
          renderingParameters: { foo: 'bar' },
        },
      ],
    };
    return rule;
  }

  function getRulesInfo(): PersonalizationRuleInfo {
    return {
      defaultRuleName: 'defaultRuleName001',
      defaultRuleUniqueId: 'defaultRuleUniqueId001',
      conditions: {
        alwaysTrueConditionTemplate: '',
        audienceVisitorFilterConditionTemplate: '',
        uniqueIdPlaceholder: '',
        ruleIdAttributeName: '',
        alwaysTrueRuleId: '',
        audienceVisitorInVariantRuleId: '',
        variantAttributeName: '',
        variantValuePlaceholder: 'VariantValuePlaceholder',
      },
      actions: {
        hideRenderingActionId: 'hideRenderingActionId001',
        setDatasourceActionId: 'setDatasourceActionId001',
        setRenderingActionId: 'setRenderingActionId001',
        setRenderingParametersActionId: 'setRenderingParametersActionId001',
      },
    };
  }

  function getPersonalizationRules(): Rule[] {
    const rules = [
      {
        uniqueId: 'rule1',
        name: 'rule1',
        conditions: 'variant01',
        actions: [
          {
            uniqueId: 'rule1_action1',
            id: 'setDatasourceActionId001',
            dataSource: 'ds-1',
          },
          {
            uniqueId: 'rule1_action2',
            id: 'hideRenderingActionId001',
          },
        ],
        parameters: { test: 'true' },
      },
      {
        uniqueId: 'rule2',
        name: 'rule2',
        conditions: 'variant02',
        actions: [
          {
            uniqueId: 'rule2_action2',
            id: 'hideRenderingActionId001',
          },
        ],
        parameters: { test: 'true' },
      },
      {
        uniqueId: 'rule3',
        name: 'rule3',
        conditions: 'variant03',
        actions: [
          {
            uniqueId: 'rule3_action3',
            id: 'setRenderingActionId001',
            renderingItem: 'renderingItemID',
          },
        ],
        parameters: { test: 'true' },
      },
      {
        uniqueId: 'rule4',
        name: 'rule4',
        conditions: 'variant04',
        actions: [
          {
            uniqueId: 'rule4_action4',
            id: 'setRenderingParametersActionId001',
            renderingParameters: { foo: 'bar' },
          },
        ],
        parameters: { test: 'true' },
      },
      {
        uniqueId: 'multiaction-rule5',
        name: 'multiaction-rule5',
        conditions: 'variant05',
        actions: [
          {
            uniqueId: 'rule5_action1',
            id: 'setDatasourceActionId001',
            dataSource: 'ds-1',
          },
          {
            uniqueId: 'rule5_action2',
            id: 'setRenderingActionId001',
            renderingItem: 'renderingItemID',
          },
          {
            uniqueId: 'rule5_action3',
            id: 'setRenderingParametersActionId001',
            renderingParameters: { foo: 'bar' },
          },
        ],
        parameters: { test: 'true' },
      },
    ];
    return [...rules];
  }

  beforeEach(() => {
    personalizationRulesServiceSpy = jasmine.createSpyObj<PersonalizationRulesService>('PersonalizationRulesService', [
      'buildDefaultRule',
      'buildSetDataSourceAction',
      'buildSetRenderingAction',
      'buildHideRenderingAction',
      'getRuleInfo',
      'getConditionsCompareFn',
      'getConditionVariantCompareFn',
      'buildSetRenderingParametersAction',
      'buildVariantRule',
    ]);

    TestBed.configureTestingModule({
      providers: [
        PersonalizationLayoutService,
        {
          provide: CanvasServices,
          useValue: jasmine.createSpyObj<CanvasServices>({
            getCurrentLayout: jasmine.createSpyObj<CanvasLayoutServices>([
              'getAllRenderings',
              'setRenderingsPersonalizationRules',
              'getRenderingPersonalizationRules',
            ]),
          }),
        },
        {
          provide: PersonalizationRulesService,
          useValue: personalizationRulesServiceSpy,
        },
        {
          provide: NgCommandManager,
          useValue: jasmine.createSpyObj<NgCommandManager<EditorCommands>>({ invoke: undefined }),
        },
      ],
    });
    sut = TestBed.inject(PersonalizationLayoutService);
  });

  beforeEach(() => {
    canvasServices = TestBedInjectSpy(CanvasServices);
    canvasLayoutServices = canvasServices.getCurrentLayout() as any;

    ngCommandManagerSpy = TestBedInjectSpy(NgCommandManager);
    ngCommandManagerSpy.invoke.and.callFake((_name, ctx) => Promise.resolve(ctx));
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('addSetDataSourcePersonalizationRule()', () => {
    it('should create a datasource action', fakeAsync(async () => {
      // arrange
      const newRule = buildRule('id1', 'testRule1', 'newRuleCondition');
      const defaultRule = buildRule('id2', 'defaultRule', 'defaultRuleCondition');

      personalizationRulesServiceSpy.buildVariantRule.and.returnValue(Promise.resolve(newRule));
      personalizationRulesServiceSpy.buildDefaultRule.and.returnValue(Promise.resolve(defaultRule));
      canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([]);

      // act
      await sut.addSetDataSourcePersonalizationRule('test-rendering-instance-id', 'variant-id', 'datasourceid1');
      tick();

      // assert
      expect(personalizationRulesServiceSpy.buildSetDataSourceAction).toHaveBeenCalledWith('datasourceid1');
      flush();
    }));

    describe('WHEN segemntId is defined AND there is no personalization on rendering', () => {
      it('should set DefaultRule and SetDataSourceRule on rendering personalization', fakeAsync(async () => {
        // arrange
        const newRule = buildRule('id1', 'testRule1', 'newRuleCondition');
        const defaultRule = buildRule('id2', 'defaultRule', 'defaultRuleCondition');

        personalizationRulesServiceSpy.buildVariantRule.and.returnValue(Promise.resolve(newRule));
        personalizationRulesServiceSpy.buildDefaultRule.and.returnValue(Promise.resolve(defaultRule));
        canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([]);

        // act
        await sut.addSetDataSourcePersonalizationRule('test-rendering-instance-id', 'variant-id', 'datasourceid1');
        tick();

        // assert
        expect(canvasLayoutServices.setRenderingsPersonalizationRules).toHaveBeenCalledWith(
          [
            {
              renderingInstanceId: 'test-rendering-instance-id',
              rules: [newRule, defaultRule],
            },
          ],
          true,
        );
        flush();
      }));
    });

    describe('WHEN segemntId is defined AND there are some personalization on rendering', () => {
      describe('AND there is no assigned rule with same variant name', () => {
        it('should add a new SetDatasourceRule to the existent rules', fakeAsync(async () => {
          // arrange
          const newRule = buildRule('id1', 'testRule1', 'newRuleCondition');
          const existentRules = getPersonalizationRules();

          personalizationRulesServiceSpy.buildVariantRule.and.returnValue(Promise.resolve(newRule));
          personalizationRulesServiceSpy.getConditionsCompareFn.and.returnValue(Promise.resolve(() => false));
          canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

          // act
          await sut.addSetDataSourcePersonalizationRule('test-rendering-instance-id', 'variant-id', 'datasourceid1');
          tick();

          // assert
          expect(canvasLayoutServices.setRenderingsPersonalizationRules).toHaveBeenCalledWith(
            [
              {
                renderingInstanceId: 'test-rendering-instance-id',
                rules: [newRule, ...existentRules],
              },
            ],
            true,
          );
          flush();
        }));
      });

      describe('AND there is an assigned rule with same variant name BUT no SetDatasource action', () => {
        it('should add a new SetDataSource action to the rule existent actions', fakeAsync(async () => {
          // arrange
          const newRule = buildRule('id1', 'testRule1', 'newRuleCondition');
          newRule.actions = [
            {
              uniqueId: 'test uniqueId',
              id: getRulesInfo().actions.setDatasourceActionId,
              dataSource: 'test datasourceid',
            },
          ];

          const existentRules = getPersonalizationRules();
          existentRules[0].actions = [
            {
              uniqueId: 'rule1_action1',
              id: 'hideRenderingActionId001',
            },
          ];

          personalizationRulesServiceSpy.buildVariantRule.and.returnValue(Promise.resolve(newRule));
          personalizationRulesServiceSpy.getConditionsCompareFn.and.returnValue(Promise.resolve(() => true));
          canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

          // act
          await sut.addSetDataSourcePersonalizationRule('test-rendering-instance-id', 'variant1', 'datasourceid1');
          tick();

          const expectedRulesUpdates = getPersonalizationRules();
          expectedRulesUpdates[0].actions = [
            {
              uniqueId: 'rule1_action1',
              id: 'hideRenderingActionId001',
            },
            {
              uniqueId: 'test uniqueId',
              id: 'setDatasourceActionId001',
              dataSource: 'test datasourceid',
            },
          ];

          // assert
          expect(canvasLayoutServices.setRenderingsPersonalizationRules).toHaveBeenCalledWith(
            [
              {
                renderingInstanceId: 'test-rendering-instance-id',
                rules: expectedRulesUpdates,
              },
            ],
            true,
          );
          flush();
        }));
      });

      describe('AND there is an assigned rule with same variant name AND SetDatasource action', () => {
        it('should replace the existent SetDataSource action', fakeAsync(async () => {
          // arrange
          const newRule = buildRule('id1', 'testRule1', 'newRuleCondition');
          newRule.actions = [
            {
              uniqueId: 'test uniqueId',
              id: getRulesInfo().actions.setDatasourceActionId,
              dataSource: 'test datasourceid',
            },
          ];

          const existentRules = getPersonalizationRules();

          personalizationRulesServiceSpy.buildVariantRule.and.returnValue(Promise.resolve(newRule));
          personalizationRulesServiceSpy.getConditionsCompareFn.and.returnValue(Promise.resolve(() => true));
          canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

          // act
          await sut.addSetDataSourcePersonalizationRule('test-rendering-instance-id', 'variant1', 'datasourceid1');
          tick();

          const expectedRulesUpdates = getPersonalizationRules();
          expectedRulesUpdates[0].actions = [
            {
              uniqueId: 'rule1_action2',
              id: 'hideRenderingActionId001',
            },
            {
              uniqueId: 'test uniqueId',
              id: 'setDatasourceActionId001',
              dataSource: 'test datasourceid',
            },
          ];

          // assert
          expect(canvasLayoutServices.setRenderingsPersonalizationRules).toHaveBeenCalledWith(
            [
              {
                renderingInstanceId: 'test-rendering-instance-id',
                rules: expectedRulesUpdates,
              },
            ],
            true,
          );
          flush();
        }));
      });
    });

    describe('WHEN segemntId is undefined', () => {
      it('should set DefaultRule with personalized datasource action', fakeAsync(async () => {
        // arrange
        const defaultRule = buildRule('id', 'defaultRule', 'defaultRuleCondition');
        const action = {
          uniqueId: 'uid',
          id: 'id',
          dataSource: 'ds',
          parameters: {},
        };
        defaultRule.actions = [action];

        personalizationRulesServiceSpy.buildDefaultRule.and.returnValue(Promise.resolve(defaultRule));
        personalizationRulesServiceSpy.buildSetDataSourceAction.and.returnValue(Promise.resolve(action));
        canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([]);

        // act
        await sut.addSetDataSourcePersonalizationRule('test-rendering-instance-id', undefined, 'datasourceid1');
        tick();

        // assert
        expect(canvasLayoutServices.setRenderingsPersonalizationRules).toHaveBeenCalledWith(
          [
            {
              renderingInstanceId: 'test-rendering-instance-id',
              rules: [defaultRule],
            },
          ],
          true,
        );
        flush();
      }));
    });
  });

  describe('addSetRenderingPersonalizationRule()', () => {
    it('should create a set rendering personalization action', fakeAsync(async () => {
      // arrange
      const newRule = buildRule('id1', 'testRule1', 'newRuleCondition');
      const defaultRule = buildRule('id2', 'defaultRule', 'defaultRuleCondition');

      personalizationRulesServiceSpy.buildVariantRule.and.returnValue(Promise.resolve(newRule));
      personalizationRulesServiceSpy.buildDefaultRule.and.returnValue(Promise.resolve(defaultRule));
      canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([]);

      // act
      await sut.addSetRenderingPersonalizationRule('test-rendering-instance-id', 'variant1', 'renderingId1');
      tick();

      // assert
      expect(personalizationRulesServiceSpy.buildSetRenderingAction).toHaveBeenCalledWith('renderingId1');
      flush();
    }));

    describe('WHEN segemntId is defined AND there is no personalization on rendering', () => {
      it('should set DefaultRule and SetRenderingRule on rendering personalization', fakeAsync(async () => {
        // arrange
        const newRule = buildRule('id1', 'testRule1', 'newRuleCondition');
        const defaultRule = buildRule('id2', 'defaultRule', 'defaultRuleCondition');

        personalizationRulesServiceSpy.buildVariantRule.and.returnValue(Promise.resolve(newRule));
        personalizationRulesServiceSpy.buildDefaultRule.and.returnValue(Promise.resolve(defaultRule));
        canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([]);

        // act
        await sut.addSetRenderingPersonalizationRule('test-rendering-instance-id', 'variant1', 'renderingId1');
        tick();

        // assert
        expect(canvasLayoutServices.setRenderingsPersonalizationRules).toHaveBeenCalledWith(
          [
            {
              renderingInstanceId: 'test-rendering-instance-id',
              rules: [newRule, defaultRule],
            },
          ],
          true,
        );
        flush();
      }));
    });

    describe('WHEN segemntId is defined AND there are some personalization on rendering', () => {
      describe('AND there is no assigned rule with same variant name', () => {
        it('should add a new SetRenderingRule to the existent rules', fakeAsync(async () => {
          // arrange
          const newRule = buildRule('id1', 'testRule1', 'newRuleCondition');
          const existentRules = getPersonalizationRules();

          personalizationRulesServiceSpy.buildVariantRule.and.returnValue(Promise.resolve(newRule));
          personalizationRulesServiceSpy.getConditionsCompareFn.and.returnValue(Promise.resolve(() => false));
          canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

          // act
          await sut.addSetRenderingPersonalizationRule('test-rendering-instance-id', 'variant1', 'renderingId1');
          tick();

          // assert
          expect(canvasLayoutServices.setRenderingsPersonalizationRules).toHaveBeenCalledWith(
            [
              {
                renderingInstanceId: 'test-rendering-instance-id',
                rules: [newRule, ...existentRules],
              },
            ],
            true,
          );
          flush();
        }));
      });

      describe('AND there is an assigned rule with same variant name BUT no SetRendering action', () => {
        it('should add a new SetRendering action to the rule existent actions', fakeAsync(async () => {
          // arrange
          const newRule = buildRule('id1', 'testRule1', 'newRuleCondition');
          newRule.actions = [
            {
              uniqueId: 'test uniqueId',
              id: getRulesInfo().actions.setRenderingActionId,
              renderingItem: 'test renderingId',
            },
          ];

          const existentRules = getPersonalizationRules();
          existentRules[0].actions = [
            {
              uniqueId: 'rule1_action1',
              id: 'hideRenderingActionId001',
            },
          ];

          personalizationRulesServiceSpy.buildVariantRule.and.returnValue(Promise.resolve(newRule));
          personalizationRulesServiceSpy.getConditionsCompareFn.and.returnValue(Promise.resolve(() => true));
          canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

          // act
          await sut.addSetRenderingPersonalizationRule('test-rendering-instance-id', 'variant1', 'renderingId1');
          tick();

          const expectedRulesUpdates = getPersonalizationRules();
          expectedRulesUpdates[0].actions = [
            {
              uniqueId: 'rule1_action1',
              id: 'hideRenderingActionId001',
            },
            {
              uniqueId: 'test uniqueId',
              id: 'setRenderingActionId001',
              renderingItem: 'test renderingId',
            },
          ];

          // assert
          expect(canvasLayoutServices.setRenderingsPersonalizationRules).toHaveBeenCalledWith(
            [
              {
                renderingInstanceId: 'test-rendering-instance-id',
                rules: expectedRulesUpdates,
              },
            ],
            true,
          );
          flush();
        }));
      });

      describe('AND there is an assigned rule with same variant name AND SetRendering action', () => {
        it('should replace the existent SetRendering action', fakeAsync(async () => {
          // arrange
          const newRule = buildRule('id1', 'testRule1', 'newRuleCondition');
          newRule.actions = [
            {
              uniqueId: 'test uniqueId',
              id: getRulesInfo().actions.setRenderingActionId,
              renderingItem: 'test renderingId',
            },
          ];

          const existentRules = getPersonalizationRules();
          existentRules[0].actions = [
            {
              uniqueId: 'rule1_action1',
              id: 'setRenderingActionId001',
              renderingItem: 'renderingItemID',
            },
          ];

          personalizationRulesServiceSpy.buildVariantRule.and.returnValue(Promise.resolve(newRule));
          personalizationRulesServiceSpy.getConditionsCompareFn.and.returnValue(Promise.resolve(() => true));
          canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

          // act
          await sut.addSetRenderingPersonalizationRule('test-rendering-instance-id', 'variant1', 'renderingId1');
          tick();

          const expectedRulesUpdates = getPersonalizationRules();
          expectedRulesUpdates[0].actions = [
            {
              uniqueId: 'test uniqueId',
              id: 'setRenderingActionId001',
              renderingItem: 'test renderingId',
            },
          ];

          // assert
          expect(canvasLayoutServices.setRenderingsPersonalizationRules).toHaveBeenCalledWith(
            [
              {
                renderingInstanceId: 'test-rendering-instance-id',
                rules: expectedRulesUpdates,
              },
            ],
            true,
          );
          flush();
        }));
      });
    });

    describe('WHEN segemntId is undefined', () => {
      it('should set DefaultRule with personalized rendering action', fakeAsync(async () => {
        // arrange
        const defaultRule = buildRule('id', 'defaultRule', 'defaultRuleCondition');
        const action = {
          uniqueId: 'uid',
          id: 'id',
          renderingItem: 'renderingId1',
          parameters: {},
        };
        defaultRule.actions = [action];

        personalizationRulesServiceSpy.buildDefaultRule.and.returnValue(Promise.resolve(defaultRule));
        personalizationRulesServiceSpy.buildSetRenderingAction.and.returnValue(Promise.resolve(action));
        canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([]);

        // act
        await sut.addSetRenderingPersonalizationRule('test-rendering-instance-id', undefined, 'renderingId1');
        tick();

        // assert
        expect(canvasLayoutServices.setRenderingsPersonalizationRules).toHaveBeenCalledWith(
          [
            {
              renderingInstanceId: 'test-rendering-instance-id',
              rules: [defaultRule],
            },
          ],
          true,
        );
        flush();
      }));
    });
  });

  describe('addHideRenderingPersonalizationRule()', () => {
    it('should create a hide rendering action', fakeAsync(async () => {
      // arrange
      const newRule = buildRule('id1', 'testRule1', 'newRuleCondition');
      const defaultRule = buildRule('id2', 'defaultRule', 'defaultRuleCondition');

      personalizationRulesServiceSpy.buildVariantRule.and.returnValue(Promise.resolve(newRule));
      personalizationRulesServiceSpy.buildDefaultRule.and.returnValue(Promise.resolve(defaultRule));
      canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([]);

      // act
      await sut.addHideRenderingPersonalizationRule('test-rendering-instance-id', 'variant1');
      tick();

      // assert
      expect(personalizationRulesServiceSpy.buildHideRenderingAction).toHaveBeenCalled();
      flush();
    }));

    describe('WHEN segemntId is defined AND there is no personalization on rendering', () => {
      it('should add DefaultRule and HideRenderingRule on rendering personalization', fakeAsync(async () => {
        // arrange
        const newRule = buildRule('id1', 'testRule1', 'newRuleCondition');
        const defaultRule = buildRule('id2', 'defaultRule', 'defaultRuleCondition');

        personalizationRulesServiceSpy.buildVariantRule.and.returnValue(Promise.resolve(newRule));
        personalizationRulesServiceSpy.buildDefaultRule.and.returnValue(Promise.resolve(defaultRule));
        canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([]);

        // act
        await sut.addHideRenderingPersonalizationRule('test-rendering-instance-id', 'variant1');
        tick();

        // assert
        expect(canvasLayoutServices.setRenderingsPersonalizationRules).toHaveBeenCalledWith(
          [
            {
              renderingInstanceId: 'test-rendering-instance-id',
              rules: [newRule, defaultRule],
            },
          ],
          true,
        );
        flush();
      }));
    });

    describe('WHEN segemntId is defined AND there are some personalization on rendering', () => {
      describe('AND there is no assigned rule with same variant name', () => {
        it('should add new HideRenderingRule to the existent rules', fakeAsync(async () => {
          // arrange
          const newRule = buildRule('id1', 'testRule1', 'newRuleCondition');
          const existentRules = getPersonalizationRules();

          personalizationRulesServiceSpy.buildVariantRule.and.returnValue(Promise.resolve(newRule));
          personalizationRulesServiceSpy.getConditionsCompareFn.and.returnValue(Promise.resolve(() => false));
          canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

          // act
          await sut.addHideRenderingPersonalizationRule('test-rendering-instance-id', 'variant1');
          tick();

          // assert
          expect(canvasLayoutServices.setRenderingsPersonalizationRules).toHaveBeenCalledWith(
            [
              {
                renderingInstanceId: 'test-rendering-instance-id',
                rules: [newRule, ...existentRules],
              },
            ],
            true,
          );
          flush();
        }));
      });

      describe('AND there is an assiged rule with same variant name BUT no HideRendering action', () => {
        it('should add a new HideRendering action to the rule existent actions', fakeAsync(async () => {
          // arrange
          const newRule = buildRule('id1', 'testRule1', 'newRuleCondition');
          newRule.actions = [
            {
              uniqueId: 'test uniqueId',
              id: getRulesInfo().actions.hideRenderingActionId,
            },
          ];

          const existentRules = getPersonalizationRules();
          existentRules[0].actions = [
            {
              uniqueId: 'rule1_action1',
              id: 'setDatasourceActionId001',
              dataSource: 'datasourceid1',
            },
          ];

          personalizationRulesServiceSpy.buildVariantRule.and.returnValue(Promise.resolve(newRule));
          personalizationRulesServiceSpy.getConditionsCompareFn.and.returnValue(Promise.resolve(() => true));
          canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

          // act
          await sut.addHideRenderingPersonalizationRule('test-rendering-instance-id', 'variant1');
          tick();

          const expectedRulesUpdates = getPersonalizationRules();
          expectedRulesUpdates[0].actions = [
            {
              uniqueId: 'rule1_action1',
              id: 'setDatasourceActionId001',
              dataSource: 'datasourceid1',
            },
            {
              uniqueId: 'test uniqueId',
              id: 'hideRenderingActionId001',
            },
          ];

          // assert
          expect(canvasLayoutServices.setRenderingsPersonalizationRules).toHaveBeenCalledWith(
            [
              {
                renderingInstanceId: 'test-rendering-instance-id',
                rules: expectedRulesUpdates,
              },
            ],
            true,
          );
          flush();
        }));
      });

      describe('AND there is an assigned rule with same variant name AND HideRendering action', () => {
        it('should replace the existent HideRendering action', fakeAsync(async () => {
          // arrange
          const newRule = buildRule('id1', 'testRule1', 'newRuleCondition');
          newRule.actions = [
            {
              uniqueId: 'test uniqueId',
              id: getRulesInfo().actions.hideRenderingActionId,
            },
          ];

          const existentRules = getPersonalizationRules();

          personalizationRulesServiceSpy.buildVariantRule.and.returnValue(Promise.resolve(newRule));
          personalizationRulesServiceSpy.getConditionsCompareFn.and.returnValue(Promise.resolve(() => true));
          canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

          // act
          await sut.addHideRenderingPersonalizationRule('test-rendering-instance-id', 'variant1');
          tick();

          const expectedRulesUpdates = getPersonalizationRules();
          expectedRulesUpdates[0].actions = [
            {
              uniqueId: 'rule1_action1',
              id: 'setDatasourceActionId001',
              dataSource: 'ds-1',
            },
            {
              uniqueId: 'test uniqueId',
              id: 'hideRenderingActionId001',
            },
          ];

          // assert
          expect(canvasLayoutServices.setRenderingsPersonalizationRules).toHaveBeenCalledWith(
            [
              {
                renderingInstanceId: 'test-rendering-instance-id',
                rules: expectedRulesUpdates,
              },
            ],
            true,
          );
          flush();
        }));
      });
    });

    describe('WHEN segemntId is undefined', () => {
      it('should set DefaultRule with hide rendering action', fakeAsync(async () => {
        // arrange
        const defaultRule = buildRule('id', 'defaultRule', 'defaultRuleCondition');
        const action = {
          uniqueId: 'uid',
          id: 'id',
          parameters: {},
        };
        defaultRule.actions = [action];

        personalizationRulesServiceSpy.buildDefaultRule.and.returnValue(Promise.resolve(defaultRule));
        personalizationRulesServiceSpy.buildHideRenderingAction.and.returnValue(Promise.resolve(action));
        canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([]);

        // act
        await sut.addHideRenderingPersonalizationRule('test-rendering-instance-id', undefined);
        tick();

        // assert
        expect(canvasLayoutServices.setRenderingsPersonalizationRules).toHaveBeenCalledWith(
          [
            {
              renderingInstanceId: 'test-rendering-instance-id',
              rules: [defaultRule],
            },
          ],
          true,
        );
        flush();
      }));
    });
  });

  describe('removeHideRenderingPersonalizationRule()', () => {
    it('should remove the hide rendering action from personalization rule', async () => {
      // arrange
      const ruleInfo = getRulesInfo();
      const existentRules = getPersonalizationRules();

      personalizationRulesServiceSpy.getRuleInfo.and.returnValue(Promise.resolve(ruleInfo));
      personalizationRulesServiceSpy.getConditionVariantCompareFn.and.returnValue(Promise.resolve(() => true));
      canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

      // act
      await sut.removeHideRenderingPersonalizationRule('instanceId', 'variant1');

      // Because getConditionVariantCompareFn mock is configured to always return true, active rule would be rules[0].
      const expectedRulesUpdates = getPersonalizationRules();
      expectedRulesUpdates[0].actions = expectedRulesUpdates[0]?.actions?.filter(
        (action) => action.id !== ruleInfo.actions.hideRenderingActionId,
      );

      // assert
      expect(canvasLayoutServices.setRenderingsPersonalizationRules).toHaveBeenCalledWith([
        { renderingInstanceId: 'instanceId', rules: expectedRulesUpdates },
      ]);
    });

    describe('when variant name is defined and the personalization rule only contains the hide action rule', () => {
      it('should remove the personalization rule from the rendering', async () => {
        // arrange
        const ruleInfo = getRulesInfo();
        const existentRules = getPersonalizationRules();
        // Because getConditionVariantCompareFn mock is configured to always return true, active rule would be rules[0].
        existentRules[0].actions = [
          {
            uniqueId: 'rule1_action2',
            id: 'hideRenderingActionId001',
          },
        ];

        personalizationRulesServiceSpy.getRuleInfo.and.returnValue(Promise.resolve(ruleInfo));
        personalizationRulesServiceSpy.getConditionVariantCompareFn.and.returnValue(Promise.resolve(() => true));
        canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

        // act
        await sut.removeHideRenderingPersonalizationRule('instanceId', 'variant1');

        const expectedRulesUpdates = [existentRules[1], existentRules[2], existentRules[3], existentRules[4]];

        // assert
        expect(canvasLayoutServices.setRenderingsPersonalizationRules).toHaveBeenCalledWith([
          { renderingInstanceId: 'instanceId', rules: expectedRulesUpdates },
        ]);
      });
    });
  });

  describe('removePersonalizationRulesFromLayout()', () => {
    it('should remove personalization rules with specific variant name from all renderings', async () => {
      // arrange
      canvasLayoutServices.getAllRenderings.and.returnValue(testRenderings as any);
      personalizationRulesServiceSpy.getConditionVariantCompareFn.and.returnValue(Promise.resolve(() => true));

      // act
      await sut.removePersonalizationRulesFromLayout('variant1');

      const expectedRulesUpdates: PersonalizationRules[] = [
        {
          renderingInstanceId: 'rendering1',
          rules: [], // getConditionVariantCompareFn mock is configured to always return true.
        },
        {
          renderingInstanceId: 'rendering2',
          rules: [], // getConditionVariantCompareFn mock is configured to always return true.
        },
      ];

      // assert
      expect(canvasLayoutServices.setRenderingsPersonalizationRules).toHaveBeenCalledWith(expectedRulesUpdates, false);
    });
  });

  describe('removePersonalizationRuleFromRendering()', () => {
    it('should remove default rule actions when variant name is undefined', async () => {
      // arrange
      const ruleInfo = getRulesInfo();
      const existentRules = getPersonalizationRules();
      existentRules[0].uniqueId = ruleInfo.defaultRuleUniqueId;

      personalizationRulesServiceSpy.getRuleInfo.and.returnValue(Promise.resolve(ruleInfo));
      canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

      // act
      await sut.removePersonalizationRuleFromRendering('instanceId', undefined);

      const expectedRulesUpdates = getPersonalizationRules();
      expectedRulesUpdates[0].uniqueId = ruleInfo.defaultRuleUniqueId;
      expectedRulesUpdates[0].actions = undefined;

      // assert
      expect(canvasLayoutServices.setRenderingsPersonalizationRules).toHaveBeenCalledWith(
        [{ renderingInstanceId: 'instanceId', rules: expectedRulesUpdates }],
        true,
      );
    });

    it('should remove the personalization rule when variant name is defined', async () => {
      // arrange
      const ruleInfo = getRulesInfo();
      const existentRules = getPersonalizationRules();

      personalizationRulesServiceSpy.getRuleInfo.and.returnValue(Promise.resolve(ruleInfo));
      personalizationRulesServiceSpy.getConditionVariantCompareFn.and.returnValue(Promise.resolve(() => true));
      canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

      // act
      await sut.removePersonalizationRuleFromRendering('instanceId', 'variant1');

      const expectedRulesUpdates: PersonalizationRules[] = [
        {
          renderingInstanceId: 'instanceId',
          rules: [], // getConditionVariantCompareFn mock is configured to always return true.
        },
      ];

      // assert
      expect(canvasLayoutServices.setRenderingsPersonalizationRules).toHaveBeenCalledWith(expectedRulesUpdates, true);
    });
  });

  describe('getPersonalizedRenderingDataSource()', () => {
    it('should return default rule datasource when variant name is undefined', async () => {
      // arrange
      const ruleInfo = getRulesInfo();
      const existentRules = getPersonalizationRules();
      existentRules[0].uniqueId = ruleInfo.defaultRuleUniqueId;

      personalizationRulesServiceSpy.getRuleInfo.and.returnValue(Promise.resolve(ruleInfo));
      canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

      // act
      const actualDataSource = await sut.getPersonalizedRenderingDataSource('instanceId', undefined);

      // assert
      expect(actualDataSource).toBe('ds-1');
    });

    it('should return active rule datasource when variant name is defined', async () => {
      // arrange
      const ruleInfo = getRulesInfo();
      const existentRules = getPersonalizationRules();

      personalizationRulesServiceSpy.getRuleInfo.and.returnValue(Promise.resolve(ruleInfo));
      personalizationRulesServiceSpy.getConditionVariantCompareFn.and.returnValue(Promise.resolve(() => true));
      canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

      // act
      const actualDataSource = await sut.getPersonalizedRenderingDataSource('instanceId', 'variant1');

      // assert
      // Because getConditionVariantCompareFn mock is configured to always return true, active rule would be rules[0].
      expect(actualDataSource).toBe('ds-1');
    });
  });

  describe('isPersonalizedRenderingHidden()', () => {
    describe('when variant name is undefined', () => {
      it('should return true if default rule is hidden', async () => {
        // arrange
        const ruleInfo = getRulesInfo();
        const existentRules = getPersonalizationRules();
        existentRules[0].uniqueId = ruleInfo.defaultRuleUniqueId;

        personalizationRulesServiceSpy.getRuleInfo.and.returnValue(Promise.resolve(ruleInfo));
        canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

        // act
        const isHidden = await sut.isPersonalizedRenderingHidden('instanceId', undefined);

        // assert
        expect(isHidden).toBe(true);
      });

      it('should return false if default rule is not hidden', async () => {
        // arrange
        const ruleInfo = getRulesInfo();
        const existentRules = getPersonalizationRules();
        existentRules[0].uniqueId = ruleInfo.defaultRuleUniqueId;
        existentRules[0].actions = [];

        personalizationRulesServiceSpy.getRuleInfo.and.returnValue(Promise.resolve(ruleInfo));
        canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

        // act
        const isHidden = await sut.isPersonalizedRenderingHidden('instanceId', undefined);

        // assert
        expect(isHidden).toBe(false);
      });
    });

    describe('when variant name is defined', () => {
      it('should return true if active rule is hidden', async () => {
        // arrange
        const ruleInfo = getRulesInfo();
        const existentRules = getPersonalizationRules();

        personalizationRulesServiceSpy.getRuleInfo.and.returnValue(Promise.resolve(ruleInfo));
        personalizationRulesServiceSpy.getConditionVariantCompareFn.and.returnValue(Promise.resolve(() => true));
        canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

        // act
        const isHidden = await sut.isPersonalizedRenderingHidden('instanceId', 'variant1');

        // assert
        // Because getConditionVariantCompareFn mock is configured to always return true, active rule would be rules[0].
        expect(isHidden).toBe(true);
      });

      it('should return false if active rule is not hidden', async () => {
        // arrange
        const ruleInfo = getRulesInfo();
        const existentRules = getPersonalizationRules();
        existentRules[0].actions = [];

        personalizationRulesServiceSpy.getRuleInfo.and.returnValue(Promise.resolve(ruleInfo));
        personalizationRulesServiceSpy.getConditionVariantCompareFn.and.returnValue(Promise.resolve(() => true));
        canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

        // act
        const isHidden = await sut.isPersonalizedRenderingHidden('instanceId', 'variant1');

        // assert
        // Because getConditionVariantCompareFn mock is configured to always return true, active rule would be rules[0].
        expect(isHidden).toBe(false);
      });
    });
  });

  describe('getPersonalizedReplaceRenderingId()', () => {
    describe('when variant name is undefined', () => {
      it('should return value from default rule', async () => {
        const ruleInfo = getRulesInfo();
        const existentRules = [getPersonalizationRules()[2]];
        existentRules[0].uniqueId = ruleInfo.defaultRuleUniqueId;

        personalizationRulesServiceSpy.getRuleInfo.and.returnValue(Promise.resolve(ruleInfo));
        canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

        // act
        const result = await sut.getPersonalizedReplacedRenderingId('instanceId', undefined);

        // assert
        expect(result).toBe('renderingItemID');
      });
    });

    describe('when variant name is defined', () => {
      it('should return replace rendering ID if applied', async () => {
        const ruleInfo = getRulesInfo();
        const existentRules = [getPersonalizationRules()[2]];

        personalizationRulesServiceSpy.getRuleInfo.and.returnValue(Promise.resolve(ruleInfo));
        personalizationRulesServiceSpy.getConditionVariantCompareFn.and.returnValue(Promise.resolve(() => true));
        canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

        // act
        const result = await sut.getPersonalizedReplacedRenderingId('instanceId', 'variant1');

        // assert
        // Because getConditionVariantCompareFn mock is configured to always return true, active rule would be rules[0].
        expect(result).toBe('renderingItemID');
      });

      it('should return undefined if active rule is not set', async () => {
        const ruleInfo = getRulesInfo();

        personalizationRulesServiceSpy.getRuleInfo.and.returnValue(Promise.resolve(ruleInfo));
        personalizationRulesServiceSpy.getConditionVariantCompareFn.and.returnValue(Promise.resolve(() => true));
        canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([]);

        // act
        const result = await sut.getPersonalizedReplacedRenderingId('instanceId', 'variant1');

        // assert
        // Because getConditionVariantCompareFn mock is configured to always return true, active rule would be rules[0].
        expect(result).toBe(undefined);
      });
    });
  });

  describe('isVariantUsedInAnyRule()', () => {
    describe('WHEN variant is already used in a rule', () => {
      it('should return true', async () => {
        // arrange
        const ruleInfo = getRulesInfo();
        const existentRules = getPersonalizationRules();

        personalizationRulesServiceSpy.getRuleInfo.and.returnValue(Promise.resolve(ruleInfo));
        personalizationRulesServiceSpy.getConditionVariantCompareFn.and.returnValue(Promise.resolve(() => true));
        canvasLayoutServices.getAllRenderings.and.returnValue(testRenderings as any);
        canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

        // act
        const result = await sut.isVariantUsedInAnyRule('variant1');

        // assert
        expect(result).toBe(true);
      });
    });

    describe('WHEN segment is not used in any rule', () => {
      it('should return false', async () => {
        // arrange
        const ruleInfo = getRulesInfo();
        const existentRules = getPersonalizationRules();

        personalizationRulesServiceSpy.getRuleInfo.and.returnValue(Promise.resolve(ruleInfo));
        personalizationRulesServiceSpy.getConditionVariantCompareFn.and.returnValue(Promise.resolve(() => false));
        canvasLayoutServices.getAllRenderings.and.returnValue(testRenderings as any);
        canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

        // act
        const result = await sut.isVariantUsedInAnyRule('variant1');

        // assert
        expect(result).toBe(false);
      });
    });
  });

  describe('getPersonalizedRenderingParameters()', () => {
    describe('when variant name is undefined', () => {
      it('should return value from default rule', async () => {
        const ruleInfo = getRulesInfo();
        const existentRules = [getPersonalizationRules()[3]];
        existentRules[0].uniqueId = ruleInfo.defaultRuleUniqueId;

        personalizationRulesServiceSpy.getRuleInfo.and.returnValue(Promise.resolve(ruleInfo));
        canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

        // act
        const result = await sut.getPersonalizedRenderingParameters('instanceId', undefined);

        // assert
        expect(result).toEqual({ foo: 'bar' });
      });
    });

    describe('when variant name is defined', () => {
      it('should return rendering parameters if applied', async () => {
        const ruleInfo = getRulesInfo();
        const existentRules = [getPersonalizationRules()[3]];

        personalizationRulesServiceSpy.getRuleInfo.and.returnValue(Promise.resolve(ruleInfo));
        personalizationRulesServiceSpy.getConditionVariantCompareFn.and.returnValue(Promise.resolve(() => true));
        canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

        // act
        const result = await sut.getPersonalizedRenderingParameters('instanceId', 'variant1');

        // assert
        // Because getConditionVariantCompareFn mock is configured to always return true, active rule would be rules[0].
        expect(result).toEqual({ foo: 'bar' });
      });

      it('should return undefined if active rule is not set', async () => {
        const ruleInfo = getRulesInfo();

        personalizationRulesServiceSpy.getRuleInfo.and.returnValue(Promise.resolve(ruleInfo));
        personalizationRulesServiceSpy.getConditionVariantCompareFn.and.returnValue(Promise.resolve(() => true));
        canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([]);

        // act
        const result = await sut.getPersonalizedRenderingParameters('instanceId', 'variant1');

        // assert
        // Because getConditionVariantCompareFn mock is configured to always return true, active rule would be rules[0].
        expect(result).toBe(undefined);
      });
    });
  });

  describe('addSetRenderingParametersPersonalizationRule()', () => {
    it('should create a set rendering parameters action ', fakeAsync(async () => {
      // arrange
      const newRule = buildRule('id1', 'testRule1', 'newRuleCondition');
      const defaultRule = buildRule('id2', 'defaultRule', 'defaultRuleCondition');

      personalizationRulesServiceSpy.buildVariantRule.and.returnValue(Promise.resolve(newRule));
      personalizationRulesServiceSpy.buildDefaultRule.and.returnValue(Promise.resolve(defaultRule));
      canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([]);

      // act
      await sut.addSetRenderingParametersPersonalizationRule('test-rendering-instance-id', 'variant1', {
        foo: 'bar',
      });
      tick();

      // assert
      expect(personalizationRulesServiceSpy.buildSetRenderingParametersAction).toHaveBeenCalledWith({ foo: 'bar' });
      flush();
    }));

    describe('WHEN variantId is defined AND there is no personalization on rendering', () => {
      it('should set DefaultRule and SetRenderingParametersRule on rendering personalization', fakeAsync(async () => {
        // arrange
        const newRule = buildRule('id1', 'testRule1', 'newRuleCondition');
        const defaultRule = buildRule('id2', 'defaultRule', 'defaultRuleCondition');

        personalizationRulesServiceSpy.buildVariantRule.and.returnValue(Promise.resolve(newRule));
        personalizationRulesServiceSpy.buildDefaultRule.and.returnValue(Promise.resolve(defaultRule));
        canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([]);

        // act
        await sut.addSetRenderingParametersPersonalizationRule('test-rendering-instance-id', 'variant1', {
          foo: 'bar',
        });
        tick();

        // assert
        expect(canvasLayoutServices.setRenderingsPersonalizationRules).toHaveBeenCalledWith(
          [
            {
              renderingInstanceId: 'test-rendering-instance-id',
              rules: [newRule, defaultRule],
            },
          ],
          true,
        );
        flush();
      }));
    });

    describe('WHEN variantId is defined AND there are some personalization on rendering', () => {
      describe('AND there is no assigned rule with same variant name', () => {
        it('should add a new SetRenderingParametersRule to the existent rules', fakeAsync(async () => {
          // arrange
          const newRule = buildRule('id1', 'testRule1', 'newRuleCondition');
          const existentRules = getPersonalizationRules();

          personalizationRulesServiceSpy.buildVariantRule.and.returnValue(Promise.resolve(newRule));
          personalizationRulesServiceSpy.getConditionsCompareFn.and.returnValue(Promise.resolve(() => false));
          canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

          // act
          await sut.addSetRenderingParametersPersonalizationRule('test-rendering-instance-id', 'variant1', {
            foo: 'bar',
          });
          tick();

          // assert
          expect(canvasLayoutServices.setRenderingsPersonalizationRules).toHaveBeenCalledWith(
            [
              {
                renderingInstanceId: 'test-rendering-instance-id',
                rules: [newRule, ...existentRules],
              },
            ],
            true,
          );
          flush();
        }));
      });

      describe('AND there is an assigned rule with same variant name BUT no SetRendering action', () => {
        it('should add a new SetRendering action to the rule existent actions', fakeAsync(async () => {
          // arrange
          const newRule = buildRule('id1', 'testRule1', 'newRuleCondition');
          newRule.actions = [
            {
              uniqueId: 'test uniqueId',
              id: getRulesInfo().actions.setRenderingParametersActionId,
              renderingParameters: { a: 'b' },
            },
          ];

          const existentRules = getPersonalizationRules();
          existentRules[0].actions = [
            {
              uniqueId: 'rule1_action1',
              id: 'hideRenderingActionId001',
            },
          ];

          personalizationRulesServiceSpy.buildVariantRule.and.returnValue(Promise.resolve(newRule));
          personalizationRulesServiceSpy.getConditionsCompareFn.and.returnValue(Promise.resolve(() => true));
          canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

          // act
          await sut.addSetRenderingParametersPersonalizationRule('test-rendering-instance-id', 'variant1', {
            foo: 'bar',
          });
          tick();

          const expectedRulesUpdates = getPersonalizationRules();
          expectedRulesUpdates[0].actions = [
            {
              uniqueId: 'rule1_action1',
              id: 'hideRenderingActionId001',
            },
            {
              uniqueId: 'test uniqueId',
              id: 'setRenderingParametersActionId001',
              renderingParameters: { a: 'b' },
            },
          ];

          // assert
          expect(canvasLayoutServices.setRenderingsPersonalizationRules).toHaveBeenCalledWith(
            [
              {
                renderingInstanceId: 'test-rendering-instance-id',
                rules: expectedRulesUpdates,
              },
            ],
            true,
          );
          flush();
        }));
      });

      describe('AND there is an assigned rule with same variant name AND SetRendering action', () => {
        it('should replace the existent SetRendering action', fakeAsync(async () => {
          // arrange
          const newRule = buildRule('id1', 'testRule1', 'newRuleCondition');
          newRule.actions = [
            {
              uniqueId: 'test uniqueId',
              id: getRulesInfo().actions.setRenderingParametersActionId,
              renderingParameters: {
                foo: 'bar',
              },
            },
          ];

          const existentRules = getPersonalizationRules();
          existentRules[0].actions = [
            {
              uniqueId: 'rule1_action1',
              id: 'setRenderingParametersActionId001',
              renderingParameters: { a: 'b' },
            },
          ];

          personalizationRulesServiceSpy.buildVariantRule.and.returnValue(Promise.resolve(newRule));
          personalizationRulesServiceSpy.getConditionsCompareFn.and.returnValue(Promise.resolve(() => true));
          canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

          // act
          await sut.addSetRenderingParametersPersonalizationRule('test-rendering-instance-id', 'variant1', {
            foo: 'bar',
          });
          tick();

          const expectedRulesUpdates = getPersonalizationRules();
          expectedRulesUpdates[0].actions = [
            {
              uniqueId: 'test uniqueId',
              id: 'setRenderingParametersActionId001',
              renderingParameters: {
                foo: 'bar',
              },
            },
          ];

          // assert
          expect(canvasLayoutServices.setRenderingsPersonalizationRules).toHaveBeenCalledWith(
            [
              {
                renderingInstanceId: 'test-rendering-instance-id',
                rules: expectedRulesUpdates,
              },
            ],
            true,
          );
          flush();
        }));
      });
    });

    describe('WHEN segemntId is undefined', () => {
      it('should set DefaultRule with personalized rendering action', fakeAsync(async () => {
        // arrange
        const defaultRule = buildRule('id', 'defaultRule', 'defaultRuleCondition');
        const action = {
          uniqueId: 'uid',
          id: 'id',
          renderingParameters: {
            foo: 'bar',
          },
          parameters: {},
        };
        defaultRule.actions = [action];

        personalizationRulesServiceSpy.buildDefaultRule.and.returnValue(Promise.resolve(defaultRule));
        personalizationRulesServiceSpy.buildSetRenderingParametersAction.and.returnValue(Promise.resolve(action));
        canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([]);

        // act
        await sut.addSetRenderingParametersPersonalizationRule('test-rendering-instance-id', undefined, {
          foo: 'bar',
        });
        tick();

        // assert
        expect(canvasLayoutServices.setRenderingsPersonalizationRules).toHaveBeenCalledWith(
          [
            {
              renderingInstanceId: 'test-rendering-instance-id',
              rules: [defaultRule],
            },
          ],
          true,
        );
        flush();
      }));
    });
  });

  describe('getPersonlizedRenderingInfo()', () => {
    describe('when variant name is undefined', () => {
      it('should return values from default rule', async () => {
        const ruleInfo = getRulesInfo();
        const existentRules = [getPersonalizationRules()[4]];
        existentRules[0].uniqueId = ruleInfo.defaultRuleUniqueId;

        personalizationRulesServiceSpy.getRuleInfo.and.returnValue(Promise.resolve(ruleInfo));
        canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

        // act
        const result = await sut.getPersonalizedRenderingInfo('instanceId', undefined);

        // assert
        expect(result).toEqual({
          renderingId: 'renderingItemID',
          renderingParameters: { foo: 'bar' },
          dataSource: 'ds-1',
        });
      });
    });

    describe('when variant name is defined', () => {
      it('should return replace rendering ID if applied', async () => {
        const ruleInfo = getRulesInfo();
        const existentRules = [getPersonalizationRules()[4]];

        personalizationRulesServiceSpy.getRuleInfo.and.returnValue(Promise.resolve(ruleInfo));
        personalizationRulesServiceSpy.getConditionVariantCompareFn.and.returnValue(Promise.resolve(() => true));
        canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

        // act
        const result = await sut.getPersonalizedRenderingInfo('instanceId', 'variant1');

        // assert
        // Because getConditionVariantCompareFn mock is configured to always return true, active rule would be rules[0].
        expect(result).toEqual({
          renderingId: 'renderingItemID',
          renderingParameters: { foo: 'bar' },
          dataSource: 'ds-1',
        });
      });

      it('should return empty object if active rule is not set', async () => {
        const ruleInfo = getRulesInfo();

        personalizationRulesServiceSpy.getRuleInfo.and.returnValue(Promise.resolve(ruleInfo));
        personalizationRulesServiceSpy.getConditionVariantCompareFn.and.returnValue(Promise.resolve(() => true));
        canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([]);

        // act
        const result = await sut.getPersonalizedRenderingInfo('instanceId', 'variant1');

        // assert
        // Because getConditionVariantCompareFn mock is configured to always return true, active rule would be rules[0].
        expect(result).toEqual({ renderingId: undefined, renderingParameters: undefined, dataSource: undefined });
      });
    });
  });

  describe('addSetRenderingParametersPersonalizationRule()', () => {
    it('should create a set rendering parameters action when they are present in rendering details', fakeAsync(async () => {
      // arrange
      const newRule = buildRule('id1', 'testRule1', 'newRuleCondition');
      const defaultRule = buildRule('id2', 'defaultRule', 'defaultRuleCondition');

      personalizationRulesServiceSpy.buildVariantRule.and.returnValue(Promise.resolve(newRule));
      personalizationRulesServiceSpy.buildDefaultRule.and.returnValue(Promise.resolve(defaultRule));
      canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([]);

      // act
      await sut.addRenderingDetailsPersonalizationRule('test-rendering-instance-id', 'variant1', {
        renderingParameters: { foo: 'bar' },
      });
      tick();

      // assert
      expect(personalizationRulesServiceSpy.buildSetRenderingParametersAction).toHaveBeenCalledWith({ foo: 'bar' });
      expect(personalizationRulesServiceSpy.buildSetDataSourceAction).not.toHaveBeenCalled();
      expect(personalizationRulesServiceSpy.buildSetRenderingAction).not.toHaveBeenCalled();
      flush();
    }));

    it('should create a set datasource action when it is present in rendering details', fakeAsync(async () => {
      // arrange
      const newRule = buildRule('id1', 'testRule1', 'newRuleCondition');
      const defaultRule = buildRule('id2', 'defaultRule', 'defaultRuleCondition');

      personalizationRulesServiceSpy.buildVariantRule.and.returnValue(Promise.resolve(newRule));
      personalizationRulesServiceSpy.buildDefaultRule.and.returnValue(Promise.resolve(defaultRule));
      canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([]);

      // act
      await sut.addRenderingDetailsPersonalizationRule('test-rendering-instance-id', 'variant1', {
        dataSource: 'new-ds',
      });
      tick();

      // assert
      expect(personalizationRulesServiceSpy.buildSetDataSourceAction).toHaveBeenCalledWith('new-ds');
      expect(personalizationRulesServiceSpy.buildSetRenderingParametersAction).not.toHaveBeenCalled();
      expect(personalizationRulesServiceSpy.buildSetRenderingAction).not.toHaveBeenCalled();
      flush();
    }));

    it('should create a set rendering id action when it is present in rendering details', fakeAsync(async () => {
      // arrange
      const newRule = buildRule('id1', 'testRule1', 'newRuleCondition');
      const defaultRule = buildRule('id2', 'defaultRule', 'defaultRuleCondition');

      personalizationRulesServiceSpy.buildVariantRule.and.returnValue(Promise.resolve(newRule));
      personalizationRulesServiceSpy.buildDefaultRule.and.returnValue(Promise.resolve(defaultRule));
      canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([]);

      // act
      await sut.addRenderingDetailsPersonalizationRule('test-rendering-instance-id', 'variant1', {
        renderingId: 'new-rendering-id',
      });
      tick();

      // assert
      expect(personalizationRulesServiceSpy.buildSetRenderingAction).toHaveBeenCalledWith('new-rendering-id');
      expect(personalizationRulesServiceSpy.buildSetRenderingParametersAction).not.toHaveBeenCalled();
      expect(personalizationRulesServiceSpy.buildSetDataSourceAction).not.toHaveBeenCalled();
      flush();
    }));

    describe('WHEN variantId is defined AND there are some personalization on rendering', () => {
      describe('AND there is an assigned rule with same variant name and multiple actions', () => {
        it('should merge new actions with existent actions', fakeAsync(async () => {
          // arrange
          const existingActions: RuleAction[] = [
            { id: 'existing-id1', uniqueId: 'uid1' },
            { id: 'existing-id2', uniqueId: 'uid2' },
          ];

          const newActions: RuleAction[] = [
            { id: 'new-id1', uniqueId: 'new-uid1' },
            { id: 'existing-id2', uniqueId: 'new-uid2' },
            { id: 'new-id3', uniqueId: 'new-uid3' },
          ];

          const newRule = buildRule('id1', 'testRule1', 'newRuleCondition');
          newRule.actions = newActions;
          const existentRules = getPersonalizationRules();
          existentRules[0].actions = existingActions;

          personalizationRulesServiceSpy.buildVariantRule.and.returnValue(Promise.resolve(newRule));
          personalizationRulesServiceSpy.getConditionsCompareFn.and.returnValue(Promise.resolve(() => true));
          canvasLayoutServices.getRenderingPersonalizationRules.and.returnValue([...existentRules]);

          // act
          await sut.addSetRenderingParametersPersonalizationRule('test-rendering-instance-id', 'variant1', {});
          tick();

          const expectedRulesUpdates = getPersonalizationRules();
          expectedRulesUpdates[0].actions = [existingActions[0], ...newActions];

          // assert
          expect(canvasLayoutServices.setRenderingsPersonalizationRules).toHaveBeenCalledWith(
            [
              {
                renderingInstanceId: 'test-rendering-instance-id',
                rules: expectedRulesUpdates,
              },
            ],
            true,
          );
          flush();
        }));
      });
    });
  });
});
