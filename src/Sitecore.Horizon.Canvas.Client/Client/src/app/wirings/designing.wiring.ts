/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeHighlighter } from '../chrome/chrome-highlighter';
import { ChromeManager } from '../chrome/chrome-manager';
import { DesigningFrameManager } from '../designing/designing-frame-manager';
import { DesigningManager } from '../designing/designing-manager';
import { DesigningNativeEventsTranslator } from '../designing/designing-native-events-translator';
import { DesigningOverlay } from '../designing/designing-overlay';
import { DisableChromeOverlay } from '../frame/disable-overlay';
import { FrameManager } from '../frame/frame-manager';
import { Wiring } from './wiring';

export class DesigningWiring implements Wiring {
  private designingOverlay: DesigningOverlay | undefined = undefined;
  private disableRenderingFrame: DisableChromeOverlay | undefined = undefined;

  constructor(
    private readonly frameManager: FrameManager,
    private readonly chromeManager: ChromeManager,
    private readonly nativeEventsTranslator: DesigningNativeEventsTranslator,
    private readonly designingManager: DesigningManager,
    private readonly designingFrameManager: DesigningFrameManager,
    private readonly chromeHighlighter: ChromeHighlighter,
    private readonly abortController: AbortController,
  ) {}

  wire(): void {
    this.nativeEventsTranslator.setupEvents(this.chromeManager.chromes);

    this.wireTranslatorAndDesigningManager();
    this.wireDesigningManagerAndFrameManager();
    this.wireMoveRenderingInCanvas();

    // Remove all the highlighted chromes when dropping begins.
    this.nativeEventsTranslator.onDragStart.on(() => this.chromeHighlighter.resetAllHighlightings());

    // Notify translator about dynamically added drop zones, so it could catch them internally.
    this.designingFrameManager.onAddNativeDropZoneElement.on(({ element, dropTarget }) =>
      this.nativeEventsTranslator.registerCustomDropZone(element, dropTarget),
    );
  }

  private wireTranslatorAndDesigningManager() {
    this.nativeEventsTranslator.onDragStart.on(() => this.designingManager.dragStart());
    this.nativeEventsTranslator.onDragOver.on((event) => this.designingManager.dragOver(event));
    this.nativeEventsTranslator.onDrop.on((event) => this.designingManager.dropRendering(event));
    this.nativeEventsTranslator.onDragLeave.on(() => this.designingManager.dragLeave());
  }

  private wireDesigningManagerAndFrameManager() {
    this.designingManager.onShowGuideDropZones.on((rendering) => this.designingFrameManager.showGuideDropZones(rendering));
    this.designingManager.onClearGuideDropZones.on(() => this.designingFrameManager.hideGuideDropZones());

    this.designingManager.onHighlightDropTarget.on(({ target, canDrop }) => this.designingFrameManager.highlight(target, canDrop));
    this.designingManager.onClearHighlightingDropTarget.on(() => this.designingFrameManager.unhighlight());
    this.designingManager.onDropped.on(({ placeholder }) => this.designingFrameManager.animateDrop(placeholder));
    this.designingManager.onDroppedCanceled.on(() => this.designingFrameManager.stopDropAnimation());
  }

  private wireMoveRenderingInCanvas() {
    this.frameManager.onMoveRenderingStart.on((renderingChrome) => {
      this.designingOverlay = new DesigningOverlay(
        () => this.nativeEventsTranslator.onNativeDragStart(),
        () => this.nativeEventsTranslator.onNativeDragLeave(),
        (clientX: number, clientY: number) =>
          this.nativeEventsTranslator.onNativeDragOver({
            renderingId: renderingChrome.renderingDefinitionId,
            movedRendering: renderingChrome,
            clientX,
            clientY,
          }),
        (clientX: number, clientY: number) =>
          this.nativeEventsTranslator.onNativeDrop({
            renderingId: renderingChrome.renderingDefinitionId,
            movedRendering: renderingChrome,
            clientX,
            clientY,
          }),
      );
      window.document.body.appendChild(this.designingOverlay.htmlElement);
      this.disableRenderingFrame = new DisableChromeOverlay(renderingChrome, this.abortController);
      this.disableRenderingFrame.render();
    });

    this.frameManager.onMoveRenderingEnd.on(() => {
      this.designingOverlay?.destroy();
      this.disableRenderingFrame?.remove();
      this.nativeEventsTranslator.onNativeDragEnd();
    });

    this.designingManager.onHighlightDropTarget.on(({ canDrop }) => {
      if (this.designingOverlay) {
        this.designingOverlay.allowDrop = canDrop;
      }
    });
    this.designingManager.onClearHighlightingDropTarget.on(() => {
      if (this.designingOverlay) {
        this.designingOverlay.allowDrop = false;
      }
    });
  }
}
