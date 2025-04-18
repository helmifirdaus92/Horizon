/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DialogCloseHandle } from '@sitecore/ng-spd-lib';
import { PersonalizationAPIService } from 'app/pages/left-hand-side/personalization/personalization-api/personalization.api.service';
import { BXComponentFlowDefinition } from 'app/pages/left-hand-side/personalization/personalization.types';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-create-experiment-dialog',
  templateUrl: './create-experiment-dialog.component.html',
  styleUrls: ['./create-experiment-dialog.component.scss'],
})
export class CreateExperimentDialogComponent implements AfterViewInit {
  @ViewChild('nameInput', { static: true, read: ElementRef }) inputEl?: ElementRef;

  experimentName = '';
  apiErrorMessage: string | null = null;
  isLoading = false;

  existingNamesPromise: Promise<string[]>;
  renderingInstanceId = '';
  renderingDisplayName = '';

  readonly onCreate = new EventEmitter<BXComponentFlowDefinition | null>();

  constructor(
    private readonly closeHandle: DialogCloseHandle,
    private readonly personalizationAPIService: PersonalizationAPIService,
    private readonly translateService: TranslateService,
  ) {}

  ngAfterViewInit() {
    this.inputEl?.nativeElement.focus();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      event.preventDefault();
      this.close();
    }
    this.apiErrorMessage = null;
  }

  close() {
    this.onCreate.complete();
    this.closeHandle.close();
  }

  async createExperiment() {
    this.isLoading = true;
    this.experimentName = this.experimentName.trim();
    const result = await this.personalizationAPIService.createComponentFlowDefinition(
      this.renderingInstanceId,
      this.experimentName,
      this.renderingDisplayName,
    );

    if (!result.apiIsBroken && !result.requestIsInvalid && result.data) {
      this.apiErrorMessage = null;
      this.onCreate.next(result.data);
      this.close();
      this.isLoading = false;
    } else if (result.httpStatus === 409) {
      this.isLoading = false;

      this.existingNamesPromise = this.existingNamesPromise.then((names) => {
        names.push(this.experimentName);
        return names;
      });
      this.apiErrorMessage = await firstValueFrom(
        this.translateService.get('COMPONENT_TESTING.CREATE_EXPERIMENT_DIALOG.NAME_ALREADY_EXISTS_ERROR'),
      );
    } else {
      this.apiErrorMessage = await firstValueFrom(
        this.translateService.get('COMPONENT_TESTING.CREATE_EXPERIMENT_DIALOG.CREATE_ERROR'),
      );
    }
  }
}
