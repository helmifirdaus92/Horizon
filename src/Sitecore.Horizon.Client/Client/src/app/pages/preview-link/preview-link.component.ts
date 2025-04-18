/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, OnInit } from '@angular/core';
import { CanvasUrlBuilder } from 'app/shared/canvas/url-builder';
import { ContextService } from 'app/shared/client-state/context.service';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { EMPTY, Observable, shareReplay, switchMap } from 'rxjs';

@Component({
  selector: 'app-horizon-workspace-header-preview-link',
  template: `
    <ng-container *appLet="previewUrl$ | async as previewUrl">
      <a
        ngSpdIconButton
        (click)="previewPageInNewTab(previewUrl)"
        (keyup)="previewPageInNewTab(previewUrl)"
        icon="eye-outline"
        class="my-auto ml-sm btn-square"
        aria-label="preview"
        [title]="'NAV.PREVIEW' | translate"
        name="previewLink"
      ></a>
    </ng-container>
  `,
  styleUrls: ['./preview-link.component.scss'],
})
export class PreviewLinkComponent implements OnInit {
  previewUrl$: Observable<string> = EMPTY;

  constructor(
    private readonly context: ContextService,
    private readonly canvasUrlBuilder: CanvasUrlBuilder,
    private readonly messagingService: MessagingService,
  ) {}

  ngOnInit(): void {
    this.previewUrl$ = this.context.value$.pipe(
      switchMap(async (context) => {
        const item = await this.context.getItem();
        const url = await this.canvasUrlBuilder.buildPreviewModeUrl(context, item.route);
        return url;
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  async previewPageInNewTab(url: string) {
    await this.messagingService.getEditingCanvasChannel().syncEmit('sc-mode-cookie:set', { scMode: 'preview' });
    window.open(url);
    return;
  }
}
