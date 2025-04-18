/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { ContextService } from 'app/shared/client-state/context.service';
import { ItemChangeService } from 'app/shared/client-state/item-change-service';
import { BaseItemDalService } from 'app/shared/graphql/item.dal.service';
import { replayWhen } from 'app/shared/utils/rxjs/rxjs-custom';
import { isSameGuid } from 'app/shared/utils/utils';
import { Observable, combineLatest, of } from 'rxjs';
import { catchError, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { CanvasServices } from '../shared/canvas.services';

export interface CanvasSelectionContext {
  itemId: string;
  displayName: string;
}

export type GetFieldSourcesError = 'InvalidTemplateSource';

@Injectable({ providedIn: 'root' })
export class EditorRhsService {
  constructor(
    private readonly canvasServices: CanvasServices,
    private readonly context: ContextService,
    private readonly itemService: BaseItemDalService,
    private readonly itemChangeService: ItemChangeService,
  ) {}

  watchSelectionContext(): Observable<CanvasSelectionContext> {
    return combineLatest([this.canvasServices.chromeSelect$, this.context.value$]).pipe(
      replayWhen(([selectEvent, context]) =>
        this.itemChangeService.watchForChanges({
          itemId: selectEvent.selection?.chrome.contextItem.id ?? context.itemId,
        }),
      ),
      switchMap(async ([selectEvent, context]) => {
        const itemId = selectEvent.selection?.chrome.contextItem.id ?? context.itemId;
        const displayName = selectEvent.selection?.chrome.displayName ?? (await this.context.getItem()).displayName;
        return { itemId, displayName };
      }),
    );
  }

  watchCanWrite(): Observable<boolean> {
    return this.context.value$.pipe(
      distinctUntilChanged((v1, v2) => isSameGuid(v1.itemId, v2.itemId)),
      switchMap(() => this.context.getItem()),
      map((item) => item.permissions.canWrite),
    );
  }

  getFriendlyDataSourceValue(dataSource: string): Observable<string> {
    return this.itemService.getItem(dataSource, this.context.language, this.context.siteName).pipe(
      map((item) => item.path),
      // If we cannot retrieve source path (e.g. value is incorrect), just show the raw value.
      catchError(() => of(dataSource)),
    );
  }
}
