/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable, OnDestroy } from '@angular/core';
import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { firstValueFrom, Observable, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, first } from 'rxjs/operators';
import {
  PropertiesPanelContext,
  PropertiesPanelContextContract,
} from 'sdk/contracts/properties-panel-context.contract';

function isSameContext(left: PropertiesPanelContext, right: PropertiesPanelContext): boolean {
  return left.itemId === right.itemId;
}

@Injectable()
export class RhsContextSdkMessagingService implements OnDestroy {
  private readonly lifetime = new Lifetime();

  private readonly lastContext$ = new ReplaySubject<PropertiesPanelContext>(1);

  constructor(globalMessaging: NgGlobalMessaging) {
    const rpcProvider = globalMessaging.createRpc(PropertiesPanelContextContract, {
      getContext: () => firstValueFrom(this.lastContext$.pipe(first())),
    });

    const eventEmitter = globalMessaging.createEventEmitter(PropertiesPanelContextContract);
    this.lastContext$
      .pipe(takeWhileAlive(this.lifetime), distinctUntilChanged(isSameContext))
      .subscribe((val) => eventEmitter.emit('change', val));

    this.lifetime.registerCallbacks(
      //
      () => rpcProvider.disconnect(),
      () => eventEmitter.disconnect(),
    );
  }

  ngOnDestroy(): void {
    this.lifetime.dispose();
  }

  /**
   * Observes input changes while the service is alive and notifies FED UI messaging about changes.
   */
  observeContextChanges(context$: Observable<PropertiesPanelContext>): void {
    context$.pipe(takeWhileAlive(this.lifetime)).subscribe(this.lastContext$);
  }
}
