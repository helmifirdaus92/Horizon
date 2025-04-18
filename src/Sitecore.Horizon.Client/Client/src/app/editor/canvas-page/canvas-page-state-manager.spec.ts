/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { FieldValue } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { EditingShellContext } from 'sdk';
import { EditorWorkspaceService } from '../editor-workspace/editor-workspace.service';
import { PageLayout } from '../shared/layout/page-layout';
import { CanvasPageServiceApi } from './canvas-page-state';
import { CanvasPageStateManager } from './canvas-page-state-manager';

describe(CanvasPageStateManager.name, () => {
  let sut: CanvasPageStateManager;
  let messagingServiceSpy: jasmine.SpyObj<MessagingService>;
  let editorWorkspaceServiceSpy: jasmine.SpyObj<EditorWorkspaceService>;
  let canvasServiceApiSpy: jasmine.SpyObj<CanvasPageServiceApi>;

  const mockFields: FieldValue[] = [
    { itemId: 'item1', fieldId: 'field1', reset: false, itemVersion: 1, value: { rawValue: 'value1' } },
    { itemId: 'item2', fieldId: 'field2', reset: true, itemVersion: 1, value: { rawValue: 'value2' } },
  ];
  const mockLayout = PageLayout.stringifyLayoutDefinition({ devices: [] });
  const mockLayoutDeviceId = 'mockLayoutDeviceId';
  const mockContext = { itemId: 'context1', itemVersion: 1, language: 'en' } as EditingShellContext;

  beforeEach(() => {
    messagingServiceSpy = jasmine.createSpyObj<MessagingService>('MessagingService', [
      'getEditingCanvasChannel',
      'connectEditingShell',
      'onCanvasDisconnect',
    ]);

    editorWorkspaceServiceSpy = jasmine.createSpyObj('EditorWorkspaceService', ['']);
    canvasServiceApiSpy = jasmine.createSpyObj('CanvasPageServiceApi', [
      'updateCanvasFields',
      'hookInsertRendering',
      'saveItemChanges',
      'reloadCanvas',
      'notifyWorkspaceUpdate',
      'notifyFieldsSaved',
    ]);

    TestBed.configureTestingModule({
      imports: [ContextServiceTestingModule],
      providers: [
        CanvasPageStateManager,
        { provide: MessagingService, useValue: messagingServiceSpy },
        { provide: EditorWorkspaceService, useValue: editorWorkspaceServiceSpy },
      ],
    });

    canvasServiceApiSpy.saveItemChanges.and.resolveTo({ kind: 'successful', fields: [] });
    sut = TestBed.inject(CanvasPageStateManager);
  });

  describe('KeepDraftChanges', () => {
    beforeEach(() => {
      sut.initialize(canvasServiceApiSpy);
      sut.onPageLoad(mockFields, mockLayout, mockLayoutDeviceId, mockContext);
      sut.switchMode('draft');
    });

    it('should commit draft changes to persist state', async () => {
      (sut as any).canvasStates.get('draft').fields = [
        { itemId: 'item1', fieldId: 'field1', itemVersion: 1, reset: false, value: { rawValue: 'updatedValue' } },
      ];

      await sut.KeepDraftChanges();

      expect(sut.getCurrentMode()).toBe('persist');
      expect(sut.getActivePageState().getStateSnapshot().fields).toEqual([
        { itemId: 'item1', fieldId: 'field1', itemVersion: 1, reset: false, value: { rawValue: 'updatedValue' } },
        { itemId: 'item2', fieldId: 'field2', reset: true, itemVersion: 1, value: { rawValue: 'value2' } },
      ]);
    });
  });

  describe('discardDraftChanges', () => {
    beforeEach(() => {
      sut.initialize(canvasServiceApiSpy);
      sut.onPageLoad(mockFields, mockLayout, mockLayoutDeviceId, mockContext);
      sut.switchMode('draft');
    });

    it('should discard draft changes and revert to persist state', () => {
      (sut as any).canvasStates.get('draft').fields = [
        { itemId: 'item1', fieldId: 'field1', reset: false, value: { rawValue: 'draftModified' } },
      ];

      sut.discardDraftChanges(false);

      expect(sut.getCurrentMode()).toBe('persist');
      expect(sut.getActivePageState().getStateSnapshot().fields).toEqual(mockFields);
    });
  });

  describe('hasPendingChanges', () => {
    beforeEach(() => {
      sut.initialize(canvasServiceApiSpy);
      sut.onPageLoad(mockFields, mockLayout, mockLayoutDeviceId, mockContext);
      sut.switchMode('draft');
    });

    it('should return true if there are pending changes', () => {
      (sut as any).canvasStates.get('draft').fields = [
        { itemId: 'item1', fieldId: 'field1', reset: false, value: { rawValue: 'changedValue' } },
      ];

      expect(sut.hasPendingChanges()).toBeTrue();
    });

    it('should return false if there are no pending changes', () => {
      expect(sut.hasPendingChanges()).toBeFalse();
    });
  });

  describe('clearStates', () => {
    it('should clear all states and reset to persist mode', () => {
      sut.initialize(canvasServiceApiSpy);
      sut.onPageLoad(mockFields, mockLayout, mockLayoutDeviceId, mockContext);

      sut.clearStates();

      expect(sut.getCurrentMode()).toBe('persist');
      expect(sut.getActivePageState()).toBeUndefined();
    });
  });
});
