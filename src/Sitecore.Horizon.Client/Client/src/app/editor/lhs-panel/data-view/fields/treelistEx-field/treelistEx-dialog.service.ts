/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { ItemFieldDataSource } from 'app/shared/graphql/item.dal.service';
import { TreelistExItemPickerComponent } from './treelistEx-item-picker/treelistEx-item-picker.component';

@Injectable({
  providedIn: 'root',
})
export class TreelistExDialogService {
  constructor(private readonly overlayService: DialogOverlayService) {}

  show(
    dataSource: ItemFieldDataSource[],
    values: Array<{ displayName: string; itemId: string }>,
  ): TreelistExItemPickerComponent {
    const treeListExCompRef = this.overlayService.open(TreelistExItemPickerComponent, {
      size: 'AutoHeightLarge',
    });

    treeListExCompRef.component.currentValue = values;
    treeListExCompRef.component.dataSource = dataSource;
    return treeListExCompRef.component;
  }
}
