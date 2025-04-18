/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ContentTreeService } from 'app/pages/content-tree/content-tree.service';
import { LoggingService } from 'app/shared/logging.service';
import { EMPTY, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CreateFolderService } from './create-folder.service';

interface InsertOption {
  templateId: string;
  displayName: string;
  parentId: string;
}

@Component({
  selector: 'app-create-folder',
  templateUrl: './create-folder.component.html',
  styleUrls: ['./create-folder.component.scss'],
})
export class CreateFolderComponent implements OnInit {
  @Input() parentId = '';

  @Output() back = new EventEmitter<void>();

  insertOptions$: Observable<InsertOption[]> = EMPTY;
  insertOptionsEmpty$: Observable<boolean> = EMPTY;

  isLoading = true;
  slidePanelTitle = '';

  constructor(
    private readonly createFolderService: CreateFolderService,
    private readonly contentTreeService: ContentTreeService,
    private readonly logger: LoggingService,
  ) {}

  ngOnInit() {
    const itemId = this.parentId;

    if (!itemId) {
      this.logger.warn('CreateFolderComponent: itemId is not supplied, failed to getInsertOptions');
      return;
    }

    this.insertOptions$ = this.createFolderService.getInsertOptions(itemId).pipe(
      map((options) => options.map(({ id, displayName }) => ({ displayName, templateId: id, parentId: itemId }))),
      tap(() => (this.isLoading = false)),
    );
    this.insertOptionsEmpty$ = this.insertOptions$.pipe(map((insertOptions) => insertOptions.length === 0));
  }

  selectOption({ templateId, parentId }: InsertOption) {
    this.contentTreeService.addTempCreatedItem(templateId, 'folder', parentId);
    this.goBack();
  }

  goBack() {
    this.back.emit();
  }
}
