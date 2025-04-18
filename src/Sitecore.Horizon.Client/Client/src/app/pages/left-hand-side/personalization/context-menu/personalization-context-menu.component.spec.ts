/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { A11yModule } from '@angular/cdk/a11y';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { ListModule, PopoverModule } from '@sitecore/ng-spd-lib';
import { WarningDialogModule } from 'app/shared/dialogs/warning-dialog/warning-dialog.module';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { PersonalizationContextMenuComponent } from './personalization-context-menu.component';

@Component({
  selector: 'test-personalization-component',
  template: `<app-personalization-context-menu
    [variantName]="variantName"
    (deleteVariant)="deleteVariant(variantName)"
    (renameVariant)="renameVariant()"
    (editVariant)="editVariant()"
  >
  </app-personalization-context-menu>`,
})
class TestComponent {
  variantName = '';
  deletedVariant?: string;
  deleteVariant(name: string) {
    this.deletedVariant = name;
  }
  renameVariant() {}
  editVariant() {}
}

describe(PersonalizationContextMenuComponent.name, () => {
  let testComponent: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let sut: PersonalizationContextMenuComponent;

  const deletedVariantName = 'test variant';

  function openContextMenu() {
    const contextMenuButton = fixture.debugElement.query(By.css(`button[icon='dots-horizontal']`)).nativeElement;
    contextMenuButton.click();
  }

  function findDeleteActionBtn() {
    return fixture.debugElement.query(By.css(`ng-spd-list button:nth-child(3)`)).nativeElement as HTMLButtonElement;
  }

  function clickDeleteAction() {
    const deleteActionBtn = findDeleteActionBtn();
    deleteActionBtn.click();
  }

  function confirmDeleteAction() {
    const confirmBtn = document.querySelector('ng-spd-dialog-actions button:nth-child(2)') as HTMLButtonElement;
    confirmBtn.click();
  }

  const editActionBtn = () =>
    fixture.debugElement.query(By.css(`ng-spd-list button:first-child`)).nativeElement as HTMLButtonElement;

  const renameActionBtn = () =>
    fixture.debugElement.query(By.css(`ng-spd-list button:nth-child(2)`)).nativeElement as HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PersonalizationContextMenuComponent, TestComponent],
      imports: [
        BrowserAnimationsModule,
        TranslateModule,
        TranslateServiceStubModule,
        PopoverModule,
        ListModule,
        WarningDialogModule,
        A11yModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    sut = fixture.debugElement.query(By.directive(PersonalizationContextMenuComponent)).componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
    expect(sut.popoverIsActive).toBeTruthy();
  });

  describe('Delete action', () => {
    it(`should prompt delete page variant dialog`, async () => {
      testComponent.variantName = deletedVariantName;
      openContextMenu();
      fixture.detectChanges();

      clickDeleteAction();
      await fixture.whenStable();
      fixture.detectChanges();

      const dialog = document.querySelector('ng-spd-dialog-panel')!;
      const dialogHeader = dialog.querySelector('ng-spd-dialog-header')!;
      const dialogContent = dialog.querySelector('ng-spd-dialog-content')!;
      expect(dialog).toBeTruthy();
      expect(dialogHeader.textContent).toContain('PERSONALIZATION.DELETE.DIALOG_HEADER');
      expect(dialogContent.textContent).toContain(deletedVariantName);
    });
  });

  describe('WHEN confirming delete action', () => {
    it(`should raise [deleteVariant] event`, async () => {
      testComponent.variantName = deletedVariantName;
      openContextMenu();
      fixture.detectChanges();

      clickDeleteAction();
      await fixture.whenStable();
      fixture.detectChanges();

      confirmDeleteAction();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(testComponent.deletedVariant).toBe(deletedVariantName);
    });
  });

  describe('popoverIsActive', () => {
    it('should change value on toggle', async () => {
      expect(sut.popoverIsActive()).toBeFalse();

      openContextMenu();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(sut.popoverIsActive()).toBeTrue();
    });
  });

  describe('when canvas is loading', () => {
    it('should disable delete variant button', () => {
      openContextMenu();
      fixture.detectChanges();
      const deleteActionBtn = findDeleteActionBtn();

      sut.canvasIsLoading = true;
      fixture.detectChanges();

      expect(deleteActionBtn.disabled).toBeTrue();
    });
  });

  describe('when canvas is not loading', () => {
    it('should not disable delete variant button', () => {
      openContextMenu();
      fixture.detectChanges();
      const deleteActionBtn = findDeleteActionBtn();

      sut.canvasIsLoading = false;
      fixture.detectChanges();

      expect(deleteActionBtn.disabled).toBeFalse();
    });
  });

  describe('editAction', () => {
    it('should emit editVariant event', () => {
      openContextMenu();
      const spy = spyOn(testComponent, 'editVariant');
      editActionBtn().click();

      sut.canvasIsLoading = false;
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('renameVariant', () => {
    it('should emit renameVariant event', () => {
      openContextMenu();
      const spy = spyOn(testComponent, 'renameVariant');
      renameActionBtn().click();

      sut.canvasIsLoading = false;
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
