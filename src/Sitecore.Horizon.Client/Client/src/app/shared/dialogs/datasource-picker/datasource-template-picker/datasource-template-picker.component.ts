/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ContextService } from 'app/shared/client-state/context.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { ItemInsertOption, ItemTemplate } from 'app/shared/graphql/item.interface';
import { normalizeGuid } from 'app/shared/utils/utils';
import { combineLatest, EMPTY, Observable, of, ReplaySubject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { DatasourceDalService, RenderingDefinition } from '../datasource.dal.service';

export type TemplatePickerResult = { kind: 'Cancel' } | { kind: 'OK'; templateId: string };
export const PageDataItemId = '1c82e550-ebcd-4e5d-8abd-d50d0809541e';

@Component({
  selector: 'app-datasource-template-picker',
  templateUrl: './datasource-template-picker.component.html',
  styleUrls: ['./datasource-template-picker.component.scss'],
})
export class DatasourceTemplatePickerComponent implements OnInit {
  @Input() set renderingDefinition(val: RenderingDefinition | undefined) {
    this.renderingDefinition$.next(val);
  }
  @Input() set item(val: { id: string; template?: { id: string; baseTemplateIds: string[] } } | undefined) {
    this.item$.next(val || { id: '', template: { id: '', baseTemplateIds: [] } });
  }

  @Output()
  readonly result = new EventEmitter<TemplatePickerResult>();

  insertOptions$: Observable<ItemInsertOption[]> = EMPTY;
  isLoading = false;

  private readonly renderingDefinition$ = new ReplaySubject<RenderingDefinition | undefined>();
  private readonly item$ = new ReplaySubject<{ id: string; template?: { id: string; baseTemplateIds: string[] } }>();

  constructor(
    private readonly datasourceService: DatasourceDalService,
    private readonly context: ContextService,
    private readonly configurationService: ConfigurationService,
  ) {}

  ngOnInit() {
    this.insertOptions$ = combineLatest([this.item$, this.renderingDefinition$]).pipe(
      tap(() => (this.isLoading = true)),
      switchMap(([item, renderingDefinition]) => {
        // If it's a local page data folder root use data source templates as insert options
        if (
          renderingDefinition &&
          this.isPageDataItem(item.template) &&
          this.configurationService.isRenderingDefinitionIncludesBranchTemplate()
        ) {
          return of(this.templatesToInsertOptions(renderingDefinition.templates));
        }

        // Otherwise use item insert options
        return this.datasourceService.getInsertOptions(item.id, this.context.language, this.context.siteName);
      }),
      tap(() => (this.isLoading = false)),
    );
  }

  close() {
    this.result.next({ kind: 'Cancel' });
  }

  select(option: ItemInsertOption) {
    this.result.next({ kind: 'OK', templateId: option.id });
  }

  private isPageDataItem(template?: { id: string; baseTemplateIds: string[] }): boolean {
    if (!template) {
      return false;
    }

    return (
      normalizeGuid(template.id) === normalizeGuid(PageDataItemId) ||
      template.baseTemplateIds.some((t) => normalizeGuid(t) === normalizeGuid(PageDataItemId))
    );
  }

  private templatesToInsertOptions(templates: ItemTemplate[]): ItemInsertOption[] {
    const hasBranchTemplate = templates.some((template) => template.isBranchTemplate);
    const filteredTemplates = hasBranchTemplate ? templates.filter((template) => template.isBranchTemplate) : templates;
    return filteredTemplates.map((template) => ({
      displayName: template.displayName,
      id: template.id,
    }));
  }
}
