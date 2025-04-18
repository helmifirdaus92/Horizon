/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AssetsPipeModule } from 'app/shared/utils/assets.module';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { WorkspaceErrorComponent } from './workspace-error.component';

describe(WorkspaceErrorComponent.name, () => {
  let component: WorkspaceErrorComponent;
  let fixture: ComponentFixture<WorkspaceErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetsPipeModule, TranslateModule, TranslateServiceStubModule],
      declarations: [WorkspaceErrorComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
