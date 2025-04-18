/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { HistoryService } from 'app/editor/shared/history/history.service';
import { EditingShellHostService } from 'app/shared/editing-shell/editing-shell.host.service';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { EMPTY, Observable } from 'rxjs';
import { SaveUndoRedoComponent } from './save-undo-redo.component';

@Component({
  selector: 'app-save-indicator',
  template: `save-indicator`,
})
class MockSaveIndicatorComponent {}

describe(SaveUndoRedoComponent.name, () => {
  let component: SaveUndoRedoComponent;
  let fixture: ComponentFixture<SaveUndoRedoComponent>;

  beforeEach(waitForAsync(() => {
    const historyService = jasmine.createSpyObj<HistoryService>(['undo', 'redo']);
    (historyService.isInitial$ as Observable<boolean>) = EMPTY;
    (historyService.isLatest$ as Observable<boolean>) = EMPTY;

    const editingShellService = jasmine.createSpyObj<EditingShellHostService>({
      undo: Promise.resolve(),
      redo: Promise.resolve(),
    });

    TestBed.configureTestingModule({
      imports: [TranslateModule, TranslateServiceStubModule],
      providers: [
        { provide: HistoryService, useValue: historyService },
        { provide: EditingShellHostService, useValue: editingShellService },
      ],
      declarations: [SaveUndoRedoComponent, MockSaveIndicatorComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveUndoRedoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
