/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import { DesigningMessagingChannel } from 'app/shared/messaging/horizon-canvas.contract.defs';
import { RenderingPlacementAnchor } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { ElementDimensions, calculateRelativeCoordinates, sameCoordinates } from 'app/shared/utils/utils';
import { Subject, firstValueFrom } from 'rxjs';
import { distinctUntilChanged, take } from 'rxjs/operators';
import { DragAndDropNewRenderingContract } from 'sdk/contracts/editing-canvas.contract';
import { CanvasServices } from '../shared/canvas.services';
import { ComponentGalleryDialogService } from './component-gallery-dialog/component-gallery-dialog.service';
import { DesigningOverlay, DesigningOverlayService } from './designing-overlay.service';

/**
 * This service handles drag'n'drop events for Page Designing.
 * It will create an overlay on top of the Editing iframe and react to drag events on it.
 * It also communicates with the Canvas.
 */
@Injectable({ providedIn: 'root' })
export class DragndropService implements OnDestroy {
  private dragend$ = new Subject<void>();
  private channel: DesigningMessagingChannel;
  private readonly lifetime = new Lifetime();

  constructor(
    private readonly overlayService: DesigningOverlayService,
    readonly messagingService: MessagingService,
    private readonly canvasServices: CanvasServices,
    private readonly translateService: TranslateService,
    private readonly timedNotificationService: TimedNotificationsService,
    private readonly globalMessaging: NgGlobalMessaging,
    private readonly componentGalleryDialogService: ComponentGalleryDialogService,
  ) {
    this.channel = messagingService.getDesigningChannel();
    this.channel.setRpcServicesImpl({
      insertRendering: (id, phKey, placement) => this.insertRendering(id, phKey, placement),
      moveRendering: (instanceId, phKey, placement) => this.moveRendering(instanceId, phKey, placement),
      promptInsertRendering: (phKey, allowedRenderingsIds, chromeDimension) =>
        this.promptInsertRenderingDialog(phKey, allowedRenderingsIds, chromeDimension),
    });

    this.globalMessaging.createRpc(DragAndDropNewRenderingContract, {
      startDragAndDrop: (renderingDefinitionId) => this.dragstart(renderingDefinitionId),
      stopDragAndDrop: () => this.dragend(),
    });
  }

  ngOnDestroy(): void {
    this.lifetime.dispose();
  }
  // ******* Events on the DRAGGABLE target (component gallery) *******
  dragstart(renderingId: string) {
    this.channel.emit('dragstart', undefined);

    const overlay = this.overlayService.addOverlayOverIframe();
    this.wireOverlayEvents(overlay, renderingId);

    const allowDropUnsubscribe = this.channel.on('allow-drop:change', (value) => {
      overlay.allowDrop = value;
    });

    this.dragend$.pipe(take(1)).subscribe(() => {
      overlay.destroy();
      allowDropUnsubscribe();
    });
  }

  dragend() {
    this.channel.emit('dragend', undefined);
    this.dragend$.next(undefined);
  }

  // ******* Events on the DROP target (overlay) *******
  private dragenter() {
    this.channel.emit('dragenter', undefined);
  }

  private dragleave() {
    this.channel.emit('dragleave', undefined);
  }

  private dragover(event: DragEvent, overlayEl: HTMLElement, renderingId: string) {
    const { clientX, clientY } = calculateRelativeCoordinates(event, overlayEl);
    this.channel.emit('dragover', { renderingId, clientX, clientY });
  }

  private drop(event: DragEvent, overlayEl: HTMLElement, renderingId: string) {
    const { clientX, clientY } = calculateRelativeCoordinates(event, overlayEl);
    this.channel.emit('drop', { renderingId, clientX, clientY });
  }

  private async insertRendering(
    renderingDefinitionId: string,
    placeholderKey: string,
    anchor: RenderingPlacementAnchor | undefined,
  ): Promise<void> {
    let canceled;

    try {
      const placement = anchor ? { target: anchor.targetInstanceId, position: anchor.position } : undefined;
      const result = await this.canvasServices
        .getCurrentLayout()
        .insertRendering(renderingDefinitionId, placeholderKey, placement);

      canceled = !result;
    } catch {
      canceled = true;

      const errorText = await firstValueFrom(this.translateService.get('EDITOR.RENDERING_INSERT_FAILED'));
      this.timedNotificationService.push(`RenderingInitialization-${renderingDefinitionId}`, errorText, 'error');
    }

    if (canceled) {
      this.channel.emit('insertRendering:cancel');
    }
  }

  private async moveRendering(
    renderingInstanceId: string,
    placeholderKey: string,
    anchor: RenderingPlacementAnchor | undefined,
  ): Promise<void> {
    let successfullyMoved = false;
    try {
      const placement = anchor ? { target: anchor.targetInstanceId, position: anchor.position } : undefined;
      successfullyMoved = await this.canvasServices
        .getCurrentLayout()
        .moveRendering(renderingInstanceId, placeholderKey, placement);
    } catch {
      successfullyMoved = false;
    } finally {
      if (!successfullyMoved) {
        const errorText = await firstValueFrom(this.translateService.get('EDITOR.RENDERING_MOVE_FAILED'));
        this.timedNotificationService.push(`RenderingMove-${renderingInstanceId}`, errorText, 'error');
      }
    }
  }

  private promptInsertRenderingDialog(
    placeholderKey: string,
    allowedRenderingIds: readonly string[],
    chromeDimension: ElementDimensions,
  ) {
    this.componentGalleryDialogService
      .show({ allowedRenderingIds, dimension: chromeDimension })
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe((value) => {
        this.insertRendering(value, placeholderKey, undefined);
      });
  }
  // ******* Helpers *******
  private wireOverlayEvents(overlay: DesigningOverlay, renderingId: string) {
    overlay.dragenter$.subscribe(() => this.dragenter());
    overlay.dragleave$.subscribe(() => this.dragleave());
    overlay.dragover$
      .pipe(distinctUntilChanged<DragEvent>(sameCoordinates))
      .subscribe((event) => this.dragover(event, overlay.element, renderingId));
    overlay.drop$.subscribe((event) => this.drop(event, overlay.element, renderingId));
  }
}
