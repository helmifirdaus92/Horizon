/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { AppReadyGlobalFlagName } from '../sdk/contracts/set-app.contract';
import './app.scss';
import { CanvasApi } from './canvas-api';
import { WindowDom } from './chrome/chrome-dom';
import { ChromeHighlighter } from './chrome/chrome-highlighter';
import { ChromeInlineEditorFactory } from './chrome/chrome-inline-editor-factory';
import { ChromeManager } from './chrome/chrome-manager';
import { ChromePersistSelection } from './chrome/chrome-persist-selection';
import { ChromeReader } from './chrome/chrome-reader';
import { InlineChromeParser } from './chrome/read/inline-chrome-parser';
import { ShallowChromeParser } from './chrome/read/shallow-chrome-parser';
import { DesigningDropTargetResolver } from './designing/designing-drop-target-resolver';
import { DesigningFrameManager } from './designing/designing-frame-manager';
import { DesigningManager } from './designing/designing-manager';
import { DesigningNativeEventsTranslator } from './designing/designing-native-events-translator';
import { ManipulateCanvasDomManager } from './designing/manipulate-canvas-dom.manager';
import { CachedRenderingDropZonesUtil } from './designing/rendering-drop-zones-util';
import { AbTestHighlightManager } from './frame/ab-test-highlight-manager';
import { FrameManager } from './frame/frame-manager';
import { PersonalizationLabelsManager } from './frame/personalization-labels-manager';
import { BeaconState } from './messaging/horizon-canvas.contract.parts';
import { MessagingService } from './messaging/messaging-service';
import { PageStateReader } from './page-state-reader';
import { AbTestComponentService } from './services/ab-test-component.service';
import { ConfigurationService } from './services/configuration.service';
import { EditingDataService } from './services/editing-data.service';
import { FeatureFlagsService } from './services/feature-flags.service';
import { TranslationService } from './services/translation.service';
import { Debouncer } from './utils/debouncer';
import { FeatureChecker } from './utils/feature-checker';
import { ConsoleLogger } from './utils/logger';
import { AddComponentWiring } from './wirings/add-component.wiring';
import { ChromeHighlightingFramesWiring } from './wirings/chrome-highlighting-frames.wiring';
import { ChromeResizingWiring } from './wirings/chrome-resizing.wiring';
import { ChromeSelectingIncomeMessagingWiring } from './wirings/chrome-selecting-incoming.messaging.wiring';
import { ChromeSelectingMessagingWiring } from './wirings/chrome-selecting.messaging.wiring';
import { DefaultLinkBehaviorWiring } from './wirings/default-link-behavior.wiring';
import { DesigningMessagingWiring } from './wirings/designing.messaging.wiring';
import { DesigningWiring } from './wirings/designing.wiring';
import { DisableChromeWiring } from './wirings/disable-chrome-wiring';
import { EditingChannelMessagingWiring } from './wirings/editing-channel.messaging.wiring';
import { EnsurePlaceholderIsShownWiring } from './wirings/ensure-placeholder-shown.wiring';
import { FlushFieldsBeforeUnloadMessagingWiring } from './wirings/flush-fields-before-unload.messaging.wiring';
import { InitChromeHighlighterWiring } from './wirings/init-chrome-highlighter.wiring';
import { InitialPageStateMessagingWiring } from './wirings/initial-page-state.messaging.wiring';
import { LayoutContainerStylesSettingWiring } from './wirings/layout-container-styles-setting.wiring';
import { ManipulateCanvasDomWiring } from './wirings/manipulate-canvas-dom.wiring';
import { OnLeaveWiring } from './wirings/on-leave.wiring';
import { PreserveSelectionContextWiring } from './wirings/preserve-selection-context.messaging.wiring';
import { RestoreContextWiring } from './wirings/restore-context.wiring';
import { RhsEditorCommunicationMessagingWiring } from './wirings/rhs-editor-communication.messaging.wiring';
import { SaveFieldChangesMessagingWiring } from './wirings/save-field-changes.messaging.wiring';
import { SaveShortcutWiring } from './wirings/save-shortcut.wiring';
import { ScModeCookieHandlingWiring } from './wirings/sc-mode-cookie-handling.wiring';
import { Wiring } from './wirings/wiring';

export interface ShutdownParams {
  saveSnapshotChromeId?: string;
  resetPrevSelection?: boolean;
}

/**
 * This class subscribes to several browser events and never disposes the subscriptions.
 * This is fine because subscriptions are expected to remain for the lifetime of the app.
 * But might cause issues and memory leaks if multiple instance of this class are needed.
 */
export class App {
  private static canvasApi = new CanvasApi();
  private static chromeRediscoveryRequested = false;
  private static appResetRequested = false;

  static createDefault(): App {
    const abortController = new AbortController();

    // Poor man's Dependency Injection - wire up it manually.
    const pageStateReader = new PageStateReader();
    const messagingService = MessagingService.connectToParentWindow(pageStateReader.getVerificationToken());

    const windowDom = new WindowDom();
    const editingDataService = new EditingDataService(messagingService, App.appResetRequested);
    const inlineChromeReader = new ChromeReader(
      new InlineChromeParser(new ChromeInlineEditorFactory(windowDom, ConsoleLogger), messagingService, abortController),
    );

    const shallowChromeReader = new ChromeReader(
      new ShallowChromeParser(
        new ChromeInlineEditorFactory(windowDom, ConsoleLogger),
        messagingService,
        abortController,
        editingDataService,
      ),
    );

    const chromeHighlighter = new ChromeHighlighter(windowDom, abortController);
    const chromeManager = new ChromeManager(inlineChromeReader, shallowChromeReader, windowDom);
    const chromePersistSelection = new ChromePersistSelection(chromeManager, pageStateReader, ConsoleLogger);

    const frameManager = new FrameManager(windowDom, abortController);
    const manipulateCanvasDomManager = new ManipulateCanvasDomManager(chromeManager, editingDataService);

    const designingNativeEventsTranslator = new DesigningNativeEventsTranslator(windowDom, abortController);
    const designingManager = new DesigningManager(new DesigningDropTargetResolver(new CachedRenderingDropZonesUtil()));
    const designingFrameManager = new DesigningFrameManager(windowDom, frameManager, abortController);

    const translationService = new TranslationService(messagingService);
    const featureFlagsService = new FeatureFlagsService(messagingService);
    const configurationService = new ConfigurationService(messagingService);

    const abTestComponentService = new AbTestComponentService(messagingService);
    const abTestHighlightManager = new AbTestHighlightManager(chromeManager, abortController);

    const personalizationLabelsManager = new PersonalizationLabelsManager(chromeManager, abortController);

    const initAppWirings: Wiring[] = [
      new DefaultLinkBehaviorWiring(),
      new AddComponentWiring(chromeManager, messagingService),
      new InitChromeHighlighterWiring(chromeHighlighter, chromeManager, windowDom),
      new ChromeHighlightingFramesWiring(
        chromeManager,
        chromeHighlighter,
        frameManager,
        personalizationLabelsManager,
        abTestHighlightManager,
      ),
      new ChromeResizingWiring(chromeManager, frameManager),
      new SaveShortcutWiring(chromeManager),
      new EnsurePlaceholderIsShownWiring(),
      new DesigningWiring(
        frameManager,
        chromeManager,
        designingNativeEventsTranslator,
        designingManager,
        designingFrameManager,
        chromeHighlighter,
        abortController,
      ),
      new LayoutContainerStylesSettingWiring(chromeManager, messagingService),
      // Messaging
      new SaveFieldChangesMessagingWiring(chromeManager, messagingService),
      new EditingChannelMessagingWiring(chromeManager, messagingService, chromeHighlighter, frameManager),
      new FlushFieldsBeforeUnloadMessagingWiring(chromeManager, messagingService),
      new ChromeSelectingIncomeMessagingWiring(chromeManager, frameManager, messagingService),
      new DisableChromeWiring(chromeManager, pageStateReader, messagingService, chromeHighlighter, abortController),
      new ChromeSelectingMessagingWiring(chromeHighlighter, messagingService),
      new RhsEditorCommunicationMessagingWiring(chromeManager, messagingService),
      new PreserveSelectionContextWiring(messagingService, chromePersistSelection, chromeHighlighter),
      new DesigningMessagingWiring(designingNativeEventsTranslator, designingManager, manipulateCanvasDomManager, messagingService),
      new ManipulateCanvasDomWiring(manipulateCanvasDomManager, messagingService),
      new ScModeCookieHandlingWiring(pageStateReader, messagingService),

      // Setup unload behavior only if we already loaded the app and sent the 'page:load' event.
      // Otherwise app could get unload event before the load.
      new OnLeaveWiring(chromeManager, messagingService),
    ];

    const notifyPageStateWirings: Wiring[] = [
      new InitialPageStateMessagingWiring(chromeManager, frameManager, pageStateReader, messagingService, App.appResetRequested),
      new RestoreContextWiring(chromePersistSelection),
    ];

    return new App(
      messagingService,
      pageStateReader,
      editingDataService,
      chromeManager,
      chromePersistSelection,
      frameManager,
      chromeHighlighter,
      initAppWirings,
      notifyPageStateWirings,
      abortController,
      translationService,
      featureFlagsService,
      configurationService,
      abTestComponentService,
    );
  }

  static async setupApp(): Promise<App> {
    App.watchChromeRediscoveryRequests();

    let app = await App.initNewApp();

    if (App.chromeRediscoveryRequested) {
      App.chromeRediscoveryRequested = false;

      app.shutdownApp();
      app = await App.initNewApp();
    }

    app.notifyPageState();
    app.initCanvasApis();

    window[AppReadyGlobalFlagName.name] = true;
    return app;
  }

  constructor(
    private readonly messagingService: MessagingService,
    private readonly pageStateReader: PageStateReader,
    private readonly editingDataService: EditingDataService,
    private readonly chromeManager: ChromeManager,
    private readonly chromePersistSelection: ChromePersistSelection,
    private readonly frameManager: FrameManager,
    private readonly chromeHighlighter: ChromeHighlighter,
    private readonly initAppWirings: readonly Wiring[],
    private readonly notifyPageStateWirings: readonly Wiring[],
    private readonly abortController: AbortController,
    private readonly translationService: TranslationService,
    private readonly featureFlagsService: FeatureFlagsService,
    private readonly configurationService: ConfigurationService,
    private readonly abTestComponentService: AbTestComponentService,
  ) {}

  private static async initNewApp(): Promise<App> {
    const app = App.createDefault();
    await app.init();
    return app;
  }

  private async notifyPageState() {
    for (const wiring of this.notifyPageStateWirings) {
      await Promise.resolve(wiring.wire(this.abortController));
    }
  }

  private static watchChromeRediscoveryRequests() {
    App.canvasApi.initChromesRediscoveryGlobalFunction(() => {
      this.chromeRediscoveryRequested = true;
    });
  }

  private async init() {
    const pageState = this.pageStateReader.getHorizonPageState();

    this.sendBeacon(pageState);

    await this.translationService.init();
    await this.featureFlagsService.init();
    await this.configurationService.init();
    await this.abTestComponentService.init(pageState.itemId, pageState.language);

    if (FeatureChecker.isShallowChromesEnabled()) {
      this.editingDataService.startLoadingEditingData(pageState);
    }

    await this.chromeManager.initChromes();

    // Init all the wirings once application is ready and chromes are parsed.
    for (const wiring of this.initAppWirings) {
      await Promise.resolve(wiring.wire(this.abortController));
    }
  }

  private shutdownApp(params?: ShutdownParams) {
    this.abortController.abort();
    this.chromeManager.fieldChromes.forEach((f) => f.flushChanges());

    if (params?.saveSnapshotChromeId) {
      this.chromePersistSelection.saveSnapshot(params?.saveSnapshotChromeId);
    }

    this.frameManager.deselect();

    if (params?.resetPrevSelection) {
      this.chromeHighlighter.resetAllHighlightings();
    }
  }

  private sendBeacon(beacon: BeaconState) {
    this.messagingService.postBeacon(beacon);
  }

  private initCanvasApis() {
    // EXTENSIONS DEMO
    const saveRenderingParams = (renderingInstanceId: string, params: string) => {
      this.messagingService.editingChannel.rpc.setRenderingParams(renderingInstanceId, params);
    };
    const debouncer = new Debouncer((value: { id: string; params: string }) => saveRenderingParams(value.id, value.params), 250);
    App.canvasApi.initSetRenderingParamsGlobalFunction((renderingInstanceId: string, params: string) => {
      debouncer.putValue({ id: renderingInstanceId, params }, true);
    });

    // PUBLIC CONTRACT
    App.canvasApi.initChromesRediscoveryGlobalFunction(async () => {
      this.shutdownApp({ saveSnapshotChromeId: this.chromeHighlighter.selectedChrome?.chromeId });
      await App.setupApp();
    });

    // INTERNAL PRIVATE CONTRACTS
    App.canvasApi.initShutdownAppGlobalFunction((params?: ShutdownParams) => this.shutdownApp(params));
    App.canvasApi.initSetupAppGlobalFunction(() => {
      App.appResetRequested = true;
      App.setupApp();
    });
  }
}
