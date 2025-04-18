/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { FieldValue } from '../messaging/horizon-canvas.contract.parts';
import { FeatureChecker } from '../utils/feature-checker';
import { isSameGuid } from '../utils/id';
import { ConsoleLogger } from '../utils/logger';
import { Chrome } from './chrome';
import { ChromeDom } from './chrome-dom';
import { ChromeReader } from './chrome-reader';
import { FieldChrome, isFieldChrome } from './chrome.field';
import { isRenderingChrome, RenderingChrome } from './chrome.rendering';
import { InlineChromeParser } from './read/inline-chrome-parser';
import { ShallowChromeParser } from './read/shallow-chrome-parser';

export class ChromeManager {
  private _chromes: Chrome[] | null = null;
  get chromes(): readonly Chrome[] {
    if (!this._chromes) {
      ConsoleLogger.error(`Canvas Is not initialized yet.`);
      return [];
    }
    return this._chromes;
  }

  private _fieldChromes: FieldChrome[] | null = null;
  get fieldChromes(): readonly FieldChrome[] {
    if (this._fieldChromes) {
      return this._fieldChromes;
    }

    this._fieldChromes = this.chromes.filter(isFieldChrome);
    return this._fieldChromes;
  }

  constructor(
    private readonly inlineChromeReader: ChromeReader<InlineChromeParser>,
    private readonly shallowChromeReader: ChromeReader<ShallowChromeParser>,
    private readonly chromeDom: ChromeDom,
  ) {}

  async initChromes(): Promise<void> {
    this._chromes = null;
    if (FeatureChecker.isShallowChromesEnabled()) {
      this._chromes = await this.shallowChromeReader.readChromes(this.chromeDom.root);
    } else {
      this._chromes = await this.inlineChromeReader.readChromes(this.chromeDom.root);
    }
  }

  getByChromeId(chromeId: string): Chrome | undefined {
    return this.chromes.find((x) => x.chromeId === chromeId);
  }

  getByChromeSxaSource(sxaSource: string): RenderingChrome[] {
    const source = `{${sxaSource}}`.toUpperCase();

    return this.chromes.filter(
      (chrome): chrome is RenderingChrome =>
        isRenderingChrome(chrome) && chrome.sxaSource === source && chrome.renderingDefinitionId === '57573af2-9d3c-4078-aab7-35e580e4823b',
    );
  }

  writeFields(fieldValues: readonly FieldValue[]): void {
    this.fieldChromes.forEach((field) => {
      const newValueField = fieldValues.find(
        (fieldState) =>
          isSameGuid(fieldState.fieldId, field.fieldId) &&
          isSameGuid(fieldState.itemId, field.itemContext.id) &&
          fieldState.itemVersion === field.itemContext.version,
      );
      if (newValueField) {
        field.setValue(newValueField.value, newValueField.reset);
      }
    });
  }
}
