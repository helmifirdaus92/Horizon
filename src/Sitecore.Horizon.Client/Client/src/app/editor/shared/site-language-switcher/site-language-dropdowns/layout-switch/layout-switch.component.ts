/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, OnInit } from '@angular/core';
import { LayoutKind } from 'app/shared/graphql/item.interface';
import { LayoutSwitchService } from './layout-switch.service';

@Component({
  selector: 'app-layout-switch',
  templateUrl: './layout-switch.component.html',
  styleUrls: ['./layout-switch.component.scss'],
})
export class LayoutSwitchComponent implements OnInit {
  isSharedLayout = false;

  constructor(private readonly layoutSwitchService: LayoutSwitchService) {}

  async ngOnInit() {
    this.isSharedLayout = (await this.layoutSwitchService.getLayoutEditingKind()) === ('SHARED' as LayoutKind);
  }

  async toggleSharedLayout() {
    this.isSharedLayout = !this.isSharedLayout;
    await this.layoutSwitchService.setLayoutEditingKind(this.isSharedLayout ? 'SHARED' : 'FINAL');
  }
}
