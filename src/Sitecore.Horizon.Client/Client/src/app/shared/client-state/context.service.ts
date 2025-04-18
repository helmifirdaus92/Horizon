/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Inject, Injectable, InjectionToken } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NEVER, Observable, ReplaySubject, SchedulerLike, asapScheduler, firstValueFrom } from 'rxjs';
import { catchError, distinctUntilChanged, filter, map, observeOn, shareReplay } from 'rxjs/operators';
import { BaseItemDalService } from '../graphql/item.dal.service';
import { Item } from '../graphql/item.interface';
import { TimedNotification, TimedNotificationsService } from '../notifications/timed-notifications.service';
import { isSameGuid, normalizeGuid } from '../utils/utils';
import { ContextHelper } from './context.helper';
import { ItemChangeScope, ItemChangeScopeList } from './item-change-service';
import { PageInteractionsGuardService } from './page-interactions-guard.service';

export interface RequiredContext {
  siteName: string;
  language: string;
  itemId: string;
}

export type Context = RequiredContext & {
  deviceLayoutId?: string;
  itemVersion?: number;
  variant?: string;
};

export type EventSource = null | 'CANVAS_BEACON' | 'AB_TEST_COMPONENT_HANDLER';

export type ContextChangeOptions = null | {
  eventSource?: EventSource;
  forceEmitSameValue?: boolean;
  preventCanvasReload?: boolean;
};

export interface ContextChange {
  context: Context;
  options: ContextChangeOptions;
}

export const CONTEXT_SERVICE_SCHEDULER = new InjectionToken<SchedulerLike>('context-service-scheduler', {
  providedIn: 'root',
  factory: () => asapScheduler,
});

@Injectable({ providedIn: 'root' })
export class ContextService {
  private item: Item | undefined = undefined;
  protected _itemPromise: Promise<Item> = new Promise(() => {});

  protected readonly _valueChanges$ = new ReplaySubject<ContextChange>(1);
  readonly valueChanges$: Observable<ContextChange>;

  readonly value$: Observable<Context>;
  readonly itemId$: Observable<string>;
  readonly itemVersion$: Observable<number | undefined>;
  readonly language$: Observable<string>;
  readonly siteName$: Observable<string>;
  readonly variant$: Observable<string | undefined>;

  get value(): Context {
    return this.context;
  }

  get itemId(): string {
    return this.value.itemId;
  }

  get itemVersion(): number | undefined {
    return this.value.itemVersion;
  }

  get language(): string {
    return this.value.language;
  }

  get siteName(): string {
    return this.value.siteName;
  }

  get variant(): string | undefined {
    return this.value.variant;
  }

  private context = ContextHelper.empty;

  /**
   * Use scheduler to emit context changes in async fashion.
   * By default `asapScheduler` which emits in the next micro task (the default value is provided in the factory fn).
   *   1. To be backward compatible with previous implementation using apollo-link-state
   *   1. Solves a synchronization issue in router-state service
   *   1. Can prevent errors in Angular "Expression has changed after it was checked"
   */
  constructor(
    @Inject(CONTEXT_SERVICE_SCHEDULER) scheduler: SchedulerLike,
    private readonly itemDalService: BaseItemDalService,
    private readonly timedNotificationsService: TimedNotificationsService,
    private readonly translateService: TranslateService,
    private readonly pageInteractionsGuardService: PageInteractionsGuardService,
  ) {
    this.valueChanges$ = this._valueChanges$.pipe(observeOn(scheduler));
    const valueChangesFiltered$ = this.valueChanges$.pipe(
      filter((ctx) => !!ctx.context.itemId && !!ctx.context.language && !!ctx.context.siteName),
      distinctUntilChanged(
        (before, after) => !after.options?.forceEmitSameValue && ContextHelper.areEqual(before.context, after.context),
      ),
      shareReplay(1),
    );
    this.value$ = valueChangesFiltered$.pipe(map((ctx) => ctx.context));

    this.itemId$ = valueChangesFiltered$.pipe(
      distinctUntilChanged(
        (prev, cur) => !cur.options?.forceEmitSameValue && isSameGuid(prev.context.itemId, cur.context.itemId),
      ),
      map((v) => v.context.itemId),
    );
    this.itemVersion$ = valueChangesFiltered$.pipe(
      distinctUntilChanged(
        (prev, cur) => !cur.options?.forceEmitSameValue && prev.context.itemVersion === cur.context.itemVersion,
      ),
      map((v) => v.context.itemVersion),
    );
    this.language$ = valueChangesFiltered$.pipe(
      distinctUntilChanged(
        (prev, cur) => !cur.options?.forceEmitSameValue && prev.context.language === cur.context.language,
      ),
      map((v) => v.context.language),
    );
    this.siteName$ = valueChangesFiltered$.pipe(
      distinctUntilChanged(
        (prev, cur) => !cur.options?.forceEmitSameValue && prev.context.siteName === cur.context.siteName,
      ),
      map((v) => v.context.siteName),
    );
    this.variant$ = valueChangesFiltered$.pipe(
      distinctUntilChanged(
        (prev, cur) => !cur.options?.forceEmitSameValue && prev.context.variant === cur.context.variant,
      ),
      map((v) => v.context.variant),
    );
  }

  async init(context: Context) {
    await this.updateContext(context);
  }

  async updateContext(contextUpdate: Partial<Context>, changeOptions: ContextChangeOptions = null): Promise<void> {
    const { update, options } = await this.pageInteractionsGuardService.onBeforeContextChange(
      contextUpdate,
      changeOptions,
    );

    this._updateContext(update, options);
  }

  getItem(forceUpdate?: boolean): Promise<Item> {
    if (forceUpdate) {
      this.notifyItemStateUpdate(this.itemId, ItemChangeScopeList);
    }
    return this._itemPromise;
  }

  notifyItemStateUpdate(itemId: string, scopes: readonly ItemChangeScope[]) {
    if (!isSameGuid(itemId, this.context.itemId)) {
      return;
    }

    const updatedItemPromise = firstValueFrom(
      this.itemDalService.getItemState(
        this.context.itemId,
        this.context.language,
        this.context.siteName,
        this.context.itemVersion,
        scopes,
      ),
    );
    this._itemPromise = Promise.all([this._itemPromise, updatedItemPromise]).then(([item, update]) => {
      return { ...item, ...update };
    });
  }

  protected _updateContext(contextUpdate: Partial<Context>, options: ContextChangeOptions): void {
    const contextWithNormalizedId = contextUpdate;
    if (contextUpdate.itemId) {
      contextWithNormalizedId.itemId = normalizeGuid(contextUpdate.itemId);
    }

    // There's an issue that there's no way to determine which itemVersion should be used after any context update.
    // So, to avoid complexity in decision making we always reset it to "undefined" if itemVersion is not provided.
    contextWithNormalizedId.itemVersion = contextUpdate.itemVersion || undefined;

    // We need to clear variant if context reported without variant, for example site, language, item or item version changed
    contextWithNormalizedId.variant = contextUpdate.variant || undefined;

    this.context = { ...this.context, ...contextWithNormalizedId };

    // it is important to start fetching context item first. Then dependent services can use it on context change push
    this.fetchContextItem();

    this._valueChanges$.next({ context: this.context, options });
  }

  private fetchContextItem() {
    if (this.isSameItemFetched(this.context)) {
      return;
    }

    this.item = undefined;
    this._itemPromise = firstValueFrom(
      this.itemDalService
        .getItem(this.context.itemId, this.context.language, this.context.siteName, this.context.itemVersion)
        .pipe(
          catchError(() => {
            // If the getItem request returns an error, the Canvas will most likely be reloaded with the Home item.
            // We make itemPromise to be never resolved. So, all the subscribers will not receive unhandled error, but the new Canvas page load will reset it instead.
            // Bug report: https://sitecore.atlassian.net/browse/PGS-2481
            this.showGetItemErrorNotification();

            return NEVER;
          }),
        ),
    ).then((item) => (this.item = item));
  }

  private isSameItemFetched(context: Context) {
    return (
      !!this.item &&
      isSameGuid(this.item.id, context.itemId) &&
      this.item.language === context.language &&
      this.item.version === context.itemVersion
    );
  }

  private async showGetItemErrorNotification() {
    const text = await firstValueFrom(this.translateService.get('ERRORS.APP_RESET_TO_HOME'));
    const actonTitle = await firstValueFrom(this.translateService.get('ERRORS.RELOAD_ERROR_ACTION_TITLE'));

    const notification = new TimedNotification('getItemError', text, 'warning');
    notification.action = { run: () => window.location.reload(), title: actonTitle };
    notification.persistent = false;

    this.timedNotificationsService.pushNotification(notification);
  }
}
