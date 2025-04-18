/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, OnInit } from '@angular/core';
import { ContextService } from 'app/shared/client-state/context.service';
import { combineLatest, map, Observable, switchMap } from 'rxjs';
import { Item } from 'app/shared/graphql/item.interface';
import { ItemChangeService } from '../../../../shared/client-state/item-change-service';
import { replayWhen } from '../../../../shared/utils/rxjs/rxjs-custom';

@Component({
  selector: 'app-page-data-view',
  template: `
    <h1 class="text-center mb-xl">{{ 'EDITOR.EDIT_PAGE_CONTENT' | translate }}</h1>
    @if (page$ | async; as page) {
      <app-data-view [item]="page"></app-data-view>
    }
  `,
  styleUrl: './page-data-view.component.scss',
})
export class PageDataViewComponent implements OnInit {
  page$: Observable<Pick<Item, 'id' | 'language' | 'version'>>;

  constructor(
    private readonly contextService: ContextService,
    private readonly itemChangeService: ItemChangeService,
  ) {}

  ngOnInit(): void {
    this.page$ = combineLatest([
      this.contextService.itemId$,
      this.contextService.itemVersion$,
      this.contextService.language$,
    ]).pipe(
      replayWhen(([itemId]) => this.itemChangeService.watchForChanges({ itemId, scopes: ['versions'] })),
      switchMap(() => this.contextService.getItem()),
      map((item) => ({
        id: item.id,
        version: item.versions.length ? item.version : 0,
        language: item.language,
      })),
    );
  }
}
