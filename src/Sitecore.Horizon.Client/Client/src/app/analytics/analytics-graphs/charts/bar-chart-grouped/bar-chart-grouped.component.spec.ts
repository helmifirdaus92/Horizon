/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartLegendComponent } from '../chart-legend/chart-legend.component';
import { BarChartGroupedComponent } from './bar-chart-grouped.component';

function nextTick(ms: number = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Component({
  selector: 'test-workspace-component',
  template: `
    <div class="wrapper">
      <app-bar-chart-grouped [items]="data" [horizontal]="horizontal"></app-bar-chart-grouped>
    </div>
  `,
})
class TestComponent {
  data = [
    {
      name: 'Germany',
      series: [
        {
          name: '2020',
          value: 70632,
          extra: {
            code: 'de',
          },
        },
        {
          name: '2010',
          value: 40632,
          extra: {
            code: 'de',
          },
        },
      ],
    },
  ];
  horizontal = false;
}

describe(BarChartGroupedComponent.name, () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: BarChartGroupedComponent;
  let testComponent: TestComponent;

  beforeEach(waitForAsync(async () => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, NgxChartsModule],
      declarations: [TestComponent, BarChartGroupedComponent, ChartLegendComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;

    await fixture.whenStable();
    component = fixture.debugElement.query(By.directive(BarChartGroupedComponent)).componentInstance;
    fixture.detectChanges();
  }));

  afterEach(waitForAsync(() => {
    fixture.destroy();
  }));

  it('should create', () => {
    expect(testComponent).toBeTruthy();
    expect(component).toBeTruthy();
  });

  describe('watchChartResize()', async () => {
    it('should call chartComponent.update(), when element has resized', async () => {
      const updateSpy = spyOn(component.chartComponent, 'update');

      fixture.detectChanges();
      fixture.nativeElement.style.width = '100px';
      fixture.detectChanges();

      await nextTick(250);

      expect(updateSpy).toHaveBeenCalled();
    });
  });

  describe('chart type', () => {
    it('should show the vertical grouped bar chart when horizontal is set to false', () => {
      const verticalChart = fixture.debugElement.nativeElement.querySelector('ngx-charts-bar-vertical-2d');

      expect(verticalChart).toBeTruthy();
    });

    it('should show the horizontal grouped bar chart when horizontal is set to true', () => {
      testComponent.horizontal = true;
      fixture.detectChanges();

      const horizontalChart = fixture.debugElement.nativeElement.querySelector('ngx-charts-bar-horizontal-2d');

      expect(horizontalChart).toBeTruthy();
    });
  });
});
