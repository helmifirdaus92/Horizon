/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { DialogCloseHandle, DialogOverlayService } from '@sitecore/ng-spd-lib';

@Component({
  selector: 'app-feature-not-available-dialog',
  templateUrl: './feature-not-available-dialog.component.html',
  styleUrls: ['./feature-not-available-dialog.component.scss'],
})
export class FeatureNotAvailableDialogComponent {
  constructor(private readonly closeHandle: DialogCloseHandle, private readonly router: Router) {}

  static show(overlayService: DialogOverlayService) {
    return overlayService.open(FeatureNotAvailableDialogComponent, {
      size: 'AutoHeight',
    });
  }

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      event.preventDefault();
      this.closeAndNavigateToEditor();
    }
  }

  closeAndNavigateToEditor() {
    this.closeHandle.close();
    this.router.navigate(['editor']);
  }
}
