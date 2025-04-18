/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { CheckboxModule, ContainedAccordionModule, InputLabelModule } from '@sitecore/ng-spd-lib';
import { createSpyObserver } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { ExternalGeneralLink } from '../../general-link.type';
import { ExternalLinkComponent } from './external-link.component';

describe(ExternalLinkComponent.name, () => {
  const findInput = (name: 'linkText' | 'linkUrl' | 'linkTitle' | 'target') => {
    const cssSelector = name === 'target' ? 'ng-spd-checkbox' : `*[name='${name}']`;
    return fixture.debugElement.query(By.css(cssSelector)).nativeElement;
  };

  const dispatchFocusOut = (relatedTarget?: Parameters<typeof findInput>[0] | undefined) => {
    const rootEl = fixture.debugElement.query(By.css('.external-link')).nativeElement;
    rootEl.dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: relatedTarget ? findInput(relatedTarget) : undefined,
      }),
    );
  };
  let sut: ExternalLinkComponent;
  let fixture: ComponentFixture<ExternalLinkComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExternalLinkComponent],
      imports: [
        TranslateModule,
        TranslateServiceStubModule,
        InputLabelModule,
        FormsModule,
        CheckboxModule,
        ContainedAccordionModule,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalLinkComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('WHEN edit link data', () => {
    it('should save null value if link values are empty', () => {
      // arrange
      const linkValue = {
        linktype: 'external',
        url: 'http://someUrl',
        text: undefined,
        title: undefined,
        className: undefined,
        target: undefined,
      };
      sut.value = linkValue as ExternalGeneralLink;
      fixture.detectChanges();
      const spy = createSpyObserver();
      sut.valueChange.subscribe(spy);
      const linkUrlInput = findInput('linkUrl');

      // act
      linkUrlInput.value = '';
      linkUrlInput.dispatchEvent(new Event('input'));
      dispatchFocusOut();

      // assert
      expect(spy.next).toHaveBeenCalledWith(null);
    });

    it('should reflect proper link values', fakeAsync(() => {
      // arrange
      const linkValue = {
        linktype: 'external',
        url: 'linkUrlValue',
        text: 'linkTextValue',
        title: 'linkTitleValue',
        className: 'linkClassName',
        target: '_blank',
      };

      // act
      sut.value = linkValue as ExternalGeneralLink;
      fixture.detectChanges();
      tick();

      // assert
      expect(findInput('linkText').value).toBe('linkTextValue');
      expect(findInput('linkUrl').value).toBe('linkUrlValue');
      expect(findInput('linkTitle').value).toBe('linkTitleValue');
      expect(findInput('target').className).toBe('checked');
      flush();
    }));

    it('should emit new link text value', () => {
      // arrange
      sut.value = null;
      fixture.detectChanges();
      const spy = createSpyObserver();
      sut.valueChange.subscribe(spy);
      const input = findInput('linkText');

      // act
      input.value = 'new value';
      input.dispatchEvent(new Event('input'));
      dispatchFocusOut();

      // assert
      expect(spy.next).toHaveBeenCalledWith(jasmine.objectContaining({ text: 'new value' }));
    });

    it('should emit new link url value', () => {
      // arrange
      sut.value = null;
      fixture.detectChanges();
      const spy = createSpyObserver();
      sut.valueChange.subscribe(spy);
      const input = findInput('linkUrl');

      // act
      input.value = 'new value';
      input.dispatchEvent(new Event('input'));
      dispatchFocusOut();

      // assert
      expect(spy.next).toHaveBeenCalledWith(jasmine.objectContaining({ url: 'new value' }));
    });

    it('should emit new link title value', () => {
      // arrange
      sut.value = null;
      fixture.detectChanges();
      const spy = createSpyObserver();
      sut.valueChange.subscribe(spy);
      const input = findInput('linkTitle');

      // act
      input.value = 'new value';
      input.dispatchEvent(new Event('input'));
      dispatchFocusOut();

      // assert
      expect(spy.next).toHaveBeenCalledWith(jasmine.objectContaining({ title: 'new value' }));
    });

    it('should emit new target value', () => {
      // arrange
      sut.value = null;
      fixture.detectChanges();
      const spy = createSpyObserver();
      sut.valueChange.subscribe(spy);
      const openInNewWindowCheckbox = findInput('target');

      // act
      openInNewWindowCheckbox.dispatchEvent(new Event('click'));
      dispatchFocusOut();

      // assert
      expect(spy.next).toHaveBeenCalledWith(jasmine.objectContaining({ target: '_blank' }));
    });

    new Array<Parameters<typeof findInput>[0]>(
      //
      'linkText',
      'linkUrl',
    ).forEach((linkInputField) => {
      it(`it should clear '${linkInputField}' value if it has whitespace characters only`, () => {
        // arrange
        const linkValue = {
          linktype: 'external',
          url: 'http://someUrl',
          text: 'someLink',
          title: undefined,
          className: undefined,
          target: undefined,
        };
        sut.value = linkValue as ExternalGeneralLink;
        fixture.detectChanges();
        const spy = createSpyObserver();
        sut.valueChange.subscribe(spy);
        const input = findInput(linkInputField);

        // act
        input.value = '     ';
        input.dispatchEvent(new Event('input'));
        dispatchFocusOut();

        // assert
        if (linkInputField === 'linkText') {
          expect(spy.next).toHaveBeenCalledWith(jasmine.objectContaining({ text: '' }));
        } else {
          expect(spy.next).toHaveBeenCalledWith(jasmine.objectContaining({ url: '' }));
        }
      });
    });

    it('should combine initial value and changes', () => {
      // arrange
      const initialValue: ExternalGeneralLink = {
        linktype: 'external',
        text: 'linkTextValue',
        url: 'linkUrlValue',
        title: 'linkTitleValue',
        class: 'linkClassValue',
        target: '_blank',
        'any-non-editable-parameter': 'some value',
      };
      sut.value = initialValue;
      fixture.detectChanges();
      const spy = jasmine.createSpy();
      sut.valueChange.subscribe(spy);
      const linkUrlInput = findInput('linkUrl');

      // act
      linkUrlInput.value = 'http://new.url';
      linkUrlInput.dispatchEvent(new Event('input'));
      dispatchFocusOut();

      // assert
      expect(spy).toHaveBeenCalledWith({
        linktype: 'external',
        text: 'linkTextValue',
        url: 'http://new.url',
        title: 'linkTitleValue',
        class: 'linkClassValue',
        target: '_blank',
        'any-non-editable-parameter': 'some value',
      });
    });

    it('should not emit value if no changes introduced while user focuses among multiple inputs', () => {
      // arrange
      const linkValue = {
        linktype: 'external',
        text: 'linkTextValue',
        url: 'linkUrlValue',
        title: 'linkTitleValue',
        className: 'linkClassValue',
        target: '_blank',
      };
      sut.value = linkValue as ExternalGeneralLink;
      fixture.detectChanges();
      const spy = createSpyObserver();
      sut.valueChange.subscribe(spy);

      // act
      dispatchFocusOut('linkText');
      dispatchFocusOut('linkTitle');
      dispatchFocusOut('linkUrl');

      // assert
      expect(spy.next).not.toHaveBeenCalled();
    });

    it('should not emit changes if value contains empty properties', () => {
      // arrange
      const linkValue = {
        linktype: 'external',
        text: 'linkTextValue',
        url: 'linkUrlValue',
        title: undefined,
        className: undefined,
        target: '_blank',
      };
      sut.value = linkValue as ExternalGeneralLink;
      fixture.detectChanges();
      const spy = createSpyObserver();
      sut.valueChange.subscribe(spy);

      // act
      dispatchFocusOut('linkText');
      dispatchFocusOut('linkTitle');
      dispatchFocusOut('linkUrl');

      // assert
      expect(spy.next).not.toHaveBeenCalled();
    });

    it('should emit value only once when changes introduced and user focuses among multiple inputs', () => {
      // arrange
      const linkValue = {
        linktype: 'external',
        text: 'linkTextValue',
        url: 'linkUrlValue',
        title: 'linkTitleValue',
        className: 'linkClassValue',
        target: '_blank',
      };
      sut.value = linkValue as ExternalGeneralLink;
      fixture.detectChanges();
      const spy = createSpyObserver();
      sut.valueChange.subscribe(spy);
      const input = findInput('linkUrl');

      // act
      input.value = 'new value';
      input.dispatchEvent(new Event('input'));
      dispatchFocusOut('linkText');
      dispatchFocusOut('linkText');
      dispatchFocusOut();

      // assert
      expect(spy.next).toHaveBeenCalledTimes(1);
    });
  });

  describe('WHEN destroys', () => {
    it('should emit current value', () => {
      // arrange
      const spy = jasmine.createSpy();
      const valueToSave: ExternalGeneralLink = {
        linktype: 'external',
        url: 'http://example.com',
        class: 'initial-class',
        target: '_blank',
        text: undefined,
        title: undefined,
      };
      sut.valueChange.subscribe(spy);
      sut.value = valueToSave;
      const input = findInput('linkText');
      input.value = 'new value';
      input.dispatchEvent(new Event('input'));

      // act
      sut.ngOnDestroy();

      // assert
      expect(spy).toHaveBeenCalledWith({
        linktype: 'external',
        url: 'http://example.com',
        class: 'initial-class',
        target: '_blank',
        text: 'new value',
        title: undefined,
      });
    });
  });
});
