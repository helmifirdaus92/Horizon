/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import style from './designing-overlay.scss';

interface Coordinates {
  clientX: number;
  clientY: number;
}

export class DesigningOverlay {
  allowDrop = false;
  private latestDragOverCoordinates: Coordinates = { clientX: 0, clientY: 0 };
  readonly htmlElement: HTMLElement;

  constructor(
    private readonly onDragEnter: () => void,
    private readonly onDragLeave: () => void,
    private readonly onDragOver: (clientX: number, clientY: number) => void,
    private readonly onDrop: (clientX: number, clientY: number) => void,
  ) {
    const body = document.body;
    const html = document.documentElement;
    const height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

    this.htmlElement = document.createElement('div');
    this.htmlElement.className = style['sc-designing-overlay'];
    this.htmlElement.style.height = `${height}px`;

    this.attachEvents();
  }

  destroy() {
    this.htmlElement.remove();
  }

  private attachEvents() {
    this.htmlElement.addEventListener('dragenter', () => this.onDragEnter());
    this.htmlElement.addEventListener('dragleave', () => this.onDragLeave());
    this.htmlElement.addEventListener('dragover', (event) => this.handleDragOver(event));
    this.htmlElement.addEventListener('drop', (event) => this.onDrop(event.clientX, event.clientY));
  }

  private handleDragOver(event: DragEvent) {
    if (this.allowDrop) {
      event.preventDefault();
    }

    if (this.sameCoordinates({ clientX: event.clientX, clientY: event.clientY }, this.latestDragOverCoordinates)) {
      return;
    }
    this.latestDragOverCoordinates = { clientX: event.clientX, clientY: event.clientY };
    this.onDragOver(event.clientX, event.clientY);
  }

  sameCoordinates(a: Coordinates, b: Coordinates): boolean {
    return a.clientX === b.clientX && a.clientY === b.clientY;
  }
}
