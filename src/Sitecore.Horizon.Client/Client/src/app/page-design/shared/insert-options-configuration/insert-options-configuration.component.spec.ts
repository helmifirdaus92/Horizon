/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { CheckboxModule, IconButtonModule, InlineNotificationModule, TabsModule } from '@sitecore/ng-spd-lib';
import { TenantPageTemplate } from 'app/page-design/page-templates.types';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { InsertOptionsConfigurationComponent } from './insert-options-configuration.component';

const templatesList: TenantPageTemplate[] = [
  {
    pageDesign: null,
    template: {
      templateId: 'template-id1',
      name: 'template-1',
      standardValuesItem: {
        itemId: 'sv-id1',
        insertOptions: [{ templateId: 'template-id1' }, { templateId: 'template-id2' }],
      },
    },
  },
  {
    pageDesign: null,
    template: { templateId: 'template-id2', name: 'template-2', standardValuesItem: { itemId: 'sv-id2' } },
  },
  {
    pageDesign: null,
    template: { templateId: 'template-id3', name: 'template-3', standardValuesItem: { itemId: 'sv-id3' } },
  },
  {
    pageDesign: null,
    template: {
      templateId: 'template-id4',
      name: 'template-4',
      standardValuesItem: {
        itemId: 'sv-id4',
        insertOptions: [{ templateId: 'template-id1' }, { templateId: 'template-id4' }],
      },
    },
  },
];

@Component({
  selector: 'test-component',
  template: `<app-insert-options-configuration
    [selectedTemplateId]="templateId"
    [templatesList]="templatesList"
    (childInsertOptions)="updateChildInsertOptions($event)"
    (parentInsertOptions)="updateParentInsertOptions($event)"
  ></app-insert-options-configuration>`,
})
class TestComponent {
  templateId = 'template-id1';
  templatesList = templatesList;

  updateChildInsertOptions(templateIds: string[]) {
    return templateIds;
  }
  updateParentInsertOptions(templateIds: string[]) {
    return templateIds;
  }
}

describe(InsertOptionsConfigurationComponent.name, () => {
  let testComponent: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let sut: InsertOptionsConfigurationComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        TranslateModule,
        TranslateServiceStubModule,
        CheckboxModule,
        TabsModule,
        IconButtonModule,
        InlineNotificationModule,
      ],
      declarations: [TestComponent, InsertOptionsConfigurationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    sut = fixture.debugElement.query(By.directive(InsertOptionsConfigurationComponent)).componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(testComponent).toBeTruthy();
    expect(sut).toBeTruthy();
  });

  it('should initialize child and parent insert options lists on ngOnInit', () => {
    expect(sut.selectedTemplate).toEqual(templatesList[0]);
    expect(sut.childInsertOptionsList).toEqual(['template-id1', 'template-id2']);
    expect(sut.parentInsertOptionsList).toEqual(['template-id1', 'template-id4']);
  });

  it('should correctly check if a template is a child of another template', () => {
    expect(sut.isChildOf('template-id1')).toBeTruthy();
    expect(sut.isChildOf('template-id2')).toBeFalsy();
    expect(sut.isChildOf('template-id3')).toBeFalsy();
    expect(sut.isChildOf('template-id4')).toBeTruthy();
  });

  it('should correctly check if a template is a parent of another template', () => {
    expect(sut.isParentOf('template-id1')).toBeTruthy();
    expect(sut.isParentOf('template-id2')).toBeTruthy();
    expect(sut.isParentOf('template-id3')).toBeFalsy();
    expect(sut.isParentOf('template-id4')).toBeFalsy();
  });

  it('should update child insert options list and emit event when updateChildInsertOptions is called', () => {
    const spy = spyOn(testComponent, 'updateChildInsertOptions');

    // act
    sut.updateChildInsertOptions(true, 'template-id3');

    // assert
    let expectedChildInsertOptionsList = ['template-id1', 'template-id2', 'template-id3'];
    expect(sut.childInsertOptionsList).toEqual(expectedChildInsertOptionsList);
    expect(spy).toHaveBeenCalledWith(expectedChildInsertOptionsList);

    // act
    sut.updateChildInsertOptions(false, 'template-id2');

    // assert
    expectedChildInsertOptionsList = ['template-id1', 'template-id3'];
    expect(sut.childInsertOptionsList).toEqual(expectedChildInsertOptionsList);
    expect(spy).toHaveBeenCalledWith(expectedChildInsertOptionsList);
  });

  it('should update parent insert options list and emit event when updateParentInsertOptions is called', () => {
    const spy = spyOn(testComponent, 'updateParentInsertOptions');

    // act
    sut.updateParentInsertOptions(true, 'template-id3');

    // assert
    let expectedParentInsertOptionsList = ['template-id1', 'template-id4', 'template-id3'];
    expect(sut.parentInsertOptionsList).toEqual(expectedParentInsertOptionsList);
    expect(spy).toHaveBeenCalledWith(expectedParentInsertOptionsList);

    // act
    sut.updateParentInsertOptions(false, 'template-id4');

    // assert
    expectedParentInsertOptionsList = ['template-id1', 'template-id3'];
    expect(sut.parentInsertOptionsList).toEqual(expectedParentInsertOptionsList);
    expect(spy).toHaveBeenCalledWith(expectedParentInsertOptionsList);
  });

  it('should update child and parent insert options lists and emit both events when updated insert option id is same as selected template id', () => {
    const spyParentUpdates = spyOn(testComponent, 'updateParentInsertOptions');
    const spyChildUpdates = spyOn(testComponent, 'updateChildInsertOptions');

    // act
    sut.updateParentInsertOptions(false, 'template-id1');

    // assert
    expect(sut.parentInsertOptionsList).toEqual(['template-id4']);
    expect(sut.childInsertOptionsList).toEqual(['template-id2']);
    expect(spyParentUpdates).toHaveBeenCalledWith(['template-id4']);
    expect(spyChildUpdates).toHaveBeenCalledWith(['template-id2']);
  });
});
