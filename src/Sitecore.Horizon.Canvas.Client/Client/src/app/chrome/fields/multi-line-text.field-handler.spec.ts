/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { spyOnEvent } from '../../messaging/event-emitter.testing';
import { createFocusEvent, createMouseEvent, fixFocusEventBehavior, setupTestDOM, teardownTestDOM } from '../../utils/dom.testing';
import { MultiLineTextFieldHandler } from './multi-line-text.field-handler';

function nextTick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve));
}

describe(MultiLineTextFieldHandler.name, () => {
  let sut: MultiLineTextFieldHandler;
  let rootElement: Element;
  let sutElement: HTMLElement;
  let rawValueHolder: HTMLInputElement;
  let abortController: AbortController;

  beforeEach(() => {
    rootElement = setupTestDOM(`
      <field type="multi-line text" />
    `);

    sutElement = rootElement.querySelector('.scWebEditInput') as HTMLInputElement;
    rawValueHolder = rootElement.querySelector('.scFieldValue') as HTMLInputElement;

    fixFocusEventBehavior(sutElement);

    abortController = new AbortController();
    sut = new MultiLineTextFieldHandler(sutElement, rawValueHolder, abortController);
    sut.init();
  });

  afterEach(() => {
    teardownTestDOM(rootElement);
  });

  it('should return unchanged value for readValue()', () => {
    sutElement.innerHTML = '';
    sutElement.contentEditable = 'true';
    sutElement.focus();

    document.execCommand('insertText', true, 'text <br> with space');

    const result = sut.getValue();
    expect(result.rawValue).toBe('text <br> with space');
    expect(rawValueHolder.value).toBe('text <br> with space');
  });

  it('should raise onSelect when focused', () => {
    const spy = spyOnEvent(sut.onSelect);

    sutElement.focus();

    expect(spy).toHaveBeenCalled();
  });

  it('should focus element and fire event when selected via API', () => {
    const spy = spyOnEvent(sut.onSelect);

    sut.select();

    expect(document.activeElement).toBe(sutElement);
    expect(spy).toHaveBeenCalled();
  });

  describe('writeValue()', () => {
    describe('AND new value is different than the existing one', () => {
      it('should update the value', () => {
        const value = { rawValue: 'foot' };

        sut.setValue(value);

        expect(sutElement.innerText).toBe(value.rawValue);
      });

      it('should update the value to rawValueHolder', () => {
        const value = { rawValue: 'foot' };

        sut.setValue(value);

        expect(rawValueHolder.value).toBe(value.rawValue);
      });

      it('should call onChange', () => {
        const spy = spyOnEvent(sut.onChange);
        const value = { rawValue: 'foot' };

        sut.setValue(value);

        expect(spy).toHaveBeenCalled();
      });
    });

    describe('AND new value is the same the existing one', () => {
      it('should not call onChange', () => {
        const value = { rawValue: 'foot' };
        sut.setValue(value);
        const spy = spyOnEvent(sut.onChange);

        sut.setValue(value);

        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe('onBlur', () => {
      it('should call onChange', async () => {
        const spy = spyOnEvent(sut.onChange);

        // act
        sutElement.dispatchEvent(createFocusEvent());
        await Promise.resolve();
        sutElement.dispatchEvent(new Event('blur'));

        // assert
        expect(spy).toHaveBeenCalled();
      });
    });

    describe('when no text in the field', () => {
      it('should remove value of "scdefaulttext" attribute from field when clicked', async () => {
        sutElement.innerText = sut.fieldWatermarkText;

        sutElement.dispatchEvent(createMouseEvent('click'));

        await nextTick();
        expect(sutElement.innerText).toBe('');
      });
    });

    it('should remove value of "scdefaulttext" attribute from field when focused via TAB navigation', async () => {
      // arrange
      const TAB_KEY_CODE = 9;

      sutElement.innerText = sut.fieldWatermarkText;

      // act
      const event = new KeyboardEvent('keydown', {
        which: TAB_KEY_CODE,
        keyCode: TAB_KEY_CODE,
      } as KeyboardEventInit);

      document.body.dispatchEvent(event);
      sutElement.dispatchEvent(createFocusEvent());

      // assert
      await nextTick();
      expect(sutElement.innerText).toBe('');
    });

    it('should display placeholder value if value is empty when loosing focus', async () => {
      // arrange
      sutElement.innerText = '';
      sutElement.dispatchEvent(createFocusEvent());

      await nextTick();
      // act
      sutElement.dispatchEvent(new Event('blur'));

      // assert
      expect(sutElement.innerText).toBe(sut.fieldWatermarkText);
    });
  });

  describe('Should not raise events after abort', () => {
    it('should not trigger onSelect when focused', () => {
      // arrange
      const spy = spyOnEvent(sut.onSelect);

      // act
      abortController.abort();
      sutElement.focus();

      // assert
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not call onChange on blur', async () => {
      // arrange
      const spy = spyOnEvent(sut.onChange);

      // act
      abortController.abort();
      sutElement.dispatchEvent(createFocusEvent());
      await Promise.resolve();
      sutElement.dispatchEvent(new Event('blur'));

      // assert
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not listen to keydown', async () => {
      // arrange
      const TAB_KEY_CODE = 9;
      sutElement.contentEditable = 'false';

      // act
      const event = new KeyboardEvent('keydown', {
        which: TAB_KEY_CODE,
        keyCode: TAB_KEY_CODE,
      } as KeyboardEventInit);

      abortController.abort();
      document.body.dispatchEvent(event);

      // assert
      await nextTick();
      expect(sutElement.contentEditable).toBe('false');
    });

    it('should not dispatchChange and dispatchResize on input', () => {
      // arrange
      const onSizeChangespy = spyOnEvent(sut.onSizeChange);
      const onChangespy = spyOnEvent(sut.onChange);
      sutElement.innerText = 'foot';

      // act
      abortController.abort();
      sutElement.dispatchEvent(new Event('input'));

      // assert
      expect(onSizeChangespy).not.toHaveBeenCalled();
      expect(onChangespy).not.toHaveBeenCalled();
    });

    it('should not listen to mouseenter', async () => {
      // arrange
      sutElement.contentEditable = 'false';

      // act
      abortController.abort();
      sutElement.dispatchEvent(new MouseEvent('mouseenter'));

      // assert
      await nextTick();
      expect(sutElement.contentEditable).toBe('false');
    });

    it('should not listen to mouseleave', async () => {
      // arrange
      sutElement.dispatchEvent(new MouseEvent('mouseenter'));

      // act
      abortController.abort();
      sutElement.dispatchEvent(new MouseEvent('mouseleave'));

      // assert
      await nextTick();
      expect(sutElement.contentEditable).toBe('true');
    });

    it('should not dispatchChange and dispatchResize on blur', () => {
      // arrange
      const onSizeChangespy = spyOnEvent(sut.onSizeChange);
      const onChangespy = spyOnEvent(sut.onChange);

      // act
      abortController.abort();
      sutElement.dispatchEvent(new Event('blur'));

      // assert
      expect(onSizeChangespy).not.toHaveBeenCalled();
      expect(onChangespy).not.toHaveBeenCalled();
    });

    it('should not listen to click', async () => {
      // arrange
      const onSizeChangespy = spyOnEvent(sut.onSizeChange);
      const onChangespy = spyOnEvent(sut.onChange);
      sutElement.innerText = sut.fieldWatermarkText;

      // act
      abortController.abort();
      sutElement.dispatchEvent(createMouseEvent('click'));

      // assert
      await nextTick();
      expect(sutElement.innerText).toBe(sut.fieldWatermarkText);
      expect(onSizeChangespy).not.toHaveBeenCalled();
      expect(onChangespy).not.toHaveBeenCalled();
    });
  });
});
