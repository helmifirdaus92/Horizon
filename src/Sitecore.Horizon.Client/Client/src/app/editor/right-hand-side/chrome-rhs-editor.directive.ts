/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

// eslint-disable-next-line max-classes-per-file
import { Directive, DoCheck, EmbeddedViewRef, Host, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { ChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { ChromeSelection } from '../shared/canvas.services';
import { RhsEditorMessaging, RhsEditorMessagingReconnectable } from './rhs-editor-messaging';

type RhsEditorDisplayStateChange =
  | { display: false }
  | { display: true; reuse: boolean; chromeSelection: ChromeSelection };

@Directive({ selector: '[appChromeRhsEditorSwitch]' })
export class ChromeRhsEditorSwitchDirective {
  @Input('appChromeRhsEditorSwitch') chromeSelection?: ChromeSelection;
}

@Directive()
abstract class ChromeRhsEditorCaseBaseDirective implements DoCheck {
  private state?: {
    chrome: ChromeInfo;
    messaging: RhsEditorMessagingReconnectable;
  };

  private renderViewRef: EmbeddedViewRef<{ chrome: ChromeInfo; messaging: RhsEditorMessaging }>;

  constructor(
    private readonly viewContainer: ViewContainerRef,
    private readonly templateRef: TemplateRef<{
      chrome: ChromeInfo;
      messaging: RhsEditorMessaging;
    }>,
    private readonly editorSwitch: ChromeRhsEditorSwitchDirective,
  ) {}

  ngDoCheck(): void {
    const chromeSelection = this.editorSwitch.chromeSelection;
    if (this.state?.chrome === chromeSelection?.chrome) {
      return;
    }

    let displayState: RhsEditorDisplayStateChange;
    if (!chromeSelection || !this.isCompatibleChrome(chromeSelection.chrome)) {
      displayState = { display: false };
    } else {
      const reuse = this.state?.chrome.chromeId === chromeSelection.chrome.chromeId;
      displayState = { display: true, reuse, chromeSelection };
    }

    this.enforceState(displayState);
  }

  protected abstract isCompatibleChrome(chrome: ChromeInfo): boolean;

  private enforceState(state: RhsEditorDisplayStateChange): void {
    if (!state.display && this.state) {
      this.destroy();
      return;
    }

    if (state.display && !this.state) {
      this.create(state.chromeSelection);
      return;
    }

    if (state.display && !!this.state && !state.reuse) {
      this.destroy();
      this.create(state.chromeSelection);
      return;
    }

    if (state.display && !!this.state) {
      this.state.messaging.reconnect();
      this.state.chrome = state.chromeSelection.chrome;

      this.renderViewRef.context.chrome = this.state.chrome;
    }
  }

  private create(chromeSelection: ChromeSelection): void {
    this.state = {
      chrome: chromeSelection.chrome,
      messaging: chromeSelection.messaging,
    };

    this.renderViewRef = this.viewContainer.createEmbeddedView(this.templateRef, {
      chrome: this.state.chrome,
      messaging: this.state.messaging,
    });

    this.state.messaging.reconnect();
  }

  private destroy(): void {
    const messaging = this.state?.messaging;

    this.state = undefined;
    this.viewContainer.clear();
    messaging?.destroy();
  }
}

@Directive({ selector: '[appChromeRhsEditorCase]' })
export class ChromeRhsEditorCaseDirective extends ChromeRhsEditorCaseBaseDirective implements DoCheck {
  @Input('appChromeRhsEditorCase') chromeType = '';

  constructor(
    viewContainer: ViewContainerRef,
    templateRef: TemplateRef<{ chrome: ChromeInfo; messaging: RhsEditorMessaging }>,
    @Host() editorSwitch: ChromeRhsEditorSwitchDirective,
  ) {
    super(viewContainer, templateRef, editorSwitch);
  }

  override ngDoCheck() {
    // Should be declared in this type, otherwise Angular will not call it.
    super.ngDoCheck();
  }

  protected isCompatibleChrome(chrome: ChromeInfo): boolean {
    return chrome.chromeType === this.chromeType;
  }
}

@Directive({ selector: '[appChromeRhsFieldEditorCase]' })
export class ChromeRhsFieldEditorCaseDirective extends ChromeRhsEditorCaseBaseDirective implements DoCheck {
  @Input('appChromeRhsFieldEditorCase') fieldType = '';

  constructor(
    viewContainer: ViewContainerRef,
    templateRef: TemplateRef<{ chrome: ChromeInfo; messaging: RhsEditorMessaging }>,
    @Host() editorSwitch: ChromeRhsEditorSwitchDirective,
  ) {
    super(viewContainer, templateRef, editorSwitch);
  }

  override ngDoCheck() {
    // Should be declared in this type, otherwise Angular will not call it.
    super.ngDoCheck();
  }

  protected isCompatibleChrome(chrome: ChromeInfo): boolean {
    return chrome.chromeType === 'field' && chrome.fieldType === this.fieldType;
  }
}
