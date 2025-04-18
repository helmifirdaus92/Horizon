/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, HostListener } from '@angular/core';
import { DialogCloseHandle } from '@sitecore/ng-spd-lib';
import { BXComponentVariant } from 'app/pages/left-hand-side/personalization/personalization.types';

@Component({
  selector: 'app-end-experiment-dialog',
  templateUrl: './end-experiment-dialog.component.html',
  styleUrls: ['./end-experiment-dialog.component.scss'],
})
export class  EndExperimentDialogComponent {
  isStatisticalSignificanceReached = false;
  selectedVariant: BXComponentVariant;
  _variants: BXComponentVariant[];

  set variants(value: BXComponentVariant[]) {
    this._variants = value;
  }
  get variants() {
    return this._variants;
  }

  readonly onSave = new EventEmitter<BXComponentVariant>();

  constructor(private readonly closeHandle: DialogCloseHandle) {}

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  save() {
    this.onSave.next(this.selectedVariant);

    this.close();
  }

  close() {
    this.onSave.complete();
    this.closeHandle.close();
  }
}
