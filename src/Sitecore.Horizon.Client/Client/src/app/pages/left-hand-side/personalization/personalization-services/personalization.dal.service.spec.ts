/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { createGqlError, createSpyObserver } from 'app/testing/test.utils';
import {
  GET_RULES_INFO,
  GET_RULES_INFO_WITH_PARAMETERS_ACTION,
  PersonalizationDalService,
} from './personalization.dal.service';
import { PersonalizationRuleInfo } from './personalization.rules.service';

describe(PersonalizationDalService.name, () => {
  let sut: PersonalizationDalService;
  let apolloTestingController: ApolloTestingController;
  let configurationService: jasmine.SpyObj<ConfigurationService>;
  let personalizationRuleInfoResponse: PersonalizationRuleInfo;

  beforeEach(waitForAsync(() => {
    configurationService = jasmine.createSpyObj<ConfigurationService>(['isParametersPersonalizationEnabled']);

    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [
        PersonalizationDalService,
        {
          provide: ConfigurationService,
          useValue: configurationService,
        },
      ],
    });
  }));

  beforeEach(() => {
    sut = TestBed.inject(PersonalizationDalService);
    configurationService.isParametersPersonalizationEnabled.and.returnValue(true);
    apolloTestingController = TestBed.inject(ApolloTestingController);

    personalizationRuleInfoResponse = {
      defaultRuleName: 'defaultRuleName001',
      defaultRuleUniqueId: 'defaultRuleUniqueId001',
      conditions: {
        alwaysTrueConditionTemplate: 'alwaysTrueConditionTemplate001',
        alwaysTrueRuleId: 'alwaysTrueRuleId001',
        audienceVisitorFilterConditionTemplate: 'audienceVisitorFilterConditionTemplate001',
        ruleIdAttributeName: 'ruleIdAttributeName001',
        uniqueIdPlaceholder: 'uniqueIdPlaceholder001',
        audienceVisitorInVariantRuleId: 'audienceVisitorInVariantRuleId001',
        variantAttributeName: 'VariantName',
        variantValuePlaceholder: 'variantValuePlaceholder001',
      },
      actions: {
        hideRenderingActionId: 'hideRenderingActionId001',
        setDatasourceActionId: 'setDatasourceActionId001',
        setRenderingActionId: 'setRenderingActionId001',
        setRenderingParametersActionId: 'setRenderingParametersActionId001',
      },
    };
  });

  afterEach(() => {
    apolloTestingController.verify();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should fetch personalization rule info from GQL', fakeAsync(() => {
    const resultSpy = createSpyObserver();
    sut.getRuleInfo().subscribe(resultSpy);
    const query = apolloTestingController.expectOne(GET_RULES_INFO_WITH_PARAMETERS_ACTION);
    query.flush({ data: { personalizationRuleInfo: personalizationRuleInfoResponse } });
    tick();

    expect(resultSpy.next).toHaveBeenCalledTimes(1);
    const [result] = resultSpy.next.calls.mostRecent().args;
    expect(result).toEqual(personalizationRuleInfoResponse);
    flush();
  }));

  it('should fetch personalistion rule info without parameters action when it is note supported', fakeAsync(() => {
    configurationService.isParametersPersonalizationEnabled.and.returnValue(false);
    const resultSpy = createSpyObserver();
    sut.getRuleInfo().subscribe(resultSpy);
    const query = apolloTestingController.expectOne(GET_RULES_INFO);
    query.flush({ data: { personalizationRuleInfo: personalizationRuleInfoResponse } });
    tick();

    expect(resultSpy.next).toHaveBeenCalledTimes(1);
    const [result]: [PersonalizationRuleInfo] = resultSpy.next.calls.mostRecent().args;

    expect(result.actions.setRenderingParametersActionId).toBeUndefined();
    flush();
  }));

  it('should extract error code from GQL error', fakeAsync(() => {
    const resultSpy = createSpyObserver();

    sut.getRuleInfo().subscribe(resultSpy);
    const query = apolloTestingController.expectOne(GET_RULES_INFO_WITH_PARAMETERS_ACTION);
    query.graphqlErrors([createGqlError('test error just happened', 'TEST_ERR_CODE')]);
    tick();

    expect(resultSpy.error).toHaveBeenCalledWith('TEST_ERR_CODE');
    flush();
  }));
});
