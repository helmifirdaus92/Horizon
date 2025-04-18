/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ManipulateCanvasDomManager } from '../designing/manipulate-canvas-dom.manager';
import {
  ChangeDomEvent,
  InsertRenderingEvent,
  RearrangeRenderingsInSamePlaceholderEvent,
  RemoveRenderingEvent,
  UpdateRenderingEvent,
} from '../messaging/horizon-canvas.contract.parts';
import { MessagingService } from '../messaging/messaging-service';
import { Wiring } from './wiring';

export class ManipulateCanvasDomWiring implements Wiring {
  constructor(
    private readonly manipulateCanvasDomManager: ManipulateCanvasDomManager,
    private readonly messaging: MessagingService,
  ) {}

  wire(): void {
    this.messaging.editingChannel.on('canvas:change-dom', async (changeDomEvent: ChangeDomEvent) => {
      if (changeDomEvent.chromeType === 'rendering') {
        if (changeDomEvent.eventType === 'insert') {
          this.insertRendering(changeDomEvent);
        }

        if (changeDomEvent.eventType === 'update') {
          this.updateRendering(changeDomEvent);
        }

        if (changeDomEvent.eventType === 'remove') {
          this.removeRendering(changeDomEvent);
        }

        if (changeDomEvent.eventType === 'rearrangeInSamePlaceholder') {
          this.rearrangeInSamePlaceholder(changeDomEvent);
        }
      }
    });
  }

  private insertRendering(event: InsertRenderingEvent) {
    this.manipulateCanvasDomManager.insertRendering(event.renderingInstanceId, event.renderingHtml, event.placeholderKey, event.placement);
  }

  private updateRendering(event: UpdateRenderingEvent) {
    this.manipulateCanvasDomManager.updateRendering(event.renderingInstanceId, event.renderingHtml);
  }

  private removeRendering(event: RemoveRenderingEvent) {
    this.manipulateCanvasDomManager.removeRendering(event.renderingInstanceId);
  }

  private rearrangeInSamePlaceholder(event: RearrangeRenderingsInSamePlaceholderEvent) {
    this.manipulateCanvasDomManager.moveRenderingInSamePlaceholder(event.renderingInstanceId, event.direction);
  }
}
