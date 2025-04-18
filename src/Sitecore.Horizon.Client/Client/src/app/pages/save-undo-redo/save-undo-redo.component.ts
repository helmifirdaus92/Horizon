/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { HistoryService } from 'app/editor/shared/history/history.service';
import { EditingShellHostService } from 'app/shared/editing-shell/editing-shell.host.service';
import { BehaviorSubject, EMPTY, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-save-undo-redo',
  styleUrls: ['./save-undo-redo.component.scss'],
  template: `
    <app-save-indicator></app-save-indicator>

    <button
      type="button"
      class="my-auto btn-square basic"
      ngSpdIconButton
      icon="undo"
      filledIcon="undo"
      aria-label="undo"
      (click)="$event.stopPropagation(); undo()"
      (keyup)="$event.stopPropagation(); undo()"
      [title]="'NAV.UNDO' | translate"
      [disabled]="undoDisabled$ | async"
    ></button>

    <button
      type="button"
      class="my-auto btn-square basic"
      ngSpdIconButton
      icon="redo"
      filledIcon="redo"
      aria-label="redo"
      (click)="$event.stopPropagation(); redo()"
      (keyup)="$event.stopPropagation(); redo()"
      [title]="'NAV.REDO' | translate"
      [disabled]="redoDisabled$ | async"
    ></button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveUndoRedoComponent implements OnInit {
  private readonly inProgress$ = new BehaviorSubject(false);

  undoDisabled$: Observable<boolean> = EMPTY;
  redoDisabled$: Observable<boolean> = EMPTY;

  constructor(
    private readonly historyService: HistoryService,
    private readonly editingShell: EditingShellHostService,
  ) {}

  ngOnInit() {
    this.undoDisabled$ = combineLatest([this.historyService.isInitial$, this.inProgress$]).pipe(
      map(([isInitial, isBusy]) => isInitial || isBusy),
    );

    this.redoDisabled$ = combineLatest([this.historyService.isLatest$, this.inProgress$]).pipe(
      map(([isLatest, isBusy]) => isLatest || isBusy),
    );
  }

  async undo(): Promise<void> {
    this.inProgress$.next(true);

    try {
      await this.editingShell.undo();
    } finally {
      this.inProgress$.next(false);
    }
  }

  async redo(): Promise<void> {
    this.inProgress$.next(true);

    try {
      await this.editingShell.redo();
    } finally {
      this.inProgress$.next(false);
    }
  }
}
