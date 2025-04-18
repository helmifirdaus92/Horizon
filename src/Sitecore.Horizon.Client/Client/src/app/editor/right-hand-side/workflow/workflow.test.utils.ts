/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ItemWithVersionDetails, VersionDetails } from 'app/editor/shared/versions-workflow/versions-workflow.service';
import { WorkflowWarning } from 'app/shared/graphql/item.interface';

export function getTestItem({
  finalState = false,
  hasPublishableVersion = true,
  isLatestPublishableVersion = true,
  canPublish = true,
  isPublishable = true,
  canEdit = true,
  versions = [
    {
      versionNumber: 1,
      name: 'versionName1',
      lastModifiedBy: 'user1',
      lastModifiedAt: '2021-09-07T11:18:55Z',
      validFrom: '2021-09-07T11:18:58Z',
      validTo: '9999-12-31T23:59:59.9999999Z',
      workflowState: 'workflowName1',
      isLatestPublishableVersion: true,
      isAvailableToPublish: true,
    },
    {
      versionNumber: 2,
      name: 'versionName2',
      lastModifiedBy: 'user2',
      lastModifiedAt: '2021-09-07T11:19:21Z',
      validFrom: '2021-09-07T11:19:07Z',
      validTo: '9999-12-31T23:59:59.9999999Z',
      workflowState: 'workflowName2',
      isLatestPublishableVersion: false,
      isAvailableToPublish: true,
    },
  ],
  hasWorkflow = true,
}: {
  finalState?: boolean;
  hasPublishableVersion?: boolean;
  isLatestPublishableVersion?: boolean;
  canPublish?: boolean;
  isPublishable?: boolean;
  canEdit?: boolean;
  versions?: VersionDetails[];
  hasWorkflow?: boolean;
} = {}): Partial<ItemWithVersionDetails> {
  const response = {
    workflow: !hasWorkflow
      ? null
      : {
          id: 'id',
          displayName: 'foo',
          canEdit,
          warnings: [
            {
              errorCode: 'ItemLockedByAnotherUser',
            } as WorkflowWarning,
          ],
          commands: [
            {
              id: 'bar',
              displayName: 'baz',
            },
            {
              id: 'faz',
              displayName: 'lar',
            },
          ],
          finalState,
        },
    permissions: {
      canPublish,
    } as ItemWithVersionDetails['permissions'],
    publishing: {
      hasPublishableVersion,
      isPublishable,
      validFromDate: '',
      validToDate: '',
      isAvailableToPublish: true,
    },
    hasChildren: true,
    isLatestPublishableVersion,
    versions,
    createdBy: 'test-user',
    creationDate: '2021-10-07T11:18:55Z',
  };
  return response;
}

export function getTestItemWithNoWorkflow(
  finalState?: any,
  hasPublishableVersion?: any,
  isLatestPublishableVersion?: any,
  canPublish?: any,
  isPublishable?: any,
  canEdit?: any,
  versions?: any,
) {
  return getTestItem({
    finalState,
    hasPublishableVersion,
    isLatestPublishableVersion,
    canPublish,
    isPublishable,
    canEdit,
    versions,
    hasWorkflow: false,
  });
}
