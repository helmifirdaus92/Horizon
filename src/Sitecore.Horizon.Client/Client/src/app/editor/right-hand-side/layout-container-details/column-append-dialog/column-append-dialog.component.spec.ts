/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseHandle, DialogModule } from '@sitecore/ng-spd-lib';
import { CanvasServices } from 'app/editor/shared/canvas.services';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { LayoutContainerRenderingService } from '../layout-container-rendering-service';
import { LayoutTemplatesKey } from '../layout-size-templates';
import { ColumnAppendDialogComponent } from './column-append-dialog.component';

describe(ColumnAppendDialogComponent.name, () => {
  let sut: ColumnAppendDialogComponent;
  let closeHandleSpy: jasmine.SpyObj<DialogCloseHandle>;
  let layoutContainerRenderingService: jasmine.SpyObj<LayoutContainerRenderingService>;
  let canvasServicesMock: jasmine.SpyObj<CanvasServices>;
  let fixture: ComponentFixture<ColumnAppendDialogComponent>;

  const crossBtn = () => fixture.debugElement.query(By.css('ng-spd-dialog-close-button button')).nativeElement;
  const appendContentBtn = () => fixture.debugElement.query(By.css('.append-content')).nativeElement;
  const deleteContentBtn = () => fixture.debugElement.query(By.css('.delete-content')).nativeElement;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('CanvasServices', ['getCurrentLayout']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, DialogModule, TranslateModule, TranslateServiceStubModule],
      providers: [
        {
          provide: DialogCloseHandle,
          useValue: jasmine.createSpyObj<DialogCloseHandle>('DialogCloseHandle', ['close']),
        },
        {
          provide: LayoutContainerRenderingService,
          useValue: jasmine.createSpyObj<LayoutContainerRenderingService>('LayoutContainerRenderingService', [
            'getPhKeyOfContentAppendingColumn',
            'getRenderingsInsideRemovingColumn',
            'updateLayoutTemplate',
          ]),
        },
        { provide: CanvasServices, useValue: spy },
      ],
      declarations: [ColumnAppendDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ColumnAppendDialogComponent);
    closeHandleSpy = TestBedInjectSpy(DialogCloseHandle);
    layoutContainerRenderingService = TestBedInjectSpy(LayoutContainerRenderingService);
    canvasServicesMock = TestBedInjectSpy(CanvasServices) as jasmine.SpyObj<CanvasServices>;
    sut = fixture.componentInstance;

    layoutContainerRenderingService.getRenderingsInsideRemovingColumn.and.resolveTo([]);
    layoutContainerRenderingService.getPhKeyOfContentAppendingColumn.and.resolveTo('phKey');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('Dialog', () => {
    it('should close the dialog on Escape button press', () => {
      // Arrange
      const spy = spyOn(sut, 'close');
      const preventSpy = jasmine.createSpy();
      const event = { preventDefault: preventSpy, code: 'Escape' } as any;

      // Act
      sut.onKeydownHandler(event);

      // Assert
      expect(spy).toHaveBeenCalled();
    });

    it('should close the dialog on "X" button click', () => {
      crossBtn().click();

      expect(closeHandleSpy.close).toHaveBeenCalled();
    });
  });

  describe('appendContent', () => {
    it('should move all renderings inside removing columns to the new column', async () => {
      // Arrange
      const getCurrentLayoutSpy = canvasServicesMock.getCurrentLayout.and.returnValue({
        moveRendering: jasmine.createSpy('moveRendering'),
      } as any);
      layoutContainerRenderingService.getRenderingsInsideRemovingColumn.and.resolveTo([
        {
          instanceId: '123',
          id: '456',
          placeholderKey: 'placeholder1',
          dataSource: 'ds1',
          parameters: { param1: 'value1' },
        },
      ]);

      // Act
      appendContentBtn().click();
      await fixture.whenStable();

      // Assert
      expect(layoutContainerRenderingService.getRenderingsInsideRemovingColumn).toHaveBeenCalledWith(1);
      expect(layoutContainerRenderingService.getPhKeyOfContentAppendingColumn).toHaveBeenCalledWith(1);
      expect(getCurrentLayoutSpy().moveRendering).toHaveBeenCalledWith('123', 'phKey', undefined, true);
    });

    it('should call updateLayoutTemplate with the templateKey', async () => {
      // Arrange
      sut.templateKey = 'templateKey';

      // Act
      appendContentBtn().click();
      await fixture.whenStable();

      // Assert
      expect(layoutContainerRenderingService.updateLayoutTemplate).toHaveBeenCalledWith(
        'templateKey' as LayoutTemplatesKey,
      );
    });

    it('should close the dialog', async () => {
      // Act
      appendContentBtn().click();
      await fixture.whenStable();

      // Assert
      expect(closeHandleSpy.close).toHaveBeenCalled();
    });
  });

  describe('removeContent', () => {
    it('should remove all renderings inside removing columns', async () => {
      // Arrange
      const getCurrentLayoutSpy = canvasServicesMock.getCurrentLayout.and.returnValue({
        removeRendering: jasmine.createSpy('removeRendering'),
      } as any);
      layoutContainerRenderingService.getRenderingsInsideRemovingColumn.and.resolveTo([
        {
          instanceId: '123',
          id: '456',
          placeholderKey: 'placeholder1',
          dataSource: 'ds1',
          parameters: { param1: 'value1' },
        },
      ]);

      // Act
      deleteContentBtn().click();
      await fixture.whenStable();

      // Assert
      expect(layoutContainerRenderingService.getRenderingsInsideRemovingColumn).toHaveBeenCalledWith(1);
      expect(getCurrentLayoutSpy().removeRendering).toHaveBeenCalledWith('123', true, false);
    });

    it('should call updateLayoutTemplate with the templateKey', async () => {
      // Arrange
      sut.templateKey = 'templateKey';

      // Act
      deleteContentBtn().click();
      await fixture.whenStable();

      // Assert
      expect(layoutContainerRenderingService.updateLayoutTemplate).toHaveBeenCalledWith(
        'templateKey' as LayoutTemplatesKey,
      );
    });

    it('should close the dialog', async () => {
      // Act
      deleteContentBtn().click();
      await fixture.whenStable();

      // Assert
      expect(closeHandleSpy.close).toHaveBeenCalled();
    });
  });
});
