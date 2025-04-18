/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { formatNumber } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, QueryList, ViewChildren } from '@angular/core';
import { DialogCloseHandle, InputComponent } from '@sitecore/ng-spd-lib';
import {
  distributeSplitsEvenly,
  getDefaultGoalsSection,
} from 'app/pages/left-hand-side/personalization/personalization-api/personalization.api.utils';
import {
  BXComponentFlowDefinition,
  BXComponentGoals,
  GoalsPageParameters,
  TestConclusiveAction,
  TestInconclusiveAction,
} from 'app/pages/left-hand-side/personalization/personalization.types';
import { calcRequiredSessionsPerVariant } from './configure-experiment-dialog.cdp-utils';
import { ConfigureExperimentDialog } from './configure-experiment-dialog.service';
import { sampleSizeConfigIsInValid, splitsAreInvalid } from './configure-experiment-dialog.utils';

@Component({
  selector: 'app-configure-experiment-dialog',
  templateUrl: './configure-experiment-dialog.component.html',
  styleUrl: './configure-experiment-dialog.component.scss',
})
export class ConfigureExperimentDialogComponent {
  readonly onSelect = new EventEmitter<ConfigureExperimentDialog>();

  @Input() set flowDefinition(val: BXComponentFlowDefinition) {
    this.internalFlowDefinition = JSON.parse(JSON.stringify(val));

    if (!this.internalFlowDefinition.goals) {
      this.internalFlowDefinition.goals = getDefaultGoalsSection();
    }
    this.splitsAreInvalidStatic = this.splitsAreInvalid();
    this.sampleSizeConfigIsInvalidStatic = sampleSizeConfigIsInValid(
      this.internalFlowDefinition.sampleSizeConfig,
      this.internalFlowDefinition.traffic.allocation,
    );
  }

  internalFlowDefinition: BXComponentFlowDefinition;
  goals: BXComponentGoals | null = null;

  splitsAreInvalidStatic = false;
  sampleSizeConfigIsInvalidStatic = false;

  @ViewChildren(InputComponent) inputComponents!: QueryList<InputComponent>;

  addGoalsTarget(goals: BXComponentGoals) {
    this.goals = goals;
  }

  removeTargetPage(updatedPageParameters: GoalsPageParameters[]) {
    this.internalFlowDefinition.goals.primary.pageParameters = updatedPageParameters;
  }

  splitsAreInvalid = () => splitsAreInvalid(this.internalFlowDefinition?.traffic?.splits);

  isFormInValid = (): boolean => {
    return !this.inputComponents || !!this.inputComponents.find((item) => item.isInvalid);
  };

  total = () => {
    return formatNumber(
      calcRequiredSessionsPerVariant(this.internalFlowDefinition.sampleSizeConfig) || 0,
      'en-US',
      '1.0-1',
    );
  };

  existingNames: Promise<string[]> = Promise.resolve([]);
  renderingInstanceId = '';

  constructor(private readonly closeHandle: DialogCloseHandle) {}

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      event.preventDefault();
      this.cancel();
    }
  }

  roundNumbers(num: number, numbersAfterDecimal: number = 0): number {
    return parseFloat(num.toFixed(numbersAfterDecimal));
  }

  distributeSplitsEvenly() {
    distributeSplitsEvenly(this.internalFlowDefinition);
  }

  setPostTestActionConclusive(action: string) {
    this.internalFlowDefinition.postTestAction = {
      conclusive: action as TestConclusiveAction,
      inconclusive: this.internalFlowDefinition.postTestAction?.inconclusive ?? 'KEEP_RUNNING_TEST',
    };
  }

  setPostTestActionInconclusive(action: string) {
    this.internalFlowDefinition.postTestAction = {
      conclusive: this.internalFlowDefinition.postTestAction?.conclusive ?? 'SET_TRAFFIC_TO_WINNING_VARIANT',
      inconclusive: action as TestInconclusiveAction,
    };
  }

  resetSampleSizeConfig() {
    this.internalFlowDefinition.sampleSizeConfig = {
      baseValue: 0.02,
      minimumDetectableDifference: 0.2,
      confidenceLevel: 0.95,
    };
  }

  cancel() {
    this.onSelect.next({
      status: 'Canceled',
    });
    this.onSelect.complete();
    this.closeHandle.close();
  }

  submit() {
    if (this.isFormInValid()) {
      return;
    }

    this.removeSizeInSampleConfig();

    this.internalFlowDefinition.goals = this.goals ?? this.internalFlowDefinition.goals;

    this.onSelect.next({
      status: 'OK',
      flowDefinition: this.internalFlowDefinition,
    });
    this.onSelect.complete();
    this.closeHandle.close();
  }

  private removeSizeInSampleConfig() {
    // sampleSize in calculated by CDP backend based on values of sampleSizeConfig
    // submitting changed values of sampleSizeConfig with original value of sampleSize causes bad request response
    this.internalFlowDefinition.sampleSizeConfig.sampleSize = undefined;
  }
}
