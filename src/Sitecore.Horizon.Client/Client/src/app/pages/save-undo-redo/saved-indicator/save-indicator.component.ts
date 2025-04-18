/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SaveService } from 'app/editor/shared/save/save.service';
import { environment } from 'environments/environment';
import { EMPTY, Observable, of } from 'rxjs';
import { delay, map, pairwise, startWith, switchMap, timestamp } from 'rxjs/operators';

@Component({
  selector: 'app-save-indicator',
  template: `
    <ng-container *ngIf="savedStateIcon$ | async; let savedState">
      <ng-spd-saved-indicator
        [class.error]="savedState === 'error'"
        [title]="savedStateText$ | async"
        [state]="savedState"
      ></ng-spd-saved-indicator>
    </ng-container>
  `,
  styleUrls: ['./save-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveIndicatorComponent implements OnInit {
  savedStateIcon$: Observable<'saved' | 'saving' | 'error'> = EMPTY;
  savedStateText$: Observable<string> = EMPTY;

  constructor(
    private saveService: SaveService,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.savedStateIcon$ = this.saveService.saveState$.pipe(
      map((value) => (value === 'no-changes' ? 'saved' : value)),
      // eslint-disable-next-line @typescript-eslint/prefer-as-const
      startWith('saved' as 'saved'),
      timestamp(),
      pairwise(),
      switchMap(([{ value: before, timestamp: timeBefore }, { value, timestamp: timeNow }]) => {
        if (before === 'saving' && value === 'saved') {
          const elapsedTime = timeNow - timeBefore;
          if (elapsedTime < 300) {
            return of(value).pipe(delay(300 - elapsedTime));
          }
        }
        return of(value);
      }),
    );

    this.savedStateText$ = this.saveService.saveState$.pipe(
      switchMap((state) => {
        switch (state) {
          case 'error':
            return this.translate.get('EDITOR.SAVE.ERRORS.UNABLE_TO_SAVE');
          case 'saving':
            return this.translate.get('EDITOR.SAVE.PROGRESS');
          case 'saved':
            // eslint-disable-next-line no-case-declarations
            const datetime = new Date(Date.now()).toLocaleTimeString(environment.systemLang);
            return this.translate.get('EDITOR.SAVE.COMPLETE', { datetime });
          case 'no-changes':
            return this.translate.get('EDITOR.SAVE.NO_CHANGES');
        }
      }),
    );
  }
}
