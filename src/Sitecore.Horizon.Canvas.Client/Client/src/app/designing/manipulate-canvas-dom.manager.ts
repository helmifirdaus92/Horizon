/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { SetupAppGlobalFunctionName, ShutdownAppGlobalFunctionName } from '../../sdk/contracts/set-app.contract';
import { ChromeManager } from '../chrome/chrome-manager';
import { PlaceholderChromeNode, RenderingChromeNode } from '../chrome/chrome-node';
import { ChromeReader } from '../chrome/chrome-reader';
import { isPlaceholderChrome, PlaceholderChrome } from '../chrome/chrome.placeholder';
import { isRenderingChrome, RenderingChrome } from '../chrome/chrome.rendering';
import { PlaceholderChromeData } from '../chrome/read/chrome-data-types';
import { RenderingPlacementAnchor } from '../messaging/horizon-canvas.contract.parts';
import { EditingDataService } from '../services/editing-data.service';
import { FeatureChecker } from '../utils/feature-checker';
import { PlacementAnchorPosition } from '../utils/placement-anchor';

export class ManipulateCanvasDomManager {
  constructor(
    private readonly chromeManager: ChromeManager,
    private readonly editingDataService: EditingDataService,
  ) {}

  async insertRendering(
    renderingInstanceId: string,
    renderingHtml: string,
    placeholderKey: string,
    placement: RenderingPlacementAnchor | undefined,
  ) {
    const template = document.createElement('template');
    template.innerHTML = renderingHtml;

    const html = template.content;
    template.remove();

    const renderingChromeId = ChromeReader.buildChromeId(renderingInstanceId, 'rendering');
    window[ShutdownAppGlobalFunctionName.name]({ saveSnapshotChromeId: renderingChromeId });

    if (placement?.targetInstanceId && placement.position) {
      // Drop next to another rendering
      const targetChromeRendering = this.chromeManager.getByChromeId(ChromeReader.buildChromeId(placement.targetInstanceId, 'rendering'));

      if (!targetChromeRendering || !isRenderingChrome(targetChromeRendering)) {
        throw Error(`Cannot find rendering ${placement.targetInstanceId} or it is not Rendering type.`);
      }

      if (placement.position === 'after') {
        targetChromeRendering.endElement.after(html);
      } else {
        targetChromeRendering.startElement.before(html);
      }
    } else {
      // Drop into empty placeholder
      const targetPlaceholder = this.chromeManager.getByChromeId(ChromeReader.buildChromeId(placeholderKey, 'placeholder'));

      if (!targetPlaceholder || !isPlaceholderChrome(targetPlaceholder)) {
        throw Error(`Cannot find placeholder ${placeholderKey} or it is not placeholder type.`);
      }

      new PlaceholderChromeNode(targetPlaceholder).clearInnerHtml();
      targetPlaceholder.startElement.after(html);
    }

    window[SetupAppGlobalFunctionName.name]();
  }

  updateRendering(renderingInstanceId: string, renderingHtml: string) {
    const chromeToUpdate = this.chromeManager.getByChromeId(ChromeReader.buildChromeId(renderingInstanceId, 'rendering'));

    if (!chromeToUpdate || !isRenderingChrome(chromeToUpdate)) {
      throw Error(`Cannot find rendering ${renderingInstanceId} or it is not Rendering type.`);
    }

    const template = document.createElement('template');
    template.innerHTML = renderingHtml;

    const html = template.content;
    template.remove();

    const renderingChromeId = ChromeReader.buildChromeId(renderingInstanceId, 'rendering');
    window[ShutdownAppGlobalFunctionName.name]({ saveSnapshotChromeId: renderingChromeId });

    chromeToUpdate.startElement.before(html);
    new RenderingChromeNode(chromeToUpdate).remove();

    window[SetupAppGlobalFunctionName.name]();
  }

  removeRendering(renderingInstanceId: string) {
    const chromeToRemove = this.chromeManager.getByChromeId(ChromeReader.buildChromeId(renderingInstanceId, 'rendering'));

    if (!chromeToRemove || !isRenderingChrome(chromeToRemove)) {
      throw Error(`Cannot find rendering ${renderingInstanceId} or it is not Rendering type.`);
    }

    new RenderingChromeNode(chromeToRemove).remove();

    window[ShutdownAppGlobalFunctionName.name]({ resetPrevSelection: true });
    window[SetupAppGlobalFunctionName.name]();
  }

  moveRenderingInSamePlaceholder(renderingInstanceId: string, direction: 'up' | 'down') {
    const renderingChromeId = ChromeReader.buildChromeId(renderingInstanceId, 'rendering');
    const parentPlaceholder = this.chromeManager.getByChromeId(renderingChromeId)?.parentChrome;

    if (!parentPlaceholder || !isPlaceholderChrome(parentPlaceholder)) {
      return;
    }

    const renderingsInSamePlaceholder = this.chromeManager.chromes.filter(
      (item) => isRenderingChrome(item) && item.parentChrome && item.parentChrome.chromeId === parentPlaceholder.chromeId,
    ) as RenderingChrome[];
    const renderingToMove = renderingsInSamePlaceholder.find((item) => item.chromeId === renderingChromeId);

    if (renderingsInSamePlaceholder.length < 1 || !renderingToMove || !isRenderingChrome(renderingToMove)) {
      return;
    }

    // shutdown Canvas script before canvas manipulations for smoother highlighting
    window[ShutdownAppGlobalFunctionName.name]({ saveSnapshotChromeId: renderingChromeId });

    const targetChromeIndex = renderingsInSamePlaceholder.indexOf(renderingToMove);
    if (direction === 'up') {
      const siblingChrome = renderingsInSamePlaceholder[targetChromeIndex - 1];
      const siblingChromeNode = new RenderingChromeNode(siblingChrome);

      siblingChromeNode.remove();
      renderingToMove.endElement.after(siblingChromeNode.getHTMLString());
    } else {
      const siblingChrome = renderingsInSamePlaceholder[targetChromeIndex + 1];
      const siblingChromeNode = new RenderingChromeNode(siblingChrome);

      siblingChromeNode.remove();
      renderingToMove.startElement.before(siblingChromeNode.getHTMLString());
    }

    window[SetupAppGlobalFunctionName.name]();
  }

  async moveRendering(
    movedRendering: RenderingChrome,
    placeholder: PlaceholderChrome,
    targetRendering?: RenderingChrome,
    position?: PlacementAnchorPosition,
  ): Promise<void> {
    const movedChrome = new RenderingChromeNode(movedRendering);

    const movedChromeHtml = FeatureChecker.isShallowChromesEnabled()
      ? await this.rewriteNestedShallowPlaceholderKeys(
          movedChrome.getHTMLString(),
          placeholder.placeholderKey,
          movedRendering.getChromeInfo().parentPlaceholderChromeInfo.placeholderKey,
        )
      : this.rewriteNestedPlaceholderKeys(
          movedChrome.getHTMLString(),
          placeholder.placeholderKey,
          movedRendering.getChromeInfo().parentPlaceholderChromeInfo.placeholderKey,
        );

    const renderingChromeId = ChromeReader.buildChromeId(movedRendering.renderingInstanceId, 'rendering');
    window[ShutdownAppGlobalFunctionName.name]({ saveSnapshotChromeId: renderingChromeId });
    if (targetRendering && position) {
      // Drop next to another rendering
      if (position === 'after') {
        targetRendering.endElement.after(movedChromeHtml);
      } else {
        targetRendering.startElement.before(movedChromeHtml);
      }
    } else {
      // Drop into empty placeholder
      new PlaceholderChromeNode(placeholder).clearInnerHtml();
      placeholder.startElement.after(movedChromeHtml);
    }

    movedChrome.remove();

    window[SetupAppGlobalFunctionName.name]();
  }

  private rewriteNestedPlaceholderKeys(renderingHtml: DocumentFragment, parentRenderingNewKey: string, parentRenderingOriginalKey: string) {
    const nestedPlaceholders = renderingHtml.querySelectorAll(`code[chromeType='placeholder'][kind='open'][key]`);
    nestedPlaceholders.forEach((placeholderOpenHtmlElement) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, ,
      const originalPhKey = placeholderOpenHtmlElement.getAttribute('key')!;
      let newPhKey = originalPhKey.replace(parentRenderingOriginalKey, parentRenderingNewKey);
      // ph key that consist of at least 2 parts should start with slash
      // ph key on root level doesn't start with slash
      // there are scenarios of moving rendering from root level ph to nested ph or wise versa
      // replacing ph in code line above may result in double slashes or absence of slash in the beginning of the ph key
      newPhKey = newPhKey.replace('//', '/');
      newPhKey = newPhKey.startsWith('/') ? newPhKey : `/${newPhKey}`;

      placeholderOpenHtmlElement.setAttribute('key', newPhKey);

      const chromeData = JSON.parse(placeholderOpenHtmlElement.innerHTML) as PlaceholderChromeData;
      const chromeDataPlaceholderKey = chromeData.custom.placeholderKey;
      if (chromeDataPlaceholderKey) {
        chromeData.custom.placeholderKey = chromeDataPlaceholderKey.replace(originalPhKey, newPhKey);
      }
      const chromeDataPlaceholderMetadataKeys = chromeData.custom.placeholderMetadataKeys;
      for (let index = 0; index < chromeDataPlaceholderMetadataKeys.length; index++) {
        chromeDataPlaceholderMetadataKeys[index] = chromeDataPlaceholderMetadataKeys[index].replace(originalPhKey, newPhKey);
      }
      placeholderOpenHtmlElement.innerHTML = JSON.stringify(chromeData);
    });

    return renderingHtml;
  }

  private async rewriteNestedShallowPlaceholderKeys(
    renderingHtml: DocumentFragment,
    parentRenderingNewKey: string,
    parentRenderingOriginalKey: string,
  ) {
    const editingData = await this.editingDataService.getEditingData();
    const newEditingData = {
      ...editingData,
      placeholderd: editingData.placeholders.map((ph) => {
        // Rewrite only children of {parentRenderingOriginalKey} placeholder
        if (
          !ph.chromeData.custom.placeholderKey ||
          ph.chromeData.custom.placeholderKey === parentRenderingOriginalKey ||
          !ph.chromeData.custom.placeholderKey.startsWith(parentRenderingOriginalKey)
        ) {
          return ph;
        }

        const originalPhKey = ph.chromeData.custom.placeholderKey;
        let newPhKey = originalPhKey.replace(parentRenderingOriginalKey, parentRenderingNewKey);
        // ph key that consist of at least 2 parts should start with slash
        // ph key on root level doesn't start with slash
        // there are scenarios of moving rendering from root level ph to nested ph or wise versa
        // replacing ph in code line above may result in double slashes or absence of slash in the beginning of the ph key
        newPhKey = newPhKey.replace('//', '/');
        newPhKey = newPhKey.startsWith('/') ? newPhKey : `/${newPhKey}`;

        ph.chromeData.custom.placeholderKey = newPhKey;

        const chromeDataPlaceholderMetadataKeys = ph.chromeData.custom.placeholderMetadataKeys;
        for (let index = 0; index < chromeDataPlaceholderMetadataKeys.length; index++) {
          chromeDataPlaceholderMetadataKeys[index] = chromeDataPlaceholderMetadataKeys[index].replace(
            parentRenderingOriginalKey,
            parentRenderingNewKey,
          );
        }

        return ph;
      }),
    };
    this.editingDataService.patchEditingData(newEditingData);

    return renderingHtml;
  }
}
