/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import Popper from 'popper.js';
import { Chrome } from '../chrome/chrome';
import { FieldChrome, isFieldChrome } from '../chrome/chrome.field';
import { isPlaceholderChrome } from '../chrome/chrome.placeholder';
import { isRenderingChrome } from '../chrome/chrome.rendering';
import { EventEmitter } from '../messaging/event-emitter';
import { ItemPermissions } from '../messaging/horizon-canvas.contract.parts';
import { AbTestComponentService } from '../services/ab-test-component.service';
import { ConfigurationService } from '../services/configuration.service';
import { TranslationService } from '../services/translation.service';
import { getSortRenderingsOptions, isAbTestConfigured } from '../utils/chrome';
import { FeatureChecker } from '../utils/feature-checker';
import { createChip } from '../utils/popper';
import { defaultItemPermissions } from './frame-manager';
import { HighlightFrame } from './highlight-frame';
import { PageElementOutlineComponent } from './page-element-outline.component';
import { getAbTestTooltipMessage } from './utils';

export class SelectFrame extends HighlightFrame {
  private readonly outline: PageElementOutlineComponent;
  private readonly popper: Popper;

  private readonly _onDragStart = new EventEmitter();
  readonly onDragStart = this._onDragStart.asSource();

  private readonly _onDragEnd = new EventEmitter();
  readonly onDragEnd = this._onDragEnd.asSource();

  private readonly _onDelete = new EventEmitter();
  readonly onDelete = this._onDelete.asSource();

  constructor(
    private readonly chrome: Chrome,
    private readonly abortController: AbortController,
    private readonly highlightType: 'select' | 'highlight' = 'highlight',
    isPersonalizationMode?: boolean,
    permission: ItemPermissions = defaultItemPermissions,
  ) {
    super(chrome);

    this.outline = new PageElementOutlineComponent(this.abortController, chrome, highlightType, !!isPersonalizationMode);
    this.outline.text = chrome.displayName;
    this.outline.state = 'focused';

    this.outline.onDragStart.on(() => this._onDragStart.emit());
    this.outline.onDragEnd.on(() => this._onDragEnd.emit());

    if (highlightType === 'select') {
      const parentChrome = chrome.parentChrome;
      if (parentChrome) {
        this.outline.enableEvents = true;
        this.outline.icon = {
          name: 'arrow-up-left',
          onClick: (ev) => {
            ev.stopPropagation();
            parentChrome.select();
          },
          keyboardEv: (ev) => {
            if (ev.key === 'Enter') {
              ev.stopPropagation();
              parentChrome.select();
            }
          },
        };
        if (!isPersonalizationMode && isRenderingChrome(chrome) && isPlaceholderChrome(parentChrome) && parentChrome.editable) {
          this.outline.delete = {
            name: 'delete-outline',
            onClick: (ev) => {
              ev.stopPropagation();
              this._onDelete.emit();
            },
            keyboardEv: (ev) => {
              const key = ev.key;
              if (key === 'Enter' || key === 'Backspace' || key === 'Delete') {
                ev.stopPropagation();
                this._onDelete.emit();
              }
            },
            isDisabled: !permission.canWrite,
          };
          if (permission.canWrite) {
            document.addEventListener('keydown', (ev: KeyboardEvent) => {
              if (ev.key === 'Delete' || ev.key === 'Backspace') {
                ev.stopPropagation();
                this._onDelete.emit();
              }
            });
          }
        }
      }

      const sortRenderingsOptions = getSortRenderingsOptions(chrome);
      if (sortRenderingsOptions && !isPersonalizationMode) {
        if (sortRenderingsOptions.up.allowed) {
          this.outline.sortMoveUp = {
            name: 'arrow-up',
            onClick: sortRenderingsOptions.up.onClick.bind(chrome),
            keyboardEv: sortRenderingsOptions.up.onEnterKey.bind(chrome),
            isDisabled: !permission.canWrite,
          };
        }

        if (sortRenderingsOptions.down.allowed) {
          this.outline.sortMoveDown = {
            name: 'arrow-down',
            onClick: sortRenderingsOptions.down.onClick.bind(chrome),
            keyboardEv: sortRenderingsOptions.down.onEnterKey.bind(chrome),
            isDisabled: !permission.canWrite,
          };
        }
      }

      if (isRenderingChrome(chrome)) {
        if (!FeatureChecker.isContentEditingEnabled()) {
          this.outline.openItemInExplorer = {
            name: 'open-outline',
            onClick: (ev) => {
              ev.stopPropagation();
              chrome.openItemInExplorer();
            },
            keyboardEv: (ev) => {
              const key = ev.key;
              if (key === 'Enter') {
                ev.stopPropagation();
                chrome.openItemInExplorer();
              }
            },
          };
        }

        const abTestComponentConfigureStatus = AbTestComponentService.getAbTestConfigStatus();
        if (
          !isPersonalizationMode &&
          FeatureChecker.isComponentTestingEnabled() &&
          !isAbTestConfigured(chrome.renderingInstanceId) &&
          abTestComponentConfigureStatus !== 'modeNotSupported'
        ) {
          const isAbTestReadyForConfiguration = abTestComponentConfigureStatus === 'readyForConfiguration' && permission.canWrite;
          this.outline.testComponent = {
            name: 'testComponent',
            onClick: (ev) => {
              if (isAbTestReadyForConfiguration) {
                ev.stopPropagation();
                chrome.promptCreateAbComponentTest();
              }
            },
            keyboardEv: (ev) => {
              if (isAbTestReadyForConfiguration) {
                const key = ev.key;
                if (key === 'Enter') {
                  ev.stopPropagation();
                  chrome.promptCreateAbComponentTest();
                }
              }
            },
            isDisabled: !isAbTestReadyForConfiguration || !permission.canWrite,
            tooltip: getAbTestTooltipMessage(abTestComponentConfigureStatus),
          };
        }

        // // Enable optimize content action
        if (FeatureChecker.isOptimizationEnabled()) {
          const hasEditableFields = chrome.childChromes.some(
            (c) =>
              isFieldChrome(c) && (c.fieldType === 'rich text' || c.fieldType === 'single-line text' || c.fieldType === 'multi-line text'),
          );

          this.outline.aiButtonIcon = {
            name: 'creation',
            onClick: (ev) => {
              if (permission.canWrite && hasEditableFields && ConfigurationService.streamTenantId) {
                ev.stopPropagation();
                chrome.openOptimizeContent();
              }
            },
            keyboardEv: (ev) => {
              if (permission.canWrite) {
                const key = ev.key;
                if (hasEditableFields && ConfigurationService.streamTenantId) {
                  if (key === 'Enter') {
                    ev.stopPropagation();
                    chrome.openOptimizeContent();
                  }
                }
              }
            },
            isDisabled: !ConfigurationService.streamTenantId || !permission.canWrite || !hasEditableFields,
            tooltip: this.getOptimizeContentTooltip(hasEditableFields),
          };
        }
      }

      // Use styling for selected chrome.
      this.frameElement.setAttribute('select', '');
    }

    this.frameElement.setAttribute(
      'ab-test-frame',
      isRenderingChrome(chrome) && isAbTestConfigured(chrome.renderingInstanceId) ? 'true' : 'false',
    );

    this.popper = createChip(this.frameElement, this.outline.containerElement, highlightType === 'select');
  }

  show(host: Element): void {
    super.show(host);
    const isRteField = (this.chrome as FieldChrome).fieldType === 'rich text';
    // If the current field is a rich text field, we display (on selection) the CKEditor toolbar instead of our chip
    if (!isRteField || (isRteField && this.highlightType !== 'select') || !FeatureChecker.isCkeditorEnabled()) {
      this.outline.attach(host);
      this.popper.update();
    }
  }

  hide(): void {
    super.hide();
    this.outline.detach();
  }

  updatePosAndSize(): void {
    super.updatePosAndSize();
    this.popper.update();
    if (
      this.frameElement.offsetTop < 40 &&
      this.outline.containerElement.offsetTop < 40 &&
      !this.outline.containerElement.classList.contains('at-top')
    ) {
      this.outline.containerElement.classList.add('at-top');
    }
  }

  private getOptimizeContentTooltip(hasEditableFields: boolean): string {
    if (!ConfigurationService.streamTenantId) {
      return TranslationService.get('STREAM_TENANT_NOT_CONFIGURED_MESSAGE');
    }

    if (!hasEditableFields) {
      return TranslationService.get('GENERATIVE_AI_BUTTON_DISABLE_TEXT');
    }

    return '';
  }
}
