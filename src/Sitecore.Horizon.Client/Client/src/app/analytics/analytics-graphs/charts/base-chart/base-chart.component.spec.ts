/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseChartComponent as NgxBaseChartComponent, NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartLegendComponent } from '../chart-legend/chart-legend.component';
import { BaseChartComponent, ChartFormattingTarget } from './base-chart.component';

import { PerformancePalette } from './variables';

const PlainItems = [
  { name: 'Mon', value: 42 },
  { name: 'Tue', value: 24 },
];
const PerformanceColorItems = [
  {
    name: 'Mon',
    value: 232,
    performanceValue: 0,
  },
  {
    name: 'Tue',
    value: 356,
    performanceValue: 1,
  },
  {
    name: 'Wed',
    value: 510,
    performanceValue: 2,
  },
  {
    name: 'Thu',
    value: 350,
    performanceValue: 3,
  },
];
const ItemsWithSeries = [
  {
    name: 'Visits',
    value: 42,
    series: [
      { name: 'Mon', value: 42 },
      { name: 'Tue', value: 24 },
    ],
  },
];

describe('BaseChartComponent', () => {
  let component: BaseChartComponent;
  let fixture: ComponentFixture<BaseChartComponent>;
  let initComponent: () => void;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [NgxChartsModule],
      declarations: [ChartLegendComponent, BaseChartComponent],
    });

    fixture = TestBed.createComponent(BaseChartComponent);
    component = fixture.componentInstance;
    initComponent = () => fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    initComponent();
    expect(component).toBeTruthy();
  });

  it('should set hasMultipleSeries if series', () => {
    component.items = ItemsWithSeries;
    initComponent();

    expect(component.hasMultipleSeries).toBeTruthy();
  });

  it('should not set hasMultipleSeries if not series', () => {
    component.items = PlainItems;
    initComponent();

    expect(component.hasMultipleSeries).toBeFalsy();
  });

  it('should use items for legend if not series', () => {
    component.items = PlainItems;
    initComponent();

    expect(component.legendItems).toBe(PlainItems);
  });

  it('should use items for legend if series and not stacked', () => {
    component.items = ItemsWithSeries;
    initComponent();

    expect(component.legendItems).toBe(ItemsWithSeries);
  });

  it('should use first series items for legend if series and stacked _order_1', () => {
    component.items = ItemsWithSeries;
    component.isStackedSeries = true;
    initComponent();

    expect(component.legendItems).toBe(ItemsWithSeries[0].series);
  });

  it('should use first series items for legend if series and stacked _order_2', () => {
    component.isStackedSeries = true;
    component.items = ItemsWithSeries;
    initComponent();

    expect(component.legendItems).toBe(ItemsWithSeries[0].series);
  });

  it('should return name as-is if formatter is not specified', () => {
    initComponent();
    const name = 'aLeX';

    expect(component.formatNameForChart(name)).toBe(name);
    expect(component.formatNameForDisplay(name, { name: '', value: 42 })).toBe(name);
  });

  it('should format name using specified formatter', () => {
    component.nameFormatter = (v: string, target) =>
      target === ChartFormattingTarget.Chart ? v.toUpperCase() : v.toLowerCase();
    initComponent();
    const name = 'aLeX';

    expect(component.formatNameForChart(name)).toBe('ALEX');
    expect(component.formatNameForDisplay(name, { name: '', value: 42 })).toBe('alex');
  });

  it('should return value as-is if formatter is not specified', () => {
    initComponent();
    const value = 'aLeX';

    expect(component.formatValueForChart(value)).toBe(value);
    expect(component.formatValueForDisplay(value, { name: '', value: 42 })).toBe(value);
  });

  it('should format value using the specified formatter', () => {
    component.valueFormatter = (v: string, target) =>
      target === ChartFormattingTarget.Chart ? v.toUpperCase() : v.toLowerCase();
    initComponent();
    const value = 'aLeX';

    expect(component.formatValueForChart(value)).toBe('ALEX');
    expect(component.formatValueForDisplay(value, { name: '', value: 42 })).toBe('alex');
  });

  it('should return series name as-is if formatter is not specified', () => {
    initComponent();
    const seriesName = 'aLeX';

    expect(component.formatSeriesNameForDisplay(seriesName, { name: '', value: 42 })).toBe(seriesName);
  });

  it('should format series name using the specified formatter', () => {
    component.seriesNameFormatter = (v: string, target) =>
      target === ChartFormattingTarget.Chart ? v.toUpperCase() : v.toLowerCase();
    initComponent();
    const seriesName = 'aLeX';

    expect(component.formatSeriesNameForDisplay(seriesName, { name: '', value: 42 })).toBe('alex');
  });

  it('should emit itemSelected event with value in onSelect handler', () => {
    spyOn(component.itemSelected, 'emit');
    initComponent();
    const event = new Object();

    component.onSelect(event);
    expect(component.itemSelected.emit).toHaveBeenCalledWith(event as any);
  });

  it('should show performance colors in usePerformancePalette=true', () => {
    component.usePerformancePalette = true;
    component.items = PerformanceColorItems;
    initComponent();

    expect(component.config.colorScheme.domain[0]).toBe(PerformancePalette[0]);
    expect(component.config.colorScheme.domain[1]).toBe(PerformancePalette[1]);
    expect(component.config.colorScheme.domain[2]).toBe(PerformancePalette[2]);
    expect(component.config.colorScheme.domain[3]).toBe(PerformancePalette[3]);
  });

  it('should set bar padding when provided', () => {
    component.barPadding = 50;
    initComponent();

    expect(component.config.barPadding).toBe(50);
  });

  describe('refresh()', () => {
    it('should call `ngOnChanges` of chartComponent', () => {
      const spy = jasmine.createSpy('');
      component.chartComponent = { ngOnChanges: spy } as unknown as NgxBaseChartComponent;

      component.refresh();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('deactivateHandler()', () => {
    it('should set `activeItem` to null', () => {
      component.activeItem = 'foo';

      component.deactivateHandler();

      expect(component.activeItem).toBeNull();
    });
  });

  describe('itemTracker()', () => {
    it('should set return given item, when item is truthy', () => {
      const item = 'foo';
      const trackedItem = component.itemTracker(0, item);

      expect(trackedItem).toBe(item);
    });

    it('should set return undefined, when item is false', () => {
      const item = false;
      const trackedItem = component.itemTracker(0, item);

      expect(trackedItem).toBeUndefined();
    });
  });

  describe('getTooltipItemColorByIndex()', () => {
    it('should return the domain color of given index', () => {
      component.config.colorScheme.domain = ['foo', 'bar'];

      const color = component.getTooltipItemColorByIndex(1);

      expect(color).toBe('bar');
    });
  });

  describe('activateHandler()', () => {
    it('should set `activeItem` to item with given name', () => {
      component.items = PlainItems;

      component.activateHandler({ value: { name: 'Mon' } });

      expect(component.activeItem).toBe(PlainItems[0]);
    });

    describe('when there are multiple series', () => {
      beforeEach(() => {
        component.items = ItemsWithSeries;
      });

      it('should set `activeItem` to item with given name, when the series are stacked', () => {
        component.isStackedSeries = true;
        component.activateHandler({ value: { name: 'Visits' } });

        expect(component.activeItem).toBe(ItemsWithSeries[0]);
      });

      it('should set `activeItem` to serie with given name, when the series are not stacked', () => {
        component.activateHandler({ value: { name: 'Mon' } });

        expect(component.activeItem).toBe(ItemsWithSeries[0].series[0]);
      });
    });
  });

  describe('itemHighlightedHandler()', () => {
    it('should set `activeEntries` to an empty array, when item input is `undefined`', () => {
      component.activeEntries = PerformanceColorItems;

      component.itemHighlightedHandler(undefined);

      expect(component.activeEntries).toEqual([]);
    });

    it('should set `activeEntries` to an array with given item, when there are no series', () => {
      const item = { name: 'foo' };
      component.activeEntries = PerformanceColorItems;

      component.itemHighlightedHandler(item);

      expect(component.activeEntries).toEqual([item]);
    });

    describe('when there a multiple stacked series', () => {
      beforeEach(() => {
        component.items = ItemsWithSeries;
        component.isStackedSeries = true;
      });

      it('should set `activeEntries` to empty array, when there are no series that matches given item name', () => {
        const item = { name: 'foo' };
        component.activeEntries = PerformanceColorItems;

        component.itemHighlightedHandler(item);

        expect(component.activeEntries).toEqual([]);
      });

      it('should set `activeEntries` to the series that matches the given item name', () => {
        const item = { name: 'Mon' };
        const expectedSerie = ItemsWithSeries[0].series[0];
        component.activeEntries = PerformanceColorItems;

        component.itemHighlightedHandler(item);

        expect(component.activeEntries).toEqual([expectedSerie]);
      });
    });
  });

  describe('getTooltipItemColor()', () => {
    it('should return `transparent`, when the item given was not found', () => {
      component.isReversedPalette = true;
      const color = component.getTooltipItemColor({ name: 'foo' });

      expect(color).toBe('transparent');
    });

    it('should return the domain color at given item index, when the item given was found', () => {
      component.isReversedPalette = true;
      const expectedColor = 'bar';
      component.config.colorScheme.domain = ['foo', expectedColor];
      component.items = PlainItems;

      const color = component.getTooltipItemColor({ name: 'Tue' });

      expect(color).toBe(expectedColor);
    });

    describe('when there are multiple series', () => {
      beforeEach(() => {
        component.items = ItemsWithSeries;
      });

      describe('and the series are not stacked', () => {
        it('should return `transparent`, when item was not found', () => {
          const color = component.getTooltipItemColor({ name: 'foo' });

          expect(color).toBe('transparent');
        });

        it('should return the domain color at given item index, when the item given was found', () => {
          const expectedColor = 'foo';
          component.config.colorScheme.domain = [expectedColor, 'bar'];

          const color = component.getTooltipItemColor({ name: 'Visits' });

          expect(color).toBe(expectedColor);
        });
      });

      describe('and the series are stacked', () => {
        beforeEach(() => {
          component.isStackedSeries = true;
        });

        it('should return `transparent`, when item was not found', () => {
          const color = component.getTooltipItemColor({ name: 'foo' });

          expect(color).toBe('transparent');
        });

        it('should return the domain color at given series index, when the item given was found', () => {
          const expectedColor = 'bar';
          component.config.colorScheme.domain = ['foo', expectedColor];

          const color = component.getTooltipItemColor({ name: 'Tue' });

          expect(color).toBe(expectedColor);
        });
      });
    });
  });
});
