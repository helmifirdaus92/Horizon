/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Chrome } from '../chrome/chrome';
import { WindowDom } from '../chrome/chrome-dom';
import { ChromeInlineEditorFactory } from '../chrome/chrome-inline-editor-factory';
import { ChromeReader } from '../chrome/chrome-reader';
import { FieldChrome, isFieldChrome } from '../chrome/chrome.field';
import { isPlaceholderChrome, PlaceholderChrome } from '../chrome/chrome.placeholder';
import { isRenderingChrome, RenderingChrome } from '../chrome/chrome.rendering';
import { InlineChromeParser } from '../chrome/read/inline-chrome-parser';
import { MessagingService } from '../messaging/messaging-service';
import { setupTestDOM, teardownTestDOM } from '../utils/dom.testing';
import { ThrowingLogger } from '../utils/logger';
import { PlacementAnchorPosition } from '../utils/placement-anchor';
import { DesigningDropTargetResolver } from './designing-drop-target-resolver';
import { DropTarget } from './designing-manager';
import { DesigningHitEvent } from './designing-native-events-translator';
import { CachedRenderingDropZonesUtil } from './rendering-drop-zones-util';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

function itWithDom(
  expectation: string,
  domTemplateDls: string,
  callback: (chromesLookup: {
    placeholder(key: string): PlaceholderChrome;
    rendering(rid: string): RenderingChrome;
    field(id: string): FieldChrome;
  }) => void,
) {
  return it(expectation, async () => {
    const rootElement = setupTestDOM(domTemplateDls);
    const messagingService = jasmine.createSpyObj<MessagingService>('MessagingService', ['setEditingChannelRpcServices']);
    try {
      const chromeParser = new InlineChromeParser(
        new ChromeInlineEditorFactory(new WindowDom(), ThrowingLogger),
        messagingService,
        new AbortController(),
      );
      const chromes = await new ChromeReader(chromeParser).readChromes(rootElement);

      const findChrome = <TChrome extends Chrome>(
        key: string,
        typeFilter: (chrome: Chrome) => chrome is TChrome,
        keyPicker: (chrome: TChrome) => string,
      ): TChrome => {
        const result = chromes.filter(typeFilter).find((chrome) => keyPicker(chrome) === key);
        if (!result) {
          throw Error(`Cannot find chrome by key: ${key}`);
        }
        return result;
      };

      callback({
        placeholder: (key) => findChrome(key, isPlaceholderChrome, (c) => c.placeholderKey),
        rendering: (rid) => findChrome(rid, isRenderingChrome, (c) => c.renderingInstanceId),
        field: (fid) => findChrome(fid, isFieldChrome, (c) => c.fieldId),
      });
    } finally {
      teardownTestDOM(rootElement);
    }
  });
}

function makeNativeHit(chrome: Chrome, clientY = 100): DesigningHitEvent['hit'] {
  return {
    type: 'native',
    clientY,
    chrome,
  };
}

describe('DesigningDropTargetResolver', () => {
  let dropZonesUtilSpy: jasmine.SpyObj<CachedRenderingDropZonesUtil>;
  let sut: DesigningDropTargetResolver;

  beforeEach(() => {
    dropZonesUtilSpy = jasmine.createSpyObj<CachedRenderingDropZonesUtil>('dropZonesUtil', {
      calculateDropZonePosition: undefined,
      resetCache: undefined,
    });
    sut = new DesigningDropTargetResolver(dropZonesUtilSpy);
  });

  it('should reset util on cache reset', () => {
    sut.resetCache();

    expect(dropZonesUtilSpy.resetCache).toHaveBeenCalled();
  });

  describe('custom hit', () => {
    itWithDom(
      'should return value if it is of DropTarget type without anchor',
      `
        <placeholder key="ph" />
      `,
      (chromes) => {
        const placeholder = chromes.placeholder('ph');
        const dropTarget: DropTarget = { placeholder };

        const result = sut.resolveDropTarget({ type: 'custom', data: dropTarget });

        expect(result).toBe(dropTarget);
      },
    );

    itWithDom(
      'should return value if it is of DropTarget type with anchor',
      `
        <placeholder key="ph" />
        <rendering id="rnd" />
      `,
      (chromes) => {
        const placeholder = chromes.placeholder('ph');
        const rendering = chromes.rendering('rnd');
        const dropTarget: DropTarget = { placeholder, anchor: { target: rendering, position: 'after' } };

        const result = sut.resolveDropTarget({ type: 'custom', data: dropTarget });

        expect(result).toBe(dropTarget);
      },
    );

    it('should return nothing if is unknown type', () => {
      const result = sut.resolveDropTarget({ type: 'custom', data: { desc: 'arbitrary object' } });

      expect(result).toBeUndefined();
    });
  });

  describe('native placeholder hit', () => {
    itWithDom(
      'should return placeholder if no parent renderings',
      `
        <placeholder key="ph" />
      `,
      (chromes) => {
        const placeholder = chromes.placeholder('ph');
        const hit = makeNativeHit(placeholder);

        const result = sut.resolveDropTarget(hit);

        expect(result).toEqual({ placeholder });
      },
    );

    itWithDom(
      'should return nothing if placeholder is not-editable',
      `
        <placeholder key="ph" editable="false" />
      `,
      (chromes) => {
        const placeholder = chromes.placeholder('ph');
        const hit = makeNativeHit(placeholder);

        const result = sut.resolveDropTarget(hit);

        expect(result).toBeUndefined();
      },
    );

    itWithDom(
      'should return parent placeholder if placeholder is non-editable',
      `
        <placeholder key="ph">
          <rendering id="ph/rnd">
            <placeholder key="ph/rnd/ph-ne" editable="false" />
          </rendering>
        </placeholder>
      `,
      (chromes) => {
        const parentPlaceholder = chromes.placeholder('ph');
        const parentRendering = chromes.rendering('ph/rnd');
        dropZonesUtilSpy.calculateDropZonePosition.withArgs(parentRendering, 100500).and.returnValue('before');
        const nonEditablePlaceholder = chromes.placeholder('ph/rnd/ph-ne');
        const hit = makeNativeHit(nonEditablePlaceholder, 100500);

        const result = sut.resolveDropTarget(hit);

        expect(result).toEqual({ placeholder: parentPlaceholder, anchor: { position: 'before', target: parentRendering } });
      },
    );

    itWithDom(
      `should return 'before rendering' if in drop zone of parent rendering`,
      `
        <placeholder key="ph">
          <rendering id="ph/rnd">
            <placeholder key="ph/rnd/ph" />
          </rendering>
        </placeholder>
      `,
      (chromes) => {
        const parentPlaceholder = chromes.placeholder('ph');
        const parentRendering = chromes.rendering('ph/rnd');
        const innerPlaceholder = chromes.placeholder('ph/rnd/ph');
        dropZonesUtilSpy.calculateDropZonePosition.withArgs(parentRendering, 100500).and.returnValue('before');
        const hit = makeNativeHit(innerPlaceholder, 100500);

        const result = sut.resolveDropTarget(hit);

        expect(result).toEqual({ placeholder: parentPlaceholder, anchor: { position: 'before', target: parentRendering } });
      },
    );

    itWithDom(
      `should return 'after rendering' if in drop zone of parent non-editable rendering`,
      `
        <placeholder key="ph">
          <rendering id="ph/rnd-ne" editable="false">
            <placeholder key="ph/rnd-ne/ph" />
          </rendering>
        </placeholder>
      `,
      (chromes) => {
        const parentPlaceholder = chromes.placeholder('ph');
        const parentRendering = chromes.rendering('ph/rnd-ne');
        const innerPlaceholder = chromes.placeholder('ph/rnd-ne/ph');
        dropZonesUtilSpy.calculateDropZonePosition.withArgs(parentRendering, 100500).and.returnValue('after');
        const hit = makeNativeHit(innerPlaceholder, 100500);

        const result = sut.resolveDropTarget(hit);

        expect(result).toEqual({ placeholder: parentPlaceholder, anchor: { position: 'after', target: parentRendering } });
      },
    );

    itWithDom(
      'should return placeholder if not in drop zone of parent rendering',
      `
        <placeholder key="ph">
          <rendering id="ph/rnd">
            <placeholder key="ph/rnd/ph" />
          </rendering>
        </placeholder>
      `,
      (chromes) => {
        const parentRendering = chromes.rendering('ph/rnd');
        const innerPlaceholder = chromes.placeholder('ph/rnd/ph');
        dropZonesUtilSpy.calculateDropZonePosition.withArgs(parentRendering, 100500).and.returnValue(undefined);
        const hit = makeNativeHit(innerPlaceholder, 100500);

        const result = sut.resolveDropTarget(hit);

        expect(result).toEqual({ placeholder: innerPlaceholder });
      },
    );
  });

  describe('native rendering hit', () => {
    new Array<PlacementAnchorPosition>('before', 'after').forEach((position) =>
      itWithDom(
        `[position: ${position}] should use rendering as anchor`,
        `
          <placeholder key="ph">
            <rendering id="ph/rnd" />
          </placeholder>
        `,
        (chromes) => {
          const placeholder = chromes.placeholder('ph');
          const rendering = chromes.rendering('ph/rnd');
          dropZonesUtilSpy.calculateDropZonePosition.withArgs(rendering, 100500).and.returnValue(position);
          const hit = makeNativeHit(rendering, 100500);

          const result = sut.resolveDropTarget(hit);

          expect(result).toEqual({ placeholder, anchor: { position, target: rendering } });
        },
      ),
    );

    itWithDom(
      'should return nothing if not in drop zone of rendering',
      `
        <placeholder key="ph">
          <rendering id="ph/rnd" />
        </placeholder>
      `,
      (chromes) => {
        const rendering = chromes.rendering('ph/rnd');
        dropZonesUtilSpy.calculateDropZonePosition.withArgs(rendering, 100500).and.returnValue(undefined);
        const hit = makeNativeHit(rendering, 100500);

        const result = sut.resolveDropTarget(hit);

        expect(result).toBeUndefined();
      },
    );

    itWithDom(
      'should return nothing if not in drop zone of rendering and is in drop zone of parent rendering',
      `
        <placeholder key="ph">
          <rendering id="ph/rnd">
            <placeholder key="ph/rnd/ph">
              <rendering id="ph/rnd/ph/rnd" />
            </placeholder>
          </rendring>
        </placeholder>
      `,
      (chromes) => {
        const rendering = chromes.rendering('ph/rnd/ph/rnd');
        const parentRendering = chromes.rendering('ph/rnd');
        dropZonesUtilSpy.calculateDropZonePosition.withArgs(rendering, 100500).and.returnValue(undefined);
        dropZonesUtilSpy.calculateDropZonePosition.withArgs(parentRendering, 100500).and.returnValue('before');
        const hit = makeNativeHit(rendering, 100500);

        const result = sut.resolveDropTarget(hit);

        expect(result).toBeUndefined();
      },
    );

    itWithDom(
      'should look for first enabled rendering',
      `
        <placeholder key="ph">
          <rendering id="ph/rnd">
            <placeholder key="ph/rnd/ph-ne" editable="false">
              <rendering id="ph/rnd/ph-ne/rnd" />
            </placeholder>
          </rendring>
        </placeholder>
      `,
      (chromes) => {
        const renderingUnderNonEditablePh = chromes.rendering('ph/rnd/ph-ne/rnd');
        const editablePlaceholder = chromes.placeholder('ph');
        const editableRendering = chromes.rendering('ph/rnd');
        dropZonesUtilSpy.calculateDropZonePosition.withArgs(editableRendering, 100500).and.returnValue('before');
        const hit = makeNativeHit(renderingUnderNonEditablePh, 100500);

        const result = sut.resolveDropTarget(hit);

        expect(result).toEqual({ placeholder: editablePlaceholder, anchor: { position: 'before', target: editableRendering } });
      },
    );

    itWithDom(
      'should use non-editable rendering as anchor',
      `
        <placeholder key="ph">
          <rendering id="ph/rnd-ne" editable="false" />
        </placeholder>
      `,
      (chromes) => {
        const placeholder = chromes.placeholder('ph');
        const nonEditableRendering = chromes.rendering('ph/rnd-ne');
        dropZonesUtilSpy.calculateDropZonePosition.withArgs(nonEditableRendering, 100500).and.returnValue('after');
        const hit = makeNativeHit(nonEditableRendering, 100500);

        const result = sut.resolveDropTarget(hit);

        expect(result).toEqual({ placeholder, anchor: { position: 'after', target: nonEditableRendering } });
      },
    );
  });

  describe('native field hit', () => {
    itWithDom(
      'should use parent editable rendering',
      `
        <placeholder key="ph">
          <rendering id="ph/rnd">
            <field id="ph/rnd/fld" type="single-line text" />
          </rendering>
        </placeholder>
      `,
      (chromes) => {
        const placeholder = chromes.placeholder('ph');
        const rendering = chromes.rendering('ph/rnd');
        const field = chromes.field('ph/rnd/fld');
        dropZonesUtilSpy.calculateDropZonePosition.withArgs(rendering, 100500).and.returnValue('before');
        const hit = makeNativeHit(field, 100500);

        const result = sut.resolveDropTarget(hit);

        expect(result).toEqual({ placeholder, anchor: { position: 'before', target: rendering } });
      },
    );

    itWithDom(
      'should use parent non-editable rendering',
      `
        <placeholder key="ph">
          <rendering id="ph/rnd-ne" editable="false">
            <field id="ph/rnd-ne/fld" type="single-line text" />
          </rendering>
        </placeholder>
      `,
      (chromes) => {
        const placeholder = chromes.placeholder('ph');
        const rendering = chromes.rendering('ph/rnd-ne');
        const field = chromes.field('ph/rnd-ne/fld');
        dropZonesUtilSpy.calculateDropZonePosition.withArgs(rendering, 100500).and.returnValue('after');
        const hit = makeNativeHit(field, 100500);

        const result = sut.resolveDropTarget(hit);

        expect(result).toEqual({ placeholder, anchor: { position: 'after', target: rendering } });
      },
    );
  });
});
