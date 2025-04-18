/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { normalizeGuid } from 'app/shared/utils/utils';
import { Observable } from 'rxjs/internal/Observable';
import { ContentItemDialogComponent } from './content-item-dialog.component';

export interface ContentItemDialogResult {
  id: string;
  path: string;
  language: string | null;
  site: string | null;
  url: string;
  displayName: string;
}

@Injectable({ providedIn: 'root' })
export class ContentItemDialogService {
  constructor(private readonly overlayService: DialogOverlayService) {}

  show(
    options:
      | {
          id: string | null;
          language: string | null;
          site: string | null;
          showLanguageSelector?: boolean;
          showPagesOnly?: boolean;
        }
      | undefined,
  ): Observable<ContentItemDialogResult> {
    const comp = this.overlayService.open(ContentItemDialogComponent, {
      size: 'AutoHeightLarge',
    });

    if (options) {
      comp.component.selection = {
        id: options.id ? normalizeGuid(options.id) : null,
        language: options.language,
        site: options.site,
      };
      comp.component.showLanguageSelector = options.showLanguageSelector ?? true;
      comp.component.showPagesOnly = options.showPagesOnly ?? false;
    }

    return comp.component.onSelect;
  }
}
