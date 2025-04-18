/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, HostListener } from '@angular/core';
import { DialogCloseHandle } from '@sitecore/ng-spd-lib';
import { CanvasServices } from 'app/editor/shared/canvas.services';
import { LayoutContainerRenderingService } from '../layout-container-rendering-service';
import { LayoutTemplatesKey } from '../layout-size-templates';

@Component({
  selector: 'app-column-append-dialog',
  templateUrl: './column-append-dialog.component.html',
  styleUrls: ['./column-append-dialog.component.scss'],
})
export class ColumnAppendDialogComponent {
  newEnabledColumnCount = 1;
  previousColumnCount = 0;
  templateKey = '';

  constructor(
    private readonly closeHandle: DialogCloseHandle,
    private readonly canvasServices: CanvasServices,
    private readonly layoutContainerService: LayoutContainerRenderingService,
  ) {}

  get columns(): number[] {
    return Array(this.previousColumnCount)
      .fill(0)
      .map((_, i) => i + 1);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  close() {
    this.closeHandle.close();
  }

  async appendContent() {
    const phKeyOfContentAppendingColumn = await this.layoutContainerService.getPhKeyOfContentAppendingColumn(
      this.newEnabledColumnCount,
    );
    const allRenderingsInsideRemovingColumns = await this.layoutContainerService.getRenderingsInsideRemovingColumn(
      this.newEnabledColumnCount,
    );
    for (const rendering of allRenderingsInsideRemovingColumns) {
      await this.canvasServices
        .getCurrentLayout()
        .moveRendering(rendering.instanceId, phKeyOfContentAppendingColumn, undefined, true);
    }
    await this.layoutContainerService.updateLayoutTemplate(this.templateKey as LayoutTemplatesKey);
    this.close();
  }

  async removeContent() {
    const allRenderingsInsideRemovingColumns = await this.layoutContainerService.getRenderingsInsideRemovingColumn(
      this.newEnabledColumnCount,
    );

    for (const rendering of allRenderingsInsideRemovingColumns) {
      await this.canvasServices.getCurrentLayout().removeRendering(rendering.instanceId, true, false);
    }

    await this.layoutContainerService.updateLayoutTemplate(this.templateKey as LayoutTemplatesKey);
    this.close();
  }

  getBackgroundColor(index: number): string {
    if (index >= this.newEnabledColumnCount && index < this.previousColumnCount) {
      return '#ffe4df';
    } else if (index < this.newEnabledColumnCount) {
      return 'rgba(0, 0, 0, 0.43)';
    } else {
      return 'transparent';
    }
  }
}
