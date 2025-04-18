/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { DroplistModule, IconButtonModule, PopoverModule, SwitchModule } from '@sitecore/ng-spd-lib';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { ContentAlignment, DistributeAlignment, LayoutAlignmentComponent } from './layout-alignment.component';

@Component({
  template: `
    <app-layout-alignment
      [position]="position"
      [direction]="direction"
      [isWrapped]="isWrapped"
      (positionChanged)="positionChanged($event)"
      (directionChanged)="directionChanged($event)"
      (isWrappedChanged)="isWrappedChanged($event)"
    ></app-layout-alignment>
  `,
})
class TestHostComponent {
  position: ContentAlignment | DistributeAlignment = 'top-right';
  direction: 'horizontal' | 'vertical' = 'horizontal';
  isWrapped = false;
  isDistribute = false;

  positionChanged = jasmine.createSpy('positionChanged');
  directionChanged = jasmine.createSpy('directionChanged');
  isWrappedChanged = jasmine.createSpy('isWrappedChanged');
}

describe(LayoutAlignmentComponent.name, () => {
  let sut: LayoutAlignmentComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;

  const positionEl = () => fixture.debugElement.query(By.css('.position')).nativeElement;
  const directionEl = () => fixture.debugElement.query(By.css('.base')).nativeElement;
  const toggleBtn = () => fixture.debugElement.query(By.css('.toggle-popover')).nativeElement;
  const horizontalBtn = () =>
    fixture.debugElement.query(By.css('.alignment-switcher button:first-child')).nativeElement;
  const distributeBtn = () =>
    fixture.debugElement.query(By.css('.layout-switcher ng-spd-switch:last-child')).nativeElement;

  const possibleContentPositions = [
    'top-left',
    'top-center',
    'top-right',
    'center-left',
    'center-center',
    'center-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
  ];
  const possibleDistributePositions = ['distributed-start', 'distributed-center', 'distributed-end'];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        PopoverModule,
        TranslateModule,
        DroplistModule,
        TranslateServiceStubModule,
        NoopAnimationsModule,
        SwitchModule,
        IconButtonModule,
      ],
      declarations: [LayoutAlignmentComponent, TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    sut = fixture.debugElement.query(By.directive(LayoutAlignmentComponent)).componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(testHost).toBeTruthy();
    expect(sut).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should set distribute toggle to true if position is `[top, center, left, right, bottom]`', () => {
      // Act
      possibleDistributePositions.forEach((pos) => {
        testHost.position = pos as DistributeAlignment;
        sut.ngOnChanges({
          position: { currentValue: pos, previousValue: null, firstChange: true, isFirstChange: () => true },
        });

        fixture.detectChanges();

        // Assert
        expect(sut.isDistribute).toBeTruthy();
      });
    });

    describe('When base is [horizontal]', () => {
      it('should set content alignment based on dots-position', () => {
        possibleContentPositions.forEach((pos) => {
          testHost.position = pos as ContentAlignment;

          fixture.detectChanges();

          // Assert
          expect(directionEl().textContent).toEqual('RHS.SUPER_LAYOUT.HORIZONTAL');
          expect(positionEl().textContent).toEqual(`RHS.SUPER_LAYOUT.${pos.toUpperCase().replace('-', '_')}`);
        });
      });

      it('should set horizontal distribution if position is `[top, center, bottom]`', () => {
        // Arrange
        const position = ['distributed-start', 'distributed-center', 'distributed-end'];
        const textKey = ['TOP', 'CENTER', 'BOTTOM'];
        testHost.direction = 'horizontal';

        // Act
        position.forEach((pos, idx) => {
          testHost.position = pos as DistributeAlignment;
          sut.ngOnChanges({
            position: { currentValue: pos, previousValue: null, firstChange: true, isFirstChange: () => true },
            direction: {
              currentValue: 'horizontal',
              previousValue: null,
              firstChange: true,
              isFirstChange: () => true,
            },
          });

          fixture.detectChanges();

          // Assert
          expect(directionEl().textContent).toEqual('RHS.SUPER_LAYOUT.HORIZONTAL');
          expect(positionEl().textContent).toEqual(`RHS.SUPER_LAYOUT.DISTRIBUTE${''}RHS.SUPER_LAYOUT.${textKey[idx]}`);
        });
      });
    });

    describe('When base is [vertical]', () => {
      it('should set content alignment based on dots-position', () => {
        // Arrange
        testHost.direction = 'vertical';
        fixture.detectChanges();

        // Act
        possibleContentPositions.forEach((pos) => {
          testHost.position = pos as ContentAlignment;
          fixture.detectChanges();

          // Assert
          expect(directionEl().textContent).toEqual('RHS.SUPER_LAYOUT.VERTICAL');
          expect(positionEl().textContent).toEqual(`RHS.SUPER_LAYOUT.${pos.toUpperCase().replace('-', '_')}`);
        });
      });

      it('should set vertical distribution if position is `[left, center, right]`', () => {
        // Arrange
        const position = ['distributed-start', 'distributed-center', 'distributed-end'];
        const textKey = ['LEFT', 'CENTER', 'RIGHT'];

        testHost.direction = 'vertical';

        // Act
        position.forEach((pos, idx) => {
          testHost.position = pos as DistributeAlignment;
          sut.ngOnChanges({
            position: { currentValue: pos, previousValue: null, firstChange: true, isFirstChange: () => true },
            direction: {
              currentValue: 'vertical',
              previousValue: null,
              firstChange: true,
              isFirstChange: () => true,
            },
          });

          fixture.detectChanges();

          // Assert
          expect(directionEl().textContent).toEqual('RHS.SUPER_LAYOUT.VERTICAL');
          expect(positionEl().textContent).toEqual(`RHS.SUPER_LAYOUT.DISTRIBUTE${''}RHS.SUPER_LAYOUT.${textKey[idx]}`);
        });
      });
    });
  });

  describe('setdirection', () => {
    it('should set distribute position based on curent position if isDistribute is true', () => {
      // Arrange
      sut.isDistribute = true;
      testHost.position = 'top-left';
      fixture.detectChanges();

      // Act
      toggleBtn().click();
      horizontalBtn().click();
      fixture.detectChanges();

      // Assert
      expect(testHost.positionChanged).toHaveBeenCalledWith('distributed-start');
    });

    it('should emit directionChanged event', () => {
      // Arrange
      toggleBtn().click();

      // Act
      horizontalBtn().click();

      // Assert
      expect(testHost.directionChanged).toHaveBeenCalledWith('horizontal');
    });
  });

  describe('setPosition', () => {
    it('should set distribute position based on curent position if isDistribute is true', () => {
      // Arrange
      sut.isDistribute = true;
      testHost.direction = 'vertical';
      fixture.detectChanges();

      // Act
      toggleBtn().click();
      const setPositionTriggerAt = fixture.debugElement.query(
        By.css('.vertical .row button:nth-child(2)'),
      ).nativeElement;
      setPositionTriggerAt.click();

      // Assert
      expect(testHost.positionChanged).toHaveBeenCalledWith('distributed-start');
    });

    it('should emit positionChanged event', () => {
      // Arrange
      toggleBtn().click();

      // Act
      const topLeftBtn = fixture.debugElement.query(By.css('.row button:nth-child(1)')).nativeElement;
      topLeftBtn.click();

      // Assert
      expect(testHost.positionChanged).toHaveBeenCalledWith('top-left');
    });
  });

  describe('toggleDistributeAlignment', () => {
    it('should set distribute position when toggle is on', () => {
      // Arrange
      testHost.direction = 'horizontal';
      testHost.position = 'bottom-right';
      fixture.detectChanges();

      // Act
      toggleBtn().click();
      distributeBtn().dispatchEvent(new Event('changeEmitter'));
      fixture.detectChanges();

      // Assert
      expect(testHost.positionChanged).toHaveBeenCalledWith('distributed-end');
    });
  });

  describe('isWrappedChanged', () => {
    it('should emit isWrappedChanged event', () => {
      // Arrange
      toggleBtn().click();

      // Act
      const isWrappedBtn = fixture.debugElement.query(
        By.css('.layout-switcher ng-spd-switch:nth-child(1)'),
      ).nativeElement;

      isWrappedBtn.dispatchEvent(new Event('changeEmitter'));

      // Assert
      expect(testHost.isWrappedChanged).toHaveBeenCalled();
    });
  });
});
