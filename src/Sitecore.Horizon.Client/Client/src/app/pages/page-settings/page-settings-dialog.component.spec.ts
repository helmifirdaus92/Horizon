/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseHandle, DialogOverlayService, LoadingIndicatorModule } from '@sitecore/ng-spd-lib';
import { EditorWorkspaceService } from 'app/editor/editor-workspace/editor-workspace.service';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { RecreateOnChangeModule } from 'app/shared/utils/recreate-on-change/recreate-on-change.module';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { PageSettingsDialogComponent } from './page-settings-dialog.component';

@Component({
  selector: `<app-page-details></app-page-details>`,
})
class PageDetailsStubComponent {}

describe(PageSettingsDialogComponent.name, () => {
  let sut: PageSettingsDialogComponent;
  let fixture: ComponentFixture<PageSettingsDialogComponent>;
  let closeHandleSpy: jasmine.SpyObj<DialogCloseHandle>;
  let dialogOverlayServiceSpy: jasmine.SpyObj<DialogOverlayService>;
  let featureFlagsServiceSpy: jasmine.SpyObj<FeatureFlagsService>;
  let editorWorkSpaceServiceSpy: jasmine.SpyObj<EditorWorkspaceService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        TranslateModule,
        TranslateServiceStubModule,
        LoadingIndicatorModule,
        ContextServiceTestingModule,
        RecreateOnChangeModule,
      ],
      declarations: [PageSettingsDialogComponent, PageDetailsStubComponent],
      providers: [
        {
          provide: DialogCloseHandle,
          useValue: jasmine.createSpyObj<DialogCloseHandle>('DialogCloseHandle', ['close']),
        },
        {
          provide: DialogOverlayService,
          useValue: jasmine.createSpyObj<DialogOverlayService>(['open']),
        },
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>('FeatureFlagsService', ['isFeatureEnabled']),
        },
        {
          provide: EditorWorkspaceService,
          useValue: jasmine.createSpyObj<EditorWorkspaceService>('EditorWorkspaceService', ['watchCanvasLoadState']),
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    TestBed.inject(ContextServiceTesting).provideDefaultTestContext();

    dialogOverlayServiceSpy = TestBedInjectSpy(DialogOverlayService);

    featureFlagsServiceSpy = TestBedInjectSpy(FeatureFlagsService);

    closeHandleSpy = TestBedInjectSpy(DialogCloseHandle);
    editorWorkSpaceServiceSpy = TestBedInjectSpy(EditorWorkspaceService);
    editorWorkSpaceServiceSpy.watchCanvasLoadState.and.returnValue(
      of({ isLoading: true, itemId: 'testId', language: 'en' }),
    );

    fixture = TestBed.createComponent(PageSettingsDialogComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('pages_show-templates-design-updates featureflag', () => {
    it(`should show PageDesign and InsertOptions when pages_show-templates-design-updates featureflag is enabled`, () => {
      featureFlagsServiceSpy.isFeatureEnabled.and.returnValue(true);
      sut.ngOnInit();
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('app-page-design'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('app-page-insert-options'))).toBeTruthy();
    });

    it(`should not show PageDesign and InsertOptions when pages_show-templates-design-updates featureflag is not enabled`, () => {
      expect(fixture.debugElement.query(By.css('app-page-design'))).toBeFalsy();
      expect(fixture.debugElement.query(By.css('app-page-insert-options'))).toBeFalsy();
    });
  });
});
