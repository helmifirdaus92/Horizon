/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartLegendComponent } from '../chart-legend/chart-legend.component';
import { HeatmapChartComponent } from './heatmap-chart.component';

describe(HeatmapChartComponent.name, () => {
  let component: HeatmapChartComponent;
  let fixture: ComponentFixture<HeatmapChartComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, NgxChartsModule],
      declarations: [HeatmapChartComponent, ChartLegendComponent],
    });

    fixture = TestBed.createComponent(HeatmapChartComponent);
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
