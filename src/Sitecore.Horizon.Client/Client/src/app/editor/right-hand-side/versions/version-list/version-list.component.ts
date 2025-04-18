/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { VersionDetails } from 'app/editor/shared/versions-workflow/versions-workflow.service';

@Component({
  selector: 'app-version-list',
  templateUrl: './version-list.component.html',
  styleUrls: ['./version-list.component.scss'],
})
export class VersionListComponent {
  @Input() list: VersionDetails[] = [];
  @Input() active?: number;
  @Input() isLoading: boolean | null = null;
  @Input() popoverContent: TemplateRef<unknown> | null = null;
  @Input() disabled = false;

  @Output() selectChange = new EventEmitter<number>();
  @Output() createNewVersion = new EventEmitter<unknown>();
  @Output() menuButtonClick = new EventEmitter<unknown>();

  constructor() {}
}
