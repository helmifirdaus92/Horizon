/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, EventEmitter, Input, OnDestroy, Output, TemplateRef } from '@angular/core';
import { ContextService } from 'app/shared/client-state/context.service';
import { BaseItemDalService, ItemField } from 'app/shared/graphql/item.dal.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { firstValueFrom } from 'rxjs';
import { extractAndNormalizeGuids, formatAndJoinGuids } from '../../data-view.utils';
import { TreelistExDialogService } from './treelistEx-dialog.service';
import { TreelistExItemPickerComponent } from './treelistEx-item-picker/treelistEx-item-picker.component';

@Component({
  selector: 'app-treelistex-field',
  templateUrl: './treelistEx-field.component.html',
  styleUrls: ['./treelistEx-field.component.scss'],
})
export class TreelistExFieldComponent implements OnDestroy {
  private readonly lifetime = new Lifetime();
  private itemPickerDialog: TreelistExItemPickerComponent | null = null;

  @Input({ required: true }) field!: ItemField;
  @Input({ required: true }) set currentValue(val: string) {
    if (val === this.rawValue) {
      return;
    }

    this.rawValue = val;
    this.selectedValueIds = extractAndNormalizeGuids(val);
    this.syncFieldSelectedValues();
  }
  @Input() set datasourcesCount(_count: number) {
    if (!this.itemPickerDialog) {
      return;
    }
    this.itemPickerDialog.dataSource = this.field.templateField.dataSource;
  }
  @Input() rearrangeItemTemplate?: TemplateRef<any>;

  @Output() selectedValueChange = new EventEmitter<{ rawValue: string }>();
  @Output() resetToStandardValue = new EventEmitter();
  @Output() toggleRearrangeItems = new EventEmitter<Array<{ displayName: string; itemId: string }>>();
  @Output() fetchNextDatasourceBatch = new EventEmitter();

  constructor(
    private readonly treeListExService: TreelistExDialogService,
    private readonly itemDalService: BaseItemDalService,
    private readonly contextService: ContextService,
  ) {}

  selectedValues: Array<{ displayName: string; itemId: string }> = [];
  selectedValueIds: string[] = [];
  rawValue = '';

  ngOnDestroy(): void {
    this.lifetime.dispose();
  }

  async openItemSelectionDialog(): Promise<void> {
    this.itemPickerDialog = this.treeListExService.show(this.field.templateField.dataSource, this.selectedValues);
    this.itemPickerDialog.onFetchNextDsBatch.pipe(takeWhileAlive(this.lifetime)).subscribe(() => {
      this.fetchNextDatasourceBatch.emit();
    });

    this.itemPickerDialog.onSelect.pipe(takeWhileAlive(this.lifetime)).subscribe((value) => {
      this.selectedValues = value;
      this.selectedValueIds = this.selectedValues.map((item) => item.itemId);
      this.rawValue = formatAndJoinGuids(this.selectedValueIds);
      this.selectedValueChange.emit({ rawValue: this.rawValue });

      this.itemPickerDialog = null;
    });
  }

  mapRearrangeItemList(): void {
    this.toggleRearrangeItems.emit(this.selectedValues);
  }

  restField() {
    this.resetToStandardValue.emit();
  }

  private async syncFieldSelectedValues(): Promise<void> {
    if (!this.selectedValueIds.length) {
      this.selectedValues = [];
      return;
    }
    this.updateSelectedValues();
  }

  private async updateSelectedValues(): Promise<void> {
    this.selectedValues = await Promise.all(
      this.selectedValueIds.map(async (id) => {
        const name = await firstValueFrom(
          this.itemDalService.getItemDisplayName(id, this.contextService.language, this.contextService.siteName),
        );
        return { displayName: name, itemId: id };
      }),
    );

    this.selectedValues.sort(
      (a, b) => this.selectedValueIds.indexOf(a.itemId) - this.selectedValueIds.indexOf(b.itemId),
    );
  }
}
