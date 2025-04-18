/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverDirective, SearchInputComponent } from '@sitecore/ng-spd-lib';
import { ContextService } from 'app/shared/client-state/context.service';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { combineLatest, debounce, distinctUntilChanged, map, Observable, of, Subject, switchMap, timer } from 'rxjs';
import { ItemMapper } from '../item-mapper';
import { PageDesignsNavigationService } from '../page-designs/page-designs-navigation.service';
import { Ancestor, Item, SiteType } from '../page-templates.types';
import { PartialDesignsNavigationService } from '../partial-designs/partial-designs-navigation.service';
import { createNavigationExtras } from '../shared/page-templates-utils';
import { DesignSearchDalService } from './design-search.dal.service';

export type DesignType = 'pagedesign' | 'partialdesign';
@Component({
  selector: 'app-design-search',
  templateUrl: './design-search.component.html',
  styleUrls: ['./design-search.component.scss'],
})
export class DesignSearchComponent implements OnInit {
  designItems: Item[] = [];
  designFolders: Item[] = [];
  searchInput$ = new Subject<string>();
  siteType: SiteType = 'current';
  isLoading = false;
  currentSiteRootItemId = '';

  designNavigationService: PageDesignsNavigationService | PartialDesignsNavigationService | undefined;

  @Input() designType: DesignType = 'pagedesign';
  @ViewChild('popoverInstance', { static: true }) private popoverInstance?: PopoverDirective;
  @ViewChild(SearchInputComponent, { static: true }) searchEl?: SearchInputComponent;
  @Output() selectedDesignItem = new EventEmitter<Item | undefined>(undefined);

  private readonly lifetime = new Lifetime();

  constructor(
    private readonly designSearchDalService: DesignSearchDalService,
    private readonly pageDesignsNavigationService: PageDesignsNavigationService,
    private readonly partialDesignsNavigationService: PartialDesignsNavigationService,
    private readonly contextService: ContextService,
    private readonly siteService: SiteService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.designNavigationService =
      this.designType === 'pagedesign'
        ? this.pageDesignsNavigationService
        : this.designType === 'partialdesign'
          ? this.partialDesignsNavigationService
          : undefined;

    if (this.designNavigationService) {
      const designRoots$ = this.designNavigationService.designRoots$;
      combineLatest([this.watchSearch(), designRoots$])
        .pipe(
          switchMap(([query, designRoots]) => {
            if (query) {
              this.isLoading = true;
              const ids = designRoots.map((item) => item.itemId);

              return this.designSearchDalService.search(query, ids, this.designType).pipe(
                map((result) => {
                  const items = result.items.filter(
                    (item) => !designRoots.some((designRoot) => designRoot.itemId === item.itemId),
                  );
                  return { ...result, items };
                }),
              );
            } else {
              return of({ isSuccessful: true, items: [] });
            }
          }),
          map((result) => {
            this.isLoading = false;
            if (result.isSuccessful) {
              const designs: Item[] = result.items.map((itemResponse) =>
                ItemMapper.mapItemResponseToItem(itemResponse),
              );

              const designItems = designs.filter((design) => design.hasPresentation);
              const designFolders = designs.filter((folder) => folder.isFolder);

              return { designItems, designFolders };
            }
            return { designItems: [], designFolders: [] };
          }),
        )
        .subscribe((result) => {
          this.designItems = result.designItems;
          this.designFolders = result.designFolders;
        });
    }

    // Handle context site change
    this.contextService.siteName$
      .pipe(
        takeWhileAlive(this.lifetime),
        map(() => {
          if (this.searchEl) {
            this.searchEl.searchValue = '';
          }
          return this.siteService.getContextSite();
        }),
      )
      .subscribe((contextSite) => {
        this.currentSiteRootItemId = contextSite?.id ?? '';
      });

    // Handle context language change
    this.contextService.language$.pipe(takeWhileAlive(this.lifetime)).subscribe(() => {
      if (this.searchEl) {
        this.searchEl.searchValue = '';
      }
    });
  }

  onFolderItemClick(folder: Item): void {
    this.handleSiteType(folder);
    const navigationExtras = createNavigationExtras(folder.itemId, this.siteType);
    this.router.navigate([], navigationExtras);
    this.popoverInstance?.hide();
  }

  onDesignItemClick(design: Item): void {
    this.handleSiteType(design);
    const navigationExtras = createNavigationExtras(design.parentId ?? '', this.siteType);
    this.router.navigate([], navigationExtras);
    this.selectedDesignItem.emit(design);
    this.popoverInstance?.hide();
  }

  onSearchValueChange(value: string): void {
    this.searchInput$.next(value);
    if (value === '') {
      this.popoverInstance?.hide();
    }
    if (value.length && !this.popoverInstance?.isPopoverVisible()) {
      this.popoverInstance?.show();
    }
  }

  private handleSiteType(design: Item): void {
    const isSharedSite = this.isSharedSite(design.ancestors);
    isSharedSite ? (this.siteType = 'shared') : (this.siteType = 'current');
  }

  private isSharedSite(ancestors: Ancestor[] | undefined): boolean {
    return !ancestors?.some((ancestor) => ancestor.itemId === this.currentSiteRootItemId);
  }

  private watchSearch(): Observable<string> {
    return this.searchInput$.pipe(
      debounce((value) => (!!value ? timer(500) : of(value))),
      distinctUntilChanged(),
    );
  }
}
