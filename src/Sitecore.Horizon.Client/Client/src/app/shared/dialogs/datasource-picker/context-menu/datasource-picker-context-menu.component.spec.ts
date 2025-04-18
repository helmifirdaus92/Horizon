/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { ListModule, PopoverModule } from '@sitecore/ng-spd-lib';
import {
  SiteLanguageServiceTestingModule,
  SiteServiceStub,
} from 'app/shared/site-language/site-language.service.testing';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { DatasourcePickerContextMenuComponent } from './datasource-picker-context-menu.component';

@Component({
  selector: 'app-no-matter-selector',
  template: `<app-datasource-picker-context-menu
    [node]="testNode"
    (invokeAction)="handleContextMenuActionInvoke($event)"
    (contextMenuStateChange)="handleContextMenuStateChange($event)"
  >
  </app-datasource-picker-context-menu>`,
})
class TestContainerComponent {
  testNode: any = { id: 'testNodeId', isCompatible: true, enableEdit: false };
  handleContextMenuActionInvoke = jasmine.createSpy();
  handleContextMenuStateChange = jasmine.createSpy();
}

describe(DatasourcePickerContextMenuComponent.name, () => {
  let testContainer: TestContainerComponent;
  let fixture: ComponentFixture<TestContainerComponent>;
  let sut: DatasourcePickerContextMenuComponent;
  let siteService: SiteServiceStub;

  const getDuplicateBtn = () => fixture.debugElement.query(By.css(`button[icon='content-copy']`))?.nativeElement;
  const createNewBtn = () => fixture.debugElement.query(By.css(`button[icon='plus']`))?.nativeElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        TranslateModule,
        TranslateServiceStubModule,
        PopoverModule,
        ListModule,
        SiteLanguageServiceTestingModule,
      ],
      declarations: [DatasourcePickerContextMenuComponent, TestContainerComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    siteService = TestBed.inject(SiteServiceStub);

    fixture = TestBed.createComponent(TestContainerComponent);
    testContainer = fixture.componentInstance;
    sut = fixture.debugElement.query(By.directive(DatasourcePickerContextMenuComponent)).componentInstance;

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('invokeAction()', () => {
    it(`should emit invokeAction with action type of 'Create New' and value of node`, () => {
      // act
      const createItemBtn = fixture.debugElement.query(By.css(`button[icon='plus']`)).nativeElement;
      createItemBtn.click();
      fixture.detectChanges();

      // assert
      expect(testContainer.handleContextMenuActionInvoke).toHaveBeenCalledOnceWith({
        actionType: 'CreateNew',
        node: { id: 'testNodeId', isCompatible: true, enableEdit: false },
      });
    });

    it(`should emit invokeAction with action type of 'Duplicate' and value of node`, () => {
      // arrange
      testContainer.testNode.isCompatible = true;
      fixture.detectChanges();
      // act
      getDuplicateBtn().click();
      fixture.detectChanges();

      // assert
      expect(testContainer.handleContextMenuActionInvoke).toHaveBeenCalledOnceWith({
        actionType: 'Duplicate',
        node: { id: 'testNodeId', isCompatible: true, enableEdit: false },
      });
    });
  });

  describe('Duplicate item button', () => {
    it('should be hidden IF node is marked as Root item', () => {
      expect(getDuplicateBtn()).toBeTruthy();

      testContainer.testNode.isRoot = true;
      fixture.detectChanges();

      expect(getDuplicateBtn()).toBeFalsy();
    });

    it('should be hidden IF node is Root of a site item', () => {
      expect(getDuplicateBtn()).toBeTruthy();

      testContainer.testNode.id = '227bc0ff-6237-42b6-851f-49e68c1998e8';
      fixture.detectChanges();

      expect(getDuplicateBtn()).toBeFalsy();
    });

    it('should be hidden IF node is Start of a site item', () => {
      expect(getDuplicateBtn()).toBeTruthy();

      testContainer.testNode.id = 'startItemId2';
      fixture.detectChanges();

      expect(getDuplicateBtn()).toBeFalsy();
    });

    it('should disable button if node is in edit mode', () => {
      // arrange
      testContainer.testNode.enableEdit = true;
      fixture.detectChanges();

      // assert
      expect(getDuplicateBtn().disabled).toBeTrue();
    });

    it('should not disable button if node is not in edit mode', () => {
      // arrange
      testContainer.testNode.enableEdit = false;
      fixture.detectChanges();

      // assert
      expect(getDuplicateBtn().disabled).toBeFalse();
    });
  });

  describe(' Create item button', () => {
    it('should disable button if node is in edit mode', () => {
      // arrange
      testContainer.testNode.enableEdit = true;
      fixture.detectChanges();

      // assert
      expect(createNewBtn().disabled).toBeTrue();
    });

    it('should not disable button if node is not in edit mode', () => {
      // arrange
      testContainer.testNode.enableEdit = false;
      fixture.detectChanges();

      // assert
      expect(createNewBtn().disabled).toBeFalse();
    });
  });
});
