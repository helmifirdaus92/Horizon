/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { MediaValue } from 'app/editor/right-hand-side/image-field/image-field-messaging.service';
import { Observable } from 'rxjs/internal/Observable';
import { MediaDialogComponent } from './media-dialog.component';

export type MediaType = 'image' | 'file';

@Injectable({ providedIn: 'root' })
export class MediaDialogService {
  constructor(private readonly overlayService: DialogOverlayService) {}

  show(options: {
    currentValue?: MediaValue | null;
    sources: readonly string[];
    mediaTypes?: MediaType[];
  }): Observable<MediaValue> {
    const comp = this.overlayService.open(MediaDialogComponent, {
      size: 'FullWithPadding',
    });

    comp.component.selection = options.currentValue ?? null;
    comp.component.sources = options.sources;
    comp.component.mediaTypes = options.mediaTypes ?? ['image'];

    return comp.component.onSelect;
  }
}
