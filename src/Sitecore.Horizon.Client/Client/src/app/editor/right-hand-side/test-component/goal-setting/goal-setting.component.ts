/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FORM_WRAPPER_RENDERING_ID } from 'app/editor/designing/forms-components-gallery/form-wrapper-filter';
import { CanvasServices } from 'app/editor/shared/canvas.services';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import {
  formatToCharactersOnly,
  getDefalutCustomGoalSection,
} from 'app/pages/left-hand-side/personalization/personalization-api/personalization.api.utils';
import {
  BXComponentFlowDefinition,
  BXComponentGoals,
  GoalSettingOptions,
  GoalsPageParameters,
} from 'app/pages/left-hand-side/personalization/personalization.types';
import { ContextService } from 'app/shared/client-state/context.service';
import { deepClone, isSameGuid } from 'app/shared/utils/utils';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-goal-setting',
  templateUrl: './goal-setting.component.html',
  styleUrl: './goal-setting.component.scss',
})
export class GoalSettingComponent implements OnInit {
  settingOptions: GoalSettingOptions = 'pageViewGoal';
  searchEnabled = false;
  currentPageName = '';
  highlightedGoal: string | null = null;
  renderPagesPicker = false;
  @Input() renderingInstanceId = '';
  @Input() set internalFlowDefinition(val: BXComponentFlowDefinition) {
    this.componentFlowDefinition = deepClone(val);
  }

  @Output() removeGoal = new EventEmitter<GoalsPageParameters[]>();
  @Output() exitsGoalsChange = new EventEmitter<BXComponentGoals>();
  @Output() bouncesGoalChange = new EventEmitter<BXComponentGoals>();
  @Output() customGoalChange = new EventEmitter<BXComponentGoals>();
  @Output() pageViewGoalsChange = new EventEmitter<BXComponentGoals>();

  constructor(
    private readonly context: ContextService,
    private readonly canvasServices: CanvasServices,
    private readonly featureFlagsService: FeatureFlagsService,
  ) {}

  componentFlowDefinition: BXComponentFlowDefinition;

  isFormSubmissionEnabled = false;

  ngOnInit() {
    this.settingOptions = this.componentFlowDefinition.goals.primary.type;
    this.context.value$
      .pipe(switchMap(() => this.context.getItem()))
      .subscribe((item) => (this.currentPageName = item.name));

    if (this.componentFlowDefinition.goals.primary.type !== 'pageViewGoal') {
      this.componentFlowDefinition.goals.primary.pageParameters = [];
    }

    const isFormSubmissionsGoalEnabled = this.featureFlagsService.isFeatureEnabled(
      'pages_components-testing_form_submissions_goal',
    );
    this.isFormSubmissionEnabled = isFormSubmissionsGoalEnabled && this.checkIfComponentContainsForm();
  }

  addCustomGoal() {
    const customGoal = getDefalutCustomGoalSection(formatToCharactersOnly(this.renderingInstanceId));
    this.customGoalChange.emit(customGoal);
  }

  addBouncesGoal() {
    const bounceGoalSetting: BXComponentGoals = deepClone(this.componentFlowDefinition.goals);
    const type = 'bouncesGoal';
    const name = 'bounces_goal';
    const friendlyId = 'friendly_id_bounces_goal';

    const updatedBounceCalculation = {
      ...bounceGoalSetting.primary.goalCalculation,
      calculation: 'DECREASE' as const,
    };

    bounceGoalSetting.primary = {
      ...bounceGoalSetting.primary,
      type,
      name,
      friendlyId,
      goalCalculation: updatedBounceCalculation,
    };

    bounceGoalSetting.primary.pageParameters = [{ matchCondition: 'Equals', parameterString: this.currentPageName }];
    bounceGoalSetting.primary.eventType = undefined;
    this.bouncesGoalChange.emit(bounceGoalSetting);
  }

  addExitGoal() {
    const exitGoalSetting: BXComponentGoals = deepClone(this.componentFlowDefinition.goals);

    const type = 'exitsGoal';
    const name = 'exits_goal';
    const friendlyId = 'friendly_id_exits_goal';

    const updatedExitsCalculation = {
      ...exitGoalSetting.primary.goalCalculation,
      calculation: 'DECREASE' as const,
    };
    exitGoalSetting.primary = {
      ...exitGoalSetting.primary,
      type,
      name,
      friendlyId,
      goalCalculation: updatedExitsCalculation,
    };

    exitGoalSetting.primary.pageParameters = [{ matchCondition: 'Equals', parameterString: this.currentPageName }];
    exitGoalSetting.primary.eventType = undefined;
    this.exitsGoalsChange.emit(exitGoalSetting);
  }

  addPageViewGoal(pageName?: string) {
    const pagesGoalSetting: BXComponentGoals = this.componentFlowDefinition.goals;
    pagesGoalSetting.primary.type = 'pageViewGoal';
    if (pageName) {
      if (!pagesGoalSetting.primary.pageParameters.some((p) => p.parameterString === pageName)) {
        pagesGoalSetting.primary.pageParameters.push({
          matchCondition: 'Equals',
          parameterString: pageName,
        });
      }
      this.highlightGoal(pageName);
    }
    pagesGoalSetting.primary.eventType = undefined;
    this.pageViewGoalsChange.emit(pagesGoalSetting);
  }

  removeTargetPage(pageName: string) {
    const updatedPageParameters = this.componentFlowDefinition.goals.primary.pageParameters.filter(
      (p) => p.parameterString !== pageName,
    );

    this.componentFlowDefinition.goals.primary.pageParameters = updatedPageParameters;
    this.removeGoal.emit(updatedPageParameters);
  }

  private highlightGoal(goal: string) {
    this.highlightedGoal = goal;
    setTimeout(() => {
      this.highlightedGoal = null;
    }, 500);
  }

  private checkIfComponentContainsForm() {
    const rendering = this.canvasServices.getCurrentLayout().findRendering(this.renderingInstanceId);
    return (
      (rendering?.parameters?.ComponentName?.includes('SitecoreForm?formId=') ||
        isSameGuid(rendering?.id, FORM_WRAPPER_RENDERING_ID)) ??
      false
    );
  }
}
