/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, DebugElement, EventEmitter, Input, NO_ERRORS_SCHEMA, Output } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { FieldChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { Interface } from 'app/shared/utils/lang.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { ReplaySubject } from 'rxjs';
import { RhsEditorMessaging } from '../rhs-editor-messaging';
import { GeneralLinkFieldMessagingService } from './general-link-field-messaging.service';
import { GeneralLinkFieldComponent } from './general-link-field.component';
import { ExternalGeneralLink, GeneralLinkValue } from './general-link.type';
import { GeneralLinkComponent } from './general-link/general-link.component';

const externalLink: ExternalGeneralLink = {
  url: 'linkUrl',
  text: 'text',
  title: 'title',
  class: 'className',
  linktype: 'external',
};

class GeneralLinkFieldMessagingServiceTesting implements Interface<GeneralLinkFieldMessagingService> {
  currentValue$ = new ReplaySubject<GeneralLinkValue | null>();

  init = jasmine.createSpy('init');
  destroy = jasmine.createSpy('destroy');
  set = jasmine.createSpy('save');
  clear = jasmine.createSpy('clear');
}

@Component({
  selector: 'app-general-link',
  template: 'empty',
  providers: [{ provide: GeneralLinkComponent, useExisting: GeneralLinkTestingComponent }],
})
class GeneralLinkTestingComponent {
  @Input() value: GeneralLinkValue | null = null;
  @Output() valueChange = new EventEmitter<GeneralLinkValue>();
}

describe('GeneralLinkFieldComponent', () => {
  let sut: GeneralLinkFieldComponent;
  let fixture: ComponentFixture<GeneralLinkFieldComponent>;
  let messagingService: GeneralLinkFieldMessagingServiceTesting;
  let de: DebugElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GeneralLinkFieldComponent, GeneralLinkTestingComponent],
      imports: [TranslateModule, TranslateServiceStubModule],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(GeneralLinkFieldComponent, {
        set: {
          providers: [
            {
              provide: GeneralLinkFieldMessagingService,
              useClass: GeneralLinkFieldMessagingServiceTesting,
            },
          ],
        },
      })
      .compileComponents();
  }));

  beforeEach(() => {
    const rhsMessaging = jasmine.createSpyObj<RhsEditorMessaging>('messaging', {
      getChannel: { bar: 'foo' } as any,
    });
    const fieldChrome: FieldChromeInfo = {
      chromeId: 'fld_1',
      chromeType: 'field',
      displayName: 'displayName',
      fieldId: 'fld-id',
      fieldType: 'image',
      contextItem: {
        id: 'item-id',
        language: 'item-lang',
        version: -1,
      },
      isPersonalized: false,
    };

    fixture = TestBed.createComponent(GeneralLinkFieldComponent);
    de = fixture.debugElement;
    sut = fixture.componentInstance;

    sut.rhsMessaging = rhsMessaging;
    sut.chrome = fieldChrome;

    messagingService = de.injector.get(GeneralLinkFieldMessagingService) as any;
    messagingService.currentValue$.next(externalLink);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('WHEN inits', () => {
    it('should proxy current value to GeneralLinkComponent', () => {
      const generalLinkComp: GeneralLinkTestingComponent = fixture.debugElement.query(
        By.directive(GeneralLinkComponent),
      ).componentInstance;

      expect(generalLinkComp.value).toEqual(externalLink);
    });
  });

  describe('WHEN General link emits link change', () => {
    it('should set value to messaging service', () => {
      const generalLinkComp: GeneralLinkTestingComponent = fixture.debugElement.query(
        By.directive(GeneralLinkComponent),
      ).componentInstance;

      generalLinkComp.valueChange.emit(externalLink);

      expect(messagingService.set).toHaveBeenCalledWith(externalLink);
    });
  });
});
