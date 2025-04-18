/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule, DialogCloseHandle, DialogModule, IconButtonModule } from '@sitecore/ng-spd-lib';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { OptimizationConfirmationDialogComponent } from './optimization-confirmation-dialog.component';

describe(OptimizationConfirmationDialogComponent.name, () => {
  let component: OptimizationConfirmationDialogComponent;
  let fixture: ComponentFixture<OptimizationConfirmationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OptimizationConfirmationDialogComponent],
      imports: [
        CommonModule,
        TranslateModule,
        DialogModule,
        IconButtonModule,
        ButtonModule,
        TranslateServiceStubModule,
      ],
      providers: [
        {
          provide: DialogCloseHandle,
          useValue: jasmine.createSpyObj<DialogCloseHandle>('DialogCloseHandle', ['close']),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptimizationConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
