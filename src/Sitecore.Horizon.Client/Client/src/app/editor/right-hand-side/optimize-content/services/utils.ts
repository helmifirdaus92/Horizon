/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { ChromeInfo, FieldChromeInfo, RenderingChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { normalizeGuid } from 'app/shared/utils/utils';
import { PromptInputs, VariantsRequest, VariantsResponse } from './variant-recommendation.types';

export interface PromptContent {
  text: string;
  code?: number;
  language?: string;
  promptInputs?: PromptInputs;
}

export function isRenderingChromeInfo(chrome: ChromeInfo | undefined): chrome is RenderingChromeInfo {
  return chrome?.chromeType === 'rendering';
}

export function isFieldChromeInfo(chrome: ChromeInfo | undefined): chrome is FieldChromeInfo {
  return chrome?.chromeType === 'field';
}

export function createVariantsRequest(
  renderingInstanceId: string,
  promptValue: PromptContent,
  fieldValues: Array<{ fieldId: string; fieldName: string; textValue: string }>,
  brandKitId?: string,
): VariantsRequest {
  const request: VariantsRequest = {
    numberOfVariants: 1,
    componentId: normalizeGuid(renderingInstanceId),
    fields: fieldValues?.map((field) => ({ name: field.fieldId, value: field.textValue })),
    language: promptValue.language,
    ...(promptValue.code ? { predefinedPrompt: promptValue.code } : { prompt: promptValue.text }),
  };

  if (brandKitId) {
    const referencesPath = `/api/brands/v1/organizations/${ConfigurationService.organization}/brandkits/${brandKitId}/references`;
    request.references = [{ type: 'brandkit', id: brandKitId, path: referencesPath }];
  }

  return request;
}

export function mapVariantsToRecommendations(
  optimizedVariants: VariantsResponse,
  fieldValues: Array<{ fieldId: string; fieldName: string }>,
): Array<{ fieldId: string; fieldName: string; textValue: string }> {
  if (optimizedVariants && optimizedVariants.variants) {
    return optimizedVariants.variants.flatMap((variant) =>
      variant.fields.map((variantField) => ({
        fieldId: variantField.name,
        fieldName: fieldValues.find((f) => f.fieldId === variantField.name)?.fieldName ?? variantField.name,
        textValue: variantField.value,
      })),
    );
  }
  return [];
}

export function isTextFieldType(fieldType: string): boolean {
  return fieldType === 'single-line text' || fieldType === 'multi-line text' || fieldType === 'rich text';
}
