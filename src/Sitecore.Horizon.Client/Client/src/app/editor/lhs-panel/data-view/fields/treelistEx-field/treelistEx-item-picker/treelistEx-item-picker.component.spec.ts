/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseHandle, DialogModule } from '@sitecore/ng-spd-lib';
import { LhsPanelModule } from 'app/editor/lhs-panel/lhs-panel.module';
import { DatasourcePickerService } from 'app/shared/dialogs/datasource-picker/datasource-picker.service';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { TreelistExItemPickerComponent } from './treelistEx-item-picker.component';

describe(TreelistExItemPickerComponent.name, () => {
  let sut: TreelistExItemPickerComponent;
  let fixture: ComponentFixture<TreelistExItemPickerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, TranslateModule, TranslateServiceStubModule, LhsPanelModule, DialogModule],
      providers: [
        { provide: DialogCloseHandle, useValue: jasmine.createSpyObj<DialogCloseHandle>(['close']) },
        {
          provide: DatasourcePickerService,
          useValue: jasmine.createSpyObj<DatasourcePickerService>({
            fetchRawItemChildren: of([]),
          }),
        },
      ],
      declarations: [TreelistExItemPickerComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreelistExItemPickerComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });
});
