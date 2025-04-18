/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ApmHelperService } from 'app/apm/apm-helper.service';
import { XmCloudSessionManagerService } from 'app/authentication/xmCloudSessionManager.service';
import { PageTemplatesService } from 'app/page-design/page-templates.service';
import { Item } from 'app/page-design/page-templates.types';
import { LHSNavigationService } from 'app/pages/left-hand-side/lhs-navigation.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { ActiveDevice, DeviceService } from 'app/shared/client-state/device.service';
import { LayoutKind } from 'app/shared/graphql/item.interface';
import { EditingMessagingChannel } from 'app/shared/messaging/horizon-canvas.contract.defs';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { TimedNotification, TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { EMPTY, Observable, firstValueFrom } from 'rxjs';
import { LhsPanelStateService } from '../lhs-panel/lhs-panel.service';
import { VersionsUtilService } from '../right-hand-side/versions/versions-util.service';
import { VersionsWorkflowService } from '../shared/versions-workflow/versions-workflow.service';
import { EditorWorkspaceService } from './editor-workspace.service';

const IFRAME = Symbol();

@Component({
  selector: 'app-editor-workspace',
  templateUrl: './editor-workspace.component.html',
  styleUrls: ['./editor-workspace.component.scss'],
  host: {
    '[class.hide]': 'isLhsPanelExpanded',
  },
})
export class EditorWorkspaceComponent implements OnInit, OnDestroy {
  private readonly hrzCanvasScriptUrl: string = `${window.location.origin}/horizon/canvas/horizon.canvas.js`;

  static [IFRAME]: HTMLIFrameElement;
  static getIframe(): HTMLIFrameElement {
    return this[IFRAME];
  }
  static setIframe(iframe: HTMLIFrameElement): HTMLIFrameElement {
    return (this[IFRAME] = iframe);
  }

  device$: Observable<ActiveDevice> = EMPTY;
  @Input() iframeUrl$: Observable<{ url: string; isError: boolean }> = EMPTY;
  @Input() canvasLoading$: Observable<boolean> = EMPTY;

  iframeIsLoading = false;
  @ViewChild('iframeContainer', { static: true, read: ElementRef }) iframeContainer!: ElementRef;

  editorWidth$: Observable<number> = EMPTY;

  selectedPartialDesigns: Item[] = [];
  activeNavigation$: Observable<string> = EMPTY;
  isError = false;

  displayedShareLayoutWarning = false;

  observer: ResizeObserver = new ResizeObserver(() => {
    this.zone.run(() => {
      this.handleResize();
    });
  });

  isLhsPanelExpanded = false;

  private currentIFrame: HTMLIFrameElement | null = null;
  private preloadingIFrame: HTMLIFrameElement | null = null;
  private pageInCanvasLoadedHandler = (_event: any) => {};
  private orchestratorLoadedHandler = (_event: any) => {};

  private readonly editingChannel: EditingMessagingChannel;

  private lifetime = new Lifetime();

  constructor(
    private readonly messagingService: MessagingService,
    private readonly contextService: ContextService,
    private readonly timedNotificationsService: TimedNotificationsService,
    private readonly translateService: TranslateService,
    private readonly editorWorkspaceService: EditorWorkspaceService,
    private readonly elementRef: ElementRef,
    private readonly deviceService: DeviceService,
    private zone: NgZone,
    private readonly versionsWorkflowService: VersionsWorkflowService,
    private readonly versionsUtilService: VersionsUtilService,
    private readonly pageTemplatesService: PageTemplatesService,
    private readonly lhsNavService: LHSNavigationService,
    private readonly apmHelperService: ApmHelperService,
    private readonly xmCloudSessionManagerService: XmCloudSessionManagerService,
    private readonly lhsPanelStateService: LhsPanelStateService,
  ) {
    this.editingChannel = this.messagingService.getEditingCanvasChannel();

    this.hrzCanvasScriptUrl += `?v=${this.readAppHash()}`;
  }

  ngOnInit() {
    // for some scenarios it is required to show page start loading even before this.iframeUrl$ emits
    // for example when SXA component is dropped on the page - new datasource is being created, that takes 1-3 seconds
    // we need to show loading indicator during this time
    this.canvasLoading$
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe((isLoading) => (this.iframeIsLoading = isLoading));

    this.lhsPanelStateService.isExpanded$.pipe(takeWhileAlive(this.lifetime)).subscribe((val) => {
      this.isLhsPanelExpanded = val;
    });

    this.iframeUrl$.pipe(takeWhileAlive(this.lifetime)).subscribe(async ({ url, isError }) => {
      this.isError = isError;
      if (this.isError) {
        return;
      }

      this.iframeIsLoading = true;
      this.versionsUtilService.hideNoActiveVersionNotification();

      // We notify loading Start from here, but loading End should be triggered only from canvas-page.service
      this.editorWorkspaceService.setCanvasLoadState({ isLoading: true });
      await this.xmCloudSessionManagerService.waitForSession();

      this.apmHelperService.reportCanvasPageLoadStart(url);

      // Recreate iFrame for the purposes of keeping old page shown in the canvas while new page is loading
      // Avoid blank white canvas while new page is loading
      this.recreateIFrame(url);
    });

    this.device$ = this.deviceService.active$;
    this.editorWidth$ = this.deviceService.editorWidth$;

    this.observer.observe(this.elementRef.nativeElement);

    this.listenCanvasLoadEvents();
    this.pageTemplatesService
      .watchSelectedPartialDesignItems()
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe((selectedPartialDesigns) => {
        this.selectedPartialDesigns = selectedPartialDesigns;
      });
    this.activeNavigation$ = this.lhsNavService.watchRouteSegment();
  }

  ngOnDestroy() {
    this.versionsUtilService.hideNoActiveVersionNotification();
    this.observer.unobserve(this.elementRef.nativeElement);

    window.removeEventListener('message', this.pageInCanvasLoadedHandler);
    window.removeEventListener('message', this.orchestratorLoadedHandler);
  }

  private async recreateIFrame(url: string) {
    this.preloadingIFrame?.remove();

    this.preloadingIFrame = document.createElement('iframe');
    this.preloadingIFrame.classList.add('editor');
    this.preloadingIFrame.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-popups');

    // No needed for the normal flow.
    // Required for the cases when page loaded without Horizon Canvas orchestrator script
    this.preloadingIFrame.onload = () => this.iframeOnLoad();

    this.preloadingIFrame.src = url;
    this.iframeContainer.nativeElement.appendChild(this.preloadingIFrame);
  }

  private listenCanvasLoadEvents() {
    this.orchestratorLoadedHandler = (event: any) => {
      if (event.data === 'hrz-page-orchestrator-loaded') {
        // important to post to both iframes, because of non deterministic order of receiving this event
        // with regard to lifetime of the preloading/current iframes
        this.preloadingIFrame?.contentWindow?.postMessage({ hrzCanvasScriptUrl: this.hrzCanvasScriptUrl }, '*');
        this.currentIFrame?.contentWindow?.postMessage({ hrzCanvasScriptUrl: this.hrzCanvasScriptUrl }, '*');
      }
    };
    window.addEventListener('message', this.orchestratorLoadedHandler);

    this.pageInCanvasLoadedHandler = (event: any) => {
      if (event.source === this.preloadingIFrame?.contentWindow && event.data === 'hrz-page-DOMContentLoaded') {
        this.iframeOnLoad();
      }
    };
    window.addEventListener('message', this.pageInCanvasLoadedHandler);
  }

  private iframeOnLoad() {
    if (this.currentIFrame === this.preloadingIFrame || !this.preloadingIFrame) {
      return;
    }

    this.iframeIsLoading = false;

    // the preloading iframe is located behind the current iframe
    // to make it to appear faster, we first hide the current iframe and only then we delete it
    if (this.currentIFrame) {
      this.currentIFrame.style.display = 'none';
    }
    this.currentIFrame?.remove();

    this.currentIFrame = this.preloadingIFrame;
    this.preloadingIFrame = null;

    this.apmHelperService.reportCanvasPageLoadComplete();
    EditorWorkspaceComponent.setIframe(this.currentIFrame);

    this.showSharedLayoutEditingMessage();
    this.showNonExistingVersionNotification();
  }

  private handleResize() {
    this.deviceService.setEditorWidth(this.elementRef.nativeElement.offsetWidth);
  }

  private async showSharedLayoutEditingMessage() {
    const layoutKind = (await this.contextService.getItem()).layoutEditingKind;

    if (layoutKind && layoutKind === ('SHARED' as LayoutKind)) {
      const text = await firstValueFrom(this.translateService.get('WARNING.LAYOUT_EDITING_WARNING'));
      const notification = new TimedNotification('shared-layout-change-warning', text, 'info');
      notification.persistent = true;
      this.displayedShareLayoutWarning = true;
      this.timedNotificationsService.pushNotification(notification);
    } else if (this.displayedShareLayoutWarning) {
      this.timedNotificationsService.hideNotificationById('shared-layout-change-warning');
      this.displayedShareLayoutWarning = false;
    }
  }

  private async showNonExistingVersionNotification() {
    const activeVersion = await firstValueFrom(this.versionsWorkflowService.watchActiveVersion());

    this.versionsUtilService.handleTimedNotifications(activeVersion);
  }

  private readAppHash() {
    const mainScriptElement = document.querySelector('body>script[src^="main."][src$=".js"]') as HTMLScriptElement;
    const appJsHash = mainScriptElement?.src?.split('main.')[1]?.replace('.js', '');
    if (!appJsHash) {
      throw Error('Can not get application build hash');
    }
    return appJsHash;
  }

  deselectChrome() {
    this.editingChannel.rpc.deselectChrome();
  }
}
