/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, OnInit } from '@angular/core';
import { ComponentGalleryComponent } from 'app/editor/designing/component-gallery/component-gallery.component';
import { LhsPanelStateService } from 'app/editor/lhs-panel/lhs-panel.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { EMPTY, Observable, distinctUntilChanged, tap } from 'rxjs';
import { ContentTreePanelComponent } from './content-tree-panel/content-tree-panel.component';
import { ExternalComponentsComponent } from './external-components/external-components.component';
import { LHSNavigationService } from './lhs-navigation.service';

@Component({
  selector: 'app-left-hand-side',
  templateUrl: './left-hand-side.component.html',
  styleUrls: ['./left-hand-side.component.scss'],
})
export class LeftHandSideComponent implements OnInit {
  activeNavigation$: Observable<string> = EMPTY;
  selectedEditorContent: 'sitetree' | 'components' = 'sitetree';

  isLhsPanelExpanded$ = this.lhsPanelStateService.isExpanded$.pipe(
    tap((val) => {
      if (val) {
        this.selectedEditorContent = 'sitetree';
      }
    }),
  );

  treeComponentRef = ContentTreePanelComponent;
  componentRef = ComponentGalleryComponent;
  extComponentRef = ExternalComponentsComponent;

  constructor(
    private readonly lhsNavService: LHSNavigationService,
    private readonly lhsPanelStateService: LhsPanelStateService,
  ) {}

  private readonly lifetime = new Lifetime();

  ngOnInit() {
    this.activeNavigation$ = this.lhsNavService.watchRouteSegment();

    // select tree tab by default when navigating between editor and page branches
    this.activeNavigation$
      .pipe(takeWhileAlive(this.lifetime), distinctUntilChanged())
      .subscribe(() => (this.selectedEditorContent = 'sitetree'));
  }
}
