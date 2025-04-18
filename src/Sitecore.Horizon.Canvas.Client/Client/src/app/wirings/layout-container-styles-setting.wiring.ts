/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeManager } from '../chrome/chrome-manager';
import { isRenderingChrome, RenderingChrome } from '../chrome/chrome.rendering';
import { LayoutComponentIdentifier } from '../messaging/horizon-canvas.contract.parts';
import { MessagingService } from '../messaging/messaging-service';
import { Wiring } from './wiring';

export class LayoutContainerStylesSettingWiring implements Wiring {
  private readonly prefix = 'xmc';
  private layoutContainer: HTMLElement | null = null;
  private columnContainer: HTMLCollectionOf<Element> | undefined = undefined;

  constructor(
    private readonly chromeManager: ChromeManager,
    private readonly messaging: MessagingService,
  ) {}
  wire(): void {
    this.messaging.editingChannel.on('layoutComponentStylesSetting:change', (params) => {
      const chrome = this.chromeManager.chromes.find((c) => isRenderingChrome(c) && c.renderingInstanceId === params.containerInstanceId);
      if (chrome && isRenderingChrome(chrome)) {
        this.initializeContainers(chrome);

        switch (params.containerType) {
          case 'columnStyles':
            this.updateColumnStyles(params);
            break;
          case 'containerStyles':
            this.updateContainerStyles(params);
            break;
        }

        if (params.breakPoint) {
          this.updateColumnStackBreakPoint(params);
        }
      }
    });
  }

  private initializeContainers(chrome: RenderingChrome): void {
    const startElement = chrome.startElement.nextElementSibling;
    if (startElement) {
      this.layoutContainer = startElement.getElementsByClassName('xmc-layout-container')[0] as HTMLElement;
      this.columnContainer = startElement.getElementsByClassName('xmc-layout-column');
    }
  }

  private updateColumnStyles(params: LayoutComponentIdentifier): void {
    if (this.columnContainer) {
      const columnIndex = params.columnIndex as number;
      const columnsToUpdate = `ColumnStyle${columnIndex + 1}`;

      const columnStyles = (params.renderingParameters[columnsToUpdate] || '')
        .split(' ')
        .map((style) => `${this.prefix}-${style}`)
        .join(' ');

      const columnEl = this.columnContainer[columnIndex].children[0] as HTMLElement;
      const columnContentClassIdentifier = 'xmc-layout-column-content';

      if (columnEl) {
        columnEl.classList.remove(...Array.from(columnEl.classList));
        columnEl.classList.add(columnContentClassIdentifier, ...columnStyles.split(' '));
      }
    }
  }

  private updateContainerStyles(params: LayoutComponentIdentifier): void {
    if (!this.layoutContainer) {
      return;
    }
    const containerStyles = params.renderingParameters['ContainerStyles'] || '';

    if (this.layoutContainer) {
      this.layoutContainer.style.cssText = containerStyles;
    }
  }

  private updateColumnStackBreakPoint(params: LayoutComponentIdentifier): void {
    if (!this.layoutContainer) {
      return;
    }
    const breakPoint = params.renderingParameters['StackColumnAt'];

    if (breakPoint) {
      this.layoutContainer.classList.remove(...Array.from(this.layoutContainer.classList));
      const layoutContainerClassIdentifier = 'xmc-layout-container';
      if (breakPoint !== 'never') {
        const breakPointClass = `${this.prefix}-${breakPoint}-stack`;
        this.layoutContainer.classList.add(layoutContainerClassIdentifier, ...breakPointClass.split(' '));
      } else {
        this.layoutContainer.classList.add(layoutContainerClassIdentifier);
      }
    }
  }
}
