/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Size, TagComponent } from './tag.component';

describe(TagComponent.name, () => {
  let component: TagComponent;
  let fixture: ComponentFixture<TagComponent>;
  let debugElement: DebugElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('should render state', () => {
    it('should not add dismiss button for the component', () => {
      component.isDismissible = false;
      fixture.detectChanges();
      debugElement = fixture.debugElement.query(By.css('button.mdi-close'));

      expect(debugElement).toBeNull();
    });

    it('should add dismiss button for the component', () => {
      component.isDismissible = true;
      fixture.detectChanges();
      debugElement = fixture.debugElement.query(By.css('button.mdi-close'));

      expect(debugElement).not.toBeNull();
    });

    it('should assing "ng-spd-tag-dismissible" class to the host element', () => {
      component.isDismissible = true;
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.classList.contains('ng-spd-tag-dismissible')).toBeTrue();
    });

    it('should add tabindex="1" to the host element when [isDismissible]=false', () => {
      component.isDismissible = false;
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.getAttribute('tabindex')).toBe('1');
    });

    it('should add tabindex="-1" to the host element when [isDismissible]=true', () => {
      component.isDismissible = true;
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.getAttribute('tabindex')).toBe('-1');
    });

    it('should remove component on dismiss click', () => {
      // Arrange
      spyOn(component, 'onDismiss');
      component.isDismissible = true;
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      fixture.detectChanges();
      const el = fixture.debugElement.query(By.css('button.mdi-close'));

      // Act
      el.triggerEventHandler('click', event);

      // Assert
      expect(component.onDismiss).toHaveBeenCalledOnceWith(event);
    });

    it('should set [dismissButtonLabel] for the dismiss button', () => {
      // Arrange
      component.isDismissible = true;
      component.dismissButtonLabel = 'dismiss label';
      fixture.detectChanges();

      // Act
      debugElement = fixture.debugElement.query(By.css('button'));

      // Assert
      expect(debugElement.nativeElement.getAttribute('title')).toBe('dismiss label');
    });
  });

  describe('icon', () => {
    it('should render icon when set', () => {
      const element: HTMLElement = fixture.debugElement.query(By.css('.normal')).nativeElement;
      component.icon = 'eye';

      fixture.detectChanges();
      expect(element).toBeTruthy();
    });
  });

  describe('size', () => {
    it('should add class size to the host element based on the size input value', () => {
      new Array<Size>('xs', 'sm', 'md', 'lg').forEach((size) => {
        component.size = size;
        fixture.detectChanges();

        expect(fixture.debugElement.classes[size]).toBeTruthy();
      });
    });
  });

  describe('[dismissible]', () => {
    it('should return [isDismissible] which is false', () => {
      component.isDismissible = false;
      fixture.detectChanges();
      const result = component.dismissible;

      expect(result).toBeFalse();
    });

    it('should return [isDismissible] which is true', () => {
      component.isDismissible = true;
      fixture.detectChanges();
      const result = component.dismissible;

      expect(result).toBeTrue();
    });
  });

  describe('onDismiss()', () => {
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    });

    it('should emit() on actionClick', () => {
      // arrange
      spyOn(component.actionClick, 'emit');

      // act
      component.onDismiss(event);

      // assert
      expect(component.actionClick.emit).toHaveBeenCalledWith(event);
    });

    it('should invoke remove() on [nativeElement]', () => {
      // arrange
      spyOn(component.actionClick, 'emit');
      spyOn(fixture.nativeElement, 'remove');

      // act
      component.onDismiss(event);

      // assert
      expect(fixture.nativeElement.remove).toHaveBeenCalled();
    });
  });
});
