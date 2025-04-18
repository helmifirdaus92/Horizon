/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { PageApiService } from 'app/shared/rest/page/page.api.service';
import { PageOperationResponse } from 'app/shared/rest/page/page.types';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { firstValueFrom, of } from 'rxjs';
import { VersionsDalRestService } from './versions.dal.rest.service';

describe(VersionsDalRestService.name, () => {
  let sut: VersionsDalRestService;
  let pageApiServiceSpy: jasmine.SpyObj<PageApiService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: PageApiService,
          useValue: jasmine.createSpyObj<PageApiService>({
            addPageVersion: undefined,
            updatePage: undefined,
            setPublishingSettings: undefined,
            deletePageVersion: undefined,
          }),
        },
        VersionsDalRestService,
      ],
    });

    sut = TestBed.inject(VersionsDalRestService);
    pageApiServiceSpy = TestBedInjectSpy(PageApiService);
  });

  it('should be defined', () => {
    expect(sut).toBeTruthy();
  });

  it('should add item version', async () => {
    // Arrange
    const addItemVersionInput = {
      path: 'mockPath',
      baseVersionNumber: 1,
      versionName: 'Mock Version',
      language: 'en',
      siteName: 'example-site',
    };
    pageApiServiceSpy.addPageVersion.and.returnValue(of(1));

    // Act
    const response = await firstValueFrom(sut.addItemVersion(addItemVersionInput));

    // Assert
    expect(response.success).toBeTrue();
    expect(pageApiServiceSpy.addPageVersion).toHaveBeenCalledWith(
      addItemVersionInput.path,
      jasmine.objectContaining({
        baseVersion: addItemVersionInput.baseVersionNumber,
        language: addItemVersionInput.language,
        versionName: addItemVersionInput.versionName,
      }),
    );
  });

  it('should delete item version', async () => {
    // Arrange
    const deleteItemVersionInput = {
      path: 'mockPath',
      versionNumber: 1,
      language: 'en',
      siteName: 'example-site',
    };
    pageApiServiceSpy.deletePageVersion.and.returnValue(of(1));

    // Act
    const response = await firstValueFrom(sut.deleteItemVersion(deleteItemVersionInput));

    // Assert
    expect(response.success).toBeTrue();
    expect(pageApiServiceSpy.deletePageVersion).toHaveBeenCalledWith(
      deleteItemVersionInput.path,
      jasmine.objectContaining({
        language: deleteItemVersionInput.language,
        versionNumber: deleteItemVersionInput.versionNumber,
      }),
    );
  });

  it('should set publishing settings', async () => {
    // Arrange
    const setPublishingSettingsInput = {
      path: 'mockPath',
      versionNumber: 1,
      validFromDate: '2024-05-20',
      validToDate: '2024-06-20',
      language: 'en',
      siteName: 'example-site',
      isAvailableToPublish: true,
    };
    pageApiServiceSpy.setPublishingSettings.and.returnValue(of(true));

    // Act
    const response = await firstValueFrom(sut.setPublishingSettings(setPublishingSettingsInput));

    // Assert
    expect(response.success).toBeTrue();
    expect(pageApiServiceSpy.setPublishingSettings).toHaveBeenCalledWith(
      setPublishingSettingsInput.path,
      jasmine.objectContaining({
        language: setPublishingSettingsInput.language,
        site: setPublishingSettingsInput.siteName,
        isAvailableToPublish: setPublishingSettingsInput.isAvailableToPublish,
        validFromDate: setPublishingSettingsInput.validFromDate,
        validToDate: setPublishingSettingsInput.validToDate,
      }),
    );
  });

  it('should rename item version', async () => {
    // Arrange
    const renameItemVersionInput = {
      path: 'mockPath',
      versionNumber: 1,
      newName: 'New Name',
      language: 'en',
      siteName: 'example-site',
    };

    const pageOperationResponse: PageOperationResponse = {
      pageId: 'page-1',
      path: 'path',
      name: 'New Name',
      displayName: 'display Name',
    };
    pageApiServiceSpy.updatePage.and.returnValue(of(pageOperationResponse));

    // Act
    const response = await firstValueFrom(sut.renameItemVersion(renameItemVersionInput));

    // Assert
    expect(response.success).toBeTrue();
    expect(pageApiServiceSpy.updatePage).toHaveBeenCalledWith(
      renameItemVersionInput.path,
      jasmine.objectContaining({
        language: renameItemVersionInput.language,
        versionNumber: renameItemVersionInput.versionNumber,
        fields: [{ name: '__Version Name', value: renameItemVersionInput.newName }],
      }),
    );
  });
});
