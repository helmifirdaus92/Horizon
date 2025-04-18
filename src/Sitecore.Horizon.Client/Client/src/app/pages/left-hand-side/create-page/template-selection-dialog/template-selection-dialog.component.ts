/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, HostListener, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DialogCloseHandle } from '@sitecore/ng-spd-lib';
import { PageTemplatesService } from 'app/page-design/page-templates.service';
import { TenantPageTemplate } from 'app/page-design/page-templates.types';
import { ContentTreeService } from 'app/pages/content-tree/content-tree.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { BaseItemDalService } from 'app/shared/graphql/item.dal.service';
import { BehaviorSubject, catchError, EMPTY, firstValueFrom, map, Observable, of, switchMap, tap } from 'rxjs';

interface InsertOption {
  templateId: string;
  displayName: string;
  parentId: string;
  thumbnailUrl?: string;
}

@Component({
  selector: 'app-template-selection-dialog',
  templateUrl: './template-selection-dialog.component.html',
  styleUrls: ['./template-selection-dialog.component.scss'],
})
export class TemplateSelectionDialogComponent implements OnInit {
  constructor(
    private readonly closeHandle: DialogCloseHandle,
    private readonly itemDalService: BaseItemDalService,
    private readonly pageTemplatesService: PageTemplatesService,
    private readonly contextService: ContextService,
    private readonly contentTreeService: ContentTreeService,
    private readonly translateService: TranslateService,
  ) {}

  itemId = '';
  itemName = '';
  emptyStateDescription = '';
  insertOptions$: Observable<InsertOption[]> = EMPTY;
  insertOptionsEmpty$: Observable<boolean> = EMPTY;
  pageTemplates$: Observable<TenantPageTemplate[]> = EMPTY;
  isLoading = true;

  selectedItem$ = new BehaviorSubject<InsertOption | undefined>(undefined);

  readonly onSelection = new EventEmitter<boolean>();
  async ngOnInit() {
    if (!this.itemId) {
      console.warn('TemplateSelectionDialogComponent: itemId not supplied, failed to getInsertOptions');
      return;
    }

    this.pageTemplates$ = this.pageTemplatesService.getTenantPageTemplates(this.contextService.siteName).pipe(
      catchError(() => {
        // for non-sxa site
        return of([]);
      }),
    );

    this.insertOptions$ = this.itemDalService
      .getItemInsertOptions(this.itemId, 'page', this.contextService.language, this.contextService.siteName)
      .pipe(
        switchMap((options) =>
          this.pageTemplates$.pipe(
            map((templates) =>
              options.map(({ id, displayName }) => {
                const pageDesignThumbnailUrl = templates.find((pageTemplate) => pageTemplate.template.templateId === id)
                  ?.pageDesign?.thumbnailUrl;
                return { displayName, templateId: id, parentId: this.itemId, thumbnailUrl: pageDesignThumbnailUrl };
              }),
            ),
          ),
        ),
        tap(() => (this.isLoading = false)),
      );

    this.insertOptionsEmpty$ = this.insertOptions$.pipe(map((insertOptions) => insertOptions.length === 0));
    this.emptyStateDescription = await this.getDescription();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  close() {
    this.closeHandle.close();
  }

  selectTemplate() {
    const selectedItem = this.selectedItem$?.value;

    if (selectedItem) {
      this.contentTreeService.addTempCreatedItem(selectedItem.templateId, 'page', selectedItem.parentId);
      this.onSelection.next(true);
      this.onSelection.complete();
      this.close();
    }
  }

  private async getDescription(): Promise<string> {
    const description = await firstValueFrom(
      this.translateService.get('PAGE_DESIGNS.WORKSPACE.NO_INSERT_OPTIONS_ASSIGNED_TO_PAGE', {
        itemName: this.itemName,
      }),
    );

    const helpLinkUrl = 'https://doc.sitecore.com/xmc/en/developers/xm-cloud/assign-or-copy-insert-options.html';
    const helpLinkText = await firstValueFrom(this.translateService.get('PAGE_DESIGNS.WORKSPACE.INSERT_OPTIONS'));
    const helpLink = `<a href="${helpLinkUrl}" target="_blank">${helpLinkText}</a>`;

    return `${description} ${helpLink}`;
  }
}
