/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Color, BaseChartComponent as NgxBaseChartComponent } from '@swimlane/ngx-charts';
import { Observable, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ChartPalette, ColorCode, PerformancePalette } from './variables';

export enum ChartFormattingTarget {
  Chart,
  Display,
}

export enum ChartPerformanceValue {
  Bad = 0,
  Fair = 1,
  Good = 2,
  Excelent = 3,
}

export interface ChartItem {
  name: any;
  value?: any;
  series?: ChartItem[];
  performanceValue?: ChartPerformanceValue;
}

export interface ChartModelItem {
  name: any;
  value: any;
  series?: any;
}

export interface CustomColor {
  name: any;
  value: string;
}

export interface ChartConfig {
  view: any;
  animations: boolean;
  showXAxis: boolean;
  showYAxis: boolean;
  gradient: boolean;
  showLegend: boolean;
  showXAxisLabel: boolean;
  showYAxisLabel: boolean;
  legendTitle: string;
  xAxisLabel: string;
  yAxisLabel: string;
  barPadding: number;
  groupPadding: number;
  colorScheme: Color;
  autoScale: boolean;
  xScaleMin: number;
  xScaleMax: number;
  yScaleMin: number;
  yScaleMax: number;
  roundEdges: boolean;
  doughnut: boolean;
}

@Component({
  selector: 'app-base-chart',
  template: ``,
  styleUrls: ['./base-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseChartComponent implements OnInit, AfterViewInit, OnDestroy {
  static readonly defaultChartConfig: ChartConfig = {
    view: undefined,
    animations: true,
    showXAxis: true,
    showYAxis: true,
    gradient: false,
    showLegend: false,
    showXAxisLabel: false,
    showYAxisLabel: false,
    legendTitle: '',
    xAxisLabel: '',
    yAxisLabel: '',
    barPadding: 20,
    groupPadding: 16,
    colorScheme: { domain: [] } as unknown as Color,
    autoScale: true,
    xScaleMin: 0,
    xScaleMax: 0,
    yScaleMin: 0,
    yScaleMax: 0,
    roundEdges: false,
    doughnut: true,
  };

  @Input()
  set items(value: ChartItem[]) {
    this._items = value;
    this.setSeries();
  }

  @Input() isLegendVisible = false;
  @Input() paletteIndex: ColorCode = ColorCode.ColoredMain;
  @Input() isReversedPalette = false;
  @Input()
  set isStackedSeries(value: any) {
    this._isStackedSeries = value;
    this.setSeries();
  }
  @Input() showXAxis = true;
  @Input() showYAxis = true;
  @Input() autoScale = true;
  @Input() doughnut = true;
  @Input() xScaleMin = 0;
  @Input() xScaleMax = 0;
  @Input() yScaleMin = 0;
  @Input() yScaleMax = 0;
  @Input() barPadding = 20;
  @Input() groupPadding = 16;

  @Input() nameFormatter?: (name: any, target: ChartFormattingTarget, model?: ChartModelItem) => any;
  @Input() valueFormatter?: (value: any, target: ChartFormattingTarget, model?: ChartModelItem) => any;
  @Input() seriesNameFormatter?: (seriesName: any, target: ChartFormattingTarget, model?: ChartModelItem) => any;
  @Output() itemSelected: EventEmitter<ChartModelItem> = new EventEmitter();
  @ViewChild('ngxChartComponent') chartComponent!: NgxBaseChartComponent;

  @Input() usePerformancePalette = false;

  _items: ChartItem[] = [];
  legendItems: ChartItem[] = [];
  _isStackedSeries = false;
  hasMultipleSeries = false;
  activeEntries: ChartItem[] = [];
  subscription: any;
  chartContainer?: HTMLElement;
  config: ChartConfig = BaseChartComponent.defaultChartConfig;
  activeItem: any;
  observerSubscription?: Subscription;

  // These need to be arrow functions since they are used as callbacks, and therefore need their context (this) to be preserved.
  readonly formatNameForChart = (name: any) => this.formatName(name, ChartFormattingTarget.Chart);
  readonly formatNameForDisplay = (name: any, model?: ChartModelItem) =>
    this.formatName(name, ChartFormattingTarget.Display, model);
  readonly formatSeriesNameForDisplay = (name: any, m: ChartModelItem) =>
    this.formatSeriesName(name, ChartFormattingTarget.Display, m);
  readonly formatValueForChart = (value: any) => this.formatValue(value, ChartFormattingTarget.Chart);
  readonly formatValueForDisplay = (value: any, model: ChartModelItem) =>
    this.formatValue(value, ChartFormattingTarget.Display, model);

  constructor(
    private readonly ngZone: NgZone,
    private readonly elementRef: ElementRef,
  ) {}

  ngAfterViewInit() {
    this.watchChartResize();
  }

  ngOnInit() {
    this.config = this.makeChartConfig(this.usePerformancePalette, this.paletteIndex);
  }

  ngOnDestroy(): void {
    this.observerSubscription?.unsubscribe();
  }

  refresh() {
    this.chartComponent.ngOnChanges({} as SimpleChanges);
  }

  onSelect(event: any) {
    this.itemSelected.emit(event);
  }

  itemHighlightedHandler(item: any) {
    if (item === undefined) {
      this.activeEntries = [];
      return;
    }

    if (this._isStackedSeries && this.hasMultipleSeries) {
      this.activeEntries = [];
      this._items.forEach((element) => {
        const seriesElement = element.series!.find((element2: ChartItem) => element2.name === item.name);
        if (seriesElement !== undefined) {
          seriesElement.series = element.name;
          this.activeEntries.push(seriesElement);
        }
      });
    } else {
      this.activeEntries = [item];
    }
  }

  activateHandler(event: { value: ChartItem }): void {
    this.activeItem = this.getItemByName(event.value.name);
  }

  deactivateHandler(): void {
    this.activeItem = null;
  }

  itemTracker(_: number, item: any): any {
    return item ? item : undefined;
  }

  getTooltipItemColorByIndex(index: number): string {
    return this.config.colorScheme.domain[index];
  }

  getTooltipItemColor(model: ChartItem): string {
    if (this.hasMultipleSeries) {
      let itemIndex = -1;
      if (this._isStackedSeries) {
        itemIndex = this._items[0].series!.findIndex((item: ChartItem) => item.name === model.name);
      } else {
        itemIndex = this._items.findIndex((item) => item.name === model.name);
      }

      if (itemIndex > -1) {
        return this.config.colorScheme.domain[itemIndex];
      }

      return 'transparent';
    }

    const index = this.getItemIndexByName(model.name);

    if (index > -1) {
      return this.config.colorScheme.domain[index];
    }

    return 'transparent';
  }

  private watchChartResize() {
    this.observerSubscription = new Observable<void>((subscriber) => {
      const observer = new (window as any).ResizeObserver(() => {
        subscriber.next();
      });
      observer.observe(this.elementRef.nativeElement);

      return () => {
        observer.disconnect();
      };
    })
      .pipe(debounceTime(200))
      .subscribe(() => {
        this.ngZone.run(() => this.chartComponent.update());
      });
  }

  private setSeries() {
    this.hasMultipleSeries = this._items.length > 0 && this._items[0].series !== undefined;

    if (this._isStackedSeries && this.hasMultipleSeries) {
      this.legendItems = this._items[0].series!;
    } else {
      this.legendItems = this._items;
    }
  }

  private getItemIndexByName(name: string): number {
    return this._items.findIndex((item) => item.name === name);
  }

  private getItemByName(name: string) {
    if (this.hasMultipleSeries) {
      if (this._isStackedSeries) {
        return this._items.find((item: ChartItem) => item.name === name);
      }
      return this._items[0].series!.find((item) => item.name === name);
    }
    return this._items.find((item) => item.name === name);
  }

  private formatName(name: any, target: ChartFormattingTarget, model?: ChartModelItem) {
    if (this.nameFormatter) {
      return this.nameFormatter(name, target, model);
    }

    return name;
  }

  private formatValue(value: any, target: ChartFormattingTarget, model?: ChartModelItem) {
    if (this.valueFormatter) {
      return this.valueFormatter(value, target, model);
    }

    return value;
  }

  private formatSeriesName(seriesName: any, target: ChartFormattingTarget, model?: ChartModelItem) {
    if (this.seriesNameFormatter) {
      return this.seriesNameFormatter(seriesName, target, model);
    }

    return seriesName;
  }

  private makeChartConfig(
    usePerformancePalette: boolean,
    paletteIndex: ColorCode = ColorCode.ColoredMain,
  ): ChartConfig {
    const newConfig = Object.assign({}, BaseChartComponent.defaultChartConfig);
    newConfig.colorScheme = {
      domain: this.getChartPalette(paletteIndex, usePerformancePalette),
    } as unknown as Color;

    newConfig.showXAxis = this.showXAxis;
    newConfig.showYAxis = this.showYAxis;
    newConfig.autoScale = this.autoScale;
    newConfig.yScaleMin = this.yScaleMin;
    newConfig.yScaleMax = this.yScaleMax;
    newConfig.doughnut = this.doughnut;
    newConfig.barPadding = this.barPadding;
    newConfig.groupPadding = this.groupPadding;

    return newConfig;
  }

  private getPerformancePalette() {
    const performancePalette = [] as string[];
    this._items.forEach((element) => {
      if (element.performanceValue !== undefined) {
        performancePalette.push(PerformancePalette[element.performanceValue]);
      }
    });

    return performancePalette;
  }

  private getChartPalette(paletteIndex: ColorCode = ColorCode.ColoredMain, usePerformancePalette: boolean): string[] {
    if (usePerformancePalette) {
      return this.getPerformancePalette();
    }
    return this.isReversedPalette ? [...ChartPalette[paletteIndex]].reverse() : ChartPalette[paletteIndex];
  }
}
