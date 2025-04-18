/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';

@Component({
  selector: 'app-gallery-item',
  template: `
    <ng-spd-thumbnail>
      <ng-content select="[galleryItemImg]"></ng-content>
    </ng-spd-thumbnail>
    <ng-content></ng-content>
  `,
  styleUrls: ['gallery-item.component.scss'],
})
export class GalleryItemComponent {}
