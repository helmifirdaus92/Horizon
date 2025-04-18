/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingP2PChannel, MessagingP2PChannelDefFromChannel } from '@sitecore/horizon-messaging';
import { EventEmitter } from '../../messaging/event-emitter';
import { FieldRawValue } from '../../messaging/horizon-canvas.contract.parts';
import { ConfigurationService } from '../../services/configuration.service';
import { calculateMaxDimensions, ElementDimensions, setSizeAttribute } from '../../utils/dom';
import { isAbsoluteUrl, isXmcMediaRelativeUrl, makeAbsoluteUrl } from '../../utils/url';
import { parseXmlElement } from '../../utils/xml';
import { FieldHandler, RhsFieldEditorMessaging } from '../chrome.field';

const PLACEHOLDER_IMAGE =
  // eslint-disable-next-line max-len
  `data:image/svg+xml,%3Csvg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 240 240" style="enable-background:new 0 0 240 240;" xml:space="preserve"%3E%3Cstyle type="text/css"%3E .st0%7Bfill:none;%7D .st1%7Bfill:%23969696;%7D .st2%7Bfill:%23FFFFFF;%7D .st3%7Bfill:%23FFFFFF;stroke:%23FFFFFF;stroke-width:0.75;stroke-miterlimit:10;%7D%0A%3C/style%3E%3Cg%3E%3Crect class="st0" width="240" height="240"/%3E%3Cg%3E%3Cg%3E%3Crect x="20" y="20" class="st1" width="200" height="200"/%3E%3C/g%3E%3Cg%3E%3Ccircle class="st2" cx="174" cy="67" r="14"/%3E%3Cpath class="st2" d="M174,54c7.17,0,13,5.83,13,13s-5.83,13-13,13s-13-5.83-13-13S166.83,54,174,54 M174,52 c-8.28,0-15,6.72-15,15s6.72,15,15,15s15-6.72,15-15S182.28,52,174,52L174,52z"/%3E%3C/g%3E%3Cpolyline class="st3" points="29.5,179.25 81.32,122.25 95.41,137.75 137.23,91.75 209.5,179.75 "/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;

const EMPTY_VALUE: ImageFieldValue = { rawValue: '' };

export interface ImageFieldValue {
  rawValue: string;
  src?: string;
  alt?: string;
  height?: number;
  width?: number;
}

export type RhsChannel = MessagingP2PChannel<
  // Inbound events
  {},
  // Outbound events
  {
    'value:change': ImageFieldValue | null;
  },
  // Remote RPC services
  {},
  // Provided RPC services
  {
    getValue(): ImageFieldValue | null;
    setValue(value: ImageFieldValue): void;
    clearValue(): void;
  }
>;

export const RhsChannelDef: MessagingP2PChannelDefFromChannel<RhsChannel> = {
  name: 'general',
};

function parseRawValue(rawValue: string): ImageFieldValue {
  if (!rawValue) {
    return EMPTY_VALUE;
  }

  const imageRawValue = parseXmlElement(rawValue);

  function parseIntAttr(value: string | undefined): number | undefined {
    if (!value) {
      return undefined;
    }

    return parseInt(value, 10);
  }

  return {
    rawValue,
    alt: imageRawValue.alt,
    width: parseIntAttr(imageRawValue.width),
    height: parseIntAttr(imageRawValue.height),
  };
}

export class ImageFieldHandler implements FieldHandler {
  readonly onSizeChange = new EventEmitter();
  readonly onSelect = new EventEmitter();
  readonly onChange = new EventEmitter<{ value: FieldRawValue; debounce: boolean; requireSSR: boolean }>();

  private readonly messaging: RhsChannel;

  private readonly element: HTMLImageElement | HTMLElement;
  private value: ImageFieldValue;

  constructor(
    element: HTMLElement,
    private readonly rawValueHolder: HTMLInputElement,
    rhsMessaging: RhsFieldEditorMessaging,
    private readonly abortController: AbortController,
  ) {
    this.element = element;
    const rawValue = this.rawValueHolder.value;

    this.messaging = rhsMessaging.getChannel(RhsChannelDef);

    this.value = parseRawValue(rawValue);
    if (element instanceof HTMLImageElement) {
      this.value = { ...this.value, src: rawValue ? element.src : undefined, alt: element.alt || undefined };
    }

    // Normalize drawing of initial value. Do it only for empty images to not change initial look, as it might differ after client render.
    if (!this.value.rawValue) {
      this.setValue(this.value);
    }
  }

  async init() {
    this.element.style.cursor = 'pointer';
    this.element.tabIndex = 0;

    this.initAttachEvents();
    this.initRhsEditorMessages();
  }

  private initAttachEvents() {
    const element = this.element;

    element.addEventListener('focus', () => this.dispatchSelect(), { signal: this.abortController.signal });

    element.addEventListener('load', () => this.dispatchResize(), { signal: this.abortController.signal });
  }

  private initRhsEditorMessages() {
    this.messaging.setRpcServicesImpl({
      getValue: () => {
        const value = this.getValue();
        return value.rawValue ? value : null;
      },
      setValue: (receivedValue) => this.setValue(receivedValue),
      clearValue: () => this.clearValue(),
    });
  }

  getDimensions(): ElementDimensions {
    return calculateMaxDimensions([this.element]);
  }

  select(): void {
    this.element.focus();
  }

  getValue(): ImageFieldValue {
    return this.value;
  }

  setValue(value: ImageFieldValue): void {
    this.value = value;
    this.rawValueHolder.value = this.value.rawValue;

    // Hack to support ContentHub putting non-image stuff to the image field.
    // We render new value only if current tag is image and new value is either empty or of image type.
    // Otherwise, we notify that we cannot render value client side, and request server rendering (i.e. canvas reload).
    // This is mostly required because of following:
    //   - we don't know how to render various field types. For instance, we don't know how to render video.
    //   - we cannot re-create elements under chrome with the current architecture, as we subscribe to element events early during app init.
    //     If we re-create element later, some functionality (like chrome highlighting) is broken.
    let requireSSR;
    const element = this.element;
    if (element instanceof HTMLImageElement && (!value.rawValue || value.src)) {
      requireSSR = false;

      const bannerVariantParentEl = element.parentNode?.parentElement;
      const isBannerVariant =
        bannerVariantParentEl &&
        bannerVariantParentEl.classList.contains('sc-sxa-image-hero-banner') &&
        bannerVariantParentEl.getAttribute('style')?.includes('background-image');

      if (isBannerVariant) {
        bannerVariantParentEl?.setAttribute('style', `background-image: url('${value.src || PLACEHOLDER_IMAGE}')`);

        element.style.minWidth = '48px';
        element.style.minHeight = '48px';
        element.style.maxWidth = '100%';
        element.style.maxHeight = '100%';
        element.style.width = '100%';
        element.style.height = '100%';
      } else {
        if (value.src) {
          element.src =
            !isAbsoluteUrl(value.src) && isXmcMediaRelativeUrl(value.src)
              ? makeAbsoluteUrl(value.src, ConfigurationService.xmCloudTenantUrl)
              : value.src;
        } else {
          element.src = PLACEHOLDER_IMAGE;
        }

        element.alt = value.alt || '';
        setSizeAttribute(element, 'width', value.width);
        setSizeAttribute(element, 'height', value.height);

        if (element.src === PLACEHOLDER_IMAGE) {
          // If we set our placeholder image, ensure to specify sizing parameters.
          // Use min/max instead of exact size in case there is CSS rule controlling the size.
          element.style.minWidth = '48px';
          element.style.minHeight = '48px';
          element.style.maxWidth = '400px';
          element.style.maxHeight = '400px';
        } else {
          element.style.minWidth = '';
          element.style.minHeight = '';
          element.style.maxWidth = '';
          element.style.maxHeight = '';
        }
      }
    } else {
      requireSSR = true;
    }

    this.onChange.emit({ value, debounce: false, requireSSR });
    this.messaging.emit('value:change', value.rawValue ? value : null);
    this.dispatchResize();
  }

  private clearValue(): void {
    this.setValue(EMPTY_VALUE);
  }

  private dispatchResize() {
    this.onSizeChange.emit();
  }

  private dispatchSelect() {
    this.onSelect.emit();
  }
}
