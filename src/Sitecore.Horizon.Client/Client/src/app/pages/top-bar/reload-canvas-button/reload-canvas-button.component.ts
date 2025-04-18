/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { LhsPanelStateService } from 'app/editor/lhs-panel/lhs-panel.service';
import { ContextService } from 'app/shared/client-state/context.service';

@Component({
  selector: 'app-reload-canvas-button',
  template: `
    <button
      ngSpdIconButton
      (click)="reloadCanvas()"
      (keyup)="reloadCanvas()"
      icon="cached"
      class="my-auto btn-square"
      [attr.aria-label]="'NAV.RELOAD' | translate"
      [title]="'NAV.RELOAD' | translate"
      [disabled]="!!(isLhsPanelExpanded$ | async)"
      name="reloadCanvas"
      id="reloadCanvas"
    ></button>
  `,
  styleUrls: ['./reload-canvas-button.component.scss'],
})
export class ReloadCanvasButtonComponent {
  isLhsPanelExpanded$ = this.lhsPanelStateService.isExpanded$;

  constructor(
    private readonly contextService: ContextService,
    private readonly lhsPanelStateService: LhsPanelStateService,
  ) {}

  reloadCanvas() {
    this.contextService.updateContext(this.contextService.value);
  }
}
