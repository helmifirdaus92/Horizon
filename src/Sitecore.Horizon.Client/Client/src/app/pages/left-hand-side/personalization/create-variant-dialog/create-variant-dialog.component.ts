/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DialogCloseHandle } from '@sitecore/ng-spd-lib';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { HostingEnvironmentService } from 'app/shared/hosting-environment/hosting-environment.service';
import { environment } from 'environments/environment.dev';
import { BehaviorSubject, take } from 'rxjs';
import { PersonalizationAPIService } from '../personalization-api/personalization.api.service';
import { PersonalizationFlowDefinition } from '../personalization.types';
import { Steps } from '../stepper/stepper.component';
@Component({
  selector: 'app-create-variant-dialog',
  templateUrl: './create-variant-dialog.component.html',
  styleUrls: ['./create-variant-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateVariantDialogComponent implements OnInit {
  isConnectedMode = environment.personalizationIntegrationConnectedMode;
  variantName = '';
  audienceName = '';
  variantId = '';
  iframeIsLoading = false;

  flowDefinition: PersonalizationFlowDefinition | null = null;
  safeUrl: SafeResourceUrl | null = null;
  dialogSteps$ = new BehaviorSubject<Steps>(null);
  isValidName = true;

  readonly onCreate = new EventEmitter<{ id: string; name: string } | null>();

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly closeHandle: DialogCloseHandle,
    private readonly personalizationApiService: PersonalizationAPIService,
    private readonly hostingEnvironmentService: HostingEnvironmentService,
  ) {}

  ngOnInit(): void {
    this.setSafeUrl();
    this.toggleLoading(true);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  onIframeLoadEnd(_iframe: EventTarget | null) {
    if (!_iframe) {
      return;
    }

    const iframe = _iframe as HTMLIFrameElement;

    if (iframe.src) {
      this.toggleLoading(false);
    }
  }

  close() {
    this.dialogSteps$.pipe(take(1)).subscribe(async (step) => {
      if (step === 'createVariant') {
        // If the user closes the dialog without creating a variant, check if the flowDefinition is empty.
        // If empty, archive it so the user can create an A/B test later and hide personalize icon.
        // Note: Creating the first variant will unarchive the flowDefinition.
        if (this.flowDefinition?.traffic?.splits.length === 0) {
          await this.personalizationApiService.archiveFlowDefinition(this.flowDefinition);
        }

        this.onCreate.next(null);
        this.closeHandle.close();
      } else {
        this.onCreate.next({ id: this.variantId, name: this.variantName });
        this.closeHandle.close();
      }
    });
  }

  goToCreateAudienceStep(hasValidationErrors: boolean) {
    if (hasValidationErrors) {
      return;
    }

    this.dialogSteps$.next('createAudience');
    this.setSafeUrl();
  }

  private setSafeUrl(): void {
    if (!ConfigurationService.xmCloudTenant || !ConfigurationService.cdpTenant) {
      return;
    }
    const { id, organizationId } = ConfigurationService.xmCloudTenant;
    const { appUrl } = ConfigurationService.cdpTenant;

    const encodedVariantName = encodeURIComponent(`${this.variantName}?`);
    const url = `${appUrl}/#/embedded/${this.flowDefinition?.friendlyId}/${
      this.variantId
    }?pageVariantName=${encodedVariantName}&xmTenantId=${id}&organization=${organizationId}${this.hostingEnvironmentService.addEnvironmentInfo()}`;

    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private toggleLoading(val: boolean) {
    this.iframeIsLoading = val;
  }

  // This method is only meant to be called in disconnected mode
  async addVariantToLocalFlowDefinition() {
    this.personalizationApiService.addUpdateVariantToFlowDefinition({
      audienceName: this.audienceName,
      template: JSON.stringify({ variantId: this.variantId }),
      variantId: this.variantId,
      variantName: this.variantName,
      conditionGroups: [],
    });
    this.close();
  }
}
