/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { BehaviorSubject } from 'rxjs';
import { DataSourceItemModel, DataSourceItemRoot } from '../feaas-components-gallery/feaas-component-types';
import { ComponentFilterStateService } from './component-filter-state.service';

export type DataSourceType = 'external' | 'xmCloud';
@Component({
  selector: 'app-component-filter-context',
  templateUrl: './component-filter-context.component.html',
  styleUrls: ['./component-filter-context.component.scss'],
})
export class ComponentFilterContextComponent implements OnInit {
  @Output() selectedDataSourceIdsChange = new EventEmitter<string[]>();

  private readonly lifetime = new Lifetime();
  public dataSources$ = new BehaviorSubject<DataSourceItemRoot>({
    dataSources: { externalDataSources: [], xmCloudDataSources: [] },
  });

  constructor(private readonly componentFilterStateService: ComponentFilterStateService) {
    this.dataSources$ = this.componentFilterStateService.dataSources$;
  }

  ngOnInit(): void {
    this.componentFilterStateService.selectedDataSourceIds
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe(([exDsIds, xmDsIds]) => {
        const concatIds = [...exDsIds, ...xmDsIds];
        this.selectedDataSourceIdsChange.emit(concatIds);
      });
  }

  toggleRootCategory(isChecked: boolean, type: DataSourceType): void {
    const dataSourceRootItem = this.dataSources$.getValue() as DataSourceItemRoot;

    if (type === 'external') {
      dataSourceRootItem.dataSources.externalDataSources.forEach((ds) => (ds.isChecked = isChecked));
      dataSourceRootItem.isExternalRootChecked = isChecked;
    } else if (type === 'xmCloud') {
      dataSourceRootItem.dataSources.xmCloudDataSources.forEach((ds) => (ds.isChecked = isChecked));
      dataSourceRootItem.isXmCloudRootChecked = isChecked;
    }

    this.dataSources$.next(dataSourceRootItem);
    this.componentFilterStateService.updateSelectedDataSourceIds(type);
  }

  toggleDataSourceItem(dataSourceId: string, isChecked: boolean, type: DataSourceType): void {
    const dataSourceRootItem = this.dataSources$.getValue() as DataSourceItemRoot;
    let dataSourcesItem: DataSourceItemModel[] = [];

    if (type === 'external') {
      dataSourcesItem = dataSourceRootItem.dataSources.externalDataSources;
    } else if (type === 'xmCloud') {
      dataSourcesItem = dataSourceRootItem.dataSources.xmCloudDataSources;
    }
    const dataSource = dataSourcesItem.find((ds) => ds.dataSourceId === dataSourceId);
    if (dataSource) {
      dataSource.isChecked = isChecked;
    }

    // Update root category check state based on all items being checked
    if (type === 'external') {
      dataSourceRootItem.isExternalRootChecked = dataSourcesItem.every((ds) => ds.isChecked);
    } else if (type === 'xmCloud') {
      dataSourceRootItem.isXmCloudRootChecked = dataSourcesItem.every((ds) => ds.isChecked);
    }

    this.dataSources$.next(dataSourceRootItem);
    this.componentFilterStateService.updateSelectedDataSourceIds(type);
  }
}
