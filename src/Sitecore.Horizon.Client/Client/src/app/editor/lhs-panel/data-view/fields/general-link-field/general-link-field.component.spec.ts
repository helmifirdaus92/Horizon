/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { DroplistModule, TabsModule } from '@sitecore/ng-spd-lib';
import {
  externalLink,
  internalLink,
  mailLink,
  mediaLink,
  TestGeneralLinkModule,
} from 'app/editor/right-hand-side/general-link-field/general-link-test-module';
import { EmailLinkComponent } from 'app/editor/right-hand-side/general-link-field/general-link/email-link/email-link.component';
import { ExternalLinkComponent } from 'app/editor/right-hand-side/general-link-field/general-link/external-link/external-link.component';
import { InternalLinkComponent } from 'app/editor/right-hand-side/general-link-field/general-link/internal-link/internal-link.component';
import { MediaLinkComponent } from 'app/editor/right-hand-side/general-link-field/general-link/media-link/media-link.component';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { GeneralLinkFieldComponent } from './general-link-field.component';

describe(GeneralLinkFieldComponent.name, () => {
  let sut: GeneralLinkFieldComponent;
  let fixture: ComponentFixture<GeneralLinkFieldComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GeneralLinkFieldComponent],
      imports: [
        TranslateModule,
        TranslateServiceStubModule,
        FormsModule,
        DroplistModule,
        TestGeneralLinkModule,
        EmailLinkComponent,
        TabsModule,
      ],
      providers: [],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralLinkFieldComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('External link', () => {
    describe('WHEN external link component emits "linkChanged" event ', () => {
      it('should emit the new value', () => {
        sut.linkType = 'external';
        fixture.detectChanges();

        const spy = jasmine.createSpy();
        const externalLinkComp: ExternalLinkComponent = fixture.debugElement.query(
          By.directive(ExternalLinkComponent),
        ).componentInstance;
        sut.valueChange.subscribe(spy);
        externalLinkComp.valueChange.emit(externalLink);

        expect(spy).toHaveBeenCalledWith({
          rawValue: '<link linktype="external" url="linkUrl" target="" text="text" title="title" class="className"/>',
          model: { url: 'linkUrl', text: 'text', title: 'title', class: 'className', linktype: 'external' },
        });
      });
    });
  });

  describe('Internal link', () => {
    describe('WHEN internal link component emits "linkChanged" event ', () => {
      it('should emit the new value', () => {
        sut.linkType = 'internal';

        fixture.detectChanges();

        const spy = jasmine.createSpy();
        const internalLinkComp: InternalLinkComponent = fixture.debugElement.query(
          By.directive(InternalLinkComponent),
        ).componentInstance;

        sut.valueChange.subscribe(spy);
        internalLinkComp.valueChange.emit(internalLink);

        expect(spy).toHaveBeenCalledWith({
          rawValue:
            '<link linktype="internal" id="id" anchor="" querystring="" target="" class="className" text="text" title="title"/>',
          model: {
            class: 'className',
            text: 'text',
            title: 'title',
            linktype: 'internal',
            item: { id: 'id', displayName: 'name', url: '/some/path' },
          },
        });
      });
    });
  });

  describe('Media link', () => {
    describe('WHEN media link component emits "linkChanged" event ', () => {
      it('should emit the new value', () => {
        sut.linkType = 'media';

        fixture.detectChanges();

        const spy = jasmine.createSpy();
        const mediaLinkComp: MediaLinkComponent = fixture.debugElement.query(
          By.directive(MediaLinkComponent),
        ).componentInstance;

        sut.valueChange.subscribe(spy);
        mediaLinkComp.valueChange.emit(mediaLink);

        expect(spy).toHaveBeenCalledWith({
          rawValue: '<link linktype="media" id="id" target="" class="className" text="text" title="title"/>',
          model: {
            class: 'className',
            text: 'text',
            title: 'title',
            linktype: 'media',
            item: { id: 'id', displayName: 'name', url: '/some/path' },
          },
        });
      });
    });
  });

  describe('Mail link', () => {
    describe('WHEN mail link component emits "linkChanged" event ', () => {
      it('should emit the new value', () => {
        sut.linkType = 'mailto';
        fixture.detectChanges();

        const spy = jasmine.createSpy();
        const externalLinkComp: EmailLinkComponent = fixture.debugElement.query(
          By.directive(EmailLinkComponent),
        ).componentInstance;

        sut.valueChange.subscribe(spy);
        externalLinkComp.valueChange.emit(mailLink);

        expect(spy).toHaveBeenCalledWith({
          rawValue: '<link linktype="mailto" url="example@gmail.com" class="" text="text" title=""/>',
          model: { url: 'example@gmail.com', text: 'text', linktype: 'mailto' },
        });
      });
    });
  });
});
