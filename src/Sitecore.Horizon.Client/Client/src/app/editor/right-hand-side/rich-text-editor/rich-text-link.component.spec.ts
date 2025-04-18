/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { IconButtonGroupModule, IconButtonModule } from '@sitecore/ng-spd-lib';
import { SlideInPanelModule } from 'app/component-lib/slide-in-panel/slide-in-panel.module';
import { createSpyObserver } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { RichTextLinkComponent } from './rich-text-link.component';

describe(RichTextLinkComponent.name, () => {
  let sut: RichTextLinkComponent;
  let fixture: ComponentFixture<RichTextLinkComponent>;

  const findInput = (name: 'linkUrl' | 'linkTitle' | 'linkTarget') =>
    fixture.debugElement.query(By.css(`*[name='${name}']`));
  const dispatchFocusOut = (relatedTarget?: Parameters<typeof findInput>[0] | undefined) => {
    fixture.nativeElement.dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: relatedTarget ? findInput(relatedTarget).nativeElement : undefined,
      }),
    );
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        TranslateServiceStubModule,
        IconButtonModule,
        SlideInPanelModule,
        IconButtonGroupModule,
      ],
      declarations: [RichTextLinkComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RichTextLinkComponent);
    sut = fixture.componentInstance;
  });

  it('should create', () => {
    expect(sut).toBeDefined();
  });

  it('should save URL', () => {
    sut.link = null;
    fixture.detectChanges();
    const resultObserver = createSpyObserver();
    sut.linkChange.subscribe(resultObserver);
    const urlInput = findInput('linkUrl').nativeElement;

    urlInput.value = 'new value';
    urlInput.dispatchEvent(new Event('input'));
    dispatchFocusOut();

    expect(resultObserver.next).toHaveBeenCalledWith(jasmine.objectContaining({ url: 'new value' }));
  });

  it('should save title', () => {
    sut.link = { url: 'foo URL', title: 'old title', target: null };
    fixture.detectChanges();
    const resultObserver = createSpyObserver();
    sut.linkChange.subscribe(resultObserver);
    const titleInput = findInput('linkTitle').nativeElement;

    titleInput.value = 'new title';
    titleInput.dispatchEvent(new Event('input'));
    dispatchFocusOut();

    expect(resultObserver.next).toHaveBeenCalledWith(jasmine.objectContaining({ title: 'new title' }));
  });

  it('should save target', () => {
    sut.link = { url: 'foo URL', title: null, target: null };
    fixture.detectChanges();
    const resultObserver = createSpyObserver();
    sut.linkChange.subscribe(resultObserver);
    const targetInput = findInput('linkTarget').nativeElement;

    targetInput.value = targetInput.options[1].value;
    targetInput.dispatchEvent(new Event('change'));
    dispatchFocusOut();

    expect(resultObserver.next).toHaveBeenCalledWith(jasmine.objectContaining({ target: '_blank' }));
  });

  it('should save null value if url is empty', () => {
    sut.link = { url: 'some url', title: 'some title', target: '_blank' };
    fixture.detectChanges();
    const resultObserver = createSpyObserver();
    sut.linkChange.subscribe(resultObserver);
    const urlInput = findInput('linkUrl').nativeElement;

    urlInput.value = '';
    urlInput.dispatchEvent(new Event('input'));
    dispatchFocusOut();

    expect(resultObserver.next).toHaveBeenCalledWith(null);
  });

  it('should save only once if user focused among multiple inputs', () => {
    sut.link = null;
    fixture.detectChanges();
    const resultObserver = createSpyObserver();
    sut.linkChange.subscribe(resultObserver);
    const urlInput = findInput('linkUrl').nativeElement;
    const titleInput = findInput('linkTitle').nativeElement;
    const targetInput = findInput('linkTarget').nativeElement;

    urlInput.value = 'new url';
    urlInput.dispatchEvent(new Event('input'));
    dispatchFocusOut('linkTitle');
    titleInput.value = 'new title';
    titleInput.dispatchEvent(new Event('input'));
    dispatchFocusOut('linkTarget');
    targetInput.value = targetInput.options[1].value;
    targetInput.dispatchEvent(new Event('change'));
    dispatchFocusOut();

    expect(resultObserver.next).toHaveBeenCalledTimes(1);
  });

  it('should save value on destroy', () => {
    sut.link = { url: 'foo URL', title: 'old title', target: null };
    fixture.detectChanges();
    const resultObserver = createSpyObserver();
    sut.linkChange.subscribe(resultObserver);
    const titleInput = findInput('linkTitle').nativeElement;
    titleInput.value = 'new title';
    titleInput.dispatchEvent(new Event('input'));

    sut.ngOnDestroy();

    expect(resultObserver.next).toHaveBeenCalled();
  });

  describe('removeLink()', () => {
    it('should return change with a null link', () => {
      const resultSpy = createSpyObserver();
      sut.linkChange.subscribe(resultSpy);
      sut.link = { url: 'foo', title: 'bar', target: 'baz' };

      sut.removeLink();

      expect(resultSpy.next).toHaveBeenCalledWith(null);
    });

    it('should do nothing if link was already null', () => {
      const resultSpy = createSpyObserver();
      sut.linkChange.subscribe(resultSpy);
      sut.link = null;

      sut.removeLink();

      expect(resultSpy.next).not.toHaveBeenCalled();
    });
  });

  describe('visitLink()', () => {
    it('should call `window.open()` with url when url is specified', () => {
      const spy = spyOn(window, 'open');
      sut.link = { url: 'foo', title: null, target: null };

      sut.visitLink();

      expect(spy).toHaveBeenCalledWith('foo');
    });

    it('should not call `window.open()`, when URL is not specified', () => {
      const spy = spyOn(window, 'open');
      sut.link = { url: 'foo URL', title: 'title foo', target: '_blank' };
      sut.draftLink.url = '';

      sut.visitLink();

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
