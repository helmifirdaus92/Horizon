/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LHSNavigationService } from 'app/pages/left-hand-side/lhs-navigation.service';
import { CanvasUrlBuilder } from 'app/shared/canvas/url-builder';
import { EditingMessagingChannel } from 'app/shared/messaging/horizon-canvas.contract.defs';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { RenderingHostResolverService } from 'app/shared/rendering-host/rendering-host-resolver.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { environment } from 'environments/environment';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { CanvasPageService } from './canvas-page/canvas-page.service';
import { EditingMetadataCanvasService } from './editing-metadata/editing-metadata-canvas.service';
import { ItemTypesUtilityService } from './editor-pages-utilities.service';
import { EditorWorkspaceService } from './editor-workspace/editor-workspace.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  providers: [CanvasPageService, EditingMetadataCanvasService],
})
export class EditorComponent implements OnInit, OnDestroy {
  activeNavigation$: Observable<string> = EMPTY;
  private readonly lifetime = new Lifetime();
  editorUrl$: Observable<{ url: string; isError: boolean }> = EMPTY;

  private readonly _canvasLoading$ = new BehaviorSubject<boolean>(false);
  readonly canvasLoading$ = this._canvasLoading$.asObservable();

  isLocalDevelopmentMode = !environment.production;

  private readonly editingChannel: EditingMessagingChannel;

  constructor(
    private readonly canvasPageService: CanvasPageService,
    private readonly canvasUrlBuilder: CanvasUrlBuilder,
    private readonly utilities: ItemTypesUtilityService,
    private route: ActivatedRoute,
    private readonly editingMetadataCanvasService: EditingMetadataCanvasService,
    private readonly editorWorkspaceService: EditorWorkspaceService,
    private readonly renderingHostResolverService: RenderingHostResolverService,
    private readonly messagingService: MessagingService,
    private readonly lhsNavService: LHSNavigationService,
  ) {
    this.editingChannel = this.messagingService.getEditingCanvasChannel();
  }

  ngOnInit() {
    this.activeNavigation$ = this.lhsNavService.watchRouteSegment();
    this.editorWorkspaceService
      .watchCanvasLoadState()
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe(({ isLoading }) => this._canvasLoading$.next(isLoading));

    let canvasState$ = this.canvasPageService.canvasUrl$.pipe(tap(() => this._canvasLoading$.next(true)));
    const renderSitePagesOnly: boolean = this.route.snapshot.data.renderSitePagesOnly;
    canvasState$ = renderSitePagesOnly
      ? this.utilities.ensureFirstEmitIsSitePage(canvasState$, (input) => input.canvasUrl.context)
      : canvasState$;

    const canvasStateWithMetadataMode$ = this.editingMetadataCanvasService.injectEditingMetadata(canvasState$);

    this.editorUrl$ = canvasStateWithMetadataMode$.pipe(
      map(({ canvasUrl, metadataMode, isDirectRenderEnabled, route, layoutKind }) => {
        const renderingHostError = this.isRenderingHostError(isDirectRenderEnabled);
        this.renderingHostResolverService.notifyErrorState(renderingHostError);
        if (renderingHostError) {
          this._canvasLoading$.next(false);
          return { url: '', isError: true };
        }

        if (isDirectRenderEnabled && metadataMode && route && layoutKind) {
          return {
            url: this.canvasUrlBuilder.buildEditModeUrl(canvasUrl.context, route, layoutKind),
            isError: false,
          };
        }

        return {
          url: this.canvasUrlBuilder.buildXmcEditModeUrl(canvasUrl.context, { metadataMode }),
          isError: false,
        };
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  ngOnDestroy(): void {
    this.lifetime.dispose();
  }

  deselectChrome() {
    this.editingChannel.rpc.deselectChrome();
  }

  private isRenderingHostError(isDirectRenderEnabled: boolean) {
    return this.renderingHostResolverService.isLocalRenderingHostSelected() && !isDirectRenderEnabled;
  }
}
