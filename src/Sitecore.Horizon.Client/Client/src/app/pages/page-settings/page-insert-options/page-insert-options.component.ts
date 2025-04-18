/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PageTemplatesService } from 'app/page-design/page-templates.service';
import { TenantPageTemplate } from 'app/page-design/page-templates.types';
import { ContextService } from 'app/shared/client-state/context.service';
import { BaseItemDalService } from 'app/shared/graphql/item.dal.service';
import { Item, ItemInsertOption } from 'app/shared/graphql/item.interface';
import { arraysContentIsEqual } from 'app/shared/utils/array.utils';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-page-insert-options',
  templateUrl: './page-insert-options.component.html',
  styleUrls: ['./page-insert-options.component.scss'],
})
export class PageInsertOptionsComponent {
  @Input() isAccordionOpen = false;
  @Output() accordionOpenChange = new EventEmitter<boolean>();

  page?: Item;
  pageInsertOptions: ItemInsertOption[] = [];
  updatedPageInsertOptions: ItemInsertOption[] | null = null;

  templatesList?: TenantPageTemplate[];
  pageTemplate?: TenantPageTemplate;
  pageTemplateInsertOptions: ItemInsertOption[] = [];

  isChanged = false;
  isLoading = true;
  reset = false;
  apiErrorMessage: string | null = null;

  constructor(
    private readonly contextService: ContextService,
    private readonly pageTemplatesService: PageTemplatesService,
    private readonly itemDalService: BaseItemDalService,
  ) {}

  async getItemInsetOptions(isOpen: boolean): Promise<void> {
    if (this.isAccordionOpen) {
      this.isLoading = true;

      this.page = await this.contextService.getItem();
      this.pageInsertOptions = await firstValueFrom(
        this.itemDalService.getItemInsertOptions(
          this.page.id,
          'page',
          this.contextService.language,
          this.contextService.siteName,
        ),
      );
      this.updatedPageInsertOptions = [...this.pageInsertOptions];

      this.templatesList = await firstValueFrom(
        this.pageTemplatesService.getTenantPageTemplates(this.contextService.siteName),
      );
      this.pageTemplate = this.templatesList.find((t) => t.template.templateId === this.page?.template?.id);
      if (this.pageTemplate?.template.standardValuesItem?.insertOptions) {
        this.pageTemplateInsertOptions = this.pageTemplate?.template.standardValuesItem?.insertOptions
          .filter((option) => this.templatesList?.some((t) => t.template.templateId === option.templateId))
          .map((option) => ({ id: option.templateId, displayName: option.name || 'undefined' }));
      }
      this.isLoading = false;
    }
    this.accordionOpenChange.emit(isOpen);
  }

  isPageInsertOption(templateId: string) {
    return this.pageInsertOptions?.some((o) => o.id === templateId);
  }

  updatePageInsertOptions(check: boolean, templateId: string, templateName: string) {
    this.updatedPageInsertOptions ??= [];
    if (check) {
      this.updatedPageInsertOptions.push({ id: templateId, displayName: templateName });
    } else {
      this.updatedPageInsertOptions = this.updatedPageInsertOptions.filter((option) => option.id !== templateId);
    }

    this.isChanged = !arraysContentIsEqual(this.pageInsertOptions, this.updatedPageInsertOptions, 'id');
    this.apiErrorMessage = null;
    this.reset = false;
  }

  async saveChanges() {
    if (!this.page?.id) {
      return;
    }

    this.isLoading = true;
    const result = await firstValueFrom(
      this.pageTemplatesService.updatePageInsertOptions(
        this.page.id,
        this.updatedPageInsertOptions === null
          ? null
          : this.updatedPageInsertOptions.map((o) => {
              return { templateId: o.id };
            }),
      ),
    );

    if (result.successful) {
      if (this.updatedPageInsertOptions === null) {
        this.updatedPageInsertOptions = [...this.pageTemplateInsertOptions];
      }
      this.pageInsertOptions = [...this.updatedPageInsertOptions];
    } else {
      this.apiErrorMessage = result.errorMessage;
    }

    this.isChanged = false;
    this.isLoading = false;
  }

  restoreDefaultInsertOptions() {
    this.updatedPageInsertOptions = null;
    this.saveChanges();
    this.reset = true;
  }
}
