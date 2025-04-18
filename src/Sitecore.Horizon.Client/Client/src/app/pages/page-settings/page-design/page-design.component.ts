/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { PageTemplatesService } from 'app/page-design/page-templates.service';
import { Item, ItemWithSite, TenantPageTemplate } from 'app/page-design/page-templates.types';
import { ContextService } from 'app/shared/client-state/context.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { normalizeGuid } from 'app/shared/utils/utils';
import { EMPTY, Observable, firstValueFrom, map } from 'rxjs';

@Component({
  selector: 'app-page-design',
  templateUrl: './page-design.component.html',
  styleUrls: ['page-design.component.scss'],
})
export class PageDesignComponent implements OnDestroy {
  @Input() isAccordionOpen = false;
  @Output() accordionOpenChange = new EventEmitter<boolean>();

  templatePageDesign?: Item | ItemWithSite | null;
  currentPageDesign?: Item | ItemWithSite | null;
  selectedPageDesign?: Item | ItemWithSite | null;
  pageDesigns$: Observable<ItemWithSite[]> = EMPTY;
  pageTemplate$: Observable<TenantPageTemplate | undefined> = EMPTY;
  useDesignFromTemplate = true;
  dropDownToggle = false;
  useDesignFromTemplateDropDown = false;
  buttonsVisible = false;

  private readonly lifetime = new Lifetime();
  private contextItem?: Item;

  get canWrite(): boolean {
    return this.contextItem?.access.canWrite ?? false;
  }

  constructor(
    private readonly contextService: ContextService,
    private readonly pageTemplatesService: PageTemplatesService,
  ) {}

  async getPageDesign(isOpen: boolean): Promise<void> {
    if (this.isAccordionOpen) {
      await this.loadContextItem();

      this.pageDesigns$ = this.pageTemplatesService.getPageDesignsList(this.contextService.siteName);

      if (this.contextItem?.pageDesignId) {
        this.useDesignFromTemplate = false;
        this.getCurrentPageDesign(this.contextItem?.pageDesignId);
      } else if (this.contextItem?.template) {
        this.useDesignFromTemplate = true;
        this.getPageDesignFromTemplate(normalizeGuid(this.contextItem.template.templateId));
      }
    }
    this.accordionOpenChange.emit(isOpen);
  }

  private async loadContextItem(): Promise<void> {
    this.contextItem = await firstValueFrom(
      this.pageTemplatesService.getItemDetails(this.contextService.itemId, this.contextService.language),
    );
  }

  ngOnDestroy() {
    this.lifetime.dispose();
  }

  private getCurrentPageDesign(pageDesignId: string) {
    this.pageDesigns$.pipe(takeWhileAlive(this.lifetime)).subscribe(async (pageDesigns) => {
      this.currentPageDesign = pageDesigns.find((pageDesign) => pageDesign.itemId === pageDesignId);
      if (this.currentPageDesign) {
        this.selectedPageDesign = this.currentPageDesign;
      }
    });
  }

  async restorePageDesign(isChecked: boolean): Promise<void> {
    if (isChecked) {
      this.useDesignFromTemplate = true;
      await firstValueFrom(this.pageTemplatesService.assignPageDesign(this.contextService.itemId, ''));
      this.getPageDesignFromTemplate(this.contextItem?.template?.templateId || '');
      this.buttonsVisible = false;
    } else {
      this.buttonsVisible = true;
      if (this.contextItem && this.contextItem.pageDesignId) {
        this.useDesignFromTemplate = false;
        this.getCurrentPageDesign(this.contextItem.pageDesignId);
      }
    }
  }

  private getPageDesignFromTemplate(templateId: string): void {
    const normalizedTemplateId = normalizeGuid(templateId);
    this.pageTemplate$ = this.pageTemplatesService
      .getTenantPageTemplates(this.contextService.siteName)
      .pipe(map((templates) => templates.find((template) => template.template?.templateId === normalizedTemplateId)));

    this.pageTemplate$.pipe(takeWhileAlive(this.lifetime)).subscribe((pageTemplate) => {
      this.templatePageDesign = pageTemplate?.pageDesign || null;
    });
  }

  selectPageDesign(pageDesignId: string, pageDesigns: ItemWithSite[]) {
    this.selectedPageDesign = pageDesigns.find((pageDesign) => pageDesign.itemId === pageDesignId);
    this.buttonsVisible = true;
  }

  async savePageDesign() {
    this.useDesignFromTemplate = false;

    const designId = this.selectedPageDesign ? `{${this.selectedPageDesign.itemId}}`.toUpperCase() : '';

    await firstValueFrom(this.pageTemplatesService.assignPageDesign(this.contextService.itemId, designId));

    if (this.selectedPageDesign) {
      this.currentPageDesign = this.selectedPageDesign;
      this.buttonsVisible = false;
    } else {
      this.currentPageDesign = undefined;
      this.buttonsVisible = true;
    }
  }

  async cancelSelection() {
    this.pageDesigns$ = this.pageTemplatesService.getPageDesignsList(this.contextService.siteName);
    this.buttonsVisible = false;

    if (this.contextItem?.pageDesignId) {
      this.useDesignFromTemplate = false;
      this.getCurrentPageDesign(this.contextItem.pageDesignId);
    }
  }
}
