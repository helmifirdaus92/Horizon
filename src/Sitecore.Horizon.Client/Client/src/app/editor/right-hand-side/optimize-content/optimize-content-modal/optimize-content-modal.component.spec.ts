/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AssetsPipeModule } from 'app/shared/utils/assets.module';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { OptimizeContentModalComponent } from './optimize-content-modal.component';

describe(OptimizeContentModalComponent.name, () => {
  let sut: OptimizeContentModalComponent;
  let fixture: ComponentFixture<OptimizeContentModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, TranslateModule, TranslateServiceStubModule, AssetsPipeModule],
      declarations: [OptimizeContentModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptimizeContentModalComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });
});
