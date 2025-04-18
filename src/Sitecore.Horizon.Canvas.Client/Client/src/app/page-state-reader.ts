/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ConfigurationService } from './services/configuration.service';

interface CanvasMessage<T> {
  type: 'State' | 'Layout' | 'HostVerificationToken';
  data: T;
}

export interface HorizonPageState {
  itemId: string;
  itemVersion: number;
  siteName: string;
  language: string;
  deviceId: string;
  pageMode: 'edit' | 'preview' | 'unknown';
  variant: string | undefined;
}

interface HostVerificationTokenEnvelope {
  hostVerificationToken: string;
}

export class PageStateReader {
  static getPageState(): HorizonPageState {
    const scriptTag = document.getElementById('hrz-canvas-state');
    if (!scriptTag || !scriptTag.textContent) {
      // If due do some reasons content is missing (which should never happen), just report empty content.
      // It's still safer then sending nothing.
      return { itemId: '', itemVersion: 0, siteName: '', language: '', deviceId: '', pageMode: 'unknown', variant: undefined };
    }

    const message = JSON.parse(scriptTag.textContent);

    // with PSO variant is not printed in the page state
    message.variant = message.variant ?? ConfigurationService.activeVariant;

    if (message.type === undefined) {
      return message as HorizonPageState;
    }

    const parsed = message as CanvasMessage<HorizonPageState>;
    if (parsed.type !== 'State') {
      throw Error(`Horizon page state is invalid. Expected type to be 'State', but found '${parsed.type}' instead.`);
    }

    // Normalize mode, as it could come with any casing - don't want to handle that in all the places.
    parsed.data.pageMode = parsed.data.pageMode.toLowerCase() as HorizonPageState['pageMode'];
    return parsed.data;
  }

  getHorizonPageState(): HorizonPageState {
    return PageStateReader.getPageState();
  }

  getPageLayout(): string {
    const scriptTag = document.getElementById('hrz-canvas-layout');
    if (!scriptTag || !scriptTag.textContent) {
      // If canvas layout data is missing, report empty value. App will request layout data by GraphQL call.
      return '';
    }

    const parsedMsg = JSON.parse(scriptTag.textContent) as CanvasMessage<unknown>;
    if (parsedMsg.type !== 'Layout') {
      throw Error(`Horizon page state is invalid. Expected type to be 'Layout', but found '${parsedMsg.type}' instead.`);
    }

    // Layout is returned as a JSON object, so we have to serialize it back
    return JSON.stringify(parsedMsg.data);
  }

  getVerificationToken(): string {
    const scriptTag = document.getElementById('hrz-canvas-verification-token');
    if (!scriptTag || !scriptTag.textContent) {
      // If due do some reasons content is missing (which should never happen), just report empty content.
      return '';
    }

    const message = JSON.parse(scriptTag.textContent);
    if (typeof message === 'string') {
      return message;
    }

    const parsedMsg = message as CanvasMessage<HostVerificationTokenEnvelope>;
    if (parsedMsg.type !== 'HostVerificationToken') {
      throw Error(`Horizon page state is invalid. Expected type to be 'HostVerificationToken', but found '${parsedMsg.type}' instead.`);
    }

    return parsedMsg.data.hostVerificationToken;
  }
}
