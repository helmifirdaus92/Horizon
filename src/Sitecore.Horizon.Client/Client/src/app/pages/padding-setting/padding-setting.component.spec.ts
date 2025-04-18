/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ContentEditableModule } from '@sitecore/ng-spd-lib';
import { PaddingSettingComponent } from './padding-setting.component';

describe(PaddingSettingComponent.name, () => {
  let sut: PaddingSettingComponent;
  let fixture: ComponentFixture<PaddingSettingComponent>;

  const topPaddingEl = () => fixture.debugElement.query(By.css('.top .value')).nativeElement;
  const leftPaddingEl = () => fixture.debugElement.query(By.css('.left .value')).nativeElement;
  const rightPaddingEl = () => fixture.debugElement.query(By.css('.right .value')).nativeElement;
  const bottomPaddingEl = () => fixture.debugElement.query(By.css('.bottom .value')).nativeElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentEditableModule],
      declarations: [PaddingSettingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaddingSettingComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('setTopPadding', () => {
    it('should emit top position and top-padding value', () => {
      // Arrange
      const spy = spyOn(sut.submitSetting, 'emit');

      // Act
      topPaddingEl().click();
      topPaddingEl().textContent = '10';
      fixture.detectChanges();
      topPaddingEl().dispatchEvent(new Event('blur'));

      // Assert
      expect(spy).toHaveBeenCalledWith({ position: 'top', value: 10 });
    });

    it('should not emit if value is not a number', () => {
      // Arrange
      const spy = spyOn(sut.submitSetting, 'emit');

      // Act
      topPaddingEl().click();
      topPaddingEl().textContent = 'test';
      fixture.detectChanges();

      topPaddingEl().dispatchEvent(new Event('blur'));

      // Assert
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not emit if value is the same', () => {
      // Arrange
      const spy = spyOn(sut.submitSetting, 'emit');
      sut.ngOnChanges({ paddingTop: { currentValue: 10, previousValue: 10, isFirstChange: () => false } } as any);

      // Act
      topPaddingEl().click();
      fixture.detectChanges();

      topPaddingEl().dispatchEvent(new Event('blur'));

      // Assert
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('setLeftPadding', () => {
    it('should emit left position and left-padding value', () => {
      // Arrange
      const spy = spyOn(sut.submitSetting, 'emit');

      // Act
      leftPaddingEl().click();
      leftPaddingEl().textContent = '10';
      fixture.detectChanges();

      leftPaddingEl().dispatchEvent(new Event('blur'));

      // Assert
      expect(spy).toHaveBeenCalledWith({ position: 'left', value: 10 });
    });

    it('should not emit if value is not a number', () => {
      // Arrange
      const spy = spyOn(sut.submitSetting, 'emit');

      // Act
      leftPaddingEl().click();
      leftPaddingEl().textContent = 'test';
      fixture.detectChanges();

      leftPaddingEl().dispatchEvent(new Event('blur'));

      // Assert
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not emit if value is the same', () => {
      // Arrange
      const spy = spyOn(sut.submitSetting, 'emit');
      sut.ngOnChanges({ paddingLeft: { currentValue: 10, previousValue: 10, isFirstChange: () => false } } as any);

      // Act
      leftPaddingEl().click();
      fixture.detectChanges();

      leftPaddingEl().dispatchEvent(new Event('blur'));

      // Assert
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('setRightPadding', () => {
    it('should emit right position and right-padding value', () => {
      // Arrange
      const spy = spyOn(sut.submitSetting, 'emit');

      // Act
      rightPaddingEl().click();
      rightPaddingEl().textContent = '10';
      fixture.detectChanges();

      rightPaddingEl().dispatchEvent(new Event('blur'));

      // Assert
      expect(spy).toHaveBeenCalledWith({ position: 'right', value: 10 });
    });

    it('should not emit if value is not a number', () => {
      // Arrange
      const spy = spyOn(sut.submitSetting, 'emit');

      // Act
      rightPaddingEl().click();
      rightPaddingEl().textContent = 'test';
      fixture.detectChanges();

      rightPaddingEl().dispatchEvent(new Event('blur'));

      // Assert
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not emit if value is the same', () => {
      // Arrange
      const spy = spyOn(sut.submitSetting, 'emit');
      sut.ngOnChanges({ paddingRight: { currentValue: 10, previousValue: 10, isFirstChange: () => false } } as any);

      // Act
      rightPaddingEl().click();
      fixture.detectChanges();

      rightPaddingEl().dispatchEvent(new Event('blur'));

      // Assert
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('setBottomPadding', () => {
    it('should emit bottom position and bottom-padding value', () => {
      // Arrange
      const spy = spyOn(sut.submitSetting, 'emit');

      // Act
      bottomPaddingEl().click();
      bottomPaddingEl().textContent = '10';
      fixture.detectChanges();

      bottomPaddingEl().dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      // Assert
      expect(spy).toHaveBeenCalledWith({ position: 'bottom', value: 10 });
    });

    it('should not emit if value is not a number', () => {
      // Arrange
      const spy = spyOn(sut.submitSetting, 'emit');

      // Act
      bottomPaddingEl().click();
      bottomPaddingEl().textContent = 'test';
      fixture.detectChanges();

      bottomPaddingEl().dispatchEvent(new Event('blur'));

      // Assert
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not emit if value is the same', () => {
      // Arrange
      const spy = spyOn(sut.submitSetting, 'emit');
      sut.ngOnChanges({ paddingBottom: { currentValue: 10, previousValue: 10, isFirstChange: () => false } } as any);

      // Act
      bottomPaddingEl().click();
      fixture.detectChanges();

      bottomPaddingEl().dispatchEvent(new Event('blur'));

      // Assert
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
