/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { EmailLinkComponent } from './email-link.component';

describe(EmailLinkComponent.name, () => {
  let sut: EmailLinkComponent;
  let fixture: ComponentFixture<EmailLinkComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [EmailLinkComponent, TranslateModule, TranslateServiceStubModule],
      declarations: [],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailLinkComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });
});
