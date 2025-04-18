/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { Component, output } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { IconButtonModule, ListModule, PopoverModule } from '@sitecore/ng-spd-lib';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { VariantActionsContextMenuComponent } from './variant-actions-context-menu.component';

@Component({
  template: `<app-variant-actions-context-menu
    [disabled]="disabled"
    [disableDeleteVariant]="disableDeleteVariant"
    [disableResetVariant]="disableResetVariant"
    (renameBtnClick)="renameBtnClick.emit($event)"
    (deleteBtnClick)="deleteBtnClick.emit($event)"
    (resetBtnClick)="resetBtnClick.emit($event)"
  ></app-variant-actions-context-menu>`,
})
class HostTestComponent {
  disabled = false;
  disableDeleteVariant = false;
  disableResetVariant = false;

  renameBtnClick = output<MouseEvent>();
  deleteBtnClick = output<MouseEvent>();
  resetBtnClick = output<MouseEvent>();
}

describe(VariantActionsContextMenuComponent.name, () => {
  let sut: VariantActionsContextMenuComponent;
  let testComponent: HostTestComponent;
  let fixture: ComponentFixture<HostTestComponent>;

  const actionButtons = () => fixture.debugElement.queryAll(By.css('ng-spd-list button'));
  const menuButton = () => fixture.debugElement.query(By.css('.px-md')).nativeElement as HTMLButtonElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HostTestComponent],
      imports: [
        CommonModule,
        TranslateModule,
        TranslateServiceStubModule,
        ListModule,
        PopoverModule,
        IconButtonModule,
        A11yModule,
        NoopAnimationsModule,
        VariantActionsContextMenuComponent,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HostTestComponent);
    testComponent = fixture.componentInstance;

    sut = fixture.debugElement.query(By.directive(VariantActionsContextMenuComponent)).componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should disable button when disabled is true', () => {
    testComponent.disabled = true;
    fixture.detectChanges();

    expect(menuButton().disabled).toBeTrue();
  });

  it('should disable reset button when disableResetVariant is true', () => {
    testComponent.disableResetVariant = true;
    fixture.detectChanges();

    menuButton().click();
    const resetButton = actionButtons()[1].nativeElement as HTMLButtonElement;

    expect(resetButton.disabled).toBeTrue();
  });

  it('should disable delete button when disableDeleteVariant is true', () => {
    testComponent.disableDeleteVariant = true;
    fixture.detectChanges();

    menuButton().click();
    const deleteButton = actionButtons()[2].nativeElement as HTMLButtonElement;

    expect(deleteButton.disabled).toBeTrue();
  });

  it('should emit renameBtnClick when rename button is clicked', () => {
    menuButton().click();
    fixture.detectChanges();

    spyOn(testComponent.renameBtnClick, 'emit');
    const renameButton = actionButtons()[0].nativeElement as HTMLButtonElement;
    renameButton.click();

    expect(testComponent.renameBtnClick.emit).toHaveBeenCalled();
  });

  it('should emit resetBtnClick when reset button is clicked', () => {
    menuButton().click();
    fixture.detectChanges();

    spyOn(testComponent.resetBtnClick, 'emit');
    const resetButton = actionButtons()[1].nativeElement as HTMLButtonElement;
    resetButton.click();

    expect(testComponent.resetBtnClick.emit).toHaveBeenCalled();
  });

  it('should emit deleteBtnClick when delete button is clicked', () => {
    menuButton().click();
    fixture.detectChanges();

    spyOn(testComponent.deleteBtnClick, 'emit');
    const deleteButton = actionButtons()[2].nativeElement as HTMLButtonElement;
    deleteButton.click();

    expect(testComponent.deleteBtnClick.emit).toHaveBeenCalled();
  });
});
