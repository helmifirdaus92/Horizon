/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { PageTemplatesService } from 'app/page-design/page-templates.service';
import { StandardValuesItem, TenantPageTemplate } from 'app/page-design/page-templates.types';
import { ContextService } from 'app/shared/client-state/context.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class InsertOptionsConfigurationService {
  constructor(
    private readonly pageTemplatesService: PageTemplatesService,
    private readonly contextService: ContextService,
  ) {}

  async getTenantPageTemplatesWithStandardValues(): Promise<TenantPageTemplate[]> {
    const templatesList = await firstValueFrom(
      this.pageTemplatesService.getTenantPageTemplates(this.contextService.siteName),
    );

    const templateIds: string[] = templatesList
      .filter((t) => !t.template.standardValuesItem)
      .map((t) => t.template.templateId);

    if (!templateIds.length) {
      return templatesList;
    }

    const result = await firstValueFrom(this.pageTemplatesService.createTemplatesStandardValuesItems(templateIds));

    // If creation of standard values item failed for one or more template, we won't throw exception,
    // instead will disable insert options configuration on that template
    if (!result.templates) {
      return templatesList;
    }

    // Update template lists with the result of creating StandardValues Item for templates without StandardValues Item
    result.templates.forEach((templateWithStandardValues) => {
      const templateWithoutStandardValues = templatesList.find(
        (t) => t.template.templateId === templateWithStandardValues.templateId,
      );

      if (templateWithoutStandardValues) {
        templateWithoutStandardValues.template.standardValuesItem = templateWithStandardValues.standardValuesItem;
      }
    });

    return templatesList;
  }

  async updateTemplateInsertOptions(
    template: TenantPageTemplate,
    templatesList: TenantPageTemplate[],
    childInsertOptions?: string[],
    parentInsertOptions?: string[],
  ): Promise<{ success: boolean; errorMessage?: string }> {
    let standardValuesItemUpdates: StandardValuesItem[] = [];

    if (childInsertOptions) {
      standardValuesItemUpdates = standardValuesItemUpdates.concat(
        this.addChildInsertOptionsUpdates(template, templatesList, childInsertOptions),
      );
    }

    if (parentInsertOptions) {
      standardValuesItemUpdates = standardValuesItemUpdates.concat(
        this.addParentInsertOptionsUpdates(template, templatesList, parentInsertOptions),
      );
    }

    const updateInsertOptionsResult = await firstValueFrom(
      this.pageTemplatesService.updateStandardValuesInsertOptions(standardValuesItemUpdates),
    );

    if (updateInsertOptionsResult.errorMessage) {
      return { success: false, errorMessage: updateInsertOptionsResult.errorMessage };
    }

    return { success: true };
  }

  private addChildInsertOptionsUpdates(
    template: TenantPageTemplate,
    templatesList: TenantPageTemplate[],
    childInsertOptions: string[],
  ) {
    const standardValuesItemUpdates: StandardValuesItem[] = [];

    const standardValueItem = templatesList.find((t) => t.template.templateId === template.template.templateId)
      ?.template.standardValuesItem;

    if (standardValueItem) {
      standardValueItem.insertOptions = childInsertOptions.map((id) => {
        return { templateId: id };
      });

      standardValuesItemUpdates.push({
        itemId: standardValueItem.itemId,
        insertOptions: standardValueItem.insertOptions,
      });
    }

    return standardValuesItemUpdates;
  }

  private addParentInsertOptionsUpdates(
    template: TenantPageTemplate,
    templatesList: TenantPageTemplate[],
    parentInsertOptions: string[],
  ) {
    const standardValuesItemUpdates: StandardValuesItem[] = [];

    templatesList.forEach((t) => {
      const templateStandardValuesItem = t.template.standardValuesItem;
      if (!templateStandardValuesItem) {
        return;
      }

      const existingOption = templateStandardValuesItem.insertOptions?.find(
        (option) => option.templateId === template.template.templateId,
      );

      if (parentInsertOptions.includes(t.template.templateId)) {
        if (!existingOption) {
          templateStandardValuesItem.insertOptions ??= [];
          templateStandardValuesItem.insertOptions.push({ templateId: template.template.templateId });
          standardValuesItemUpdates.push({
            itemId: templateStandardValuesItem.itemId,
            insertOptions: templateStandardValuesItem.insertOptions,
          });
        }
      } else {
        if (existingOption) {
          const options = templateStandardValuesItem.insertOptions?.filter(
            (option) => option.templateId !== template.template.templateId,
          );
          standardValuesItemUpdates.push({
            itemId: templateStandardValuesItem.itemId,
            insertOptions: options,
          });
        }
      }
    });

    return standardValuesItemUpdates;
  }
}
