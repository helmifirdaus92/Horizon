/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { ContentPosition, horizontalContentLayoutMap, verticalContentLayoutsMap } from './column-content-layout';
import { parseInlineStyle, parsePadding, parseStyleValue } from './inline-style.utils';
import {
  LayoutContainerColumn,
  LayoutContainerModel,
  LayoutContainerStyles,
} from './layout-container-rendering-service';
import { layoutTemplates, LayoutTemplatesKey } from './layout-size-templates';

export const DEFAULT_LIMITED_WIDTH = 1000;
export const DEFAULT_GAP = 0;

@Injectable({ providedIn: 'root' })
export class LayoutContainerParametersParseService {
  public serializeLayoutContainerParameters(layoutContainerModel: LayoutContainerModel): Record<string, string> {
    return {
      ...this.serializeColumnSizesParameters(layoutContainerModel.columns),
      ...this.serializeContainerStylesParameters(layoutContainerModel.containerStyles),
      ...this.serializeColumnStylesParameters(layoutContainerModel.columns),
      StackColumnAt: layoutContainerModel.stackBreakpoint,
    };
  }

  public parseLayoutContainerModel(layoutContainerParameters: Record<string, string>): LayoutContainerModel {
    let enabledColumns = parseInt(layoutContainerParameters.EnabledColumns, 10);
    if (isNaN(enabledColumns)) {
      enabledColumns = 0;
    }

    const columns = [...Array(enabledColumns).keys()].map((i) => this.parseColumn(layoutContainerParameters, i));
    const layoutTemplateKey = this.identifyLayoutTemplate(columns);

    const containerStyles = this.parseContainerStyles(layoutContainerParameters);

    return {
      columns,
      containerStyles,
      layoutTemplateKey,
      stackBreakpoint: layoutContainerParameters.StackColumnAt,
    };
  }

  private parseColumn(layoutContainerParameters: Record<string, string>, index: number): LayoutContainerColumn {
    const size = layoutContainerParameters[`ColumnSize${index + 1}`] ?? '';
    const columnStyleClasses = layoutContainerParameters[`ColumnStyle${index + 1}`]?.split(' ') ?? [];
    const direction = columnStyleClasses.includes('flex-row') ? 'horizontal' : 'vertical';
    const mainAxis = columnStyleClasses.find((c) => c.startsWith('justify-'));
    const crossAxis = columnStyleClasses.find((c) => c.startsWith('items-'));
    const layout = `${mainAxis} ${crossAxis}`;
    const position = this.getContentLayoutMap(direction).find((m) => m.layout === layout)?.position ?? 'top-left';
    const wrap = columnStyleClasses.includes('wrap');

    return {
      size,
      direction,
      wrap,
      position,
    };
  }

  private identifyLayoutTemplate(columns: LayoutContainerColumn[]): LayoutTemplatesKey {
    for (const template of layoutTemplates) {
      if (template.columnsCount === columns.length) {
        if (template.columns.every((column, index) => column === columns[index].size)) {
          return template.key;
        }
      }
    }

    return 'custom';
  }

  private serializeColumnSizesParameters(columns: LayoutContainerColumn[]): Record<string, string> {
    const columnSizesParameters: Record<string, string> = {
      EnabledColumns: columns.length.toString(),
    };

    for (let i = 0; i < columns.length; i++) {
      columnSizesParameters[`ColumnSize${i + 1}`] = columns[i].size ?? '';
    }

    return columnSizesParameters;
  }

  private serializeContainerStylesParameters(containerStyles: LayoutContainerStyles): Record<string, string> {
    const paddingUnit = containerStyles.padding.unit || 'px';
    const widthUnit = containerStyles.width.unit || 'px';
    const gapUnit = containerStyles.gap.unit || 'px';

    const { top, right, bottom, left } = containerStyles.padding.value;
    const padding = `${top}${paddingUnit} ${right}${paddingUnit} ${bottom}${paddingUnit} ${left}${paddingUnit}`;
    const width = containerStyles.width.value === '100%' ? '100%' : `${containerStyles.width.value}${widthUnit}`;

    return {
      ContainerStyles: `gap: ${containerStyles.gap.value}${gapUnit}; width: ${width}; padding: ${padding}`,
    };
  }

  private serializeColumnStylesParameters(columns: LayoutContainerColumn[]): Record<string, string> {
    const columnsStyles: Record<string, string> = {};
    for (let i = 0; i < columns.length; i++) {
      const directionClass = columns[i].direction === 'horizontal' ? 'flex-row' : 'flex-col';
      const wrapClass = columns[i].wrap ? 'wrap' : 'no-wrap';
      const positionClass =
        this.getContentLayoutMap(columns[i].direction).find((m) => m.position === columns[i].position)?.layout ?? '';
      columnsStyles[`ColumnStyle${i + 1}`] = `${directionClass} ${wrapClass} ${positionClass}`;
    }

    return columnsStyles;
  }

  private parseContainerStyles(layoutContainerParameters: Record<string, string>): LayoutContainerStyles {
    const styleObject = parseInlineStyle(layoutContainerParameters.ContainerStyles);
    let isFullWidth = (styleObject.width ?? '100%') === '100%';

    const width = parseStyleValue(styleObject?.width ?? '');
    let widthValue = parseFloat(width.value);

    if (isNaN(widthValue)) {
      widthValue = 0;
      isFullWidth = true;
    }
    const gap = parseStyleValue(styleObject.gap ?? `${DEFAULT_GAP}px`);
    const gapValue = isNaN(parseFloat(gap.value)) ? DEFAULT_GAP : parseFloat(gap.value);

    const padding = parsePadding(styleObject?.padding ?? '0');
    return {
      width: isFullWidth ? { value: '100%', unit: '' } : { value: widthValue, unit: width.unit },
      gap: { value: gapValue, unit: gap.unit },
      padding: { value: padding.value, unit: padding.unit },
    };
  }

  private getContentLayoutMap(
    direction: 'horizontal' | 'vertical',
  ): Array<{ position: ContentPosition; layout: string }> {
    if (direction === 'horizontal') {
      return horizontalContentLayoutMap;
    }

    return verticalContentLayoutsMap;
  }
}
