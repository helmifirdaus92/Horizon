/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PopoverModule } from '@sitecore/ng-spd-lib';
import { ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { LocalDevelopmentSettingsComponent } from './local-dev-settings.component';

describe(LocalDevelopmentSettingsComponent.name, () => {
  let sut: LocalDevelopmentSettingsComponent;
  let fixture: ComponentFixture<LocalDevelopmentSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopoverModule, TranslateModule, TranslateServiceStubModule, ContextServiceTestingModule],
      declarations: [LocalDevelopmentSettingsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalDevelopmentSettingsComponent);

    sut = fixture.componentInstance;
    sut.isProductionMode = false;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should not produce content in Prod mode', () => {
    sut.isProductionMode = true;
    fixture.detectChanges();

    expect(fixture.debugElement.nativeElement.innerHTML.toString().replace(/\n/g, '').replace(/ /g, '')).toBe(
      '<!--bindings={"ng-reflect-ng-if":"false"}-->',
    );
  });
});
