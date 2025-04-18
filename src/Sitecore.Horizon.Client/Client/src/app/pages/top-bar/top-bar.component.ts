/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { PageTemplatesService } from 'app/page-design/page-templates.service';
import { LHSNavigationService } from 'app/pages/left-hand-side/lhs-navigation.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { environment } from 'environments/environment';
import { EMPTY, Observable } from 'rxjs';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
})
export class TopBarComponent implements OnInit, OnDestroy {
  @Input() renderGlobalElementsRegion = true;
  @Input() contextViewInfo?: { header?: string; pageDisplayName?: string };

  isAppSwitcherEnabled = false;
  activeNavigation = '';
  contextPageDesign$: Observable<{ id: string; version: number | undefined } | undefined> = EMPTY;

  renderSwitchersAndNavigation = (): boolean =>
    this.activeNavigation !== 'editpartialdesign' &&
    this.activeNavigation !== 'editpagedesign' &&
    this.activeNavigation !== 'editpagebranch';

  showSettingsBlock = environment.settingsNavigationEnabled;

  private readonly lifetime = new Lifetime();

  constructor(
    private readonly lhsNavService: LHSNavigationService,
    private readonly router: Router,
    private route: ActivatedRoute,
    private readonly featureFlagService: FeatureFlagsService,
    private readonly pageTemplatesService: PageTemplatesService,
  ) {}

  ngOnInit() {
    this.isAppSwitcherEnabled = this.featureFlagService.isFeatureEnabled('pages_show-app-switcher');
    const activeNavigation$ = this.lhsNavService.watchRouteSegment();
    activeNavigation$.pipe(takeWhileAlive(this.lifetime)).subscribe((route) => (this.activeNavigation = route));

    this.contextPageDesign$ = this.pageTemplatesService.watchContextPageDesign();
  }

  goToEditPageDesign(pageDesignItem: { id: string; version: number | undefined }) {
    this.pageTemplatesService.setContextPageDesign(undefined);
    this.router.navigate(['/editpagedesign'], {
      queryParams: {
        sc_itemid: pageDesignItem.id,
        sc_version: pageDesignItem.version ?? '',
      },
      queryParamsHandling: 'merge',
    });
  }

  goToDesignList() {
    const queryParams = this.route.snapshot.queryParams;
    const navigationExtras: NavigationExtras = {
      queryParams,
    };

    if (this.activeNavigation === 'editpagedesign') {
      this.router.navigate(['templates/pagedesigns'], navigationExtras);
    } else if (this.activeNavigation === 'editpartialdesign') {
      this.router.navigate(['templates/partialdesigns'], navigationExtras);
    } else if (this.activeNavigation === 'editpagebranch') {
      this.router.navigate(['templates/pagebranches'], navigationExtras);
    }
  }

  ngOnDestroy() {
    this.lifetime.dispose();
  }
}
