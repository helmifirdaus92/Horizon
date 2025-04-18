/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { DialogCloseHandle } from '@sitecore/ng-spd-lib';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { isVirtualPageTemplate } from 'app/shared/utils/tree.utils';
import { normalizeGuid } from 'app/shared/utils/utils';
import { EMPTY, Observable } from 'rxjs';
import { DatasourcePickerOptions } from 'sdk';
import { TimedNotificationsService } from '../../notifications/timed-notifications.service';
import {
  DatasourcePickerComponent,
  DataSourcePickerSelect,
  PAGE_RELATIVE_PATH,
} from '../datasource-picker/datasource-picker.component';

@Component({
  selector: 'app-datasource-dialog',
  templateUrl: './datasource-dialog.component.html',
  styleUrl: './datasource-dialog.component.scss',
  providers: [TimedNotificationsService],
})
export class DatasourceDialogComponent implements OnDestroy {
  renderingId$: Observable<string> = EMPTY;
  initialSelect$: Observable<string> = EMPTY;
  datasourcePickerOptions?: DatasourcePickerOptions;

  canSelect = false;
  private select: DataSourcePickerSelect | null = null;

  private readonly lifetime = new Lifetime();

  readonly onSelect = new EventEmitter<DataSourcePickerSelect>();

  @ViewChild('picker', { static: true }) picker!: DatasourcePickerComponent;

  constructor(private readonly closeHandle: DialogCloseHandle) {}

  ngOnDestroy() {
    this.lifetime.dispose();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.code === 'Escape' && !this.picker.isBusy) {
      event.preventDefault();
      this.close();
    }
  }

  close() {
    this.onSelect.complete();
    this.closeHandle.close();
  }

  selectChange(select: DataSourcePickerSelect | null) {
    this.select = select;
    this.initialSelect$.pipe(takeWhileAlive(this.lifetime)).subscribe((initialSelect) => {
      this.canSelect = this.canSelectDatasource(select, initialSelect);
    });
  }

  submit() {
    if (!this.select) {
      return;
    }

    const selectedDsId = isVirtualPageTemplate(this.select.templateId) ? PAGE_RELATIVE_PATH : this.select.id;
    this.select.id = selectedDsId;

    this.onSelect.next(this.select);
    this.onSelect.complete();
    this.closeHandle.close();
  }

  private canSelectDatasource(select: DataSourcePickerSelect | null, initialSelect: string): boolean {
    return (
      !!select &&
      select.isCompatible &&
      ((initialSelect !== PAGE_RELATIVE_PATH && normalizeGuid(initialSelect) !== normalizeGuid(select.id)) ||
        (initialSelect === PAGE_RELATIVE_PATH && !isVirtualPageTemplate(select.templateId)))
    );
  }
}
