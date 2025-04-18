/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ContextService } from 'app/shared/client-state/context.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { BaseItemDalService, ItemField, ItemFieldValidationResult } from 'app/shared/graphql/item.dal.service';
import { Field } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { isSameGuid, isSameItemVersion } from 'app/shared/utils/utils';
import { BehaviorSubject, debounceTime, firstValueFrom, Observable, Subject } from 'rxjs';
import { FieldState } from 'sdk/contracts/editing-shell.contract';
import { Item } from 'app/shared/graphql/item.interface';
import { DataViewSaveService } from './data-view.save.service';
import { FieldsTrackerService } from './fields-tracker.service';

export interface itemFieldsSection {
  name: string;
  fields: ItemField[];
}

@Component({
  selector: 'app-data-view',
  templateUrl: './data-view.component.html',
  styleUrl: './data-view.component.scss',
  providers: [DataViewSaveService],
})
export class DataViewComponent implements OnInit, OnDestroy {
  private _isLoadingDatasources = false;
  private _fieldsSections$: BehaviorSubject<itemFieldsSection[]> = new BehaviorSubject<itemFieldsSection[]>([]);
  fieldsSections: Observable<itemFieldsSection[]> = this._fieldsSections$.asObservable();
  private fields: ItemField[] = [];

  private saveWithDebounce$ = new Subject<ItemField>();
  private readonly lifetime = new Lifetime();
  private sections: itemFieldsSection[] = [];

  @Input() mode: 'pageItem' | 'dataSourceItem' = 'pageItem';
  @Input() size?: 'sm' | 'lg';
  private _item: Pick<Item, 'id' | 'language' | 'version'>;
  @Input() set item(value: Pick<Item, 'id' | 'language' | 'version'>) {
    if (!value || isSameItemVersion(value, this._item)) {
      return;
    }

    this._item = value;
    this.init();
  }

  mappedSelectedItemsList: Array<{ displayName: string; itemId: string }> = [];

  draggingIndex: number | undefined;
  initialOrder: string[] = [];
  isLoading = false;

  itemValidationResult = ItemFieldValidationResult;

  get item(): { id: string; language: string; version?: number } {
    return this._item;
  }

  constructor(
    private readonly fieldsTrackerService: FieldsTrackerService,
    private readonly itemDalService: BaseItemDalService,
    private readonly dataViewSaveService: DataViewSaveService,
    private readonly contextService: ContextService,
    private readonly translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.saveWithDebounce$.pipe(debounceTime(1000), takeWhileAlive(this.lifetime)).subscribe((field) => {
      this.save(field);
    });

    this.fieldsTrackerService
      .watchFieldsValueChange()
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe((fields) => {
        fields.forEach((field) => {
          const fieldToUpdate = this.findField(field);
          if (fieldToUpdate && !this.hasSameFieldValue(fieldToUpdate, field)) {
            fieldToUpdate.value.rawValue = field.value.rawValue ?? '';
            fieldToUpdate.containsStandardValue = field.reset;
          }
        });
      });

    this.fieldsTrackerService
      .watchFieldsSaved()
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe((fields) => {
        fields.forEach(async (savedField) => {
          const fieldToUpdate = this.findField(savedField);
          if (fieldToUpdate) {
            const field = await firstValueFrom(
              this.itemDalService.fetchItemField(
                savedField.fieldId,
                savedField.itemId,
                this.item.language,
                savedField.itemVersion,
              ),
            );
            if (fieldToUpdate && !this.hasSameValidationErrors(fieldToUpdate, field)) {
              this.adaptXmcValidationMessages([fieldToUpdate]);
              fieldToUpdate.validation = field.validation;
            }
          }
        });
      });
  }

  ngOnDestroy(): void {
    this.lifetime.dispose();
  }

  private async init() {
    this.isLoading = true;

    this.fields = await this.itemDalService.fetchItemFields(this.item.id, this.item.language, this.item.version);
    this.adaptXmcValidationMessages(this.fields);

    this.isLoading = false;
    this.notifyInitialItemState(this.fields);

    this.sections = this.organizeFieldsBySection();
    this._fieldsSections$.next(this.sections);
  }

  private findField(field: FieldState) {
    return this.fields.find(
      (f) =>
        isSameGuid(field.fieldId, f.templateField.templateFieldId) &&
        isSameGuid(field.itemId, f.item.id) &&
        field.itemVersion == f.item.version,
    );
  }

  private hasSameFieldValue(itemField: ItemField, fieldState: FieldState) {
    return (
      itemField.value.rawValue === fieldState.value.rawValue && itemField.containsStandardValue === fieldState.reset
    );
  }

  private hasSameValidationErrors(itemField1: ItemField, itemField2: ItemField) {
    return (
      itemField1.validation.length === itemField2.validation.length &&
      itemField1.validation.every((v1) => itemField2.validation.some((v2) => v1.message === v2.message))
    );
  }

  private notifyInitialItemState(initialFields: ItemField[]) {
    if (initialFields.length === 0) {
      return;
    }

    const fields: Field[] = initialFields.map((field) => ({
      itemId: field.item.id,
      itemVersion: field.item.version,
      revision: field.item.revision,
      fieldId: field.templateField.templateFieldId,
      value: { rawValue: field.value.rawValue },
      reset: field.containsStandardValue,
      validationErrors: field.validation.map((v) => v.message),
    }));

    this.fieldsTrackerService.notifyInitialItemFieldsState(fields);
  }

  onInputChange(textModel: NgModel, field: ItemField, debounce: boolean) {
    if (!textModel.dirty || textModel.errors) {
      return;
    }

    if (debounce) {
      this.saveWithDebounce$.next(field);
    } else {
      this.save(field);
    }
  }

  saveWithDebounce(field: ItemField, value: { rawValue: string }) {
    if (field.value.rawValue !== value.rawValue) {
      field.value = value;
      this.saveWithDebounce$.next(field);
    }
  }

  saveWithoutDebounce(field: ItemField, value: { rawValue: string }) {
    if (field.value.rawValue !== value.rawValue) {
      field.value = value;
      this.save(field);
    }
  }

  resetToStandardValue(field: ItemField) {
    this.save(field, true);
  }

  private save(field: ItemField, reset = false): void {
    field.containsStandardValue = reset;

    const fieldState: FieldState = {
      value: field.value,
      reset,
      fieldId: field.templateField.templateFieldId,
      itemId: field.item.id,
      itemVersion: field.item.version,
    };
    this.dataViewSaveService.save(fieldState, field.templateField.type);
  }

  async fetchNextDatasourceBatch(field: ItemField) {
    if (this._isLoadingDatasources || !field.templateField.dataSourcePageInfo.hasNextPage) {
      return;
    }

    this._isLoadingDatasources = true;
    const nextBatch = await firstValueFrom(
      this.itemDalService.fetchItemField(
        field.templateField.templateFieldId,
        this.item.id,
        this.item.language,
        this.item.version,
        field.templateField.dataSourcePageInfo.endCursor,
      ),
    );

    field.templateField.dataSourcePageInfo = nextBatch.templateField.dataSourcePageInfo;
    field.templateField.dataSource.push(...nextBatch.templateField.dataSource);
    this._isLoadingDatasources = false;
  }

  private organizeFieldsBySection(): itemFieldsSection[] {
    const sections: itemFieldsSection[] = [];

    this.fields.forEach((f) => {
      const section = sections.find((s) => s.name === f.templateField.sectionName);
      if (section) {
        section.fields.push(f);
      } else {
        sections.push({ name: f.templateField.sectionName, fields: [f] });
      }
    });

    sections.forEach((section) => {
      section.fields.sort((a, b) =>
        a.templateField.type === 'Single-Line Text' ? -1 : b.templateField.type === 'Single-Line Text' ? 1 : 0,
      );
    });

    return sections;
  }

  isFieldValid(field: ItemField): boolean {
    return field.validation.every((result) => result.valid);
  }

  selectedDropLinkItem(field: ItemField): string | undefined {
    const assignedDs = field.templateField.dataSource.find((ds) => isSameGuid(ds.itemId, field.value.rawValue));
    if (assignedDs) {
      return assignedDs.itemId;
    }
    return undefined;
  }

  selectedDropListItem(field: ItemField): string | undefined {
    const assignedDs = field.templateField.dataSource.find(
      (ds) => ds.displayName.toLowerCase() === field.value.rawValue.toLowerCase(),
    );
    if (assignedDs) {
      return assignedDs.displayName;
    }
    return undefined;
  }

  onDragStart(event: DragEvent, index: number): void {
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
    this.draggingIndex = index;
    this.initialOrder = this.mappedSelectedItemsList.map((item) => item.itemId);
  }

  onDragEnter(event: DragEvent): void {
    const dragItem = event.target as HTMLElement;
    if (dragItem) {
      dragItem.classList.add('placeholder');
    }
  }

  onDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    if (this.draggingIndex !== undefined && this.draggingIndex !== index) {
      this.reorderItem(this.draggingIndex, index);
    }
  }

  onDragLeave(event: DragEvent): void {
    const dragItem = event.target as HTMLElement;
    if (dragItem) {
      dragItem.classList.remove('placeholder');
    }
  }

  onDrop(event: DragEvent, field: ItemField) {
    const dragItem = event.target as HTMLElement;
    if (dragItem) {
      dragItem.classList.remove('placeholder');
    }

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';

      const currentOrder = this.mappedSelectedItemsList.map((item) => item.itemId);
      const isOrderChanged = this.initialOrder.some((itemId, index) => itemId !== currentOrder[index]);

      if (isOrderChanged) {
        const normalizedFieldValue = this.mappedSelectedItemsList
          .map((item) => `{${item.itemId.toUpperCase()}}`)
          .join('|');

        if (field.value.rawValue !== normalizedFieldValue) {
          field.value.rawValue = normalizedFieldValue;
          this.save(field);
        }
      }
      this.draggingIndex = undefined;
    }
  }

  onDragEnd(event: DragEvent) {
    this.draggingIndex = undefined;
    const dragItem = event.target as HTMLElement;
    if (dragItem) {
      dragItem.classList.remove('placeholder');
    }
  }

  private reorderItem(fromIndex: number, toIndex: number) {
    const itemToBeReordered = this.mappedSelectedItemsList.splice(fromIndex, 1)[0];
    this.mappedSelectedItemsList.splice(toIndex, 0, itemToBeReordered);

    this.draggingIndex = toIndex;
  }

  shouldUseBasicHeader(field: ItemField): boolean {
    return (
      field.templateField.type !== 'Taglist' &&
      field.templateField.type !== 'Treelist' &&
      field.templateField.type !== 'Multiroot Treelist' &&
      field.templateField.type !== 'Multilist' &&
      field.templateField.type !== 'Image' &&
      field.templateField.type !== 'TreelistEx'
    );
  }

  wrapWithBrackets(value: string): string {
    return `{${value}}`;
  }

  openItemInContentEditor(): void {
    const platformUrl = ConfigurationService.xmCloudTenant?.url;
    const contextData =
      this.mode === 'pageItem'
        ? {
            itemId: this.contextService.itemId,
            language: this.contextService.language,
            version: this.contextService.itemVersion,
          }
        : {
            itemId: this.item?.id,
            language: this.item?.language,
            version: this.item?.version,
          };

    const itemId = contextData.itemId?.replace(/[{}]/g, '');

    if (!itemId || !platformUrl) {
      console.warn('Missing required parameters for Content Editor URL.');
      return;
    }

    const queryParams = new URLSearchParams({ sc_bw: '1', fo: itemId });

    if (contextData.language) {
      queryParams.append('lang', contextData.language);
    }

    if (contextData.version) {
      queryParams.append('vs', contextData.version.toString());
    }

    const contentEditorLink = `${platformUrl}sitecore/shell/Applications/Content%20Editor.aspx?${queryParams}`;

    window.open(contentEditorLink, '_blank');
  }

  private adaptXmcValidationMessages(fields: ItemField[]) {
    fields.forEach((field) => {
      field.validation.forEach(async (validation) => {
        if (validation.validator === 'XHtml Validator') {
          const message = await firstValueFrom(this.translateService.get('EDITOR.SAVE.ERRORS.XHTML_VALIDATOR_MESSAGE'));
          validation.message = message;
        }
      });
    });
  }
}
