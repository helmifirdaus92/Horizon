/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { ContextService } from 'app/shared/client-state/context.service';
import { BaseItemDalService } from 'app/shared/graphql/item.dal.service';
import { ItemInsertOption } from 'app/shared/graphql/item.interface';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CreateFolderService {
  private readonly _startCreateOperation = new Subject<{ parentId: string }>();
  startCreateOperation$: Observable<{ parentId: string }> = this._startCreateOperation.asObservable();

  constructor(
    private readonly context: ContextService,
    private readonly itemDalService: BaseItemDalService,
  ) {}

  getInsertOptions(itemId: string): Observable<ItemInsertOption[]> {
    return this.itemDalService.getItemInsertOptions(itemId, 'folder', this.context.language, this.context.siteName);
  }

  startCreateOperation(parentId: string) {
    this._startCreateOperation.next({ parentId });
  }
}
