/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable, OnDestroy } from '@angular/core';
import { ContentTreeService } from 'app/pages/content-tree/content-tree.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { LayoutKind } from 'app/shared/graphql/item.interface';
import { EditingMetadataMessagingChannel } from 'app/shared/messaging/horizon-canvas.contract.defs';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { RenderingHostService } from 'app/shared/rendering-host/rendering-host.service';
import { Lifetime } from 'app/shared/utils/lifetime';
import { Observable, switchMap } from 'rxjs';
import { CanvasUrl } from '../canvas-page/canvas-page.service';
import { LayoutSwitchService } from '../shared/site-language-switcher/site-language-dropdowns/layout-switch/layout-switch.service';
import { EditingMetadataService } from './editing-metadata.service';

@Injectable()
export class EditingMetadataCanvasService implements OnDestroy {
  private readonly editingMetadataChannel: EditingMetadataMessagingChannel;
  private readonly lifetime = new Lifetime();

  constructor(
    private readonly editingMetadataService: EditingMetadataService,
    private readonly renderingHostService: RenderingHostService,
    private readonly messagingService: MessagingService,
    private readonly contentTreeService: ContentTreeService,
    private readonly contextService: ContextService,
    private readonly layoutSwitchService: LayoutSwitchService,
  ) {
    this.editingMetadataChannel = this.messagingService.getEditinMetadataChannel();
    this.editingMetadataChannel.setRpcServicesImpl({
      getEditingMetadata: async (editingDataRequest) =>
        await this.editingMetadataService.getEditingData(editingDataRequest),
    });

    this.lifetime.registerCallbacks(() =>
      this.editingMetadataChannel.setRpcServicesImpl({
        getEditingMetadata: () => {
          throw Error('[BUG] EditorCanvasService is not connected');
        },
      }),
    );
  }

  ngOnDestroy(): void {
    this.lifetime.dispose();
  }

  injectEditingMetadata<TCanvasState extends { canvasUrl: CanvasUrl }>(
    canvasState$: Observable<TCanvasState>,
  ): Observable<
    TCanvasState & {
      metadataMode: boolean;
      isDirectRenderEnabled: boolean;
      route: string | undefined;
      layoutKind: LayoutKind | undefined;
    }
  > {
    return canvasState$.pipe(
      switchMap(async (value) => {
        const metadataMode = await this.renderingHostService.isShallowChromeMetadataEnabled();
        const isDirectRenderEnabled = await this.renderingHostService.isDirectIntegrationEnabled();
        let route: string | undefined = undefined;
        let layoutKind: LayoutKind | undefined = undefined;
        if (isDirectRenderEnabled && metadataMode) {
          this.editingMetadataService.loadAndCacheEditingData(value.canvasUrl.context);
          layoutKind = await this.layoutSwitchService.getLayoutEditingKind();
          route =
            this.contentTreeService.getTreeItem(value.canvasUrl.context.itemId)?.item.route ??
            (await this.contextService.getItem()).route;
        }

        return {
          ...value,
          metadataMode,
          isDirectRenderEnabled,
          route,
          layoutKind,
        };
      }),
    );
  }
}
