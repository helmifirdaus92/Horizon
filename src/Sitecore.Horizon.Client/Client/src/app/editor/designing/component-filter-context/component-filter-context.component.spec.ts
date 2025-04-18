/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CheckboxModule } from '@sitecore/ng-spd-lib';
import { AssetsPipeModule } from 'app/shared/utils/assets.module';
import { AppLetModule } from 'app/shared/utils/let-directive/let.directive';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { BehaviorSubject } from 'rxjs';
import { DataSourceItemRoot } from '../feaas-components-gallery/feaas-component-types';
import { ComponentFilterContextComponent } from './component-filter-context.component';
import { ComponentFilterStateService } from './component-filter-state.service';

describe(ComponentFilterContextComponent.name, () => {
  let sut: ComponentFilterContextComponent;
  let fixture: ComponentFixture<ComponentFilterContextComponent>;

  const componentFilterStateServiceSpy = jasmine.createSpyObj('ComponentFilterStateService', [
    'selectedDataSourceIds',
    'updateSelectedDataSourceIds',
    'dataSources$',
  ]);

  const mockDataSources: DataSourceItemRoot = {
    dataSources: {
      externalDataSources: [
        {
          name: 'ext-testDs',
          dataSourceId: 'dataSource1',
          isChecked: false,
        },
        {
          name: 'ext-testDs2',
          dataSourceId: 'dataSource2',
          isChecked: false,
        },
      ],
      xmCloudDataSources: [
        {
          name: 'xm-testDs1',
          dataSourceId: 'xmDataSource1',
          isChecked: false,
        },
        {
          name: 'xm-testDs2',
          dataSourceId: 'xmDataSource2',
          isChecked: false,
        },
      ],
    },
    isExternalRootChecked: false,
    isXmCloudRootChecked: false,
  };

  const mockSelectedDataSourceIds = [['dataSource1'], ['xmDataSource1']];

  componentFilterStateServiceSpy.dataSources$ = new BehaviorSubject(mockDataSources);
  componentFilterStateServiceSpy.selectedDataSourceIds = new BehaviorSubject(mockSelectedDataSourceIds);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        TranslateModule,
        TranslateServiceStubModule,
        AssetsPipeModule,
        CheckboxModule,
        AppLetModule,
      ],
      declarations: [ComponentFilterContextComponent],
      providers: [{ provide: ComponentFilterStateService, useValue: componentFilterStateServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentFilterContextComponent);

    sut = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should emit selectedDataSourceIdsChange on init', () => {
      // Arrange
      const selectedDsSpy = spyOn(sut.selectedDataSourceIdsChange, 'emit');

      // Act
      sut.ngOnInit();
      fixture.detectChanges();

      // Assert
      expect(selectedDsSpy).toHaveBeenCalled();
      expect(selectedDsSpy).toHaveBeenCalledWith(['dataSource1', 'xmDataSource1']);
    });
  });

  describe('toggleRootCategory', () => {
    it('should update external root check status on checkbox toggle on root level', () => {
      // Arrange
      const currentDsState = componentFilterStateServiceSpy.dataSources$.getValue();
      const type = 'external';
      const isChecked = true;

      // Act
      sut.toggleRootCategory(isChecked, type);
      fixture.detectChanges();

      // Assert
      expect(currentDsState.isExternalRootChecked).toBe(isChecked);
    });

    it('should update xmCloud root check status on checkbox toggle on root level', () => {
      // Arrange
      const currentDsState = componentFilterStateServiceSpy.dataSources$.getValue();
      const type = 'xmCloud';
      const isChecked = false;

      // Act
      sut.toggleRootCategory(isChecked, type);
      fixture.detectChanges();

      // Assert
      expect(currentDsState.isXmCloudRootChecked).toBe(isChecked);
    });

    it('should invoke updateSelectedDataSourceIds on checkbox toggle on root level', () => {
      // Arrange
      const type = 'external';
      const isChecked = true;

      // Act
      sut.toggleRootCategory(isChecked, type);
      fixture.detectChanges();

      // Assert
      expect(componentFilterStateServiceSpy.updateSelectedDataSourceIds).toHaveBeenCalledWith(type);
    });
  });

  describe('toggleDataSourceItem', () => {
    it('should update check status for checked item on external data source on checkbox toggle', () => {
      // Arrange
      const currentDsState = componentFilterStateServiceSpy.dataSources$.getValue();
      const type = 'external';
      const isChecked = true;
      const dataSourceId = 'dataSource1';

      // Act
      sut.toggleDataSourceItem(dataSourceId, isChecked, type);
      fixture.detectChanges();

      // Assert
      expect(currentDsState.dataSources.externalDataSources[0].isChecked).toBe(isChecked);
    });

    it('should update check status for checked item on xmCloud data source on checkbox toggle', () => {
      // Arrange
      const currentDsState = componentFilterStateServiceSpy.dataSources$.getValue();
      const type = 'xmCloud';
      const isChecked = true;
      const dataSourceId = 'xmDataSource1';

      // Act
      sut.toggleDataSourceItem(dataSourceId, isChecked, type);
      fixture.detectChanges();

      // Assert
      expect(currentDsState.dataSources.xmCloudDataSources[0].isChecked).toBe(isChecked);
    });

    it('should set check status for root category to true if all items are checked on external data source ', () => {
      // Arrange
      const currentDsState = componentFilterStateServiceSpy.dataSources$.getValue();
      const type = 'external';

      // Act
      sut.toggleDataSourceItem('dataSource1', true, type); // select first item
      sut.toggleDataSourceItem('dataSource2', true, type); // select second item
      fixture.detectChanges();

      // Assert
      expect(currentDsState.isExternalRootChecked).toBe(true);
    });

    it('should set check status for root category to false if at least one item is unchecked on external data source', () => {
      // Arrange
      const currentDsState = componentFilterStateServiceSpy.dataSources$.getValue();
      const type = 'external';

      // Act
      sut.toggleDataSourceItem('dataSource1', true, type); // select first item
      sut.toggleDataSourceItem('dataSource2', false, type); // deselect second item
      fixture.detectChanges();

      // Assert
      expect(currentDsState.isExternalRootChecked).toBe(false);
    });

    it('should set check status for root category to true if all items are checked on xmCloud data source ', () => {
      // Arrange
      const currentDsState = componentFilterStateServiceSpy.dataSources$.getValue();
      const type = 'xmCloud';

      // Act
      sut.toggleDataSourceItem('xmDataSource1', true, type); // select first item
      sut.toggleDataSourceItem('xmDataSource2', true, type); // select second item
      fixture.detectChanges();

      // Assert
      expect(currentDsState.isXmCloudRootChecked).toBe(true);
    });

    it('should set check status for root category to false if at least one item is unchecked on xmCloud data source', () => {
      // Arrange
      const currentDsState = componentFilterStateServiceSpy.dataSources$.getValue();
      const type = 'xmCloud';

      // Act
      sut.toggleDataSourceItem('xmDataSource1', true, type); // select first item
      sut.toggleDataSourceItem('xmDataSource2', false, type); // deselect second item
      fixture.detectChanges();

      // Assert
      expect(currentDsState.isXmCloudRootChecked).toBe(false);
    });

    it('should invoke updateSelectedDataSourceIds on checkbox toggle on item level', () => {
      // Arrange
      const type = 'external';
      const isChecked = true;
      const dataSourceId = 'dataSource1';

      // Act
      sut.toggleDataSourceItem(dataSourceId, isChecked, type);
      fixture.detectChanges();

      // Assert
      expect(componentFilterStateServiceSpy.updateSelectedDataSourceIds).toHaveBeenCalledWith(type);
    });
  });
});
