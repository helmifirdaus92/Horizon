/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TenantPageTemplate } from 'app/page-design/page-templates.types';

@Component({
  selector: 'app-insert-options-configuration',
  templateUrl: './insert-options-configuration.component.html',
  styleUrls: ['./insert-options-configuration.component.scss'],
})
export class InsertOptionsConfigurationComponent implements OnInit {
  @Input() templatesList: TenantPageTemplate[] = [];
  @Input() selectedTemplateId = '';

  @Output() childInsertOptions = new EventEmitter<string[]>();
  @Output() parentInsertOptions = new EventEmitter<string[]>();

  selectedTemplate: TenantPageTemplate | undefined;
  childInsertOptionsList: string[] | undefined;
  parentInsertOptionsList: string[] | undefined;
  isParentOfTabDisabled = false;

  ngOnInit() {
    this.selectedTemplate = this.templatesList.find((t) => t.template.templateId === this.selectedTemplateId);
    this.childInsertOptionsList = this.selectedTemplate?.template.standardValuesItem?.insertOptions?.map(
      (option) => option.templateId,
    );
    this.parentInsertOptionsList = this.templatesList
      .filter((t) =>
        t.template.standardValuesItem?.insertOptions?.some((option) => option.templateId === this.selectedTemplateId),
      )
      .map((t) => t.template.templateId);

    if (this.selectedTemplate && !this.selectedTemplate.template.standardValuesItem?.access?.canWrite) {
      this.isParentOfTabDisabled = true;
    }
  }

  isChildOf(id: string) {
    if (this.parentInsertOptionsList) {
      return this.parentInsertOptionsList.some((templateId) => templateId === id);
    }

    return false;
  }

  isParentOf(id: string) {
    if (this.childInsertOptionsList) {
      return this.childInsertOptionsList?.some((templateId) => templateId === id);
    }
    return false;
  }

  updateChildInsertOptions(isChecked: boolean, id: string) {
    if (id === this.selectedTemplateId) {
      this.updateSelfInsertOption(isChecked);
      return;
    }

    if (isChecked) {
      this.childInsertOptionsList ??= [];
      if (!this.childInsertOptionsList.includes(id)) {
        this.childInsertOptionsList.push(id);
      }
    } else {
      this.childInsertOptionsList = this.childInsertOptionsList?.filter((templateId) => templateId !== id);
    }

    this.childInsertOptions.emit(this.childInsertOptionsList);
  }

  updateParentInsertOptions(isChecked: boolean, id: string) {
    if (id === this.selectedTemplateId) {
      this.updateSelfInsertOption(isChecked);
      return;
    }

    if (isChecked) {
      this.parentInsertOptionsList ??= [];
      if (!this.parentInsertOptionsList.includes(id)) {
        this.parentInsertOptionsList.push(id);
      }
    } else {
      this.parentInsertOptionsList = this.parentInsertOptionsList?.filter((templateId) => templateId !== id);
    }

    this.parentInsertOptions.emit(this.parentInsertOptionsList);
  }

  private updateSelfInsertOption(isChecked: any) {
    if (isChecked) {
      this.childInsertOptionsList ??= [];
      this.parentInsertOptionsList ??= [];

      if (!this.childInsertOptionsList.includes(this.selectedTemplateId)) {
        this.childInsertOptionsList.push(this.selectedTemplateId);
      }
      if (!this.parentInsertOptionsList.includes(this.selectedTemplateId)) {
        this.parentInsertOptionsList.push(this.selectedTemplateId);
      }
    } else {
      this.childInsertOptionsList = this.childInsertOptionsList?.filter(
        (templateId) => templateId !== this.selectedTemplateId,
      );
      this.parentInsertOptionsList = this.parentInsertOptionsList?.filter(
        (templateId) => templateId !== this.selectedTemplateId,
      );
    }

    this.childInsertOptions.emit(this.childInsertOptionsList);
    this.parentInsertOptions.emit(this.parentInsertOptionsList);
  }
}
