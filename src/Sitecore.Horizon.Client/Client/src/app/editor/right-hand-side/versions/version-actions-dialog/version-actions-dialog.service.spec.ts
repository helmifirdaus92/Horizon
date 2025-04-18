/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { VersionDetails } from 'app/editor/shared/versions-workflow/versions-workflow.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { VersionActionsDialogService } from './version-actions-dialog.service';

describe(VersionActionsDialogService.name, () => {
  let sut: VersionActionsDialogService;
  let dialogOverlayServiceSpy: jasmine.SpyObj<DialogOverlayService>;

  const sampleVersion: VersionDetails = {
    versionNumber: 1,
    name: 'test-version',
    lastModifiedBy: 'user1',
    lastModifiedAt: '',
    validFrom: '',
    validTo: '',
    workflowState: '',
    isLatestPublishableVersion: false,
    isAvailableToPublish: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DialogOverlayService,
          useValue: jasmine.createSpyObj<DialogOverlayService>(['open']),
        },
      ],
    });
    dialogOverlayServiceSpy = TestBedInjectSpy(DialogOverlayService);
    sut = TestBed.inject(VersionActionsDialogService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should call open() of overlay service on `showCreateVersionDialog` call', () => {
    dialogOverlayServiceSpy.open.and.returnValue({ component: {} } as any);

    sut.showCreateVersionDialog();

    expect(dialogOverlayServiceSpy.open).toHaveBeenCalled();
  });

  it('should call open() of overlay service on `showRenameVersionDialog` call', () => {
    dialogOverlayServiceSpy.open.and.returnValue({ component: {} } as any);

    sut.showRenameVersionDialog(sampleVersion);

    expect(dialogOverlayServiceSpy.open).toHaveBeenCalled();
  });

  it('should call open() of overlay service on `showDuplicateVersionDialog` call', () => {
    dialogOverlayServiceSpy.open.and.returnValue({ component: {} } as any);

    sut.showDuplicateVersionDialog(sampleVersion);

    expect(dialogOverlayServiceSpy.open).toHaveBeenCalled();
  });

  it('should call open() of overlay service on `showPublishingSettingDialog` call', () => {
    dialogOverlayServiceSpy.open.and.returnValue({ component: {} } as any);

    sut.showPublishingSettingDialog(sampleVersion, '', '', true);

    expect(dialogOverlayServiceSpy.open).toHaveBeenCalled();
  });
});
