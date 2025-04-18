/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { merge, Subject } from 'rxjs';
import { debounceTime, filter, map, withLatestFrom } from 'rxjs/operators';

@Component({
  selector: 'app-media-action-bar',
  templateUrl: './media-action-bar.component.html',
  styleUrls: ['media-action-bar.component.scss'],
})
export class MediaActionBarComponent implements OnDestroy {
  @Output() searchChange = new EventEmitter<string>();
  @Output() fileChange = new EventEmitter<FileList | null>();
  @Output() refreshItem = new EventEmitter<unknown>();
  @Input() totalMediaItems?: number;
  @Input() hasCreatePermission = false;

  @Input() isLoading = false;

  private readonly search$ = new Subject<string>();
  private readonly submitSearch$ = new Subject<boolean>();

  private readonly lifetime = new Lifetime();
  constructor() {
    this.watchSearch().pipe(takeWhileAlive(this.lifetime)).subscribe(this.searchChange);
  }

  ngOnDestroy(): void {
    this.lifetime.dispose();
  }

  search(value: string) {
    this.search$.next(value);
  }

  submitSearch() {
    this.submitSearch$.next(true);
  }

  onFileUpload(event: Event) {
    if (!event.target) {
      return;
    }
    this.fileChange.emit((event.target as HTMLInputElement).files);
  }

  private watchSearch() {
    const searchAsYouType$ = this.search$.pipe(
      debounceTime(500),
      filter((value) => value === '' || value.length >= 3),
    );

    const searchOnSubmit$ = this.submitSearch$.pipe(
      withLatestFrom(this.search$),
      map(([_, search]) => search),
    );

    return merge(searchAsYouType$, searchOnSubmit$);
  }
}
