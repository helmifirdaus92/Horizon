/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import {
  TestMessagingP2PChannelFromChannel,
  makeTestMessagingP2PChannelFromDef,
} from '@sitecore/horizon-messaging/dist/testing';
import { DialogOverlayService, IconButtonGroupModule, IconButtonModule } from '@sitecore/ng-spd-lib';
import { SlideInPanelModule } from 'app/component-lib/slide-in-panel/slide-in-panel.module';
import { MediaDialogService } from 'app/shared/dialogs/media-dialog/media-dialog.service';
import { AppLetModule } from 'app/shared/utils/let-directive/let.directive';
import { TestBedInjectSpy, nextTick } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { EMPTY, NEVER, of } from 'rxjs';
import { MediaValue } from '../image-field/image-field-messaging.service';
import { RhsEditorMessaging } from '../rhs-editor-messaging';
import { EditSourceCodeService } from './edit-source-code.service';
import { CanvasChannel, CanvasChannelDef, RichTextEditorComponent } from './rich-text-editor.component';
import { FormattingOptions } from './rich-text-editor.types';
import { RichTextLinkComponent } from './rich-text-link.component';

describe(RichTextEditorComponent.name, () => {
  let component: RichTextEditorComponent;
  let fixture: ComponentFixture<RichTextEditorComponent>;
  let de: DebugElement;
  let messaging: TestMessagingP2PChannelFromChannel<CanvasChannel>;
  let formatting: FormattingOptions;
  let mediaDialogService: jasmine.SpyObj<MediaDialogService>;
  let editSourceCodeService: jasmine.SpyObj<EditSourceCodeService>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RichTextEditorComponent, RichTextLinkComponent],
      imports: [
        IconButtonGroupModule,
        IconButtonModule,
        TranslateModule,
        TranslateServiceStubModule,
        FormsModule,
        SlideInPanelModule,
        NoopAnimationsModule,
        AppLetModule,
      ],
      providers: [
        {
          provide: DialogOverlayService,
          useValue: {},
        },
        {
          provide: MediaDialogService,
          useValue: jasmine.createSpyObj<MediaDialogService>('MediaDialogService', ['show']),
        },
        {
          provide: EditSourceCodeService,
          useValue: jasmine.createSpyObj<EditSourceCodeService>(['promptEditSourceCode']),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    messaging = makeTestMessagingP2PChannelFromDef(
      CanvasChannelDef,
      jasmine.createSpyObj({
        getSelection: { hasSelection: false, format: {} },
        setFormatting: undefined,
        clearFormatting: undefined,
        insertHtmlAtCaretPos: undefined,
        getValue: 'OldValue',
        setValue: undefined,
      }),
    );
    const rhsMessaging = jasmine.createSpyObj<RhsEditorMessaging>('messaging', {
      getChannel: messaging as any,
      onReconnect: undefined,
    });
    rhsMessaging.onReconnect.and.callFake((callback) => callback());

    mediaDialogService = TestBedInjectSpy(MediaDialogService);
    editSourceCodeService = TestBedInjectSpy(EditSourceCodeService);

    fixture = TestBed.createComponent(RichTextEditorComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;

    component.rhsMessaging = rhsMessaging;
    fixture.detectChanges();

    formatting = new FormattingOptions();
    component.formatting = formatting;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('when EditorService `chromeSelect$` has been updated', () => {
    describe('when input `chromeType` is `web-edit` and `fieldType` is `rich text`', () => {
      let link: any;
      let formattingChangeMsg: any;

      function dispatchDefaultSlectionChangeEvent() {
        link = Object.assign(
          {},
          {
            url: 'foo',
            target: 'bar',
            title: 'baz',
          },
        );
        formattingChangeMsg = Object.assign(
          {},
          {
            format: { bold: true, link } as FormattingOptions,
            hasSelection: true,
          },
        );
        messaging.dispatchEvent('selection:change' as never, formattingChangeMsg);
      }

      it('should set `hasSelection`, `formatting` and `isEditingLink`', () => {
        dispatchDefaultSlectionChangeEvent();

        expect(component.hasSelection).toBeTruthy();
        expect(component.isEditingLink).toBeTrue();
        expect(component.formatting.bold).toBeTruthy();
        expect(component.formatting.link).toEqual(link);
      });

      it('should toggle `keepLinkOpen`, when it is already true', () => {
        component.keepLinkOpen = true;

        dispatchDefaultSlectionChangeEvent();

        expect(component.keepLinkOpen).toBeFalsy();
      });

      it('should set `showLink` to false, `keepLinkOpen` is false', () => {
        component.showLink = true;
        component.keepLinkOpen = false;

        dispatchDefaultSlectionChangeEvent();

        expect(component.showLink).toBeFalsy();
      });

      it('should has undefined as initional value and submit only the changes', () => {
        dispatchDefaultSlectionChangeEvent();

        expect(component.formatting.bold).toBeTrue();
        expect(component.formatting.link).toBeDefined();
        expect(component.formatting.italic).toBeUndefined();
        expect(component.formatting.align).toBeUndefined();
        expect(component.formatting.header).toBeUndefined();
        expect(component.formatting.list).toBeUndefined();
        expect(component.formatting.strike).toBeUndefined();
        expect(component.formatting.underline).toBeUndefined();
      });

      describe('link editing', () => {
        describe('WHEN cursor is within an existed link, but there is no a selection', () => {
          it('should enable link editing', () => {
            link = Object.assign(
              {},
              {
                url: 'foo',
                target: 'bar',
                title: 'baz',
              },
            );
            formattingChangeMsg = Object.assign(
              {},
              {
                format: { bold: true, link } as FormattingOptions,
                hasSelection: false,
              },
            );

            messaging.dispatchEvent('selection:change' as never, formattingChangeMsg);
            fixture.detectChanges();
            const linkEditBtn = fixture.debugElement.query(
              By.css('button[title="EDITOR.RTE.LINK.CREATE_OR_EDIT_LINK"]'),
            ).nativeElement;

            expect(component.isEditingLink).toBeTrue();
            expect(linkEditBtn.hasAttribute('disabled')).toBeFalse();
          });
        });

        describe('WHEN cursor is not within an existed link, but there is a selection', () => {
          it('should enable link editing', () => {
            formattingChangeMsg = Object.assign(
              {},
              {
                format: { bold: true } as FormattingOptions,
                hasSelection: true,
              },
            );

            messaging.dispatchEvent('selection:change' as never, formattingChangeMsg);
            fixture.detectChanges();
            const linkEditBtn = fixture.debugElement.query(
              By.css('button[title="EDITOR.RTE.LINK.CREATE_OR_EDIT_LINK"]'),
            ).nativeElement;

            expect(component.isEditingLink).toBeFalse();
            expect(linkEditBtn.hasAttribute('disabled')).toBeFalse();
          });
        });

        describe('WHEN cursor is within an existed link and there is a selection', () => {
          it('should enable link editing', () => {
            link = Object.assign(
              {},
              {
                url: 'foo',
                target: 'bar',
                title: 'baz',
              },
            );
            formattingChangeMsg = Object.assign(
              {},
              {
                format: { bold: true, link } as FormattingOptions,
                hasSelection: false,
              },
            );

            messaging.dispatchEvent('selection:change' as never, formattingChangeMsg);
            fixture.detectChanges();
            const linkEditBtn = fixture.debugElement.query(
              By.css('button[title="EDITOR.RTE.LINK.CREATE_OR_EDIT_LINK"]'),
            ).nativeElement;

            expect(component.isEditingLink).toBeTrue();
            expect(linkEditBtn.hasAttribute('disabled')).toBeFalse();
          });
        });

        describe('WHEN cursor is not within an existed link and there is no a selection', () => {
          it('should not enable link editing', () => {
            formattingChangeMsg = Object.assign(
              {},
              {
                format: { bold: true } as FormattingOptions,
                hasSelection: false,
              },
            );

            messaging.dispatchEvent('selection:change' as never, formattingChangeMsg);
            fixture.detectChanges();
            const linkEditBtn = fixture.debugElement.query(
              By.css('button[title="EDITOR.RTE.LINK.CREATE_OR_EDIT_LINK"]'),
            ).nativeElement;

            expect(component.isEditingLink).toBeFalse();
            expect(linkEditBtn.hasAttribute('disabled')).toBeTrue();
          });
        });
      });
    });
  });

  describe('given selection is bold and italic', () => {
    beforeEach(() => {
      formatting.bold = true;
      formatting.italic = true;
      component.formatting = formatting;
    });

    it('format("bold", false) should tell editorService to change selection to only have italic formatting', () => {
      component.format('bold', false);

      expect(formatting.bold).toBeFalsy();
      expect(messaging.remoteRpcImpl.setFormatting).toHaveBeenCalledWith(jasmine.objectContaining({ bold: false }));
    });

    it(`format("underline", true) should tell editorService to change selection to have bold, italic
    and underline formatting`, () => {
      component.format('underline', true);

      expect(formatting.underline).toBeTruthy();
      expect(messaging.remoteRpcImpl.setFormatting).toHaveBeenCalledWith(jasmine.objectContaining({ underline: true }));
    });
  });

  it('align("center") should tell editorService to change selection to align', () => {
    component.align('center');

    expect(formatting.align).toBe('center');
    expect(messaging.remoteRpcImpl.setFormatting).toHaveBeenCalledWith(jasmine.objectContaining({ align: 'center' }));
  });

  it('header(2) should tell editorService to change selection to be header 2', () => {
    component.header(2);

    expect(formatting.header).toBe(2);
    expect(messaging.remoteRpcImpl.setFormatting).toHaveBeenCalledWith(jasmine.objectContaining({ header: 2 }));
  });

  it(`header(false) should remove existing header formatting
  and tell editorService to change selection not be header`, () => {
    formatting.header = 2;
    component.formatting = formatting;

    component.header(false);

    expect(formatting.header).toBeFalsy();
    expect(messaging.remoteRpcImpl.setFormatting).toHaveBeenCalledWith(formatting);
  });

  it('indent(1) should change indentation to 1 and tell editorService to change indentation', () => {
    component.indent(1);

    expect(formatting.indent).toBe(1);
    expect(messaging.remoteRpcImpl.setFormatting).toHaveBeenCalledWith(jasmine.objectContaining({ indent: 1 }));
  });

  it('given indent is 0, call indent(-1) should keep indentation at 0', () => {
    formatting.indent = 0;
    component.formatting = formatting;

    component.indent(-1);

    expect(formatting.indent).toBe(0);
    expect(messaging.remoteRpcImpl.setFormatting).not.toHaveBeenCalled();
  });

  describe('given indent is 8', () => {
    beforeEach(() => {
      formatting.indent = 8;
      component.formatting = formatting;
    });

    it('call indent(1) should keep indentation at 8', () => {
      component.indent(1);

      expect(formatting.indent).toBe(8);
      expect(messaging.remoteRpcImpl.setFormatting).not.toHaveBeenCalled();
    });

    it('call indent(-1) should change indentation to 7 and tell editorService to change indentation', () => {
      component.indent(-1);

      expect(formatting.indent).toBe(7);
      expect(messaging.remoteRpcImpl.setFormatting).toHaveBeenCalledWith(jasmine.objectContaining({ indent: 7 }));
    });
  });

  it('list("bullet") should change list to bullet and tell editorService to change list formatting', () => {
    component.list('bullet');

    expect(formatting.list).toBe('bullet');
    expect(messaging.remoteRpcImpl.setFormatting).toHaveBeenCalledWith(jasmine.objectContaining({ list: 'bullet' }));
  });

  it('reset() should change formatting to defaults and call editorService with the false', () => {
    formatting.bold = true;
    formatting.header = 2;
    formatting.align = 'center';
    formatting.indent = 5;
    formatting.italic = true;
    formatting.list = 'bullet';
    formatting.strike = true;
    formatting.underline = true;
    component.formatting = formatting;

    component.reset();
    const defaults = new FormattingOptions();
    expect(component.formatting).toEqual(defaults);
    expect(messaging.remoteRpcImpl.clearFormatting).toHaveBeenCalled();
  });

  it('isSelected("align", "center") should return true when align is center', () => {
    formatting.align = 'center';
    component.formatting = formatting;

    const isSelected = component.isSelected('align', 'center');

    expect(isSelected).toBe(true);
  });

  it('isSelected("list", "ordered") should return false when list is "bullet"', () => {
    formatting.list = 'ordered';
    component.formatting = formatting;

    const isSelected = component.isSelected('list', 'bullet');

    expect(isSelected).toBe(false);
  });

  describe('onLinkPanelFocusChange()', () => {
    describe('WHEN shift input focus', () => {
      it('should set `keepLinkOpen` to true', () => {
        component.showLink = true;
        fixture.detectChanges();
        component.onLinkPanelFocusChange();

        expect(component.keepLinkOpen).toBe(true);
      });
    });
  });

  describe('setLink()', () => {
    let spy: jasmine.Spy;

    beforeEach(() => {
      spy = spyOn(component, 'postFormatChange');
    });

    it('should call `postFormatChange()` with `link`, when it has a url', () => {
      const link = { url: 'foo', title: 'bar', target: 'baz' };

      component.setLink(link);

      expect(spy).toHaveBeenCalledWith({ link });
    });

    it('should call `postFormatChange()` with `link` set to `false`, when it doesnt have a url', () => {
      component.setLink(null);

      expect(spy).toHaveBeenCalledWith({ link: false });
    });
  });

  describe('select from media dialog', () => {
    it('should call `MediaDialogService.show()` when button is clicked', () => {
      mediaDialogService.show.and.returnValue(NEVER);
      const buttons = fixture.debugElement.queryAll(By.css('[ngspdiconbutton]'));
      const inserMediaButton = buttons.find((p) => p.nativeElement.title === 'EDITOR.RTE.MEDIA.INSERT');

      (inserMediaButton?.nativeElement as HTMLElement).dispatchEvent(new MouseEvent('click'));

      expect(mediaDialogService.show).toHaveBeenCalled();
    });

    it('should insert image html when media is selected', () => {
      const imageMarkup = '<img src="test-path" />';
      const resolvedMedia: MediaValue = {
        embeddedHtml: imageMarkup,
        rawValue: '',
        src: '',
      };
      mediaDialogService.show.and.returnValue(of(resolvedMedia));

      component.selectFromMediaDialog();

      expect(messaging.remoteRpcImpl.insertHtmlAtCaretPos).toHaveBeenCalledWith(imageMarkup);
    });

    it('should not invoke RPC if dialog returned nothing', () => {
      mediaDialogService.show.and.returnValue(EMPTY);

      component.selectFromMediaDialog();

      expect(messaging.remoteRpcImpl.insertHtmlAtCaretPos).not.toHaveBeenCalled();
    });
  });

  describe('edit source code', () => {
    it('should enable source code editor', async () => {
      editSourceCodeService.promptEditSourceCode.and.resolveTo({ status: 'OK', value: 'NewValue' });

      component.editSourceCode();
      await nextTick();

      expect(messaging.remoteRpcImpl.setValue).toHaveBeenCalledWith('NewValue');
    });

    it('should not update value if the dialog returns cancelation', async () => {
      editSourceCodeService.promptEditSourceCode.and.resolveTo({ status: 'Canceled' });

      component.editSourceCode();
      await nextTick();

      expect(messaging.remoteRpcImpl.setValue).not.toHaveBeenCalled();
    });
  });
});
