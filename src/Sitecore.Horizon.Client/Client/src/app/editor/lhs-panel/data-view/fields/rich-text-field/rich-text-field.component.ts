/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { NgModel } from '@angular/forms';
import { ContextService } from 'app/shared/client-state/context.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { ItemField } from 'app/shared/graphql/item.dal.service';
import { LanguageService } from 'app/shared/site-language/site-language.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { isAbsoluteUrl, isXmcMediaRelativeUrl, makeAbsoluteUrl } from 'app/shared/utils/url.utils';
import { ClassicEditor, EditorConfig } from 'ckeditor5';
import { Subject, debounceTime, firstValueFrom } from 'rxjs';
import { DEFAULT_CONFIG } from './ckeditor-customize/ckeditor-config';
import { CkeditorHandlerService } from './ckeditor-customize/ckeditor-handler.service';

export function convertXmcUrlsToRelative(fieldRawValue: string): string {
  const xmcTenantUrl = ConfigurationService.xmCloudTenant?.url.toLowerCase() || '';
  if (!xmcTenantUrl || !fieldRawValue.toLowerCase().includes(xmcTenantUrl)) {
    return fieldRawValue;
  }

  const toRelativeUrl = (rtValueDocument: Document, attribute: string) => {
    const elements = Array.from(rtValueDocument.querySelectorAll(`[${attribute}]`)).filter((element) =>
      element.getAttribute(attribute)?.toLowerCase().startsWith(xmcTenantUrl),
    );
    elements.forEach((element) => {
      const url = element.getAttribute(attribute);
      if (url && url.toLowerCase().startsWith(xmcTenantUrl)) {
        const relativeUrl = new URL(url).pathname.replace(/^\//, '');
        element.setAttribute(attribute, relativeUrl);
      }
    });
  };
  const valueDocument = new DOMParser().parseFromString(fieldRawValue, 'text/html');
  toRelativeUrl(valueDocument, 'src');
  toRelativeUrl(valueDocument, 'href');

  return valueDocument.body.innerHTML;
}

export function convertXmcUrlsToAbsolute(fieldRawValue: string): string {
  const xmcTenantUrl = ConfigurationService.xmCloudTenant?.url.toLowerCase() || '';
  let isModified = false;
  const toAbsoluteUrl = (rtValueDocument: Document, attribute: string) => {
    const elements = Array.from(rtValueDocument.querySelectorAll(`[${attribute}]`));
    elements.forEach((element) => {
      const url = element.getAttribute(attribute);
      if (url && !isAbsoluteUrl(url) && isXmcMediaRelativeUrl(url)) {
        isModified = true;
        const absoluteUrl = makeAbsoluteUrl(url, xmcTenantUrl);
        element.setAttribute(attribute, absoluteUrl);
      }
    });
  };
  const valueDocument = new DOMParser().parseFromString(fieldRawValue, 'text/html');
  toAbsoluteUrl(valueDocument, 'src');
  toAbsoluteUrl(valueDocument, 'href');

  return isModified ? valueDocument.body.innerHTML : fieldRawValue;
}

/* eslint-disable @angular-eslint/use-component-view-encapsulation */
@Component({
  selector: 'app-rich-text-field',
  templateUrl: './rich-text-field.component.html',
  styleUrl: './rich-text-field.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class RichTextFieldComponent implements OnInit, AfterViewInit {
  private xmcTenantUrl = ConfigurationService.xmCloudTenant?.url.toLowerCase() || '';
  private latestValue: string = '';

  public config: EditorConfig = {}; // CKEditor needs the DOM tree before calculating the configuration.
  public Editor = ClassicEditor;
  public isViewInitialized = false;

  @Input({ required: true }) set currentValue(value: string) {
    if (this.latestValue === value) {
      return;
    }
    this.latestValue = value;

    this.modelValue = convertXmcUrlsToAbsolute(value);
  }

  @Input({ required: true }) field: ItemField;
  @Input() isInlineEditing: boolean = false;

  @Output() valueChange = new EventEmitter<{ rawValue: string }>();
  @Output() fieldBlur = new EventEmitter<{ rawValue: string }>();

  private valueChangeSubject = new Subject<{ rawValue: string }>();
  modelValue = '';

  private parser = new DOMParser();
  private readonly lifetime = new Lifetime();

  constructor(
    private readonly ckeditorHandlerService: CkeditorHandlerService,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly languageService: LanguageService,
    private readonly contextService: ContextService,
  ) {}

  ngOnInit(): void {
    this.valueChangeSubject.pipe(debounceTime(1000), takeWhileAlive(this.lifetime)).subscribe(() => {
      const rawValue = this.normalizeValue();
      this.valueChange.emit({ rawValue });
    });
  }

  async ngAfterViewInit() {
    this.config = DEFAULT_CONFIG;

    // Provide context language to CKE to accommodate non-latin languages specifics. E.g. Arabic => rtl.
    const languageIso = await firstValueFrom(
      this.languageService.getLanguageIsoFormat(this.contextService.language),
    ).catch(() => this.contextService.language);
    this.config.language = {
      content: languageIso,
    };

    this.isViewInitialized = true;
    this.changeDetector.detectChanges();
  }

  onEditorReady(editor: ClassicEditor) {
    this.ckeditorHandlerService.registerCustomPluginEvents(editor);
  }

  isFieldValid(field: ItemField): boolean {
    return field.validation.every((rule) => rule.valid);
  }

  onInputChange(textModel: NgModel) {
    if (!textModel.dirty || textModel.errors) {
      return;
    }
    this.valueChangeSubject.next({ rawValue: this.modelValue });
  }

  onBlur(textModel: NgModel) {
    if (!textModel.dirty || textModel.errors) {
      return;
    }

    const rawValue = this.normalizeValue();
    this.valueChange.emit({ rawValue });
  }

  private normalizeValue(): string {
    let rawValue = convertXmcUrlsToRelative(this.modelValue);
    rawValue = this.processLinks(rawValue);
    return rawValue;
  }

  private processLinks(fieldRawValue: string): string {
    if (!this.xmcTenantUrl) {
      return fieldRawValue;
    }

    const valueDocument = this.parser.parseFromString(fieldRawValue, 'text/html');
    const linkElements = Array.from(valueDocument.querySelectorAll('a[target=_blank]'));

    linkElements.forEach((link) => {
      // set title attribute as XMC validation requires it
      if (!link.getAttribute('title') && link.textContent) {
        link.setAttribute('title', link.textContent);
      }
    });
    return valueDocument.body.innerHTML;
  }
}
