/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartLegendComponent } from '../chart-legend/chart-legend.component';
import { BarChartComponent } from './bar-chart.component';

function nextTick(ms: number = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
@Component({
  selector: 'test-workspace-component',
  template: ` <div class="wrapper"><app-bar-chart [items]="data" [horizontal]="horizontal"></app-bar-chart></div> `,
})
class TestComponent {
  data = [
    {
      name: 'Mon',
      value: 232,
    },
    {
      name: 'Tue',
      value: 356,
    },
  ];

  horizontal = false;
}

describe('BarChartComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: BarChartComponent;
  let testComponent: TestComponent;

  beforeEach(waitForAsync(async () => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, NgxChartsModule],
      declarations: [TestComponent, BarChartComponent, ChartLegendComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;

    await fixture.whenStable();
    fixture.detectChanges();

    component = fixture.debugElement.query(By.directive(BarChartComponent)).componentInstance;
  }));

  afterEach(waitForAsync(() => {
    fixture.destroy();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('watchChartResize()', () => {
    it('should call chartComponent.update(), when element has resized', async () => {
      fixture.detectChanges();
      const updateSpy = spyOn(component.chartComponent, 'update');

      fixture.nativeElement.style.width = '100px';
      await nextTick(250);

      expect(updateSpy).toHaveBeenCalled();
    });
  });

  describe('horizontal', () => {
    it('should show the vertical bar chart when horizontal is set to false', () => {
      const verticalBarChart = fixture.debugElement.nativeElement.querySelector('ngx-charts-bar-vertical');

      expect(verticalBarChart).toBeTruthy();
    });

    it('should show the horizontal bar chart when horizontal is set to true', () => {
      testComponent.horizontal = true;
      fixture.detectChanges();
      const horizontalBarChart = fixture.debugElement.nativeElement.querySelector('ngx-charts-bar-horizontal');

      expect(horizontalBarChart).toBeTruthy();
    });
  });
});
