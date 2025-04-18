/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';

type Position = 'top' | 'left' | 'right' | 'bottom';
export interface PaddingSetting {
  position: Position;
  value: number;
}

@Component({
  selector: 'app-padding-setting',
  templateUrl: './padding-setting.component.html',
  styleUrls: ['./padding-setting.component.scss'],
})
export class PaddingSettingComponent implements OnChanges {
  @Input() top = 0;
  @Input() left = 0;
  @Input() right = 0;
  @Input() bottom = 0;
  @Input() unit = 'px';

  @Output() submitSetting = new EventEmitter<PaddingSetting>();

  @ViewChild('topEl') paddingTopInput: ElementRef;
  @ViewChild('leftEl') paddingLeftInput: ElementRef;
  @ViewChild('rightEl') paddingRightInput: ElementRef;
  @ViewChild('bottomEl') paddingBottomInput: ElementRef;

  enableEditingTop = false;
  enableEditingLeft = false;
  enableEditingRight = false;
  enableEditingBottom = false;

  ngOnChanges(changes: SimpleChanges): void {
    const paddingProperties: Array<{
      key: Position;
      input: ElementRef;
    }> = [
      { key: 'top', input: this.paddingTopInput },
      { key: 'left', input: this.paddingLeftInput },
      { key: 'right', input: this.paddingRightInput },
      { key: 'bottom', input: this.paddingBottomInput },
    ];
    paddingProperties.forEach(({ key, input }) => {
      if (changes[key] && input) {
        this[key] = changes[key].currentValue;
        input.nativeElement.innerText = changes[key].currentValue;
      }
    });
  }

  setPadding(side: Position, value: string, referenceEl: HTMLElement): void {
    const padding = this.updatePaddingValue(value, this[side], referenceEl);

    if (!padding) {
      return;
    }
    this.submitSetting.emit({ position: side, value: padding });
  }

  private updatePaddingValue(value: string, currentSetting: number, referenceEl: HTMLElement): number | undefined {
    const parsedValue = parseFloat(value);
    if (parsedValue === currentSetting) {
      return undefined;
    }
    if (isNaN(parsedValue)) {
      referenceEl.innerHTML = currentSetting.toString();
      return undefined;
    }
    return parsedValue;
  }
}
