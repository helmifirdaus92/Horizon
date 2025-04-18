/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { DroplistModule, TabsModule } from '@sitecore/ng-spd-lib';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { externalLink, internalLink, mediaLink, TestGeneralLinkModule } from '../general-link-test-module';
import { ExternalGeneralLink } from '../general-link.type';
import { ExternalLinkComponent } from './external-link/external-link.component';
import { GeneralLinkComponent } from './general-link.component';
import { InternalLinkComponent } from './internal-link/internal-link.component';
import { MediaLinkComponent } from './media-link/media-link.component';

describe(GeneralLinkComponent.name, () => {
  let sut: GeneralLinkComponent;
  let fixture: ComponentFixture<GeneralLinkComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GeneralLinkComponent],
      imports: [
        TranslateModule,
        TranslateServiceStubModule,
        FormsModule,
        DroplistModule,
        TestGeneralLinkModule,
        TabsModule,
      ],
      providers: [],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralLinkComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('Clear value', () => {
    const value: ExternalGeneralLink = {
      linktype: 'external',
      url: 'url',
    };
    sut.value = value;

    expect(sut.currentValue).toBe(null);

    sut.linkType = 'external';
    fixture.detectChanges();

    expect(sut.currentValue).toEqual(value);

    const spy = jasmine.createSpy();
    sut.valueChange.subscribe(spy);
    fixture.debugElement.query(By.css('button.clear-btn')).nativeElement.click();
    fixture.detectChanges();

    expect(sut.currentValue).toBe(null);
    expect(spy).toHaveBeenCalledWith(null);
  });

  describe('External link', () => {
    describe('WHEN external link component emits "linkChanged" event ', () => {
      it('should emit the new value', () => {
        const spy = jasmine.createSpy();
        sut.valueChange.subscribe(spy);
        sut.linkType = 'external';
        fixture.detectChanges();

        const externalLinkComp: ExternalLinkComponent = fixture.debugElement.query(
          By.directive(ExternalLinkComponent),
        ).componentInstance;

        externalLinkComp.valueChange.emit(externalLink);
        fixture.detectChanges();

        expect(spy).toHaveBeenCalledWith(externalLink);
      });
    });
  });

  describe('Internal link', () => {
    describe('WHEN internal link component emits "linkChanged" event ', () => {
      it('should emit the new value', () => {
        const spy = jasmine.createSpy();
        sut.valueChange.subscribe(spy);
        sut.linkType = 'internal';
        fixture.detectChanges();

        const internalLinkComp: InternalLinkComponent = fixture.debugElement.query(
          By.directive(InternalLinkComponent),
        ).componentInstance;

        internalLinkComp.valueChange.emit(internalLink);
        fixture.detectChanges();

        expect(spy).toHaveBeenCalledWith(internalLink);
      });
    });
  });

  describe('Media link', () => {
    describe('WHEN media link component emits "linkChanged" event ', () => {
      it('should emit the new value', () => {
        const spy = jasmine.createSpy();
        sut.valueChange.subscribe(spy);
        sut.linkType = 'media';
        fixture.detectChanges();

        const mediaLinkComp: MediaLinkComponent = fixture.debugElement.query(
          By.directive(MediaLinkComponent),
        ).componentInstance;

        mediaLinkComp.valueChange.emit(mediaLink);
        fixture.detectChanges();

        expect(spy).toHaveBeenCalledWith(mediaLink);
      });
    });
  });

  describe('WHEN switch link type', () => {
    it('should switch link type view', () => {
      const initialProvider1 = fixture.debugElement.query(By.css('app-internal-link'));
      const testInternalLinks1 = fixture.debugElement.query(By.css('app-external-link'));

      const tabButtons = fixture.debugElement.queryAll(By.css('button.general-link-type-button'));

      const externalTabButton = tabButtons.find((btn) =>
        (btn.nativeElement.getAttribute('title') || '').includes('EXTERNAL'),
      )?.nativeElement;

      externalTabButton.click();
      fixture.detectChanges();

      const initialProvider2 = fixture.debugElement.query(By.css('app-internal-link'));
      const testInternalLinks2 = fixture.debugElement.query(By.css('app-external-link'));

      expect(tabButtons.length).toBeGreaterThan(1);
      expect(externalTabButton).toBeTruthy();
      expect(initialProvider1).toBeTruthy();
      expect(testInternalLinks1).toBeFalsy();
      expect(initialProvider2).toBeFalsy();
      expect(testInternalLinks2).toBeTruthy();
    });
  });

  describe('WHEN value type does not match the selected linktype', () => {
    it('should return null for currentValue', () => {
      const value: ExternalGeneralLink = {
        linktype: 'external',
        url: 'url',
      };
      sut.value = value;

      expect(sut.currentValue).toBe(null);

      sut.linkType = 'external';
      fixture.detectChanges();
      expect(sut.currentValue).toBe(value);

      sut.linkType = 'internal';
      fixture.detectChanges();

      expect(sut.currentValue).toBe(null);
    });
  });
});
