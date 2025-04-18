/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { shareReplayLatest } from 'app/shared/utils/rxjs/rxjs-custom';
import { EMPTY, Observable, forkJoin } from 'rxjs';
import { panelAnimations } from '../rhs-slide-in-panel.animations';
import { AiHypophysisDummyDataService } from './ai-hypophysis-dummy-data.service';
import { AiHypophysisPanelService } from './ai-hypophysis-panel.service';

export interface SuggestionCategory {
  name: string;
  tips: SuggestionItem[];
  suggestions: SuggestionItem[];
}
export interface SuggestionItem {
  text: string;
  tags: string[];
}

@Component({
  selector: 'app-ai-hypophysis-panel',
  templateUrl: './ai-hypophysis-panel.component.html',
  styleUrls: ['./ai-hypophysis-panel.component.scss'],
  animations: panelAnimations,
})
export class AiHypophysisPanelComponent implements OnInit, OnDestroy {
  @Input() resetPanel$: Observable<unknown> = EMPTY;
  isOpen = false;

  tabSelected: 'page' | 'components' = 'page';
  isLoading = true;

  pageItems: Observable<SuggestionCategory[]> = this.dataService.getDummyPageData().pipe(shareReplayLatest());
  componentItems: Observable<SuggestionCategory[]> = this.dataService
    .getDummyComponentsData()
    .pipe(shareReplayLatest());

  private readonly lifetime = new Lifetime();
  private loadingLifeTime = new Lifetime();

  constructor(
    private readonly aiHypophysisPanelService: AiHypophysisPanelService,
    private dataService: AiHypophysisDummyDataService,
  ) {
    forkJoin([this.pageItems, this.componentItems])
      .pipe(takeWhileAlive(this.loadingLifeTime))
      .subscribe(() => {
        this.isLoading = false;
      });
  }

  ngOnInit(): void {
    this.resetPanel$
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe(() => this.isOpen && this.aiHypophysisPanelService.closePanel());

    this.aiHypophysisPanelService.panelState$.pipe(takeWhileAlive(this.lifetime)).subscribe((state) => {
      this.isOpen = state;
    });
  }

  ngOnDestroy(): void {
    this.lifetime.dispose();
  }

  closePanel(): void {
    this.aiHypophysisPanelService.closePanel();
  }

  regenerate() {
    this.loadingLifeTime.dispose();
    this.loadingLifeTime = new Lifetime();

    this.isLoading = true;

    this.pageItems = this.dataService.getDummyPageData().pipe(shareReplayLatest());
    this.componentItems = this.dataService.getDummyComponentsData().pipe(shareReplayLatest());

    forkJoin([this.pageItems, this.componentItems])
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe(() => {
        this.isLoading = false;
      });
  }
}
