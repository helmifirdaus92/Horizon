/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { PublishingJobState, PublishingMode } from '../rest/page/page.types';

export interface PublishItemOutput {
  operationId: string;
}

export interface PublishItemInput {
  rootItemId: string;
  publishSubItems: boolean;
  languages: string[];
  publishRelatedItems: boolean;
  publishItemMode: PublishingMode;
  targetDatabases?: string[];
}

export interface PublishingStatus {
  isDone: boolean;
  isFailed: boolean;
  processed: number;
  state: PublishingJobState;
}
