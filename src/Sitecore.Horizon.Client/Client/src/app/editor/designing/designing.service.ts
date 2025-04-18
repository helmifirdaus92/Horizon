/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { ReplaySubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DesigningService {
  private readonly _droppableRenderingIds = new ReplaySubject<readonly string[]>(1);
  readonly droppableRenderingIds = this._droppableRenderingIds.asObservable();

  constructor(private readonly messagingService: MessagingService) {}

  init() {
    this.messagingService.getEditingCanvasChannel().on('page:load', ({ droppableRenderingIds }) => {
      this._droppableRenderingIds.next(droppableRenderingIds);
    });
  }
}
