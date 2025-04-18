/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { ContextService } from 'app/shared/client-state/context.service';
import { MediaDalService } from 'app/shared/platform-media/media.dal.service';
import { MediaItem } from 'app/shared/platform-media/media.interface';
import { MaybeObservable } from 'app/shared/utils/rxjs/rxjs-custom';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MediaDetailsService {
  private get site() {
    return this.context.siteName;
  }
  private get language() {
    return this.context.language;
  }

  constructor(private context: ContextService, private mediaService: MediaDalService) {}

  getMediaItem(path: MaybeObservable<string>, sources: MaybeObservable<readonly string[]>): Observable<MediaItem> {
    return this.mediaService.getMediaItem({ path, language: this.language, site: this.site, sources });
  }
}
