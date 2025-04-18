/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { InputLabelModule } from '@sitecore/ng-spd-lib';
import { FieldChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { ObservableType } from 'app/shared/utils/lang.utils';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { BehaviorSubject } from 'rxjs';
import { RhsEditorMessaging } from '../rhs-editor-messaging';
import { NumericalFieldMessagingService } from './numerical-field-messaging.service';
import { NumericalFieldComponent, NumericFieldInputValidator } from './numerical-field.component';

const INITIAL_VALUE = '1.1';

describe(NumericalFieldComponent.name, () => {
  let sut: NumericalFieldComponent;
  let fixture: ComponentFixture<NumericalFieldComponent>;
  let timedNotificationsServiceSpy: jasmine.SpyObj<TimedNotificationsService>;
  let messagingServiceSpy: jasmine.SpyObj<NumericalFieldMessagingService>;
  let messagingServiceSpyCurrentValue$: BehaviorSubject<
    ObservableType<NumericalFieldMessagingService['currentValue$']>
  >;

  function getInputField(): HTMLInputElement {
    return fixture.debugElement.query(By.css('input')).nativeElement;
  }
  function getInputLabel(): HTMLLabelElement {
    return fixture.debugElement.query(By.css('label')).nativeElement;
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule, TranslateServiceStubModule, FormsModule, InputLabelModule],
      declarations: [NumericalFieldComponent],
      providers: [
        {
          provide: TimedNotificationsService,
          useValue: jasmine.createSpyObj<TimedNotificationsService>('TimedNotificationsService', ['push']),
        },
      ],
    })
      .overrideComponent(NumericalFieldComponent, {
        set: {
          providers: [
            {
              provide: NumericalFieldMessagingService,
              useValue: jasmine.createSpyObj<NumericalFieldMessagingService>(
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

    fixture = TestBed.createComponent(NumericalFieldComponent);
    sut = fixture.componentInstance;

    timedNotificationsServiceSpy = TestBedInjectSpy(TimedNotificationsService);
    messagingServiceSpy = fixture.debugElement.injector.get(NumericalFieldMessagingService) as any;
    messagingServiceSpyCurrentValue$ = messagingServiceSpy.currentValue$ as any;

    const rhsMessaging = jasmine.createSpyObj<RhsEditorMessaging>('messaging', {
      getChannel: { bar: 'foo' } as any,
    });

    const fieldChrome: FieldChromeInfo = {
      chromeId: 'fld_1',
      chromeType: 'field',
      displayName: 'displayName',
      fieldId: 'fld-id',
      fieldType: 'number',
      contextItem: {
        id: 'item-id',
        language: 'item-lang',
        version: -1,
      },
      isPersonalized: false,
    };

    const fieldValidator: NumericFieldInputValidator = {
      isValidInput: (value) => !Number.isNaN(Number(value)),
      validationErrorInlineMessageKey: 'foo',
      validationErrorNotificationMessageKey: 'bar',
    };

    sut.rhsMessaging = rhsMessaging;
    sut.chrome = fieldChrome;
    sut.fieldValidator = fieldValidator;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('onInput', () => {
    it('should show validation error label when input is not valid', () => {
      const input = getInputField();
      const label = getInputLabel();
      input.value = 'abc';
      input.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      expect(label.innerText).toEqual(sut.fieldValidator.validationErrorInlineMessageKey + ' {"value":"abc"}');
      expect(label.className).toContain('validation-failed');
    });

    it('should not show validation error label when input is valid', () => {
      const input = getInputField();
      const label = getInputLabel();
      input.value = '123';
      input.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      expect(label.innerText).toEqual(sut.fieldValidator.validationErrorInlineMessageKey + ' {"value":"123"}');
      expect(label.className).not.toContain('validation-failed');
    });

    it('should not show error label when input is integer with leading or/and following whitespace characters', () => {
      const input = getInputField();
      const label = getInputLabel();
      input.value = '   123   ';
      input.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      expect(label.innerText).toEqual(sut.fieldValidator.validationErrorInlineMessageKey + ' {"value":"123"}');
      expect(label.className).not.toContain('validation-failed');
    });
  });

  describe('onBlur', () => {
    it('should be called when focus blurs', () => {
      const spy = spyOn(sut, 'trySaveInputValue');

      const input = getInputField();
      input.value = '11';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith();
    });

    it('should save the new value', () => {
      const input = getInputField();
      input.value = '42';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));

      fixture.detectChanges();

      expect(messagingServiceSpy.set).toHaveBeenCalledWith('42');
    });

    it('should trim and save the new value', () => {
      const input = getInputField();
      input.value = '      123     ';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));

      fixture.detectChanges();

      expect(messagingServiceSpy.set).toHaveBeenCalledWith('123');
    });

    it('should not save the new value if after trimming it is equal to previously saved value', () => {
      const input = getInputField();

      input.value = '123';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      input.value = '    123    ';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(messagingServiceSpy.set).toHaveBeenCalledTimes(1);
    });

    it('should not save the new value if validation failed', () => {
      const input = getInputField();
      input.value = '123abc';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));

      fixture.detectChanges();

      expect(messagingServiceSpy.set).not.toHaveBeenCalled();
    });

    it('should not set value if was not modified', () => {
      const input = getInputField();
      input.value = INITIAL_VALUE;
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));

      fixture.detectChanges();

      expect(messagingServiceSpy.set).not.toHaveBeenCalled();
    });
  });

  describe('messaging emits a new value', () => {
    it('should set new value from messaging', () => {
      messagingServiceSpyCurrentValue$.next('1.5');
      fixture.detectChanges();

      expect(sut.currentValue).toBe('1.5');
    });

    it('should set new value to empty if null from messaging', () => {
      messagingServiceSpyCurrentValue$.next(null);
      fixture.detectChanges();

      expect(sut.currentValue).toBe('');
    });
  });

  describe('on destroy', () => {
    it('should save unsaved value', () => {
      sut.currentValue = '100500';

      sut.ngOnDestroy();

      expect(messagingServiceSpy.set).toHaveBeenCalledWith('100500');
    });

    it('should not save value if was not modified', () => {
      sut.currentValue = INITIAL_VALUE;

      sut.ngOnDestroy();

      expect(messagingServiceSpy.set).not.toHaveBeenCalled();
    });

    it('should not save value if validation failed', () => {
      sut.currentValue = 'abc';

      sut.ngOnDestroy();

      expect(messagingServiceSpy.set).not.toHaveBeenCalled();
    });

    it('should invoke timed notification if validation failed', () => {
      sut.currentValue = 'def';

      sut.ngOnDestroy();

      expect(timedNotificationsServiceSpy.push).toHaveBeenCalled();
    });
  });
});
