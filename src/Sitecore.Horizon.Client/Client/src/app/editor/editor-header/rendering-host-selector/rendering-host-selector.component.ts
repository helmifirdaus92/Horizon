/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { pagesAnimations } from 'app/pages/pages.animations';
import { ContextService } from 'app/shared/client-state/context.service';
import { TimedNotification, TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { RenderingHostResolverService } from 'app/shared/rendering-host/rendering-host-resolver.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { firstValueFrom } from 'rxjs';

type RenderingHostType = 'default' | 'local';
interface RenderingHost {
  type: RenderingHostType;
  url: string;
}

@Component({
  selector: 'app-rendering-host-selector',
  templateUrl: './rendering-host-selector.component.html',
  styleUrls: ['./rendering-host-selector.component.scss'],
  animations: [pagesAnimations],
})
export class RenderingHostSelectorComponent implements OnDestroy, OnInit {
  private readonly lifetime = new Lifetime();
  private localHostNotificationId = 'local-rendering-host-used-notification-id';

  isLocalHostError = false;
  currentHost: RenderingHost;

  hostTypeDraft: RenderingHostType;
  localHostUrlDraft: string;

  constructor(
    private readonly contextService: ContextService,
    private readonly hostResolverService: RenderingHostResolverService,
    private readonly timedNotificationService: TimedNotificationsService,
    private readonly translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.hostResolverService.errorState$.pipe(takeWhileAlive(this.lifetime)).subscribe((isError) => {
      this.isLocalHostError = isError;
    });

    if (this.hostResolverService.isLocalRenderingHostSelected()) {
      this.showLocalHostNotification();
      this.currentHost = { type: 'local', url: this.hostResolverService.hostUrl ?? '' };
    } else {
      this.currentHost = { type: 'default', url: '' };
    }

    this.alignStateWithCurrentHost();
  }

  ngOnDestroy(): void {
    this.lifetime.dispose();
  }

  popoverIsActiveChange(isActive: boolean) {
    if (!isActive) {
      // setTimeout is used to avoid flickering while the popover is closing
      setTimeout(() => this.alignStateWithCurrentHost(), 100);
    }
  }

  save() {
    this.currentHost = {
      type: this.hostTypeDraft,
      url: this.hostTypeDraft === 'default' ? '' : this.localHostUrlDraft,
    };

    if (this.currentHost.type === 'default') {
      this.hostResolverService.removeLocalRenderingHost();
      this.hideLocalHostNotification();
    } else {
      this.hostResolverService.setLocalRenderingHost(this.currentHost.url);
      this.showLocalHostNotification();
    }

    this.contextService.updateContext({});
  }

  private async showLocalHostNotification() {
    const text = await firstValueFrom(this.translateService.get('RENDERING_HOST.NOTIFICATION.TEXT'));
    const buttonText = await firstValueFrom(this.translateService.get('RENDERING_HOST.NOTIFICATION.BUTTON_TEXT'));
    const notification = new TimedNotification(this.localHostNotificationId, text, 'info');
    notification.persistent = true;
    notification.closable = true;
    notification.action = {
      title: buttonText,
      run: () => {
        this.hostTypeDraft = 'default';
        this.save();
        this.alignStateWithCurrentHost();
      },
    };
    this.timedNotificationService.pushNotification(notification);
  }

  private hideLocalHostNotification() {
    this.timedNotificationService.hideNotificationById(this.localHostNotificationId);
  }

  private alignStateWithCurrentHost() {
    this.hostTypeDraft = this.currentHost.type;
    this.localHostUrlDraft = this.currentHost.type === 'default' ? '' : this.currentHost.url;
  }
}
