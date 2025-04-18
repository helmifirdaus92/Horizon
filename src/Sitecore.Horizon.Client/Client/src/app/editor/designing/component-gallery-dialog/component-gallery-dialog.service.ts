/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { ElementDimensions } from 'app/shared/utils/utils';
import { Observable } from 'rxjs';
import { ComponentGalleryDialogComponent } from './component-gallery-dialog.component';

@Injectable({ providedIn: 'root' })
export class ComponentGalleryDialogService {
  constructor(private readonly overlayService: DialogOverlayService) {}

  show(options: { allowedRenderingIds: readonly string[]; dimension: ElementDimensions }): Observable<string> {
    const comp = this.overlayService.open(ComponentGalleryDialogComponent, {
      size: { width: '0', height: '0' },
    });
    comp.component.allowedRenderingIds = options.allowedRenderingIds;
    comp.component.chromeDimension = options.dimension;
    return comp.component.onSelect;
  }
}
