/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { escapeXml } from './xml';

const PLACEHOLDER_TEXT = `[No text in field]`;

export function createMouseEvent(type: string) {
  const mouseEvent = document.createEvent('MouseEvents');
  mouseEvent.initMouseEvent(type, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  return mouseEvent;
}

export function createFocusEvent(): FocusEvent {
  const focusEvent = document.createEvent('FocusEvent');
  focusEvent.initEvent('focus');
  return focusEvent;
}

export function createKeyboardEvent(type: string, key: string): KeyboardEvent {
  const keyboardEvent = new KeyboardEvent(type, {
    key,
  });

  return keyboardEvent;
}

export function triggerClick(el: Element) {
  const fullClick = [
    createMouseEvent('mouseover'),
    createMouseEvent('mousedown'),
    createMouseEvent('mouseup'),
    createMouseEvent('click'),
    createFocusEvent(),
  ];
  fullClick.forEach((event) => {
    el.dispatchEvent(event);
  });
}

export function triggerMouseOut(el: Element) {
  const fullOver = [createMouseEvent('mouseout'), createMouseEvent('mouseleave')];
  fullOver.forEach((event) => {
    el.dispatchEvent(event);
  });
}

export function triggerMouseOver(el: Element) {
  const fullOver = [createMouseEvent('mouseover'), createMouseEvent('mouseenter')];
  fullOver.forEach((event) => {
    el.dispatchEvent(event);
  });
}

/**
 * Fixes the issue when element.focus() is not invoking the Focus event when browser is not active (focused).
 */
export function fixFocusEventBehavior(el: HTMLElement) {
  const originalFn = el.focus;
  el.focus = (options) => {
    originalFn.call(el, options);
    el.dispatchEvent(createFocusEvent());
  };
}

/**
 * Render dom using pseudo-html syntax for better readability
 */
export function setupTestDOM(templateDsl: string): HTMLElement {
  const parsedXml = new DOMParser().parseFromString(`<root>${templateDsl}</root>`, 'text/xml');
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const innerContent: string = Array.from(parsedXml.firstElementChild!.children).map(renderDlsNode).join('\n');

  const testElement = document.createElement('div');
  testElement.innerHTML = innerContent;
  document.body.appendChild(testElement);

  return testElement;
}

export function teardownTestDOM(testElement: Element) {
  testElement.remove();
}

export function renderSingleTestNode(nodeDsl: string): Element {
  const parsedXml = new DOMParser().parseFromString(`${nodeDsl}`, 'text/xml');
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const rawNode = renderDlsNode(parsedXml.firstElementChild!);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return new DOMParser().parseFromString(rawNode, 'text/html').firstElementChild!;
}

function renderDlsNode(element: Element) {
  const innerContent: string = element.childElementCount ? Array.from(element.children).map(renderDlsNode).join('\n') : element.innerHTML;

  const attr = (name: string) => element.getAttribute(name) || undefined;

  function withoutUndefined<T extends object>(obj: T): T {
    const copy = { ...obj } as any;
    Object.keys(obj).forEach((key) => (copy[key] === undefined ? delete copy[key] : ''));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return copy;
  }

  switch (element.tagName) {
    case 'placeholder': {
      const config = {
        id: attr('id') ?? 'testPlaceholderId',
        key: attr('key') ?? 'testPhKey',
        editable: attr('editable') ? attr('editable') === 'true' : undefined,
      };
      return renderPlaceholder(withoutUndefined(config), innerContent);
    }

    case 'rendering': {
      const config = {
        id: attr('id') ?? 'testRenderingInstanceId',
        rid: attr('rid') ?? 'testRenderingId',
        editable: attr('editable') ? attr('editable') === 'true' : undefined,
        inlineEditor: attr('inlineEditor') ?? undefined,
        appliedPersonalizationActions: attr('appliedPersonalizationActions') ?? undefined,
        displayName: attr('displayName') ?? undefined,
        feaasComponentName: attr('FEaasComponentName') ?? undefined,
      };
      return renderRendering(withoutUndefined(config), innerContent);
    }

    case 'field': {
      const fldType = attr('type') ?? 'unknown';

      const fieldId = attr('id') ?? `test-${fldType}`;

      switch (fldType) {
        case 'single-line text': {
          const config = { fieldId, text: element.textContent || undefined };
          return renderSingleLineTextField(withoutUndefined(config));
        }

        case 'multi-line text': {
          const config = { fieldId, text: element.textContent || undefined };
          return renderMultiLineTextField(withoutUndefined(config));
        }

        case 'integer': {
          const config = { fieldId, text: element.textContent || undefined };
          return renderIntegerField(withoutUndefined(config));
        }

        case 'number': {
          const config = { fieldId, text: element.textContent || undefined };
          return renderNumberField(withoutUndefined(config));
        }

        case 'date': {
          const config = { fieldId, text: element.textContent || undefined };
          return renderDateField(withoutUndefined(config));
        }

        case 'rich-text': {
          const config = { fieldId, html: element.innerHTML || undefined };
          return renderRichTextField(withoutUndefined(config));
        }

        case 'image': {
          const config = {
            fieldId,
            src: attr('src'),
            alt: attr('alt'),
            width: parseInt(attr('width') || '0', 10) || undefined,
            height: parseInt(attr('height') || '0', 10) || undefined,
          };
          return renderImageField(withoutUndefined(config));
        }

        case 'general link': {
          const config = {
            fieldId,
            linktype: attr('linktype'),
            url: attr('url'),
            text: attr('text'),
            title: attr('title'),
            content: innerContent || undefined,
          };
          return renderGeneralLinkField(withoutUndefined(config));
        }

        default:
          return renderUnsupportedWebEditField();
      }
    }

    case 'editframe': {
      return renderEditFrame(innerContent);
    }

    default: {
      const tag = element.tagName;
      return `<${tag}>${innerContent}</${tag}>`;
    }
  }
}

function renderImageField(config?: { fieldId?: string; src?: string; alt?: string; width?: number; height?: number }) {
  const { fieldId, src, alt, width, height } = { ...{ fieldId: 'testImageField', src: '//:0', alt: '', width: 42, height: 24 }, ...config };

  return `
    <input class='scFieldValue' type='hidden' value="&lt;image mediaid=&quot;{DC2B8A8F-95AC-40F9-926C-2B2EB95F3D9C}&quot; /&gt;" />
    <code type="text/sitecore" chromeType="field" class="scpm" kind="open" id="start_${fieldId}">
      {
        "custom": {
          "fieldId": "${fieldId}",
          "fieldType": "image",
          "fieldWebEditParameters": { },
          "contextItem": {
            "id": "{110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9}",
            "language": "en",
            "version": 1,
            "revision": "56afab7f-7250-45ef-a3ab-ab0cf6daaf06"
          }
        },
        "displayName": "Image field"
      }
    </code>

    <img src="${src}" alt="${alt}" width="${width}" height="${height}" />

    <code class="scpm" type="text/sitecore" chromeType="field" kind="close" id="end_${fieldId}"></code>
  `;
}

function renderSingleLineTextField(config?: { fieldId?: string; text?: string }) {
  const { fieldId, text } = { ...{ fieldId: 'testSingleLineField', text: 'Foo Bar Baz' }, ...config };
  const renderedValue = text || PLACEHOLDER_TEXT;

  return `
    <input class='scFieldValue' type='hidden' value="${text}" />
    <span class="scChromeData">
      {
        "custom": {
          "fieldId": "${fieldId}",
          "fieldType": "single-line text",
          "fieldWebEditParameters": {},
          "contextItem": {
            "id": "{110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9}",
            "language": "en",
            "version": 1,
            "revision": "56afab7f-7250-45ef-a3ab-ab0cf6daaf06"
          }
        },
        "displayName": "Single line text"
      }
    </span>
    <span contenteditable="true" class="scWebEditInput">${renderedValue}</span>
  `;
}

function renderIntegerField(config?: { fieldId?: string; text?: string }) {
  const { fieldId, text } = { ...{ fieldId: 'testIntegerField', text: '12345' }, ...config };
  const renderedValue = text || PLACEHOLDER_TEXT;

  return `
    <input class='scFieldValue' type='hidden' value="${text}" />
    <span class="scChromeData">
      {
        "custom": {
          "fieldId": "${fieldId}",
          "fieldType": "integer",
          "fieldWebEditParameters": {},
          "contextItem": {
            "id": "{110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9}",
            "language": "en",
            "version": 1,
            "revision": "56afab7f-7250-45ef-a3ab-ab0cf6daaf06"
          }
        },
        "displayName": "Integer"
      }
    </span>
    <span contenteditable="true" class="scWebEditInput">${renderedValue}</span>
  `;
}

function renderNumberField(config?: { fieldId?: string; text?: string }) {
  const { fieldId, text } = { ...{ fieldId: 'testNumberField', text: '1.1' }, ...config };
  const renderedValue = text || PLACEHOLDER_TEXT;

  return `
    <input class='scFieldValue' type='hidden' value="${text}" />
    <span class="scChromeData">
      {
        "custom": {
          "fieldId": "${fieldId}",
          "fieldType": "number",
          "fieldWebEditParameters": {},
          "contextItem": {
            "id": "{110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9}",
            "language": "en",
            "version": 1,
            "revision": "56afab7f-7250-45ef-a3ab-ab0cf6daaf06"
          }
        },
        "displayName": "number"
      }
    </span>
    <span contenteditable="true" class="scWebEditInput">${renderedValue}</span>
  `;
}

function renderDateField(config?: { fieldId?: string; text?: string }) {
  const { fieldId, text } = { ...{ fieldId: 'testDateField', text: '20230530T020000Z' }, ...config };
  const renderedValue = text || PLACEHOLDER_TEXT;

  return `
    <input class='scFieldValue' type='hidden' value="${text}" />
    <span class="scChromeData">
      {
        "custom": {
          "fieldId": "${fieldId}",
          "fieldType": "date",
          "fieldWebEditParameters": {},
          "contextItem": {
            "id": "{110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9}",
            "language": "en",
            "version": 1,
            "revision": "56afab7f-7250-45ef-a3ab-ab0cf6daaf06"
          }
        },
        "displayName": "date"
      }
    </span>
    <span contenteditable="true" class="scWebEditInput">${renderedValue}</span>
  `;
}

function renderRichTextField(config?: { fieldId?: string; html?: string }) {
  const { fieldId, html } = {
    ...{
      fieldId: 'testRichTextField',
      html: `<p>From a <strong>single</strong> connected platform that also integrates with other customer-facing platforms.</p>`,
    },
    ...config,
  };
  const renderedValue = html || PLACEHOLDER_TEXT;

  return `
    <input class='scFieldValue' type='hidden' value="${html}" />
    <span class="scChromeData" id="chrome_${fieldId}">
      {
        "custom": {
          "fieldId": "${fieldId}",
          "fieldType": "rich text",
          "fieldWebEditParameters": {},
          "contextItem": {
            "id": "{110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9}",
            "language": "en",
            "version": 1,
            "revision": "56afab7f-7250-45ef-a3ab-ab0cf6daaf06"
          }
        },
        "displayName": "Rich text"
      }
    </span>
    <span contenteditable="true" class="scWebEditInput">${renderedValue}</span>
  `;
}

function renderMultiLineTextField(config?: { fieldId?: string; text?: string }) {
  const { fieldId, text } = {
    ...{ fieldId: 'testMultiLineTextField', text: 'Lorem ipsum dolor sit amet,\n\nconsectetur adipiscing elit.' },
    ...config,
  };
  const renderedValue = text ? text.replace(/\n/g, '<br />') : PLACEHOLDER_TEXT;

  return `
    <input class='scFieldValue' type='hidden' value="${text}" />
    <span class="scChromeData">
      {
        "custom": {
          "fieldId": "${fieldId}",
          "fieldType": "multi-line text",
          "fieldWebEditParameters": {},
          "contextItem": {
            "id": "{110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9}",
            "language": "en",
            "version": 1,
            "revision": "56afab7f-7250-45ef-a3ab-ab0cf6daaf06"
          }
        },
        "displayName": "Multi-line text field"
      }
    </span>
    <span contenteditable="true" class="scWebEditInput">${renderedValue}</span>
  `;
}

function renderGeneralLinkField(config?: { fieldId?: string; linktype?: string; url?: string; content?: string; title?: string }) {
  const { fieldId, linktype, content, url, title } = {
    fieldId: 'testMultiLineTextField',
    content: 'General Link field. Click me',
    url: 'https://example.com',
    linktype: 'external',
    ...config,
  };

  const rawValue = url === '' ? `` : `<link linktype="${linktype}" url="${url}" text="${content}" title="${title}" />`;
  const renderedValue = url === '' ? `<span>${PLACEHOLDER_TEXT}</span>` : `<a href="${url}" title="${title}">${content}</a>`;

  return `
    <input class='scFieldValue' type='hidden' value="${escapeXml(rawValue)}" />
    <code type="text/sitecore" chrometype="field" class="scpm" kind="open">
      {
        "custom": {
          "fieldId": "${fieldId}",
          "fieldType": "general link",
          "fieldWebEditParameters": { },
          "contextItem": {
            "id": "{110d559f-dea5-42ea-9c1c-8a5df7e70ef9}",
            "language": "en",
            "version": 1,
            "revision": "56afab7f-7250-45ef-a3ab-ab0cf6daaf06"
          }
        },
        "displayName": "General link field"
      }
    </code>
    ${renderedValue}
    <code class="scpm" type="text/sitecore" chromeType="field" kind="close"></code>
  `;
}

function renderPlaceholder(config: { id: string; key: string; editable?: boolean }, content = '') {
  const { id, key, editable } = { ...{ key: '', editable: true }, ...config };

  return `
    <code type='text/sitecore' chromeType='placeholder' kind='open' class='scpm' id="start_${id}">
      {
        "custom": {
          "placeholderKey": "${key}",
          "placeholderMetadataKeys": [
            "${key}"
          ],
          "allowedRenderings": [],
          "contextItem": {
            "id": "{110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9}",
            "language": "en",
            "version": 1,
            "revision": "56afab7f-7250-45ef-a3ab-ab0cf6daaf06"
          },
          "editable": "${editable}"
        },
        "displayName": "${key}"
      }
    </code>
    ${content}
    <code type='text/sitecore' chromeType='placeholder' kind='close' class='scpm' id="end_${id}"></code>
  `;
}

function renderRendering(
  config: {
    id: string;
    rid: string;
    editable?: boolean;
    inlineEditor?: string;
    appliedPersonalizationActions?: string;
    displayName?: string;
    feaasComponentName?: string;
  },
  content: string,
) {
  const { id, rid, editable, inlineEditor, appliedPersonalizationActions, displayName, feaasComponentName } = {
    ...{ id: '', rid: '', editable: true, inlineEditor: undefined, appliedPersonalizationActions: '[]' },
    ...config,
  };

  return `
    <code type="text/sitecore" chromeType="rendering" kind="open" class="scpm" id="start_${rid}">
      {
        "custom": {
          "renderingInstanceId": "${id}",
          "renderingId": "${rid}",
          "contextItem": {
            "id": "{110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9}",
            "language": "en",
            "version": 1,
            "revision": "56afab7f-7250-45ef-a3ab-ab0cf6daaf06"
          },
          "editable": "${editable}",
          "appliedPersonalizationActions": ${appliedPersonalizationActions}
          ${inlineEditor ? `, "inlineEditor": "${inlineEditor}"` : ''},
          "FEaasComponentName": "${feaasComponentName ? feaasComponentName : ''}"
        },
        "displayName": "${displayName ? displayName : id}"
      }
    </code>
    ${content}
    <code type="text/sitecore" chromeType="rendering" kind="close" class="scpm" id="end_${rid}"></code>
  `;
}

function renderUnsupportedWebEditField() {
  const text = `Hello world! Here is some more text`;
  return `
    <input class='scFieldValue' type='hidden' value="${text}" />
    <span class="scChromeData">
      {
        "custom": {
          "fieldId": "54be02fc-1e7a-460c-bd4f-1c33a214efc5",
          "fieldType": "unknown field type",
          "fieldWebEditParameters": {},
          "contextItem": {
            "id": "{110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9}",
            "language": "en",
            "version": 1,
            "revision": "56afab7f-7250-45ef-a3ab-ab0cf6daaf06"
          }
        },
        "displayName": "Unknown field"
      }
    </span>
    <span contenteditable="true" class="scWebEditInput">${text}</span>
  `;
}

function renderEditFrame(content: string) {
  return `
    <div class="scLooseFrameZone">
      <span class="scChromeData">
        {
          "displayName": "Edit frame"
        }
      </span>
      ${content}
    </div>
  `;
}
