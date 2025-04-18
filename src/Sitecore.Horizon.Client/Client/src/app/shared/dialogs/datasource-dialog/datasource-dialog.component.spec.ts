/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, NO_ERRORS_SCHEMA, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule, DialogCloseHandle } from '@sitecore/ng-spd-lib';
import { createSpyObserver, TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { EMPTY, Observable, of } from 'rxjs';
import { DataSourcePickerSelect } from '../datasource-picker/datasource-picker.component';
import { DatasourceDialogComponent } from './datasource-dialog.component';

@Component({
  selector: 'app-datasource-picker',
  template: '',
})
class TestPickerComponent {
  @Input() renderingId$: Observable<string> = EMPTY;
  @Input() rawDatasource$: Observable<string> = EMPTY;
  @Output() readonly selectChange = new EventEmitter<DataSourcePickerSelect>();

  isBusy = false;
}

describe(DatasourceDialogComponent.name, () => {
  const renderingId = 'renderingId';
  const initialSelect = 'initialSelect';
  let sut: DatasourceDialogComponent;
  let fixture: ComponentFixture<DatasourceDialogComponent>;

  let picker: TestPickerComponent;
  let closeHandle: jasmine.SpyObj<DialogCloseHandle>;

  const submitButton = () => fixture.debugElement.query(By.css('ng-spd-dialog-actions button.primary')).nativeElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateServiceStubModule, TranslateModule, ButtonModule],
      declarations: [DatasourceDialogComponent, TestPickerComponent],
      providers: [{ provide: DialogCloseHandle, useValue: jasmine.createSpyObj<DialogCloseHandle>(['close']) }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasourceDialogComponent);
    sut = fixture.componentInstance;

    closeHandle = TestBedInjectSpy(DialogCloseHandle);
    picker = fixture.debugElement.query(By.directive(TestPickerComponent)).componentInstance;

    sut.renderingId$ = of(renderingId);
    sut.initialSelect$ = of(initialSelect);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('WHEN init', () => {
    it('should set data to the picker', () => {
      const renderingIdResult = createSpyObserver();
      const initialSelectResult = createSpyObserver();

      picker.renderingId$.subscribe(renderingIdResult);
      picker.rawDatasource$.subscribe(initialSelectResult);

      expect(renderingIdResult.next).toHaveBeenCalledWith(renderingId);
      expect(initialSelectResult.next).toHaveBeenCalledWith(initialSelect);
    });

    it('should disable "Add selection" button', () => {
      const button = fixture.debugElement.query(By.css('ng-spd-dialog-actions button.primary')).nativeElement;

      expect(button.getAttribute('disabled')).toBe('');
    });
  });

  describe('selection change', () => {
    new Array<boolean>(false, true).forEach((isCompatible) => {
      it(`isCompatible: ${isCompatible} property should properly set submit button state`, () => {
        picker.selectChange.emit({
          id: 'id',
          path: 'path',
          isCompatible,
        });
        fixture.detectChanges();

        const button = submitButton();
        expect(button.getAttribute('disabled') === null).toBe(isCompatible);
      });
    });

    describe('canSelect', () => {
      it('should disable submit button if new selection is the same as the initial selection ', () => {
        sut.initialSelect$ = of('1');
        picker.selectChange.emit({
          id: '1',
          path: 'path',
          isCompatible: true,
        });
        fixture.detectChanges();

        const button = submitButton();
        expect(button.getAttribute('disabled')).toBeDefined();
      });

      it('should disable submit if initial selection is page: and new selection is virtual page template', () => {
        sut.initialSelect$ = of('page:');
        picker.selectChange.emit({
          id: 'id',
          path: 'path',
          isCompatible: true,
          templateId: '83754CB5-0447-4022-906D-BB36718AD183',
        });
        fixture.detectChanges();

        const submitButton = fixture.debugElement.query(By.css('ng-spd-dialog-actions button.primary')).nativeElement;
        expect(submitButton.getAttribute('disabled')).toBeDefined();
      });

      it('should disable submit if initial selection is not page: and new selection is not initial selection', () => {
        sut.initialSelect$ = of('1');
        picker.selectChange.emit({
          id: '2',
          path: 'path',
          isCompatible: true,
        });
        fixture.detectChanges();

        const submitButton = fixture.debugElement.query(By.css('ng-spd-dialog-actions button.primary')).nativeElement;
        expect(submitButton.getAttribute('disabled')).toBeDefined();
      });

      it('should enable submit if initial selection is page: and new selection is not virtual page template', () => {
        sut.initialSelect$ = of('page:');
        picker.selectChange.emit({
          id: 'id',
          path: 'path',
          isCompatible: true,
        });
        fixture.detectChanges();

        const submitButton = fixture.debugElement.query(By.css('ng-spd-dialog-actions button.primary')).nativeElement;
        expect(submitButton.getAttribute('disabled')).toBeNull();
      });
    });
  });

  describe('submit selection', () => {
    it('should emit selection and close the dialog', () => {
      const onSelectSpy = createSpyObserver();
      sut.onSelect.subscribe(onSelectSpy);

      picker.selectChange.emit({
        id: 'id',
        path: 'path',
        isCompatible: true,
      });
      fixture.detectChanges();

      submitButton().click();

      expect(onSelectSpy.next).toHaveBeenCalledWith({ id: 'id', path: 'path', isCompatible: true });
      expect(onSelectSpy.complete).toHaveBeenCalled();
      expect(closeHandle.close).toHaveBeenCalled();
    });

    it('should emit "page:" as a selection if the selected node is virtual page node', () => {
      const onSelectSpy = createSpyObserver();
      sut.onSelect.subscribe(onSelectSpy);

      picker.selectChange.emit({
        id: 'id',
        path: 'path',
        isCompatible: true,
        templateId: '83754CB5-0447-4022-906D-BB36718AD183',
      });
      fixture.detectChanges();

      submitButton().click();

      expect(onSelectSpy.next).toHaveBeenCalledWith({
        id: 'page:',
        path: 'path',
        isCompatible: true,
        templateId: '83754CB5-0447-4022-906D-BB36718AD183',
      });
      expect(onSelectSpy.complete).toHaveBeenCalled();
      expect(closeHandle.close).toHaveBeenCalled();
    });
  });

  describe('close the dialog via pressing Escape', () => {
    it('should close the dialog', () => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          code: 'Escape',
        }),
      );

      expect(closeHandle.close).toHaveBeenCalled();
    });

    describe('WHEN there is a pending NodeChange transaction in the picker', () => {
      it('should NOT close the dialog', () => {
        picker.isBusy = true;

        document.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Escape',
            code: 'Escape',
          }),
        );

        expect(closeHandle.close).not.toHaveBeenCalled();
      });
    });
  });
});
