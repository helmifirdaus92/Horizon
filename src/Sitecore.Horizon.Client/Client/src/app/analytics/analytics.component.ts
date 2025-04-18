/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { pagesAnimations } from 'app/pages/pages.animations';
import { environment } from 'environments/environment';
import { EMPTY, Observable } from 'rxjs';
import { AnalyticsContextService } from './analytics-context.service';
import { AnalyticsRoute } from './analytics.types';
import { PageAnalyticsComponent } from './page-analytics/page-analytics.component';
import { SiteAnalyticsComponent } from './site-analytics/site-analytics.component';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
  animations: pagesAnimations,
})
export class AnalyticsComponent implements OnInit {
  @ViewChild('wrapper') wrapper!: ElementRef;

  isLocalDevelopmentMode = !environment.production;
  pageAnalyticsComponent = PageAnalyticsComponent;
  siteAnalyticsComponent = SiteAnalyticsComponent;
  selectedComponent$: Observable<AnalyticsRoute> = EMPTY;

  constructor(private readonly analyticsContextService: AnalyticsContextService) {}

  ngOnInit() {
    this.selectedComponent$ = this.analyticsContextService.watchActiveRoute();
  }

  selectComponent(component: AnalyticsRoute) {
    this.analyticsContextService.setActiveRoute(component);
    this.wrapper.nativeElement.scrollTop = 0;
  }
}
