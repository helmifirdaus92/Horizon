/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IconButtonModule, PopoverModule } from '@sitecore/ng-spd-lib';
import { ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { RichTextFieldComponent } from './rich-text-field.component';

describe(RichTextFieldComponent.name, () => {
  let component: RichTextFieldComponent;
  let fixture: ComponentFixture<RichTextFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        PopoverModule,
        TranslateModule,
        TranslateServiceStubModule,
        IconButtonModule,
        ContextServiceTestingModule,
      ],
      declarations: [RichTextFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RichTextFieldComponent);
    component = fixture.componentInstance;
    component.field = { value: 'value001' } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
