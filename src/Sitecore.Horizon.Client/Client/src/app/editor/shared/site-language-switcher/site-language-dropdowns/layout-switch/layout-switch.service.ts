/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import { MessagingRpcServicesClient } from '@sitecore/page-composer-sdk';
import { Apollo } from 'apollo-angular';
import { ContextService } from 'app/shared/client-state/context.service';
import { ItemChangeService } from 'app/shared/client-state/item-change-service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { LayoutKind } from 'app/shared/graphql/item.interface';
import { extractGqlErrorCode } from 'app/shared/utils/graphql.utils';
import { isDefined } from 'app/shared/utils/utils';
import gql from 'graphql-tag';
import { BehaviorSubject, catchError, distinctUntilChanged, filter, firstValueFrom, map, Observable } from 'rxjs';
import { EditingCanvasContract, EditingCanvasRpc } from 'sdk';

export const SET_LAYOUT_EDITING_KIND_MUTATION = gql`
  mutation setLayoutEditingKind($input: SetLayoutEditingKindInput!) {
    setLayoutEditingKind(input: $input) {
      success
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class LayoutSwitchService {
  private readonly editingCanvasRpc: Promise<MessagingRpcServicesClient<EditingCanvasRpc>>;

  private readonly _layoutEditingKind$ = new BehaviorSubject<{ sitename: string; layoutKind: LayoutKind } | undefined>(
    undefined,
  );

  public readonly layoutEditingKind$ = this._layoutEditingKind$.pipe(
    map((lk) => lk?.layoutKind),
    distinctUntilChanged(),
  );

  constructor(
    private readonly apollo: Apollo,
    private readonly contextService: ContextService,
    private readonly itemChangeService: ItemChangeService,
    private readonly configurationService: ConfigurationService,
    globalMessaging: NgGlobalMessaging,
  ) {
    this.editingCanvasRpc = globalMessaging.getRpc(EditingCanvasContract);

    this.contextService.value$.subscribe(async ({ siteName: contextSite }) => {
      // reset a stored layout kind when site changes, to ensure to always use values for the current site
      if (this._layoutEditingKind$.value && this._layoutEditingKind$.value.sitename !== contextSite) {
        this._layoutEditingKind$.next(undefined);
      }

      const freshLayoutKind = (await this.contextService.getItem()).layoutEditingKind;
      // force canvas reload when stored layout kind doesn't match a fetch one.
      // reload ensures that asynchronously load page doesn't use a wrong layout kind
      const shouldReloadCanvas =
        this._layoutEditingKind$.value && this._layoutEditingKind$.value?.layoutKind !== freshLayoutKind;

      this._layoutEditingKind$.next({ sitename: contextSite, layoutKind: freshLayoutKind });

      if (shouldReloadCanvas) {
        this.reloadCanvas(true);
      }
    });
  }

  async getLayoutEditingKind(): Promise<LayoutKind> {
    return firstValueFrom(
      this._layoutEditingKind$.pipe(
        filter(isDefined),
        map((lk) => lk?.layoutKind),
      ),
    );
  }

  async setLayoutEditingKind(layoutKind: LayoutKind): Promise<void> {
    const result = await firstValueFrom(this.setLayoutEditingKindRequest(layoutKind));
    if (result) {
      this._layoutEditingKind$.next({
        layoutKind,
        sitename: this.contextService.siteName,
      });
      this.itemChangeService.notifyChange(this.contextService.itemId, ['layout', 'layoutEditingKind']);
      this.reloadCanvas();
    }
  }

  private setLayoutEditingKindRequest(layoutKind: LayoutKind): Observable<boolean> {
    return this.apollo
      .mutate<{ setLayoutEditingKind: { success: boolean } }>({
        mutation: SET_LAYOUT_EDITING_KIND_MUTATION,
        variables: {
          input: this.configurationService.isSiteParameterSupportedForSetLayoutType()
            ? {
                kind: layoutKind,
                site: this.contextService.siteName,
              }
            : {
                kind: layoutKind,
              },
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => data!.setLayoutEditingKind.success),
      );
  }

  private async reloadCanvas(syncWithContext?: boolean) {
    await (await this.editingCanvasRpc).reload(syncWithContext);
  }
}
