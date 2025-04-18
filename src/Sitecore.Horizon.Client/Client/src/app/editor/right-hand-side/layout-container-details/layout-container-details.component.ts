/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input, OnInit } from '@angular/core';
import { CanvasServices } from 'app/editor/shared/canvas.services';
import { PaddingSetting } from 'app/pages/padding-setting/padding-setting.component';
import { DEFAULT_BREAKPOINTS_DATA } from 'app/pages/top-bar/device-controls/device-selector.component';
import { Device, DeviceService } from 'app/shared/client-state/device.service';
import { RenderingChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { ColumnAppendDialogService } from './column-append-dialog/column-append-dialog.service';
import { ContentPosition } from './column-content-layout';
import { parseStyleValue, unitValueConverter } from './inline-style.utils';
import { DEFAULT_LIMITED_WIDTH } from './layout-container-parameters-parse.service';
import { LayoutContainerPadding, LayoutContainerRenderingService } from './layout-container-rendering-service';
import { layoutTemplates, LayoutTemplatesKey } from './layout-size-templates';

@Component({
  selector: 'app-layout-container-details',
  templateUrl: './layout-container-details.component.html',
  styleUrls: ['./layout-container-details.component.scss'],
})
export class LayoutContainerDetailsComponent implements OnInit {
  public showAdvanced = false;
  public basicLayoutTemplates = layoutTemplates.slice(0, 4);
  public advancedLayoutTemplates = layoutTemplates.slice(4);
  currentColumnCount = 1;
  public layoutContainerModel$ = this.layoutContainerService.layoutContainerModel$;
  devices: Device[] = DEFAULT_BREAKPOINTS_DATA.devices;

  gapUnit = '';
  widthUnit = '';
  paddingUnit = '';
  baseFactor: number;

  @Input() chrome!: RenderingChromeInfo;

  private readonly lifetime = new Lifetime();
  constructor(
    private readonly layoutContainerService: LayoutContainerRenderingService,
    private readonly appendColumnDialogService: ColumnAppendDialogService,
    private readonly deviceService: DeviceService,
    private readonly canvasServices: CanvasServices,
  ) {
    this.layoutContainerModel$
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe((modal) => (this.currentColumnCount = modal.columns.length));

    this.canvasServices.canvasStyle$.pipe(takeWhileAlive(this.lifetime)).subscribe((style) => {
      const parseStyle = parseStyleValue(style.fontSizePx).value;
      this.baseFactor = parseFloat(parseStyle) || 16;
    });
  }

  async ngOnInit() {
    await this.layoutContainerService.initFromRendering(this.chrome.renderingInstanceId);
    await this.getDeviceInfo();
  }

  async selectTemplate(templateKey: LayoutTemplatesKey, newEnabledColumn: number) {
    const hasRenderings = await this.hasContentInRemovingColumns(newEnabledColumn);
    if (!!hasRenderings) {
      this.appendColumnDialogService.showColumnAppendDialog(this.currentColumnCount, newEnabledColumn, templateKey);
      return;
    }
    await this.layoutContainerService.updateLayoutTemplate(templateKey);
  }

  async setWidthType(isFullWidth: boolean) {
    await this.layoutContainerService.updateContainerStyles({
      width: isFullWidth ? { value: '100%', unit: '' } : { value: DEFAULT_LIMITED_WIDTH, unit: 'px' },
    });
  }

  async setWidth(width: number, unit: string) {
    await this.layoutContainerService.updateContainerStyles({
      width: { value: width, unit },
    });
  }

  async setGap(gap: number, unit: string) {
    await this.layoutContainerService.updateContainerStyles({
      gap: { value: gap, unit },
    });
  }

  async setPadding(currentPadding: LayoutContainerPadding, paddingUpdate: PaddingSetting, unit: string) {
    const padding = {
      ...currentPadding,
      [paddingUpdate.position]: paddingUpdate.value,
    };

    await this.layoutContainerService.updateContainerStyles({
      padding: { value: padding, unit },
    });
  }

  async setDirection(direction: 'vertical' | 'horizontal', index: number) {
    const wrap = direction === 'horizontal' ? true : false;
    await this.layoutContainerService.updateColumnLayout({ direction, wrap }, index);
  }

  async setWrap(wrap: boolean, index: number) {
    await this.layoutContainerService.updateColumnLayout({ wrap }, index);
  }

  async setColumnStackBreakpoint(stackBreakpoint: string) {
    await this.layoutContainerService.updateColumnStackBreakpoint(stackBreakpoint);
  }

  async setPosition(position: ContentPosition, index: number) {
    await this.layoutContainerService.updateColumnLayout({ position }, index);
  }

  private async hasContentInRemovingColumns(newEnabledColumn: number): Promise<boolean> {
    if (newEnabledColumn < this.currentColumnCount) {
      const renderingFromRemovingColumns =
        await this.layoutContainerService.getRenderingsInsideRemovingColumn(newEnabledColumn);
      return renderingFromRemovingColumns.length > 0;
    }
    return false;
  }

  private async getDeviceInfo(): Promise<void> {
    const devicesInfo = await this.deviceService.getDevicesInfo();
    if (devicesInfo?.devices) {
      this.devices = devicesInfo.devices
        .filter((d) => d.type !== 'disabled')
        .sort((a, b) => parseInt(a.width, 10) - parseInt(b.width, 10));
    }
  }

  handleGapUnitUpdate(newUnit: string, originalSetting: { value: number; unit: string }): void {
    this.gapUnit = newUnit;
    const gapSetting = unitValueConverter(newUnit, originalSetting, this.baseFactor);
    this.setGap(gapSetting, newUnit);
  }

  handleWidthUnitUpdate(newUnit: string, originalSetting: { value: number | '100%'; unit: string }): void {
    if (originalSetting.value === '100%') {
      return;
    }
    this.widthUnit = newUnit;
    const widthSetting = unitValueConverter(
      newUnit,
      originalSetting as { value: number; unit: string },
      this.baseFactor,
    );
    this.setWidth(widthSetting, newUnit);
  }

  async handlePaddingUnitUpdate(
    newUnit: string,
    originalSetting: { value: LayoutContainerPadding; unit: string },
  ): Promise<void> {
    this.paddingUnit = newUnit;
    const { top, right, bottom, left } = originalSetting.value;
    const unit = originalSetting.unit;

    const paddingSetting = {
      top: unitValueConverter(newUnit, { value: top, unit }, this.baseFactor),
      right: unitValueConverter(newUnit, { value: right, unit }, this.baseFactor),
      bottom: unitValueConverter(newUnit, { value: bottom, unit }, this.baseFactor),
      left: unitValueConverter(newUnit, { value: left, unit }, this.baseFactor),
    };
    await this.layoutContainerService.updateContainerStyles({
      padding: { value: paddingSetting, unit: newUnit },
    });
  }
}
