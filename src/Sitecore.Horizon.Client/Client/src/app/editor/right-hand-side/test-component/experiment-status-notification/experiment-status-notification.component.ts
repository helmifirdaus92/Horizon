/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input } from '@angular/core';
import { BXComponentFlowDefinition } from 'app/pages/left-hand-side/personalization/personalization.types';

@Component({
  selector: 'app-experiment-status-notification',
  templateUrl: './experiment-status-notification.component.html',
  styleUrls: ['./experiment-status-notification.component.scss'],
})
export class ExperimentStatusNotificationComponent {
  @Input() flowDefinition: BXComponentFlowDefinition;
  @Input() isPagePublished: boolean;

  constructor() {}
}
