/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartLegendComponent } from '../chart-legend/chart-legend.component';
import { StackedColumnChartComponent } from './stacked-column-chart.component';

describe('StackedColumnChartComponent', () => {
  let component: StackedColumnChartComponent;
  let fixture: ComponentFixture<StackedColumnChartComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, NgxChartsModule],
      declarations: [StackedColumnChartComponent, ChartLegendComponent],
    });

    fixture = TestBed.createComponent(StackedColumnChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
