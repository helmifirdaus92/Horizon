/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { async, ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';
import { PopoverModule, SwitchModule } from '@sitecore/ng-spd-lib';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { LayoutSwitchComponent } from './layout-switch.component';
import { LayoutSwitchService } from './layout-switch.service';

describe(LayoutSwitchComponent.name, () => {
  let sut: LayoutSwitchComponent;
  let fixture: ComponentFixture<LayoutSwitchComponent>;
  let layoutSwitchServiceSpy: jasmine.SpyObj<LayoutSwitchService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LayoutSwitchComponent],
      imports: [TranslateModule, TranslateServiceStubModule, SwitchModule, PopoverModule],
      providers: [
        {
          provide: LayoutSwitchService,
          useValue: jasmine.createSpyObj<LayoutSwitchService>(['getLayoutEditingKind', 'setLayoutEditingKind']),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    layoutSwitchServiceSpy = TestBedInjectSpy(LayoutSwitchService);
    fixture = TestBed.createComponent(LayoutSwitchComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('switch layout kind toggle', () => {
    it('should initialize isSharedLayout to true when LayoutSwitchService returns "SHARED"', fakeAsync(() => {
      // Arrange
      layoutSwitchServiceSpy.getLayoutEditingKind.and.returnValue(Promise.resolve('SHARED'));

      // Act
      sut.ngOnInit();
      tick();

      // Assert
      expect(sut.isSharedLayout).toBe(true);
      flush();
    }));

    it('should initialize isSharedLayout to false when LayoutSwitchService returns "FINAL"', fakeAsync(() => {
      // Arrange
      layoutSwitchServiceSpy.getLayoutEditingKind.and.returnValue(Promise.resolve('FINAL'));

      // Act
      sut.ngOnInit();
      tick();

      // Assert
      expect(sut.isSharedLayout).toBe(false);
      flush();
    }));

    it('should toggle isSharedLayout and call setLayoutEditingKind', fakeAsync(() => {
      // Arrange
      layoutSwitchServiceSpy.setLayoutEditingKind.and.returnValue(Promise.resolve());
      sut.isSharedLayout = false;

      // Act
      sut.toggleSharedLayout();
      tick();

      // Assert
      expect(sut.isSharedLayout).toBe(true);
      expect(layoutSwitchServiceSpy.setLayoutEditingKind).toHaveBeenCalledWith('SHARED');

      // Toggle again
      sut.toggleSharedLayout();
      tick();

      // Assert
      expect(sut.isSharedLayout).toBe(false);
      expect(layoutSwitchServiceSpy.setLayoutEditingKind).toHaveBeenCalledWith('FINAL');
      flush();
    }));
  });
});
