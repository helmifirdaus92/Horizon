/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-chart-legend',
  templateUrl: './chart-legend.component.html',
  styleUrls: ['./chart-legend.component.scss'],
})
export class ChartLegendComponent {
  @Input() legendItems: Array<{ name: string }> = [];
  @Input() palette: string[] = [];
  @Input() activeItem: any;
  @Input() isStackedSeries: any;
  @Input() legendLabelFormatter?: (name: any) => any;
  @Output() itemHighlighted = new EventEmitter();

  constructor() {}

  formatLabel = (name: any) => {
    if (this.legendLabelFormatter) {
      return this.legendLabelFormatter(name);
    }

    return name;
  };

  itemHighlightedHandler(event: any, index: number): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.itemHighlighted.emit(this.legendItems[index]);
  }

  clearHighlight() {
    this.itemHighlighted.emit(undefined);
  }

  itemTracker(_: number, item: any): any {
    return item ? item : undefined;
  }
}
