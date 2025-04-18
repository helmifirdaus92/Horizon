/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CreateFolderService } from 'app/pages/left-hand-side/create-page/create-folder.service';
import { ItemInsertOption } from 'app/shared/graphql/item.interface';
import { Observable, of, Subject } from 'rxjs';

export class CreateFolderServiceTesting implements Partial<CreateFolderService> {
  startCreateOperation$ = new Subject<{ parentId: string }>();

  getInsertOptions(_parentId: string): Observable<ItemInsertOption[]> {
    return of([
      {
        id: 'mockOption1',
        name: 'Option 1',
        displayName: 'Mock Option Display Name',
      },
    ]);
  }
}
