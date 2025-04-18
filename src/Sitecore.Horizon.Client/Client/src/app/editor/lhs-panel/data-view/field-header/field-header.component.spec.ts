/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { IconButtonModule, PopoverModule } from '@sitecore/ng-spd-lib';
import { TagComponent } from 'app/component-lib/tag/tag.component';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { FieldHeaderComponent } from './field-header.component';

describe(FieldHeaderComponent.name, () => {
  let sut: FieldHeaderComponent;
  let fixture: ComponentFixture<FieldHeaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FieldHeaderComponent],
      imports: [
        CommonModule,
        TranslateModule,
        TranslateServiceStubModule,
        PopoverModule,
        IconButtonModule,
        TagComponent,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldHeaderComponent);
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
        name: 'Checkbox',
        type: 'Checkbox',
        sectionName: 'Content',
        dataSource: [],
        versioning: 'SHARED',
        dataSourcePageInfo: { hasNextPage: false, startCursor: '', endCursor: '' },
      },
      validation: [],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });
});
