/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { DataSourceItemRoot } from '../feaas-components-gallery/feaas-component-types';
import { FEaaSComponentsDalService } from '../feaas-components-gallery/feaas-components.dal.service';
import { DataSourceType } from './component-filter-context.component';

interface SelectedDataSourceIds {
  externalDsId: BehaviorSubject<string[]>;
  xmCloudDsId: BehaviorSubject<string[]>;
}

@Injectable({
  providedIn: 'root',
})
export class ComponentFilterStateService {
  dataSources$ = new BehaviorSubject<DataSourceItemRoot>({
    dataSources: { externalDataSources: [], xmCloudDataSources: [] },
  });

  private _selectedDataSourceIds: SelectedDataSourceIds = {
    externalDsId: new BehaviorSubject<string[]>([]),
    xmCloudDsId: new BehaviorSubject<string[]>([]),
  };

  get selectedDataSourceIds() {
    return combineLatest([this._selectedDataSourceIds.externalDsId, this._selectedDataSourceIds.xmCloudDsId]);
  }

  constructor(private readonly fEaaSComponentsDalService: FEaaSComponentsDalService) {
    this.dataSources$ = this.fEaaSComponentsDalService._dataSources$;
  }

  updateSelectedDataSourceIds(type: DataSourceType): void {
    const currentState = this.dataSources$.getValue();
    if (type === 'external') {
      const exIds = currentState.dataSources.externalDataSources
        .filter((ds) => ds.isChecked)
        .map((ds) => ds.dataSourceId);
      this._selectedDataSourceIds.externalDsId.next(exIds);
    } else if (type === 'xmCloud') {
      const xmIds = currentState.dataSources.xmCloudDataSources
        .filter((ds) => ds.isChecked)
        .map((ds) => ds.dataSourceId);
      this._selectedDataSourceIds.xmCloudDsId.next(xmIds);
    }
  }
}
