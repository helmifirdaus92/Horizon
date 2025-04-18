/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { MessagingService } from './messaging.service';

@Injectable({ providedIn: 'root' })
export class TranslationMessagingService {
  constructor(
    private readonly messagingService: MessagingService,
    private readonly translateService: TranslateService,
  ) {}

  async init() {
    const channel = this.messagingService.getTranslationChannel();

    channel.setRpcServicesImpl({
      getTranslations: () => firstValueFrom(this.translateService.get('CANVAS_TRANSLATIONS')),
    });
  }
}
