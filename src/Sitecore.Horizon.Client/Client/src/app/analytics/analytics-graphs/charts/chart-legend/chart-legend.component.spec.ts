/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ChartLegendComponent } from './chart-legend.component';

describe('ChartLegendComponent', () => {
  let component: ChartLegendComponent;
  let fixture: ComponentFixture<ChartLegendComponent>;
  let findLegendItems: () => DebugElement[];

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [ChartLegendComponent],
    });

    fixture = TestBed.createComponent(ChartLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    findLegendItems = () => {
      return fixture.debugElement.queryAll(By.css('.legend-item'));
    };
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render each legend item', () => {
    component.legendItems = [1, 2, 3, 4].map((v) => ({ name: v.toString() }));
    fixture.detectChanges();

    const legendItems = findLegendItems();
    expect(legendItems.length).toBe(4);
  });

  it('should render name if no formatter is specified', () => {
    component.legendItems = [{ name: 'fortyTwo' }];
    fixture.detectChanges();

    const legendItem = findLegendItems()[0];
    const label = legendItem.query(By.css('.legend-label')).nativeElement.textContent;

    expect(label).toBe('fortyTwo');
  });

  it('should use the passed label formatter', () => {
    component.legendLabelFormatter = (v: string) => v.toUpperCase();
    component.legendItems = [{ name: 'alex' }];
    fixture.detectChanges();

    const legendItem = findLegendItems()[0];
    const label = legendItem.query(By.css('.legend-label')).nativeElement.textContent;

    expect(label).toBe('ALEX');
  });

  it('should emit event on legend item mouse hover', () => {
    spyOn(component.itemHighlighted, 'emit');
    component.legendItems = [1, 2, 3].map((v) => ({ name: v.toString() }));
    fixture.detectChanges();

    const legendItem = findLegendItems()[2];
    legendItem.nativeElement.dispatchEvent(new Event('mouseenter'));

    expect(component.itemHighlighted.emit).toHaveBeenCalledWith(component.legendItems[2]);
  });

  it('should emit event on legend item, on touch start without any event attached', () => {
    spyOn(component.itemHighlighted, 'emit');
    component.legendItems = [1, 2, 3].map((v) => ({ name: v.toString() }));
    fixture.detectChanges();

    const legendItem = findLegendItems()[2];
    legendItem.triggerEventHandler('touchstart', null);

    expect(component.itemHighlighted.emit).toHaveBeenCalledWith(component.legendItems[2]);
  });

  it('should emit event on legend mouse leave', () => {
    spyOn(component.itemHighlighted, 'emit');
    component.legendItems = [1, 2, 3].map((v) => ({ name: v.toString() }));
    fixture.detectChanges();

    const root = fixture.debugElement.query(By.css('.legend')).nativeElement;
    root.dispatchEvent(new Event('mouseleave'));
    expect(component.itemHighlighted.emit).toHaveBeenCalledWith(undefined);
  });

  describe('itemTracker()', () => {
    it('should return undefined, when item is falsy', () => {
      expect(component.itemTracker(0, false)).toBeUndefined();
    });
  });
});
