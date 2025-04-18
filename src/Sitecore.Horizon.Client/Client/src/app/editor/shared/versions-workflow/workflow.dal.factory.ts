/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';

import { WorkflowDalRestService } from './rest/workflow.dal.rest.service';
import { BaseWorkflowDalService, WorkflowDalService } from './workflow.dal.service';

export function workflowDalServiceFactory(featureFlagsService: FeatureFlagsService) {
  if (featureFlagsService.isXmAppsRestApiEnabledAndSupported()) {
    return new WorkflowDalRestService();
  }
  return new WorkflowDalService();
}

export const workflowDalServiceProvider = {
  provide: BaseWorkflowDalService,
  useFactory: workflowDalServiceFactory,
  deps: [FeatureFlagsService],
};
