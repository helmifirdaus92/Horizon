/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannel } from '@sitecore/horizon-messaging/dist/testing';
import { EditorWorkspaceService } from 'app/editor/editor-workspace/editor-workspace.service';
import { CanvasRenderingApiService } from 'app/shared/canvas/canvas-rendering-api.service';
import { Context } from 'app/shared/client-state/context.service';
import { EditingChannelDef } from 'app/shared/messaging/horizon-canvas.contract.defs';
import {
  EditingCanvasRpcServices,
  EditingHorizonEvents,
  EditingHorizonRpcServices,
  PlaceholderChromeInfo,
  RenderingFieldsdData,
} from 'app/shared/messaging/horizon-canvas.contract.parts';
import { Lifetime } from 'app/shared/utils/lifetime';
import { EditingCanvasEvents, RenderingInitializationDetails } from 'sdk';
import { PageLayout, PageLayoutHooks, PersonalizationRules, RenderingsDefinitionUpdates } from './page-layout';
import {
  LayoutDeviceDefinition,
  LayoutRenderingDefinition,
  PageLayoutDefinition,
  Rule,
} from './page-layout-definition';

function findRendering(deviceId: string, renderingInstanceId: string, layout: PageLayoutDefinition) {
  return layout.devices.find((d) => d.id === deviceId)!.renderings.find((r) => r.instanceId === renderingInstanceId);
}

const TEST_PAGE_LAYOUT: PageLayoutDefinition = {
  devices: [
    {
      id: 'device1',
      layoutId: 'dev1-layout',
      renderings: [
        {
          id: 'dev1-r1',
          instanceId: 'dev1-rid1',
        } as LayoutRenderingDefinition,
      ],
    } as LayoutDeviceDefinition,
    {
      id: 'device2',
      layoutId: 'dev1-layout',
      renderings: [
        {
          id: 'dev2-r1',
          instanceId: 'dev2-rid1',
          placeholderKey: 'content',
          dataSource: 'ds',
        } as LayoutRenderingDefinition,
        {
          id: 'dev2-r2',
          instanceId: 'dev2-rid2',
          placeholderKey: 'content',
        } as LayoutRenderingDefinition,
        {
          id: 'dev2-r3',
          instanceId: 'dev2-rid3',
          placeholderKey: '/content/phOnRendering1',
        } as LayoutRenderingDefinition,
        {
          id: 'dev2-r4',
          instanceId: 'dev2-rid4',
          placeholderKey: '/content/phOnRendering1/phOnRendering3',
        } as LayoutRenderingDefinition,
        {
          id: 'dev2-r5',
          instanceId: 'dev2-rid5',
          placeholderKey: '/content/phOnRendering11',
        } as LayoutRenderingDefinition,
        {
          id: 'dev2-r6',
          instanceId: 'dev2-rid6',
          placeholderKey: 'content2',
        } as LayoutRenderingDefinition,
      ],
    } as LayoutDeviceDefinition,
  ],
};

const TEST_PAGE_LAYOUT_WITH_PARAMETERS: PageLayoutDefinition = {
  devices: [
    {
      id: 'device1',
      layoutId: 'dev1-layout',
      renderings: [
        {
          id: 'dev1-r1',
          instanceId: 'dev1-rid1',
          placeholderKey: 'content',
          parameters: {
            param1: 'a=1&b=foo bar',
          },
        } as LayoutRenderingDefinition,
      ],
    } as LayoutDeviceDefinition,
  ],
};

const TEST_CURRENT_DEVICE = 'device2';

const renderingsUpdates: RenderingsDefinitionUpdates[] = [
  {
    renderingInstanceId: 'dev2-rid1',
    update: {
      dataSource: 'rid1-data-source',
      caching: { cacheable: true },
      placeholderKey: 'rid1-placeholder',
    },
  },
  {
    renderingInstanceId: 'dev2-rid2',
    update: {
      dataSource: 'rid2-data-source',
      caching: { cacheable: true },
      placeholderKey: 'rid2-placeholder',
    },
  },
];

const personalizationRules: PersonalizationRules[] = [
  {
    renderingInstanceId: 'dev2-rid1',
    rules: [
      {
        uniqueId: '',
        name: 'dev2-rid1-rule1',
        conditions: 'rule1',
        actions: [
          {
            uniqueId: '',
            id: '',
            dataSource: '',
          },
        ],
      },
      {
        uniqueId: '',
        name: 'dev2-rid1-rule2',
        conditions: 'rule2',
        actions: [
          {
            uniqueId: '',
            id: '',
            dataSource: '',
          },
        ],
      },
    ],
  },
  {
    renderingInstanceId: 'dev2-rid2',
    rules: [
      {
        uniqueId: '',
        name: 'dev2-rid2-rule1',
        conditions: 'rule1',
        actions: [
          {
            uniqueId: '',
            id: '',
            dataSource: '',
          },
        ],
      },
    ],
  },
];

describe(PageLayout.name, () => {
  let sut: PageLayout;
  let hooksSpy: jasmine.SpyObj<PageLayoutHooks>;
  let editingTestChannel: TestMessagingP2PChannel<
    EditingCanvasEvents,
    EditingHorizonEvents,
    EditingCanvasRpcServices,
    EditingHorizonRpcServices
  >;
  let canvasRenderingApiService: jasmine.SpyObj<CanvasRenderingApiService>;
  let editorWorkspaceService: jasmine.SpyObj<EditorWorkspaceService>;

  const getSutLayoutSnapshot = () => JSON.parse(sut.getLayoutSnapshot()) as PageLayoutDefinition;
  const INITIAL_CONTEXT: Context = {
    itemId: 'foo',
    siteName: 'sitename',
    itemVersion: 1,
    language: 'da',
  };

  beforeEach(() => {
    hooksSpy = jasmine.createSpyObj<PageLayoutHooks>({ hookInsertRendering: undefined });
    hooksSpy.hookInsertRendering.and.callFake((ctx) => Promise.resolve(ctx));
    editingTestChannel = makeTestMessagingP2PChannelFromDef(EditingChannelDef, {
      updatePageState: () => {},
      selectChrome: () => {},
      deselectChrome: () => {},
      highlightPartialDesign: () => {},
      unhighlightPartialDesign: () => {},
      getChildRenderings: () => [],
      getChildPlaceholders: () => [{ placeholderKey: '/content/phOnRendering1' } as PlaceholderChromeInfo],
      selectRendering: () => {},
      getRenderingFields: () => ({}) as RenderingFieldsdData,
      getPageFields: () => [],
    });

    canvasRenderingApiService = jasmine.createSpyObj<CanvasRenderingApiService>('CanvasRenderingApiService', [
      'fetchComponentRendering',
    ]);

    editorWorkspaceService = jasmine.createSpyObj<EditorWorkspaceService>('EditorWorkspaceService', [
      'setCanvasLoadState',
    ]);

    sut = new PageLayout(
      JSON.stringify(TEST_PAGE_LAYOUT),
      TEST_CURRENT_DEVICE,
      hooksSpy,
      editingTestChannel,
      INITIAL_CONTEXT,
      editorWorkspaceService,
    );
  });

  describe('snapshot', () => {
    it('should return snapshot containing presentation details', () => {
      const layout = getSutLayoutSnapshot();

      expect(findRendering(TEST_CURRENT_DEVICE, 'dev2-rid1', layout)).toBeTruthy();
    });

    it('should accept generated snapshot', () => {
      const snapshot = sut.getLayoutSnapshot();

      expect(async () => await sut.setLayoutSnapshot(snapshot)).not.toThrow();
    });

    it('should not emit layout change event if snapshot corresponds', async () => {
      const evSpy = jasmine.createSpy();
      sut.onLayoutChange(Lifetime.Eternal, evSpy);

      const snapshot = sut.getLayoutSnapshot();
      await sut.setLayoutSnapshot(snapshot);

      expect(evSpy).not.toHaveBeenCalled();
    });

    it('should update layout if changed since snapshot', async () => {
      const snapshot = sut.getLayoutSnapshot();
      await sut.insertRendering('someId', 'testph', undefined);
      const evSpy = jasmine.createSpy();
      sut.onLayoutChange(Lifetime.Eternal, evSpy);

      await sut.setLayoutSnapshot(snapshot);

      expect(evSpy).toHaveBeenCalled();
    });

    it('should update layout but not emit if silent', async () => {
      const snapshotBeforeChanges = sut.getLayoutSnapshot();
      await sut.insertRendering('someId', 'testph', undefined);
      const evSpy = jasmine.createSpy();
      sut.onLayoutChange(Lifetime.Eternal, evSpy);

      await sut.setLayoutSnapshot(snapshotBeforeChanges, true);

      expect(evSpy).not.toHaveBeenCalled();
      expect(sut.getLayoutSnapshot()).toBe(snapshotBeforeChanges);
    });
  });

  describe('move rendering', () => {
    it('should fail if device cannot be found', async () => {
      sut = new PageLayout(
        JSON.stringify(TEST_PAGE_LAYOUT),
        'non-existing-device',
        hooksSpy,
        editingTestChannel,
        INITIAL_CONTEXT,
        editorWorkspaceService,
      );

      await expectAsync(sut.moveRendering('rid', 'ph', undefined)).toBeRejectedWithError(
        `Device 'non-existing-device' was not found.`,
      );
    });

    it('should return false if rendering to move was not found', async () => {
      const successfullyMoved = await sut.moveRendering('not-existent-rendering-id', 'content', undefined);

      expect(successfullyMoved).toBeFalse();
    });

    it('should return true if moved successfully', async () => {
      const successfullyMoved = await sut.moveRendering('dev2-rid1', 'content', {
        target: 'dev2-rid2',
        position: 'after',
      });

      expect(successfullyMoved).toBeTrue();
    });

    it('should move at the end if anchor not specified', async () => {
      await sut.moveRendering('dev2-rid1', 'content', undefined);

      const result = getSutLayoutSnapshot();
      const lastRendering = result.devices.find((r) => r.id === TEST_CURRENT_DEVICE)!.renderings.pop()!;
      expect(lastRendering.id).toBe('dev2-r1');
    });

    it('should move at the end if moving after last rendering', async () => {
      await sut.moveRendering('dev2-rid1', 'content/phOnRendering11', { target: 'dev2-rid6', position: 'after' });

      const result = getSutLayoutSnapshot();
      const lastRendering = result.devices.find((r) => r.id === TEST_CURRENT_DEVICE)!.renderings.pop()!;
      expect(lastRendering.id).toBe('dev2-r1');
      expect(lastRendering.placeholderKey).toBe('content/phOnRendering11');
    });

    it('should move rendering before anchor', async () => {
      await sut.moveRendering('dev2-rid2', 'content', { target: 'dev2-rid1', position: 'before' });

      const result = getSutLayoutSnapshot();
      const renderings = result.devices.find((r) => r.id === TEST_CURRENT_DEVICE)!.renderings;

      expect(renderings.findIndex((r) => r.instanceId === 'dev2-rid2')).toBe(0);
      expect(renderings.findIndex((r) => r.instanceId === 'dev2-rid1')).toBe(1);
    });

    it('should move rendering after anchor', async () => {
      await sut.moveRendering('dev2-rid1', 'content', { target: 'dev2-rid2', position: 'after' });

      const result = getSutLayoutSnapshot();
      const renderings = result.devices.find((r) => r.id === TEST_CURRENT_DEVICE)!.renderings;

      expect(renderings.findIndex((r) => r.instanceId === 'dev2-rid2')).toBe(0);
      expect(renderings.findIndex((r) => r.instanceId === 'dev2-rid1')).toBe(1);
    });

    it('should not emit layout change event with provided chromeToSelect', async () => {
      const evSpy = jasmine.createSpy();
      sut.onLayoutChange(Lifetime.Eternal, evSpy);

      await sut.moveRendering('dev2-rid1', 'content', { target: 'dev2-rid2', position: 'after' });

      const movedRendering = getSutLayoutSnapshot().devices.find((r) => r.id === TEST_CURRENT_DEVICE)!.renderings[1]!;

      expect(movedRendering.instanceId).toBe('dev2-rid1');
      expect(evSpy).toHaveBeenCalledOnceWith({
        reloadCanvas: false,
        skipHistory: false,
        chromeToSelect: { chromeId: movedRendering.instanceId, chromeType: 'rendering' },
      });
    });

    it('should move child renderings', async () => {
      await sut.moveRendering('dev2-rid1', 'content2', { target: 'dev2-rid6', position: 'before' });

      const renderings = getSutLayoutSnapshot().devices.find((r) => r.id === TEST_CURRENT_DEVICE)!.renderings;

      const rendering = renderings[4];
      expect(rendering.instanceId).toBe('dev2-rid1');
      expect(rendering.placeholderKey).toBe('content2');

      const childRendering1 = renderings[1];
      expect(childRendering1.instanceId).toBe('dev2-rid3');
      expect(childRendering1.placeholderKey).toBe('/content2/phOnRendering1');

      const childRendering2 = renderings[2];
      expect(childRendering2.instanceId).toBe('dev2-rid4');
      expect(childRendering2.placeholderKey).toBe('/content2/phOnRendering1/phOnRendering3');

      const notChildRendering = renderings[3];
      expect(notChildRendering.instanceId).toBe('dev2-rid5');
      expect(notChildRendering.placeholderKey).toBe('/content/phOnRendering11');
    });
  });

  describe('insert rendering', () => {
    it('should fail if device cannot be found', async () => {
      sut = new PageLayout(
        JSON.stringify(TEST_PAGE_LAYOUT),
        'non-existing-device',
        hooksSpy,
        editingTestChannel,
        INITIAL_CONTEXT,
        editorWorkspaceService,
      );

      await expectAsync(sut.insertRendering('rid', 'ph', undefined)).toBeRejectedWithError(
        `Device 'non-existing-device' was not found.`,
      );
    });

    it('should insert at the end if anchor not specified', async () => {
      await sut.insertRendering('new-rendering-id', 'ph', undefined);

      const result = getSutLayoutSnapshot();
      const lastRendering = result.devices.find((r) => r.id === TEST_CURRENT_DEVICE)!.renderings.pop()!;
      expect(lastRendering.id).toBe('new-rendering-id');
    });

    it('should insert at the end if cannot find anchor', async () => {
      await sut.insertRendering('new-rendering-id', 'ph-42', {
        target: 'non-existing-anchor-rendering-id',
        position: 'after',
      });

      const result = getSutLayoutSnapshot();
      const lastRendering = result.devices.find((r) => r.id === TEST_CURRENT_DEVICE)!.renderings.pop()!;
      expect(lastRendering.id).toBe('new-rendering-id');
      expect(lastRendering.placeholderKey).toBe('ph-42');
    });

    it('should insert at the end if adding after last rendering', async () => {
      await sut.insertRendering('new-rendering-id', 'ph-42', { target: 'dev2-rid6', position: 'after' });

      const result = getSutLayoutSnapshot();
      const lastRendering = result.devices.find((r) => r.id === TEST_CURRENT_DEVICE)!.renderings.pop()!;
      expect(lastRendering.id).toBe('new-rendering-id');
      expect(lastRendering.placeholderKey).toBe('ph-42');
    });

    it('should insert rendering before anchor', async () => {
      await sut.insertRendering('new-rendering-id', 'ph-42', { target: 'dev2-rid2', position: 'before' });

      const result = getSutLayoutSnapshot();
      const addedRendering = result.devices.find((r) => r.id === TEST_CURRENT_DEVICE)!.renderings[1];
      expect(addedRendering.id).toBe('new-rendering-id');
    });

    it('should insert rendering after anchor', async () => {
      await sut.insertRendering('new-rendering-id', 'ph-42', { target: 'dev2-rid1', position: 'after' });

      const result = getSutLayoutSnapshot();
      const addedRendering = result.devices.find((r) => r.id === TEST_CURRENT_DEVICE)!.renderings[1];
      expect(addedRendering.id).toBe('new-rendering-id');
    });

    it('should generate new rendering instance id each time', async () => {
      await sut.insertRendering('new-rendering-id', 'ph-42', undefined);
      await sut.insertRendering('new-rendering-id', 'ph-42', undefined);

      const result = getSutLayoutSnapshot();
      const [addedRendering1, addedRendering2] = result.devices
        .find((r) => r.id === TEST_CURRENT_DEVICE)!
        .renderings.splice(2, 2);
      expect(addedRendering1.instanceId).not.toBe(addedRendering2.instanceId);
    });

    it('should emit layout change event with provided chromeToSelect', async () => {
      const evSpy = jasmine.createSpy();
      sut.onLayoutChange(Lifetime.Eternal, evSpy);

      await sut.insertRendering('new-rendering-id', 'ph-42', undefined);

      const addedRendering = getSutLayoutSnapshot().devices.find((r) => r.id === TEST_CURRENT_DEVICE)!.renderings[6];
      expect(evSpy).toHaveBeenCalledOnceWith({
        reloadCanvas: true,
        skipHistory: false,
        chromeToSelect: { chromeId: addedRendering.instanceId, chromeType: 'rendering' },
      });
    });

    it('should call hook on rendering insert', async () => {
      await sut.insertRendering('new-rendering-id', 'ph', undefined);

      expect(hooksSpy.hookInsertRendering).toHaveBeenCalledWith(
        jasmine.objectContaining({
          renderingDetails: jasmine.objectContaining<RenderingInitializationDetails>({
            renderingId: 'new-rendering-id',
            placeholderKey: 'ph',
          }),
        }),
      );
    });

    it('should not add rendering if intialization event is canceled', async () => {
      hooksSpy.hookInsertRendering.and.callFake((ctx) => Promise.resolve({ ...ctx, cancelRenderingInsert: true }));

      const result = await sut.insertRendering('new-rendering-id', 'ph', undefined);

      const layout = sut.getLayoutSnapshot();
      expect(layout).not.toContain('new-rendering-id');
      expect(result).toEqual(false);
    });

    it('should add rendering returned from intialization event', async () => {
      hooksSpy.hookInsertRendering.and.callFake((ctx) =>
        Promise.resolve({
          ...ctx,

          renderingDetails: {
            ...ctx.renderingDetails,
            renderingId: 'updated-rendering-id',
            dataSource: 'data-source',
            parameters: {
              p1: 'v1',
            },
          },
        }),
      );

      const insertResult = await sut.insertRendering('new-rendering-id', 'ph', undefined);

      const result = getSutLayoutSnapshot();
      const lastRendering = result.devices.find((r) => r.id === TEST_CURRENT_DEVICE)!.renderings.pop()!;
      expect(lastRendering).toEqual(
        jasmine.objectContaining<LayoutRenderingDefinition>({
          id: 'updated-rendering-id',
          dataSource: 'data-source',
          parameters: {
            p1: 'v1',
          },
        }),
      );
      expect(insertResult).toEqual(true);
    });
  });

  describe('find rendering', () => {
    it('should return rendering from active device', () => {
      const result = sut.findRendering('dev2-rid2');

      expect(result).toBeTruthy();
    });

    it('should not return renderings from non-active devices', () => {
      const result = sut.findRendering('dev1-rid1');

      expect(result).toBeFalsy();
    });

    it('should return null if cannot find rendering', () => {
      const result = sut.findRendering('some unknown id');

      expect(result).toBeFalsy();
    });
  });

  describe('get all renderings', () => {
    it('should return all renderings from active device', () => {
      const result = sut.getAllRenderings();

      expect(result).toBeTruthy();
      expect(result.length).toBe(6);
      expect(result[0].id).toBe('dev2-r1');
      expect(result[1].id).toBe('dev2-r2');
      expect(result[2].id).toBe('dev2-r3');
      expect(result[3].id).toBe('dev2-r4');
      expect(result[4].id).toBe('dev2-r5');
      expect(result[5].id).toBe('dev2-r6');
    });
  });

  describe('remove rendering', () => {
    it('should remove rendering', async () => {
      await sut.removeRendering('dev2-rid1');

      expect(findRendering(TEST_CURRENT_DEVICE, 'dev2-rid1', getSutLayoutSnapshot())).toBeFalsy();
      expect(editingTestChannel.getEmittedEvents('canvas:change-dom')[0]).toEqual({
        eventType: 'remove',
        chromeType: 'rendering',
        renderingInstanceId: 'dev2-rid1',
      });
    });

    it('should remove child renderings', async () => {
      await sut.removeRendering('dev2-rid1');

      expect(findRendering(TEST_CURRENT_DEVICE, 'dev2-rid1', getSutLayoutSnapshot())).toBeFalsy();
      expect(findRendering(TEST_CURRENT_DEVICE, 'dev2-rid3', getSutLayoutSnapshot())).toBeFalsy();
      expect(findRendering(TEST_CURRENT_DEVICE, 'dev2-rid4', getSutLayoutSnapshot())).toBeFalsy();
      expect(findRendering(TEST_CURRENT_DEVICE, 'dev2-rid5', getSutLayoutSnapshot())).toBeTruthy();

      expect(editingTestChannel.getEmittedEvents('canvas:change-dom')[0]).toEqual({
        eventType: 'remove',
        chromeType: 'rendering',
        renderingInstanceId: 'dev2-rid1',
      });
    });

    it('should remove rendering in canvas conditionally based on updateCanvas parameter', async () => {
      const updateCanvas = false;
      await sut.removeRendering('dev2-rid1', true, updateCanvas);

      expect(findRendering(TEST_CURRENT_DEVICE, 'dev2-rid1', getSutLayoutSnapshot())).toBeFalsy();
      expect(editingTestChannel.getEmittedEvents('canvas:change-dom').length).toBe(0);
    });

    it('should not fail if rendering is not exist', async () => {
      await expectAsync(sut.removeRendering('non-existing id')).toBeResolved();
    });
  });

  describe('moveRenderingWithinSamePlaceholder', () => {
    it('should re-arrange renderings', async () => {
      await sut.moveRenderingWithinSamePlaceholder('dev2-rid1', 'down');

      const renderings = getSutLayoutSnapshot().devices.find((d) => d.id === TEST_CURRENT_DEVICE)!.renderings;

      expect(renderings.findIndex((r) => r.instanceId === 'dev2-rid2')).toBe(4);
      expect(renderings.findIndex((r) => r.instanceId === 'dev2-rid1')).toBe(5);

      expect(editingTestChannel.getEmittedEvents('canvas:change-dom')[0]).toEqual({
        eventType: 'rearrangeInSamePlaceholder',
        chromeType: 'rendering',
        renderingInstanceId: 'dev2-rid1',
        direction: 'down',
      });
    });

    it('should emit layout change', async () => {
      const evSpy = jasmine.createSpy();
      sut.onLayoutChange(Lifetime.Eternal, evSpy);

      await sut.moveRenderingWithinSamePlaceholder('dev2-rid1', 'down');

      expect(evSpy).toHaveBeenCalledWith({
        reloadCanvas: false,
        skipHistory: false,
      });
    });

    describe('WHEN cannot find rendering to move', () => {
      it('should NOT move renderings and NOT emit layout change ', async () => {
        const evSpy = jasmine.createSpy();
        sut.onLayoutChange(Lifetime.Eternal, evSpy);

        await sut.moveRenderingWithinSamePlaceholder('not exist', 'down');

        const [rendering1, rendering2] = getSutLayoutSnapshot().devices.find(
          (d) => d.id === TEST_CURRENT_DEVICE,
        )!.renderings;
        expect(rendering1.instanceId).toBe('dev2-rid1');
        expect(rendering2.instanceId).toBe('dev2-rid2');
        expect(evSpy).not.toHaveBeenCalled();
        expect(editingTestChannel.getEmittedEvents('canvas:change-dom').length).toBe(0);
      });
    });

    describe('WHEN rendering does not have placeholderKey', () => {
      it('should NOT move renderings and NOT emit layout change ', async () => {
        const evSpy = jasmine.createSpy();
        sut.onLayoutChange(Lifetime.Eternal, evSpy);

        await sut.moveRenderingWithinSamePlaceholder('dev1-r1', 'down');

        expect(evSpy).not.toHaveBeenCalled();
        expect(editingTestChannel.getEmittedEvents('canvas:change-dom').length).toBe(0);
      });
    });
  });

  describe('set renderings personalization rules', () => {
    it('should set personalization rules for all the specified renderings', () => {
      sut.setRenderingsPersonalizationRules(personalizationRules);

      const r1 = sut.findRendering('dev2-rid1');
      expect(r1!.personalization).not.toBe(undefined);
      expect(r1!.personalization?.ruleSet).not.toBe(undefined);
      expect(r1!.personalization?.ruleSet?.rules.length).toBe(2);
      expect(r1!.personalization?.ruleSet?.rules[0].name).toBe('dev2-rid1-rule1');
      expect(r1!.personalization?.ruleSet?.rules[1].name).toBe('dev2-rid1-rule2');

      const r2 = sut.findRendering('dev2-rid2');
      expect(r2!.personalization).not.toBe(undefined);
      expect(r2!.personalization?.ruleSet).not.toBe(undefined);
      expect(r2!.personalization?.ruleSet?.rules.length).toBe(1);
      expect(r2!.personalization?.ruleSet?.rules[0].name).toBe('dev2-rid2-rule1');
    });

    it('should clear rendering personalization settings if its rules contains only default rule with no action', () => {
      // arrange
      sut.setRenderingsPersonalizationRules(personalizationRules);
      let rendering = sut.findRendering('dev2-rid1');
      expect(rendering!.personalization!.ruleSet!.rules.length).toBe(2);

      const rules: Rule[] = [
        {
          uniqueId: '{00000000-0000-0000-0000-000000000000}',
          name: 'default',
          conditions: 'default',
        },
      ];

      // act
      sut.setRenderingsPersonalizationRules([{ renderingInstanceId: 'dev2-rid1', rules }]);

      // assert
      rendering = sut.findRendering('dev2-rid1');
      expect(rendering!.personalization).toEqual({});
    });

    it('should not clear personalization settings if default rule contains actions', () => {
      // arrange
      sut.setRenderingsPersonalizationRules(personalizationRules);
      let rendering = sut.findRendering('dev2-rid1');
      expect(rendering!.personalization!.ruleSet!.rules.length).toBe(2);

      const rules: Rule[] = [
        {
          uniqueId: '{00000000-0000-0000-0000-000000000000}',
          name: 'default',
          conditions: 'default',
          actions: [
            {
              uniqueId: '',
              id: '',
              dataSource: '',
            },
          ],
        },
      ];

      // act
      sut.setRenderingsPersonalizationRules([{ renderingInstanceId: 'dev2-rid1', rules }]);

      // assert
      rendering = sut.findRendering('dev2-rid1');
      expect(rendering!.personalization).not.toBe(undefined);
      expect(rendering!.personalization?.ruleSet).not.toBe(undefined);
      expect(rendering!.personalization?.ruleSet?.rules.length).toBe(1);
      expect(rendering!.personalization?.ruleSet?.rules[0].name).toBe('default');
    });
  });

  describe('get rendering personalization rules', () => {
    it('should return empty array when no personaliozation rules are set for the specified rendering', () => {
      // act
      const rules = sut.getRenderingPersonalizationRules('dev2-rid1');

      // assert
      expect(rules).toEqual([]);
    });

    it('should return personalization rules for the specified rendering', () => {
      // arrange
      sut.setRenderingsPersonalizationRules(personalizationRules);

      // act
      const rules = sut.getRenderingPersonalizationRules('dev2-rid1');

      // assert
      expect(rules).toEqual(personalizationRules[0].rules);
    });
  });

  describe('update renderings', () => {
    it('for all renderings, should update properties', async () => {
      await sut.updateRenderings(renderingsUpdates);

      const r1 = sut.findRendering('dev2-rid1');
      const r2 = sut.findRendering('dev2-rid2');
      expect(r1!.dataSource).toEqual('rid1-data-source');
      expect(r1!.placeholderKey).toEqual('rid1-placeholder');
      expect(r1!.caching).toEqual({ cacheable: true });
      expect(r2!.dataSource).toEqual('rid2-data-source');
      expect(r2!.placeholderKey).toEqual('rid2-placeholder');
      expect(r2!.caching).toEqual({ cacheable: true });
    });

    it('for all renderings, should not touch non-specified properties', async () => {
      await sut.updateRenderings(renderingsUpdates);

      const r1 = sut.findRendering('dev2-rid1');
      const r2 = sut.findRendering('dev2-rid2');
      expect(r1!.id).toEqual('dev2-r1');
      expect(r2!.id).toEqual('dev2-r2');
    });

    it('should be possible to reset dataSource property', async () => {
      await sut.updateRenderings([{ renderingInstanceId: 'dev2-rid1', update: { dataSource: null } }]);

      const rendering = sut.findRendering('dev2-rid1');
      expect(rendering!.dataSource).toBeNull();
    });

    it('for all renderings, should not mutate existing rendering definition object', async () => {
      const r1Before = sut.findRendering('dev2-rid1');
      const r2Before = sut.findRendering('dev2-rid2');

      await sut.updateRenderings(renderingsUpdates);
      expect(r1Before!.dataSource).toBe('ds');
      expect(r2Before!.dataSource).toBeNull();
    });

    it('non-existing rendering id should not affect updating of valid renderings', async () => {
      const updates = [...renderingsUpdates];
      updates[0] = {
        renderingInstanceId: 'non-existing-rendering',
        update: {
          dataSource: 'rid1-data-source',
          caching: { cacheable: true },
          placeholderKey: 'rid1-placeholder',
        },
      };
      await sut.updateRenderings(updates);
      const r1 = sut.findRendering('dev2-rid1');
      const r2 = sut.findRendering('dev2-rid2');

      // should be original values
      expect(r1!.dataSource).toEqual('ds');
      expect(r1!.placeholderKey).toEqual('content');
      expect(r2!.dataSource).toEqual('rid2-data-source');

      // should be modified values
      expect(r2!.placeholderKey).toEqual('rid2-placeholder');
      expect(r2!.caching).toEqual({ cacheable: true });
    });
  });

  describe(PageLayout.isSameLayout.name, () => {
    it('should return true for identical layouts', () => {
      const layout1 = PageLayout.stringifyLayoutDefinition({ devices: [] });
      const layout2 = PageLayout.stringifyLayoutDefinition({ devices: [] });

      const result = PageLayout.isSameLayout(layout1, layout2);

      expect(result).toBeTrue();
    });

    it('should property handle undefined values', () => {
      const layout = PageLayout.stringifyLayoutDefinition({ devices: [] });

      expect(PageLayout.isSameLayout(undefined, undefined)).toBeTrue();
      expect(PageLayout.isSameLayout(layout, undefined)).toBeFalse();
      expect(PageLayout.isSameLayout(undefined, layout)).toBeFalse();
    });

    it('should return false for different layouts', () => {
      // arrange
      const layout1 = PageLayout.stringifyLayoutDefinition({
        devices: [
          {
            id: 'dev1',
            layoutId: 'l1',
            placeholders: [],
            renderings: [
              {
                id: 'id1',
                placeholderKey: 'phKey1',
              } as LayoutRenderingDefinition,
            ],
          },
        ],
      });
      const layout2 = PageLayout.stringifyLayoutDefinition({
        devices: [
          {
            id: 'dev1',
            layoutId: 'l1',
            placeholders: [],
            renderings: [
              {
                id: 'id1',
                placeholderKey: 'phKeyChanged',
              } as LayoutRenderingDefinition,
            ],
          },
        ],
      });

      // act & assert
      expect(PageLayout.isSameLayout(layout1, layout2)).toBeFalse();
    });
  });

  describe('encode rendering parameters', () => {
    it('should encode rendering parameters', () => {
      const resultLayout = PageLayout.encodeRenderingParameters(JSON.stringify(TEST_PAGE_LAYOUT_WITH_PARAMETERS));

      expect(resultLayout).toContain(encodeURIComponent('a=1&b=foo bar'));
    });
  });
});
