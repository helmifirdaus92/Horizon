/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { inject, Injectable } from '@angular/core';
import { PageApiService } from 'app/shared/rest/page/page.api.service';
import {
  AddPageVersionRequest,
  DeletePageVersionRequest,
  SetPublishingSettingRequest,
  UpdatePageRequest,
} from 'app/shared/rest/page/page.types';
import { map, Observable } from 'rxjs';
import {
  AddItemVersionInput,
  AddItemVersionOutput,
  BaseVersionsDalService,
  DeleteItemVersionInput,
  DeleteItemVersionOutput,
  RenameItemVersionInput,
  RenameItemVersionOutput,
  SetPublishingSettingsInput,
  SetPublishingSettingsOutput,
} from '../versions.dal.service';

@Injectable()
export class VersionsDalRestService extends BaseVersionsDalService {
  private readonly pageApiService = inject(PageApiService);
  constructor() {
    super();
  }

  addItemVersion(addItemVersionInput: AddItemVersionInput): Observable<AddItemVersionOutput> {
    const requestBody: AddPageVersionRequest = {
      baseVersion: addItemVersionInput.baseVersionNumber,
      language: addItemVersionInput.language,
      versionName: addItemVersionInput.versionName,
    };

    return this.pageApiService.addPageVersion(addItemVersionInput.path, requestBody).pipe(
      map((result) => ({
        success: true,
        itemVersion: result,
      })),
    );
  }

  deleteItemVersion(deleteItemVersionInput: DeleteItemVersionInput): Observable<DeleteItemVersionOutput> {
    const requestBody: DeletePageVersionRequest = {
      language: deleteItemVersionInput.language,
      versionNumber: deleteItemVersionInput.versionNumber,
    };

    return this.pageApiService.deletePageVersion(deleteItemVersionInput.path, requestBody).pipe(
      map((result) => ({
        success: true,
        latestPublishableVersion: result,
      })),
    );
  }

  setPublishingSettings(
    setPublishingSettingsInput: SetPublishingSettingsInput,
  ): Observable<SetPublishingSettingsOutput> {
    const requestBody: SetPublishingSettingRequest = {
      language: setPublishingSettingsInput.language,
      site: setPublishingSettingsInput.siteName,
      isAvailableToPublish: setPublishingSettingsInput.isAvailableToPublish,
      validFromDate: setPublishingSettingsInput.validFromDate,
      validToDate: setPublishingSettingsInput.validToDate !== '' ? setPublishingSettingsInput.validToDate : undefined,
      versionNumber: setPublishingSettingsInput.versionNumber,
    };

    return this.pageApiService.setPublishingSettings(setPublishingSettingsInput.path, requestBody).pipe(
      map((result) => ({
        success: result,
      })),
    );
  }

  renameItemVersion(renameItemVersionInput: RenameItemVersionInput): Observable<RenameItemVersionOutput> {
    const requestBody: UpdatePageRequest = {
      language: renameItemVersionInput.language,
      versionNumber: renameItemVersionInput.versionNumber,
      fields: [{ name: '__Version Name', value: renameItemVersionInput.newName }],
    };

    return this.pageApiService.updatePage(renameItemVersionInput.path, requestBody).pipe(
      map(() => ({
        success: true,
      })),
    );
  }
}
