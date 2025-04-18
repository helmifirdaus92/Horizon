/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Chrome, SortRenderingsOptions } from '../chrome/chrome';
import { FieldChrome, isFieldChrome } from '../chrome/chrome.field';
import { isPlaceholderChrome, PlaceholderChrome } from '../chrome/chrome.placeholder';
import { isRenderingChrome, RenderingChrome } from '../chrome/chrome.rendering';
import { MarkupChrome } from '../chrome/read/chrome-data-types';
import { FlowDefinition } from '../messaging/horizon-canvas.contract.parts';
import { AbTestComponentService } from '../services/ab-test-component.service';
import { getElementsInBetween } from './dom';
import { normalizeIdWithoutDash } from './id';

export function setupChromeEventsHierarchically(
  chromes: readonly Chrome[],
  handlers: {
    field: (element: Element, chrome: FieldChrome) => void;
    rendering: (element: Element, chrome: RenderingChrome) => void;
    placeholder: (element: Element, chrome: PlaceholderChrome) => void;
  },
): void {
  const rootChromes = chromes.filter((c) => !c.parentChrome);

  const alreadyMatchedElements = new Set<Element>();
  for (const chrome of rootChromes) {
    setupChromeRecursively(chrome);
  }

  return;

  // Recursive util

  function setupChromeRecursively(chrome: Chrome): void {
    chrome.childChromes.forEach((childChrome) => setupChromeRecursively(childChrome));

    if (isFieldChrome(chrome)) {
      const element = chrome.element;
      if (alreadyMatchedElements.has(element)) {
        throw Error(`Field element was already attached to another chrome. Field: '${chrome.fieldId}', Item: '${chrome.itemContext.id}'`);
      }
      alreadyMatchedElements.add(element);

      handlers.field(element, chrome);
      return;
    }

    if (isRenderingChrome(chrome) || isPlaceholderChrome(chrome)) {
      const elements = getElementsInBetween(chrome.startElement, chrome.endElement);

      for (const element of elements) {
        if (alreadyMatchedElements.has(element)) {
          continue;
        }
        alreadyMatchedElements.add(element);

        if (isRenderingChrome(chrome)) {
          handlers.rendering(element, chrome);
        } else {
          handlers.placeholder(element, chrome);
        }
      }

      return;
    }
  }
}

export function getSortRenderingsOptions(chrome: Chrome): SortRenderingsOptions | undefined {
  if (
    !isRenderingChrome(chrome) ||
    !chrome.parentChrome ||
    !isPlaceholderChrome(chrome.parentChrome) ||
    !(chrome.parentChrome.childChromes.length > 0)
  ) {
    return undefined;
  }
  const renderings = chrome.parentChrome.childChromes;

  const currentPosition = renderings.findIndex((item) => item.chromeId === chrome.chromeId);

  if (currentPosition === -1) {
    return undefined;
  }

  return {
    up: {
      allowed: currentPosition > 0,
      onClick: () => chrome.sortMoveUp(),
      onEnterKey: () => chrome.sortMoveUp(),
    },
    down: {
      allowed: currentPosition < renderings.length - 1,
      onClick: () => chrome.sortMoveDown(),
      onEnterKey: () => chrome.sortMoveDown(),
    },
  };
}

export function findClosestParentRendering(chrome: Chrome): RenderingChrome | undefined {
  let parentChrome = chrome.parentChrome;
  while (parentChrome) {
    if (parentChrome instanceof RenderingChrome) {
      return parentChrome;
    } else {
      parentChrome = parentChrome?.parentChrome;
    }
  }
  return parentChrome;
}

export function isAbTestConfigured(renderingInstanceId: string): boolean {
  const abTestFlow = getAbTestFlow(renderingInstanceId);
  return !!(abTestFlow && abTestFlow.status !== 'COMPLETED');
}

export function isAbTestHasVariant(renderingInstanceId: string, variant: string | undefined) {
  if (!variant) {
    return false;
  }
  return getAbTestFlow(renderingInstanceId)?.variants.some((v) => v.tasks[0]?.input.template.includes(variant));
}

export function getAbTestFlow(renderingInstanceId: string): FlowDefinition | undefined {
  const flows = AbTestComponentService.getFlows();

  renderingInstanceId = normalizeId(renderingInstanceId);

  // First, try to find a flow with active status if there is one use that
  const activeFlow = flows.find((flow) => {
    return flow.friendlyId.includes(renderingInstanceId) && flow.status !== 'COMPLETED';
  });

  if (activeFlow) {
    return activeFlow;
  }

  return flows?.find((f) => f.friendlyId.includes(renderingInstanceId)) ?? undefined;
}

export function ensureFieldValueElementWrapped(fieldType: string, openChrome: MarkupChrome, closeChrome?: MarkupChrome) {
  fieldType = fieldType.toLowerCase();
  let valueElement = openChrome.element.nextElementSibling as HTMLElement;
  if (!valueElement || valueElement.nextElementSibling !== closeChrome?.element) {
    // some fields can be rendered without any wrapper as text node.
    // As canvas requires a real element to work with, get everything in between chromes and wrap it with span
    if (
      (fieldType === 'single-line text' ||
        fieldType === 'multi-line text' ||
        fieldType === 'datetime' ||
        fieldType === 'date' ||
        fieldType === 'integer' ||
        fieldType === 'number') &&
      closeChrome
    ) {
      valueElement = generateWrapper(openChrome, closeChrome);
    } else {
      valueElement = document.createElement('span');
      openChrome.element.after(valueElement);
    }
  }

  if (
    closeChrome &&
    fieldType === 'general link' &&
    !(valueElement instanceof HTMLAnchorElement || valueElement instanceof HTMLSpanElement)
  ) {
    // JSS might provide custom empty field html element
    // For example <JssLink ... emptyFieldEditingComponent={() => <h3>Enter value!</h3>}/>
    // Common events like hover and click should be assigned to wrapper around emptyFieldEditingComponent
    // Assigning events to wrapper allows replacing child elements while editing link
    valueElement = generateWrapper(openChrome, closeChrome);
  }

  return valueElement;
}

function generateWrapper(openChrome: MarkupChrome, closeChrome: MarkupChrome) {
  if (openChrome.element.parentNode !== closeChrome.element.parentNode) {
    throw new Error('The provided markup chromes are not siblings.');
  }

  let currentNode = openChrome.element.nextSibling;
  const span = document.createElement('span');

  while (currentNode && currentNode !== closeChrome.element) {
    const nextNode = currentNode.nextSibling;
    span.appendChild(currentNode);
    currentNode = nextNode;
  }

  closeChrome.element.parentNode?.insertBefore(span, closeChrome.element);

  return span;
}

function normalizeId(id: string) {
  return normalizeIdWithoutDash(id).replace('{', '').replace('}', '').toLowerCase();
}
