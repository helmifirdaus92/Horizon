/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { GlobalMessaging } from '../messaging/global-messaging';

export type RenderingInlineEditorFactory = (context: {
  startElement: Element;
  endElement: Element;
  messaging: GlobalMessaging;
}) => Promise<{
  editorProtocols: readonly string[];
}>;
