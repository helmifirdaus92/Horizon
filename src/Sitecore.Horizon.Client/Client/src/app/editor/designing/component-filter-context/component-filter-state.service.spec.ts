/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';

import { BehaviorSubject } from 'rxjs';
import { DataSourceItemRoot } from '../feaas-components-gallery/feaas-component-types';
import { FEaaSComponentsDalService } from '../feaas-components-gallery/feaas-components.dal.service';
import { ComponentFilterStateService } from './component-filter-state.service';

describe(ComponentFilterStateService.name, () => {
  let sut: ComponentFilterStateService;

  const fEaaSComponentsDalServiceMock = {
    _dataSources$: new BehaviorSubject<DataSourceItemRoot>({
      dataSources: { externalDataSources: [], xmCloudDataSources: [] },
    }),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: FEaaSComponentsDalService,
          useValue: fEaaSComponentsDalServiceMock,
        },
      ],
    });
    sut = TestBed.inject(ComponentFilterStateService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('updateSelectedDataSourceIds', () => {
    it('should update selected datasource based on the isChecked status for external root', () => {
      // Arrange
      const currentState = {
        dataSources: {
          externalDataSources: [
            {
              name: 'ext-testDs',
              dataSourceId: 'dataSource1',
              isChecked: true,
            },
            {
              name: 'ext-testDs2',
              dataSourceId: 'dataSource2',
              isChecked: false,
            },
          ],
          xmCloudDataSources: [],
        },
      };

      // Act
      fEaaSComponentsDalServiceMock._dataSources$.next(currentState);
      sut.updateSelectedDataSourceIds('external');

      // Assert
      sut.selectedDataSourceIds.subscribe((ids) => {
        expect(ids).toEqual([['dataSource1'], []]);
      });
    });

    it('should update selected datasource based on the isChecked status for xmCloud root', () => {
      // Arrange
      const currentState = {
        dataSources: {
          externalDataSources: [],
          xmCloudDataSources: [
            {
              name: 'xm-testDs1',
              dataSourceId: 'xmDataSource1',
              isChecked: true,
            },
            {
              name: 'xm-testDs2',
              dataSourceId: 'xmDataSource2',
              isChecked: true,
            },
          ],
        },
      };

      // Act
      fEaaSComponentsDalServiceMock._dataSources$.next(currentState);
      sut.updateSelectedDataSourceIds('xmCloud');

      // Assert
      sut.selectedDataSourceIds.subscribe((ids) => {
        expect(ids).toEqual([[], ['xmDataSource1', 'xmDataSource2']]);
      });
    });
  });
});
