/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { LhsPanelModule } from 'app/editor/lhs-panel/lhs-panel.module';
import { ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { MultilistFieldComponent } from './multilist-field.component';

describe(MultilistFieldComponent.name, () => {
  let sut: MultilistFieldComponent;
  let fixture: ComponentFixture<MultilistFieldComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, TranslateModule, TranslateServiceStubModule, LhsPanelModule, ContextServiceTestingModule],
      declarations: [MultilistFieldComponent],
      providers: [],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultilistFieldComponent);
    sut = fixture.componentInstance;

    sut.field = {
      item: {
        id: 'id001',
        version: 1,
        revision: 'rev001',
        language: 'en',
        access: {
          canRead: true,
          canWrite: true,
        },
      },
      value: { rawValue: 'value1' },
      containsStandardValue: false,
      access: {
        canRead: true,
        canWrite: true,
      },
      templateField: {
        templateFieldId: 'templateFieldId1',
        name: 'Content',
        type: 'Rich Text',
        sectionName: 'Content',
        dataSource: [],
        versioning: 'SHARED',
        dataSourcePageInfo: { hasNextPage: false, startCursor: '', endCursor: '' },
      },
      validation: [],
    };
    sut.currentValue = 'value1';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });
});
