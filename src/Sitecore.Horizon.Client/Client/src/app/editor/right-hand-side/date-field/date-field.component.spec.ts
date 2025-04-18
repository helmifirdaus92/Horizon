/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { InputLabelModule } from '@sitecore/ng-spd-lib';
import { FieldChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { ObservableType } from 'app/shared/utils/lang.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { BehaviorSubject } from 'rxjs';
import { RhsEditorMessaging } from '../rhs-editor-messaging';
import { DateFieldMessagingService } from './date-field-messaging.service';
import { DateFieldComponent } from './date-field.component';
import { convertDateToSitecoreIsoFormat } from './date-field.utils';

const INITIAL_VALUE = '20230530T020000Z';

describe(DateFieldComponent.name, () => {
  let sut: DateFieldComponent;
  let fixture: ComponentFixture<DateFieldComponent>;
  let messagingServiceSpy: jasmine.SpyObj<DateFieldMessagingService>;
  let messagingServiceSpyCurrentValue$: BehaviorSubject<ObservableType<DateFieldMessagingService['currentValue$']>>;

  const fieldChrome = (type = 'date'): FieldChromeInfo => {
    return {
      chromeId: 'fld_1',
      chromeType: 'field',
      displayName: 'displayName',
      fieldId: 'fld-id',
      fieldType: type,
      contextItem: {
        id: 'item-id',
        language: 'item-lang',
        version: -1,
      },
      isPersonalized: false,
    };
  };

  const getInputField = (): HTMLInputElement => {
    return fixture.debugElement.query(By.css('input')).nativeElement;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, InputLabelModule, FormsModule, TranslateModule, TranslateServiceStubModule],
      declarations: [DateFieldComponent],
    })
      .overrideComponent(DateFieldComponent, {
        set: {
          providers: [
            {
              provide: DateFieldMessagingService,
              useValue: jasmine.createSpyObj<DateFieldMessagingService>(
                {
                  init: undefined,
                  set: undefined,
                },
                {
                  currentValue$: new BehaviorSubject(INITIAL_VALUE),
                },
              ),
            },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DateFieldComponent);
    sut = fixture.componentInstance;

    messagingServiceSpy = fixture.debugElement.injector.get(DateFieldMessagingService) as any;
    messagingServiceSpyCurrentValue$ = messagingServiceSpy.currentValue$ as any;

    const rhsMessaging = jasmine.createSpyObj<RhsEditorMessaging>('messaging', {
      getChannel: { bar: 'foo' } as any,
    });

    sut.rhsMessaging = rhsMessaging;
    sut.chrome = fieldChrome();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should throw an error if messaging or chrome is not assigned', () => {
      sut.rhsMessaging = undefined;
      sut.chrome = undefined;

      expect(() => sut.ngOnInit()).toThrowError('Messaging or chrome is not assigned, please check markup.');
    });

    it('should initialize messaging service', () => {
      sut.ngOnInit();

      expect(messagingServiceSpy.init).toHaveBeenCalledWith(sut.rhsMessaging!);
    });

    it('should subscribe to currentValue$ and update currentValue and lastSavedValue', () => {
      // type = 'date'
      messagingServiceSpyCurrentValue$.next('20230530T020000Z');

      expect(sut.currentValue).toBe('2023-05-30');

      // type = 'datetime'
      sut.chrome = fieldChrome('datetime');
      fixture.detectChanges();
      messagingServiceSpyCurrentValue$.next('20240629T132400Z');

      expect(sut.currentValue).toContain('2024-06-29T');
    });
  });

  describe('ngOnDestroy', () => {
    it('should save new value', () => {
      sut.currentValue = '2027-04-30';
      fixture.detectChanges();

      const expectedDate = convertDateToSitecoreIsoFormat('2027-04-30');
      sut.ngOnDestroy();

      expect(messagingServiceSpy.set).toHaveBeenCalledWith(expectedDate);
    });
  });

  describe('blur', () => {
    it('should save new value', () => {
      const inputField = getInputField();
      inputField.value = '2026-04-30';

      const expectedDate = convertDateToSitecoreIsoFormat('2026-04-30');

      inputField.dispatchEvent(new Event('input'));
      inputField.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(messagingServiceSpy.set).toHaveBeenCalledWith(expectedDate);
    });
  });

  describe('saveNewValue', () => {
    it('should not save value if was not modified', () => {
      const inputField = getInputField();
      sut.currentValue = INITIAL_VALUE;
      inputField.dispatchEvent(new Event('input'));
      inputField.dispatchEvent(new Event('blur'));

      expect(messagingServiceSpy.set).not.toHaveBeenCalled();
    });

    it('should emit empty string if currentValue is empty', () => {
      const inputField = getInputField();
      inputField.value = '';
      inputField.dispatchEvent(new Event('input'));
      inputField.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(messagingServiceSpy.set).toHaveBeenCalledWith('');
    });

    it('should update lastSavedValue to currentValue', () => {
      const inputField = getInputField();
      inputField.value = '2026-04-30';
      inputField.dispatchEvent(new Event('input'));
      inputField.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(sut.lastSavedValue).toBe('2026-04-30');
    });
  });
});
