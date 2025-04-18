/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingP2PChannel, MessagingP2PChannelDefFromChannel } from '@sitecore/horizon-messaging';
import { EventEmitter } from '../../../messaging/event-emitter';
import { FieldRawValue } from '../../../messaging/horizon-canvas.contract.parts';
import { TranslationService } from '../../../services/translation.service';
import { calculateMaxDimensions, ElementDimensions } from '../../../utils/dom';
import { FieldHandler, RhsFieldEditorMessaging } from '../../chrome.field';
import { GeneralLinkValue } from './general-link-value.type';
import { buildGeneralLinkRawValue, parseGeneralLinkRawValue } from './general-link.raw-value';

export type RhsChannel = MessagingP2PChannel<
  // Inbound events
  {},
  // Outbound events
  {
    'value:change': GeneralLinkValue | null;
  },
  // Remote RPC services
  {},
  // Provided RPC services
  {
    getValue(): GeneralLinkValue | null;
    setValue(value: GeneralLinkValue | null): void;
  }
>;

export const RhsChannelDef: MessagingP2PChannelDefFromChannel<RhsChannel> = {
  name: 'general',
};

interface FieldValue {
  rawValue: string;
  model: GeneralLinkValue | null;
}

function isGeneralLinkValueWithRaw(value: FieldRawValue): value is FieldValue {
  return 'model' in value;
}

function isValidValueToAppearInDom(value: GeneralLinkValue): boolean {
  if (value?.linktype === 'external') {
    return !!(value.url.trim().length || value.text?.trim().length);
  }
  if (value?.linktype === 'internal') {
    return !!(value.item.id || value.text?.trim().length);
  }
  return true;
}

function getValueDomAppearance(
  value: GeneralLinkValue | null,
  watermarkText: string,
): { href: string; text: string; target?: string; title?: string; class?: string } {
  if (value === null) {
    return { href: '', text: watermarkText };
  }

  let href: string;
  let text: string;
  let target: string | undefined;

  switch (value.linktype) {
    case 'external': {
      href = value.url;
      text = isValidValueToAppearInDom(value) ? value.url : watermarkText;
      target = value.target || undefined;
      break;
    }

    case 'internal': {
      href = value.item.url;
      if (value.querystring) {
        href += href.indexOf('?') > -1 ? '&' : '?';
        href += value.querystring.replace(/^[\?\&]/, '');
      }
      if (value.anchor) {
        href += `#${value.anchor.replace(/^\#/, '')}`;
      }

      text = isValidValueToAppearInDom(value) ? value.item.displayName : watermarkText;
      target = value.target || undefined;
      break;
    }

    case 'media': {
      href = value.item.url;
      text = value.item.displayName;
      target = value.target || undefined;
      break;
    }

    case 'anchor': {
      href = `#${value.anchor.replace(/^\#/, '')}`;
      text = href;
      break;
    }

    case 'mailto': {
      href = `mailto:${value.url.replace(/^mailto:/, '')}`;
      text = href;
      break;
    }

    case 'javascript': {
      href = '#';
      text = `javascript:${value.url.replace(/^javascript:/, '')}`;
    }
  }

  return {
    href,
    text: value.text || text,
    target,
    title: value.title,
    class: value.class,
  };
}

export class GeneralLinkFieldHandler implements FieldHandler {
  readonly onSizeChange = new EventEmitter();
  readonly onSelect = new EventEmitter();
  readonly onChange = new EventEmitter<{ value: FieldRawValue; debounce: boolean; requireSSR: boolean }>();

  private readonly messaging: RhsChannel;

  private element: HTMLAnchorElement | HTMLSpanElement;
  private value: FieldValue;

  constructor(
    element: HTMLElement,
    private readonly rawValueHolder: HTMLInputElement,
    rhsMessaging: RhsFieldEditorMessaging,
    private readonly abortController: AbortController,
  ) {
    const rawValue = rawValueHolder.value;
    this.element = element;
    this.messaging = rhsMessaging.getChannel(RhsChannelDef);

    const renderUrl = (element as HTMLAnchorElement)?.href ?? '';
    this.value = { rawValue, model: parseGeneralLinkRawValue(rawValue, renderUrl, element.textContent ?? '') };
  }

  async init() {
    this.initElement();

    this.initRhsEditorMessages();
  }

  private initElement(element?: HTMLAnchorElement) {
    this.element = element || this.element;
    this.element.style.cursor = 'pointer';
    this.element.tabIndex = 0;

    this.element.addEventListener('focus', () => this.onSelect.emit(), { signal: this.abortController.signal });

    // Remove rendered "javascript" kind handler to evaluate JS value manually on CTRL+Click only.
    this.element.onclick = null;
    this.element.addEventListener(
      'click',
      (ev) => {
        if (this.value.model?.linktype === 'javascript') {
          ev.preventDefault();
          ev.stopImmediatePropagation();

          if (ev.ctrlKey) {
            // eslint-disable-next-line no-eval
            eval(this.value.model.url.replace(/^javascript:/, ''));
          }
        }
      },
      { signal: this.abortController.signal },
    );
  }

  private initRhsEditorMessages() {
    this.messaging.setRpcServicesImpl({
      getValue: () => this.value.model,
      setValue: (value) => {
        const newValue: FieldValue = {
          model: value,
          rawValue: buildGeneralLinkRawValue(value),
        };
        this.setValue(newValue);
      },
    });
  }

  getDimensions(): ElementDimensions {
    return calculateMaxDimensions([this.element]);
  }

  select(): void {
    this.element.focus();
  }

  getValue(): FieldValue {
    return this.value;
  }

  setValue(value: FieldRawValue): void {
    if (!isGeneralLinkValueWithRaw(value)) {
      throw Error('Value is of unsupported type');
    }

    // JSS might provide custom empty field html element, need to do server side rendering (SSR) to get rendered html
    // For example <JssLink ... emptyFieldEditingComponent={() => <h3>Enter value!</h3>}/>
    const requireSSR = !value.model && !value.rawValue;
    if (!requireSSR) {
      this.value = value;
      this.rawValueHolder.value = value.rawValue;
      this.renderCurrentValue();
    }

    this.onChange.emit({ value, debounce: false, requireSSR });
    this.onSizeChange.emit();
    this.messaging.emit('value:change', value.model);
  }

  private renderCurrentValue() {
    const renderModel = getValueDomAppearance(this.value.model, TranslationService.get('NO_TEXT_IN_FIELD'));

    const element = this.ensureElement();
    element.href = renderModel.href;
    element.textContent = renderModel.text;
    element.target = renderModel.target ?? '';
    element.title = renderModel.title ?? '';
    element.className = renderModel.class ?? '';
  }

  private ensureElement(): HTMLAnchorElement {
    if (this.element instanceof HTMLAnchorElement) {
      return this.element;
    }

    const anchorElement = document.createElement('a');
    this.element.innerHTML = '';
    this.element.appendChild(anchorElement);
    this.initElement(anchorElement);

    return anchorElement;
  }
}
