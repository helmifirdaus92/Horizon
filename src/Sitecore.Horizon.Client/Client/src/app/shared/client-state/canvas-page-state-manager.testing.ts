/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable, NgModule } from '@angular/core';
import { CanvasPageServiceApi, CanvasPageState } from 'app/editor/canvas-page/canvas-page-state';
import { CanvasPageStateManager, ShallowCanvasPageServiceApi } from 'app/editor/canvas-page/canvas-page-state-manager';
import { EditorWorkspaceService } from 'app/editor/editor-workspace/editor-workspace.service';
import { EditingMode } from 'app/editor/lhs-panel/data-view/fields-tracker.service';
import { HistoryService } from 'app/editor/shared/history/history.service';
import { queueScheduler } from 'rxjs';
import { EditingShellContext, FieldState } from 'sdk/contracts/editing-shell.contract';
import { MessagingService } from '../messaging/messaging.service';

export const DEFAULT_TEST_CONTEXT: EditingShellContext = {
  itemId: 'testItem1234',
  language: 'en-US',
  siteName: 'testSite',
  itemVersion: 1,
};

export const DEFAULT_TEST_FIELDS: FieldState[] = [
  { fieldId: 'field1', itemId: 'testItem1234', value: { rawValue: 'Test Value 1' }, reset: false },
  { fieldId: 'field2', itemId: 'testItem1234', value: { rawValue: 'Test Value 2' }, reset: false },
];

export const DEFAULT_TEST_LAYOUT = JSON.stringify({ devices: [] });
export const DEFAULT_TEST_LAYOUT_DEVICE_ID = 'device123';

@Injectable()
export class CanvasPageStateManagerTesting extends CanvasPageStateManager {
  provideTestState(mode: EditingMode, state: Partial<CanvasPageState>) {
    this.canvasStates.set(mode, {
      ...state,
    } as CanvasPageState);
  }

  provideDefaultTestState() {
    this.initialize(
      new ShallowCanvasPageServiceApi(
        { updateCanvasFields: (_fields) => Promise.resolve() } as CanvasPageServiceApi,
        {} as HistoryService,
      ),
    );
    this.onPageLoad(DEFAULT_TEST_FIELDS, DEFAULT_TEST_LAYOUT, DEFAULT_TEST_LAYOUT_DEVICE_ID, DEFAULT_TEST_CONTEXT);
  }

  setTestMode(mode: EditingMode) {
    this.switchMode(mode);
  }

  async setTestFields(fields: FieldState[]) {
    this.getActivePageState().updatePage({ fields }, 'DATA-VIEW');
  }

  async commitTestDraftChanges() {
    await this.KeepDraftChanges();
  }

  discardTestDraftChanges() {
    this.discardDraftChanges(false);
  }

  async reloadTestCanvas() {
    await this.getActivePageState().updatePage({}, 'CANVAS');
  }
}

@NgModule({
  providers: [
    { provide: CanvasPageStateManagerTesting, useClass: CanvasPageStateManagerTesting },
    { provide: CanvasPageStateManager, useExisting: CanvasPageStateManagerTesting },
    { provide: MessagingService, useValue: jasmine.createSpyObj('MessagingService', ['getEditingCanvasChannel']) },
    {
      provide: EditorWorkspaceService,
      useValue: jasmine.createSpyObj('EditorWorkspaceService', ['setCanvasLoadState', 'watchCanvasLoadState']),
    },
    { provide: queueScheduler, useValue: queueScheduler },
  ],
})
export class CanvasPageStateManagerTestingModule {}
