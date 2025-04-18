/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';
import { mockComponentFlowDefinition } from 'app/editor/right-hand-side/test-component/ab-test-component.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { PageAbTestConfigurationComponent } from './page-ab-test-configuration.component';

describe(PageAbTestConfigurationComponent.name, () => {
  let sut: PageAbTestConfigurationComponent;
  let fixture: ComponentFixture<PageAbTestConfigurationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule, TranslateServiceStubModule],
      declarations: [PageAbTestConfigurationComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageAbTestConfigurationComponent);
    sut = fixture.componentInstance;
    sut.pageAbTest = { ...mockComponentFlowDefinition, isPagePublished: true };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });
});
