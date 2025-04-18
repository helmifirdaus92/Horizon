/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { DesigningManager } from '../designing/designing-manager';
import { DesigningNativeEventsTranslator } from '../designing/designing-native-events-translator';
import { ManipulateCanvasDomManager } from '../designing/manipulate-canvas-dom.manager';
import { MessagingService } from '../messaging/messaging-service';
import { Wiring } from './wiring';

export class DesigningMessagingWiring implements Wiring {
  private previousAllowDropChange?: boolean;

  constructor(
    private readonly nativeEventsTranslator: DesigningNativeEventsTranslator,
    private readonly designingManager: DesigningManager,
    private readonly manipulateCanvasDomManager: ManipulateCanvasDomManager,
    private readonly messaging: MessagingService,
  ) {}

  wire(): void {
    const designingChannel = this.messaging.designingChannel;

    designingChannel.on('dragstart', () => this.nativeEventsTranslator.onNativeDragStart());
    designingChannel.on('dragend', () => this.nativeEventsTranslator.onNativeDragEnd());

    designingChannel.on('dragleave', () => this.nativeEventsTranslator.onNativeDragLeave());
    designingChannel.on('dragover', (info) => this.nativeEventsTranslator.onNativeDragOver(info));
    designingChannel.on('drop', (info) => this.nativeEventsTranslator.onNativeDrop(info));

    // Report droppable status.
    this.designingManager.onHighlightDropTarget.on(({ canDrop }) => this.emitAllowDropChange(canDrop));
    this.designingManager.onClearHighlightingDropTarget.on(() => this.emitAllowDropChange(false));
    // Reset the last reported status, so we always report change in new dragging session.
    designingChannel.on('dragstart', () => {
      this.previousAllowDropChange = undefined;
    });

    // Save dropped rendering
    this.designingManager.onDropped.on(async ({ placeholder, renderingDefinitionId, movedRendering: movedRendering, anchor }) => {
      if (!movedRendering) {
        designingChannel.rpc.insertRendering(
          renderingDefinitionId,
          placeholder.placeholderKey,
          anchor ? { targetInstanceId: anchor.target.renderingInstanceId, position: anchor.position } : undefined,
        );
      } else {
        await designingChannel.rpc.moveRendering(
          movedRendering.renderingInstanceId,
          placeholder.placeholderKey,
          anchor ? { targetInstanceId: anchor.target.renderingInstanceId, position: anchor.position } : undefined,
        );
        this.manipulateCanvasDomManager.moveRendering(movedRendering, placeholder, anchor?.target, anchor?.position);
      }
    });
    designingChannel.on('insertRendering:cancel', () => this.designingManager.cancelDrop());
  }

  private emitAllowDropChange(newValue: boolean): void {
    if (this.previousAllowDropChange === newValue) {
      return;
    }
    this.previousAllowDropChange = newValue;

    this.messaging.designingChannel.emit('allow-drop:change', newValue);
  }
}
