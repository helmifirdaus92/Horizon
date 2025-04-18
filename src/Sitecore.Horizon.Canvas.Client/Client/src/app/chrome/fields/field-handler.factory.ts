/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingService } from 'src/app/messaging/messaging-service';
import { FeatureChecker } from '../../utils/feature-checker';
import { FieldHandler, RhsFieldEditorMessaging } from '../chrome.field';
import { DateFieldHandler } from './date.field-handler';
import { GeneralLinkFieldHandler } from './general-link/general-link.field-handler';
import { ImageFieldHandler } from './image.field-handler';
import { MultiLineTextFieldHandler } from './multi-line-text.field-handler';
import { NumericalFieldHandler } from './numerical.field-handler';
import { RichTextCkEditorFieldHandler } from './rich-text/rich-text-ckeditor.field-handler';
import { RichTextFieldHandler } from './rich-text/rich-text.field-handler';
import { SingleLineTextFieldHandler } from './single-line-text.field-handler';
import { UnknownFieldHandler } from './unknown.field-handler';

export function createFieldHandler(
  fieldType: string,
  element: HTMLElement,
  rawValueHolder: HTMLInputElement,
  rhsMessaging: RhsFieldEditorMessaging,
  messaging: MessagingService,
  abortController: AbortController,
): FieldHandler {
  if (fieldType === 'single-line text') {
    return new SingleLineTextFieldHandler(element, rawValueHolder, abortController);
  }

  if (fieldType === 'multi-line text') {
    return new MultiLineTextFieldHandler(element, rawValueHolder, abortController);
  }

  const isFeatureEnabled = FeatureChecker.isCkeditorEnabled();

  if (!isFeatureEnabled && fieldType === 'rich text') {
    return new RichTextFieldHandler(element, rawValueHolder, rhsMessaging, abortController);
  }

  if (isFeatureEnabled && fieldType === 'rich text') {
    return new RichTextCkEditorFieldHandler(element, rawValueHolder, messaging, abortController);
  }

  if (fieldType === 'image') {
    return new ImageFieldHandler(element, rawValueHolder, rhsMessaging, abortController);
  }

  if (fieldType === 'general link') {
    return new GeneralLinkFieldHandler(element, rawValueHolder, rhsMessaging, abortController);
  }

  if (fieldType === 'integer' || fieldType === 'number') {
    return new NumericalFieldHandler(element, rawValueHolder, rhsMessaging, abortController);
  }

  if (fieldType === 'date' || fieldType === 'datetime') {
    return new DateFieldHandler(element, rawValueHolder, rhsMessaging, abortController);
  }

  return new UnknownFieldHandler(element, rawValueHolder, abortController);
}
