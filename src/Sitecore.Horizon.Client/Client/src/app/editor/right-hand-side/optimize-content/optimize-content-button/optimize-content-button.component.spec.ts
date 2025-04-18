/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule, IconButtonModule, PopoverModule } from '@sitecore/ng-spd-lib';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { OptimizeContentButtonComponent } from './optimize-content-button.component';

describe(OptimizeContentButtonComponent.name, () => {
  let sut: OptimizeContentButtonComponent;
  let fixture: ComponentFixture<OptimizeContentButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OptimizeContentButtonComponent],
      imports: [
        CommonModule,
        TranslateModule,
        TranslateServiceStubModule,
        IconButtonModule,
        ButtonModule,
        PopoverModule,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptimizeContentButtonComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });
});
