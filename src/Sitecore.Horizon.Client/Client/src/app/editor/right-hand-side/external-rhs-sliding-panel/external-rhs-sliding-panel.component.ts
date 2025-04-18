/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ExtensionFilterPredicate, ExtensionManifest } from '@sitecore/page-composer-sdk';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { EMPTY, Observable } from 'rxjs';
import { panelAnimations } from '../rhs-slide-in-panel.animations';
import { ExternalRhsPanelService } from './external-rhs-sliding-panel.service';

@Component({
  selector: 'app-external-rhs-sliding-panel',
  templateUrl: './external-rhs-sliding-panel.component.html',
  styleUrls: ['./external-rhs-sliding-panel.component.scss'],
  animations: panelAnimations,
})
export class ExternalRhsSlidingPanelComponent implements OnInit, OnDestroy {
  key?: string;
  isOpen = false;
  header?: string;

  @Input() resetPanel$: Observable<unknown> = EMPTY;
  private readonly lifetime = new Lifetime();

  constructor(private readonly rhsSlidingPanelService: ExternalRhsPanelService) {}

  readonly filterPanelContent: ExtensionFilterPredicate<unknown> = (
    extensionContext: ExtensionManifest,
    input: unknown,
  ) => {
    return extensionContext.parameters.contentKey === input;
  };

  ngOnInit(): void {
    this.resetPanel$
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe(() => this.isOpen && this.rhsSlidingPanelService.closePanel());

    this.rhsSlidingPanelService.panelState$.pipe(takeWhileAlive(this.lifetime)).subscribe((state) => {
      this.isOpen = state.isOpen;
      this.header = state.header;
      this.key = state.key;
    });
  }

  ngOnDestroy(): void {
    this.lifetime.dispose();
  }

  closePanel(): void {
    this.rhsSlidingPanelService.closePanel();
  }
}
