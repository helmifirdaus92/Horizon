/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { VersionsUtilService } from 'app/editor/right-hand-side/versions/versions-util.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { ItemChangeService } from 'app/shared/client-state/item-change-service';
import { BaseItemDalService } from 'app/shared/graphql/item.dal.service';
import { LayoutKind } from 'app/shared/graphql/item.interface';
import { TimedNotification, TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { asObservable } from 'app/shared/utils/rxjs/rxjs-custom';
import { GlobalMessagingTestingModule } from 'app/testing/global-messaging-testing';
import { createSpyObserver, TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { Observer, of, throwError } from 'rxjs';
import { WorkspaceItemState } from 'sdk';
import { FieldState } from '../history/field-state';
import { PageState } from '../history/page-state';
import { VersionsWorkflowService } from '../versions-workflow/versions-workflow.service';
import { BaseSaveDalService } from './graphql/save.dal.service';
import { SaveErrorService } from './save-error.service';
import { SaveItemDetails, SaveLayoutDetails, SaveResult } from './save.interfaces';
import { SaveService } from './save.service';

describe(SaveService.name, () => {
  let sut: SaveService;
  let controller: ApolloTestingController;
  let itemChangeServiceSpy: jasmine.SpyObj<ItemChangeService>;
  let timedNotificationsServiceSpy: jasmine.SpyObj<TimedNotificationsService>;
  let versionUtilsServiceSpy: jasmine.SpyObj<VersionsUtilService>;
  let versionsWorkflowServiceSpy: jasmine.SpyObj<VersionsWorkflowService>;
  let contextService: ContextServiceTesting;
  let getItemSpy: jasmine.Spy;
  let saveDalServiceSpy: jasmine.SpyObj<BaseSaveDalService>;

  beforeEach(() => {
    itemChangeServiceSpy = jasmine.createSpyObj<ItemChangeService>({
      notifyChange: undefined,
    });

    TestBed.configureTestingModule({
      imports: [
        ApolloTestingModule,
        ContextServiceTestingModule,
        TranslateModule,
        TranslateServiceStubModule,
        GlobalMessagingTestingModule,
      ],
      providers: [
        SaveService,
        {
          provide: ItemChangeService,
          useValue: itemChangeServiceSpy,
        },
        {
          provide: TimedNotificationsService,
          useValue: jasmine.createSpyObj<TimedNotificationsService>(['pushNotification', 'push']),
        },
        {
          provide: VersionsUtilService,
          useValue: jasmine.createSpyObj<VersionsUtilService>(['createVersion']),
        },
        {
          provide: VersionsWorkflowService,
          useValue: jasmine.createSpyObj<VersionsWorkflowService>(['watchActiveVersion']),
        },
        {
          provide: SaveErrorService,
          useValue: jasmine.createSpyObj<SaveErrorService>(['handleSaveResult']),
        },
        {
          provide: BaseItemDalService,
          useValue: jasmine.createSpyObj<BaseItemDalService>({
            getItem: of({ workflow: { finalState: true } } as any),
          }),
        },
        {
          provide: BaseSaveDalService,
          useValue: jasmine.createSpyObj<BaseSaveDalService>({ savePage: undefined }),
        },
      ],
    });

    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideDefaultTestContext();

    getItemSpy = spyOn(contextService, 'getItem');
    getItemSpy.and.resolveTo({ workflow: { finalState: false }, presentationDetails: 'presentationDetails001' });

    timedNotificationsServiceSpy = TestBedInjectSpy(TimedNotificationsService);

    versionsWorkflowServiceSpy = TestBedInjectSpy(VersionsWorkflowService);
    versionsWorkflowServiceSpy.watchActiveVersion.and.returnValue(
      of({
        versionNumber: 1,
      }) as any,
    );

    versionUtilsServiceSpy = TestBedInjectSpy(VersionsUtilService);
    versionUtilsServiceSpy.createVersion.and.resolveTo(true);
    saveDalServiceSpy = TestBedInjectSpy(BaseSaveDalService);

    sut = TestBed.inject(SaveService);
    controller = TestBed.inject(ApolloTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  it('should be defined', () => {
    expect(sut).toBeTruthy();
  });

  describe('save', () => {
    let originalWorkspaceItemState: WorkspaceItemState;
    let pageStateToSave: PageState;

    let saveStateSpy: jasmine.Spy;
    let returnValueSpy: jasmine.SpyObj<Observer<SaveResult>>;

    let saveOperationResult: SaveResult;

    const layoutEditingKind = 'FINAL' as LayoutKind;
    const siteName = 'test-site';
    const language = 'catalan-ofc';
    const itemToSaveId = '123';
    const itemVersion = 1;
    const fieldId = 'field-foo';
    const fieldOriginalValue = 'field Original';
    const layoutOriginalValue = 'layout Original';
    const revisionOriginalValue = 'revision Original';
    const fieldNewValue = '42';
    const revisionNewValue = 'rev1';

    const mockedSaveResult: SaveResult = {
      errors: [],
      savedItems: [],
      validationErrors: [],
      warnings: [],
      newCreatedVersions: [],
    };

    beforeEach(() => {
      const pageField = new FieldState(fieldId, itemToSaveId, { rawValue: fieldNewValue }, false, itemVersion);
      pageStateToSave = new PageState([pageField], 'test layout');

      originalWorkspaceItemState = {
        itemId: itemToSaveId,
        language: 'en',
        revision: revisionOriginalValue,
        fields: [
          {
            fieldId,
            itemId: itemToSaveId,
            value: { rawValue: fieldOriginalValue },
            revision: revisionOriginalValue,
            reset: false,
          },
          {
            fieldId: 'fieldId-02',
            itemId: itemToSaveId,
            value: { rawValue: fieldOriginalValue },
            revision: revisionOriginalValue,
            reset: false,
          },
        ],
        layout: layoutOriginalValue,
      };

      saveOperationResult = {
        errors: [],
        savedItems: [
          {
            fields: [
              {
                id: fieldId,
                originalValue: fieldOriginalValue,
                value: fieldNewValue,
                reset: false,
              },
            ],
            id: itemToSaveId,
            language,
            revision: revisionNewValue,
            version: itemVersion,
          },
        ],
        validationErrors: [],
        warnings: [],
        newCreatedVersions: [{ itemId: 'test-item-1', displayName: 'foo', versionNumber: 2 }],
      };
    });

    // Can't move this to beforeEach because it needs to run in the scope of `fakeSchedulers`, which is declared on `it`
    function setSpiesAndCallSave(contextItemId = itemToSaveId) {
      saveStateSpy = jasmine.createSpy('save-state');
      returnValueSpy = createSpyObserver();

      sut.updateWorkspaceItemState(originalWorkspaceItemState);
      sut.saveState$.subscribe(saveStateSpy);
      sut
        .savePage(pageStateToSave, { language, siteName, itemId: contextItemId, itemVersion }, layoutEditingKind)
        .subscribe(returnValueSpy);
    }

    it('should save the data through save dal service', fakeAsync(() => {
      const saveLayoutDetail: SaveLayoutDetails = {
        itemId: itemToSaveId,
        itemVersion,
        presentationDetails: {
          kind: 'FINAL',
          body: 'test layout',
        },
        originalPresentationDetails: {
          kind: 'FINAL',
          body: 'layout Original',
        },
        revision: 'revision Original',
      };

      const expectedSaveItemWithFields: SaveItemDetails = {
        itemId: itemToSaveId,
        itemVersion,
        revision: revisionOriginalValue,
        fields: [{ id: fieldId, value: fieldNewValue, originalValue: fieldOriginalValue, reset: false }],
      };

      saveDalServiceSpy.savePage.and.returnValue(of(mockedSaveResult));

      setSpiesAndCallSave();
      tick();

      expect(saveDalServiceSpy.savePage).toHaveBeenCalledOnceWith(
        language,
        siteName,
        [saveLayoutDetail],
        [expectedSaveItemWithFields],
      );
      flush();
    }));

    it('should update workspaceItemState with latest data from save result', fakeAsync(() => {
      saveDalServiceSpy.savePage.and.returnValue(of(saveOperationResult));

      setSpiesAndCallSave();
      tick();

      const state = sut['workspaceItemState'] as WorkspaceItemState;
      expect(state.revision).toBe(revisionNewValue);
      expect(state.fields[0].revision).toBe(revisionNewValue);
      expect(state.fields[0].value.rawValue).toBe(fieldNewValue);
      expect(state.layout).toBe('presentationDetails001');
      flush();
    }));

    it('should update workspaceItemState with new fields', fakeAsync(() => {
      sut.updateWorkspaceItemState(originalWorkspaceItemState);
      const dataSourceItemState = {
        itemId: itemToSaveId,
        language: 'en',
        revision: revisionOriginalValue,
        fields: [
          {
            itemId: 'ds001',
            fieldId: 'dsField001',
            value: { rawValue: 'dsField001Value' },
            revision: 'dsField001Revision',
            reset: false,
          },
        ],
      };
      sut.updateWorkspaceItemState(dataSourceItemState);

      const state = sut['workspaceItemState'] as WorkspaceItemState;
      expect(state.revision).toBe(dataSourceItemState.revision);
      expect(state.itemId).toBe(dataSourceItemState.itemId);

      expect(state.fields.length).toBe(3);
      expect(state.fields[0].itemId).toBe('ds001');
      expect(state.fields[0].fieldId).toBe('dsField001');
      expect(state.fields[0].revision).toBe('dsField001Revision');
      expect(state.fields[0].value.rawValue).toBe('dsField001Value');
      flush();
    }));

    it('should get revision and original value from matching itemId and fieldId value', fakeAsync(() => {
      saveDalServiceSpy.savePage.and.returnValue(of(mockedSaveResult));
      originalWorkspaceItemState = {
        revision: 'context-item-revision',
        itemId: 'context-item-id',
        language: 'en',
        fields: [
          {
            fieldId: 'field-1',
            itemId: 'ds-item-1',
            revision: 'expected-item-revision',
            value: { rawValue: 'expected-value' },
            reset: false,
          },
          {
            fieldId: 'field-1',
            itemId: 'ds-item-2',
            revision: 'samefield-wrongitem-revision',
            value: { rawValue: 'samefield-wrongitem-value' },
            reset: false,
          },
          {
            fieldId: 'field-2',
            itemId: 'ds-item-1',
            revision: 'sameitem-wrongfield-revision',
            value: { rawValue: 'sameitem-wrongfield-value' },
            reset: false,
          },
        ],
      };

      const expectedSaveItemWithFields: SaveItemDetails = {
        itemId: 'ds-item-1',
        itemVersion: undefined,
        revision: 'expected-item-revision',
        fields: [{ id: 'field-1', value: 'new-value', originalValue: 'expected-value', reset: false }],
      };

      const pageField = new FieldState('field-1', 'ds-item-1', { rawValue: 'new-value' }, false, itemVersion);
      pageStateToSave = new PageState([pageField]);

      setSpiesAndCallSave(originalWorkspaceItemState.itemId);
      tick();

      expect(saveDalServiceSpy.savePage).toHaveBeenCalledOnceWith(language, siteName, [], [expectedSaveItemWithFields]);
    }));

    it('should send empty guid revision when saving multiple fields with diffrent revission', fakeAsync(() => {
      saveDalServiceSpy.savePage.and.returnValue(of(mockedSaveResult));
      originalWorkspaceItemState = {
        revision: 'context-item-revision',
        itemId: 'context-item-id',
        language: 'en',
        fields: [
          {
            fieldId: 'field-1',
            itemId: 'ds-item-1',
            revision: 'field1-revision',
            value: { rawValue: 'field1-value' },
            reset: false,
          },
          {
            fieldId: 'field-2',
            itemId: 'ds-item-1',
            revision: 'field2-revision',
            value: { rawValue: 'field2-value' },
            reset: false,
          },
        ],
      };

      const pageField1 = new FieldState('field-1', 'ds-item-1', { rawValue: 'new-value1' }, false);
      const pageField2 = new FieldState('field-2', 'ds-item-1', { rawValue: 'new-value2' }, false);
      pageStateToSave = new PageState([pageField1, pageField2]);

      setSpiesAndCallSave(originalWorkspaceItemState.itemId);
      tick();

      expect(saveDalServiceSpy.savePage).toHaveBeenCalledOnceWith(
        language,
        siteName,
        [],
        jasmine.arrayContaining([jasmine.objectContaining({ revision: '00000000-0000-0000-0000-000000000000' })]),
      );
      tick();
      flush();
    }));

    it('should not pass itemVersion when item to save and context item are not the same', fakeAsync(() => {
      const contextPageItemId = '321';
      saveDalServiceSpy.savePage.and.returnValue(of(mockedSaveResult));
      setSpiesAndCallSave(contextPageItemId);
      tick();

      const expectedSaveItem: SaveItemDetails = {
        itemId: itemToSaveId,
        itemVersion: undefined,
        revision: revisionOriginalValue,
        fields: [{ id: fieldId, value: fieldNewValue, originalValue: fieldOriginalValue, reset: false }],
      };

      expect(saveDalServiceSpy.savePage).toHaveBeenCalledWith(
        jasmine.anything(),
        jasmine.anything(),
        jasmine.anything(),
        [expectedSaveItem],
      );
    }));

    it('should save the layout details through dal service', fakeAsync(() => {
      saveDalServiceSpy.savePage.and.returnValue(of(mockedSaveResult));
      setSpiesAndCallSave();
      tick();

      const expectedSaveLayoutDetail: SaveItemDetails = {
        itemId: itemToSaveId,
        itemVersion,
        presentationDetails: { kind: layoutEditingKind, body: pageStateToSave.layout! },
        originalPresentationDetails: { kind: layoutEditingKind, body: layoutOriginalValue },
        revision: revisionOriginalValue,
      };

      expect(saveDalServiceSpy.savePage).toHaveBeenCalledOnceWith(
        jasmine.anything(),
        jasmine.anything(),
        [expectedSaveLayoutDetail],
        jasmine.anything(),
      );
    }));

    it('should update saveState and return saveResult', fakeAsync(() => {
      saveDalServiceSpy.savePage.and.returnValue(of(saveOperationResult));
      setSpiesAndCallSave();

      expect(saveStateSpy).toHaveBeenCalledTimes(2);
      expect(saveStateSpy).toHaveBeenCalledWith('no-changes');
      expect(saveStateSpy).toHaveBeenCalledWith('saving');

      tick();

      expect(saveStateSpy).toHaveBeenCalledTimes(3);
      expect(saveStateSpy).toHaveBeenCalledWith('saved');

      expect(returnValueSpy.next.calls.mostRecent().args[0]).toEqual(saveOperationResult);
      expect(returnValueSpy.complete).toHaveBeenCalled();
    }));

    it('should show error notification if save operation returned an error', fakeAsync(() => {
      const code = 'InternalError';
      const timedNotification = new TimedNotification('errorInContext', 'EDITOR.SAVE.ERRORS.PAGE_SAVE_ERROR', 'error');
      timedNotification.persistent = true;

      saveDalServiceSpy.savePage.and.returnValue(throwError(() => code));
      // Set up spies and call save
      setSpiesAndCallSave();

      // Act
      tick();

      const notification = timedNotificationsServiceSpy.pushNotification.calls.mostRecent().args[0];
      expect(notification.id).toEqual(timedNotification.id);
      expect(notification.text).toEqual(timedNotification.text);
      expect(notification.severity).toEqual(timedNotification.severity);
      expect(notification.persistent).toEqual(timedNotification.persistent);

      flush();
    }));

    it('should notify itemChangeService with context item id even if save operation returned an error', fakeAsync(() => {
      // Arrange
      const mockedSavedErrorResult: SaveResult = {
        errors: [
          {
            errorCode: 'ItemWasModified',
            message: 'Item is modified by other user',
            itemId: itemToSaveId,
          },
        ],
        savedItems: [],
        validationErrors: [],
        warnings: [],
        newCreatedVersions: [],
      };

      saveDalServiceSpy.savePage.and.returnValue(of(mockedSavedErrorResult));
      // Set up spies and call save
      setSpiesAndCallSave();

      // Act
      tick();

      // Assert
      expect(itemChangeServiceSpy.notifyChange).toHaveBeenCalledWith(
        itemToSaveId,
        jasmine.arrayContaining(['layout', 'data-fields']),
      );
      flush();
    }));

    it('should show success notification with version scope only if a new version is automatically created', fakeAsync(() => {
      // arrange
      const mockedSavedResult: SaveResult = {
        errors: [],
        savedItems: [
          {
            id: 'test-item-1',
            fields: [],
            language,
            revision: revisionNewValue,
            version: 1,
          },
        ],
        validationErrors: [],
        warnings: [],
        newCreatedVersions: [{ itemId: 'test-item-1', displayName: 'foo', versionNumber: 2 }],
      };

      saveDalServiceSpy.savePage.and.returnValue(of(mockedSavedResult));
      contextService.setTestItemId('test-item-1');
      setSpiesAndCallSave('test-item-1');
      tick();

      // assert
      const [id, text, severity] = timedNotificationsServiceSpy.push.calls.mostRecent().args;
      const text$ = asObservable(text);
      let textResolved = '';
      text$.subscribe((value) => (textResolved = value));
      tick();

      expect(id).toBe('NewItemVersionCrated-test-item-1');
      expect(textResolved).toBe(`VERSIONS.VERSION_CREATED_SUCCESSFUL {"versionNumber":2,"itemDisplayName":"foo"}`);
      expect(severity).toBe('success');
      flush();
    }));

    it('should notify updateContext if a new version is automatically created', fakeAsync(() => {
      // arrange
      const mockedSavedResult: SaveResult = {
        errors: [],
        savedItems: [
          {
            id: itemToSaveId,
            fields: [],
            language,
            revision: revisionNewValue,
            version: 1,
          },
        ],
        validationErrors: [],
        warnings: [],
        newCreatedVersions: [{ itemId: itemToSaveId, displayName: 'foo', versionNumber: 2 }],
      };
      saveDalServiceSpy.savePage.and.returnValue(of(mockedSavedResult));

      contextService.setTestItemId(itemToSaveId);
      contextService.setTestLang(language);
      setSpiesAndCallSave();
      const updateContextSpy = spyOn(contextService, 'updateContext').and.callThrough();
      tick();

      // assert
      expect(updateContextSpy.calls.mostRecent().args[0]).toEqual({ itemVersion: 2, variant: undefined });
      flush();
    }));

    it('should create a new version for context page if a new version is created for another item', fakeAsync(() => {
      // arrange
      const mockedSavedResult: SaveResult = {
        errors: [],
        savedItems: [
          {
            id: 'test-item-1',
            fields: [],
            language,
            revision: revisionNewValue,
            version: 1,
          },
        ],
        validationErrors: [],
        warnings: [],
        newCreatedVersions: [{ itemId: 'test-item-1', displayName: 'foo', versionNumber: 2 }],
      };

      contextService.setTestItemId(itemToSaveId);
      contextService.setTestItemVersion(1);
      getItemSpy.and.resolveTo({ workflow: { finalState: true } });
      saveDalServiceSpy.savePage.and.returnValue(of(mockedSavedResult));
      setSpiesAndCallSave();
      tick();

      // assert
      expect(versionUtilsServiceSpy.createVersion).toHaveBeenCalledTimes(1);

      const [[id1, text1, severity1], [id2, text2, severity2]] = timedNotificationsServiceSpy.push.calls.allArgs();
      const text1$ = asObservable(text1);
      let textResolved1 = '';
      text1$.subscribe((value) => (textResolved1 = value));
      const text2$ = asObservable(text2);
      let textResolved2 = '';
      text2$.subscribe((value) => (textResolved2 = value));
      tick();

      expect(id1).toBe('NewItemVersionCrated-test-item-1');
      expect(textResolved1).toBe(`VERSIONS.VERSION_CREATED_SUCCESSFUL {"versionNumber":2,"itemDisplayName":"foo"}`);
      expect(severity1).toBe('success');

      expect(id2).toBe('NewItemVersionCrated-' + contextService.itemId);
      expect(textResolved2).toBe(`VERSIONS.VERSION_CREATED_SUCCESSFUL {"versionNumber":1}`); // In the test suit it return the context page version
      expect(severity2).toBe('success');
      flush();
    }));

    it('should create a new version for context page if a new version is created for another item and current content page version does not exist', fakeAsync(() => {
      // arrange
      const mockedSavedResult: SaveResult = {
        errors: [],
        savedItems: [
          {
            id: 'test-item-1',
            fields: [],
            language,
            revision: revisionNewValue,
            version: 1,
          },
        ],
        validationErrors: [],
        warnings: [],
        newCreatedVersions: [{ itemId: 'test-item-1', displayName: 'foo', versionNumber: 2 }],
      };
      contextService.setTestItemId(itemToSaveId);
      contextService.setTestItemVersion(1);
      versionsWorkflowServiceSpy.watchActiveVersion.and.returnValue(of(undefined));
      saveDalServiceSpy.savePage.and.returnValue(of(mockedSavedResult));

      setSpiesAndCallSave();
      tick();

      // assert
      expect(versionUtilsServiceSpy.createVersion).toHaveBeenCalledTimes(1);

      const [[id1, text1, severity1], [id2, text2, severity2]] = timedNotificationsServiceSpy.push.calls.allArgs();
      const text1$ = asObservable(text1);
      let textResolved1 = '';
      text1$.subscribe((value) => (textResolved1 = value));
      const text2$ = asObservable(text2);
      let textResolved2 = '';
      text2$.subscribe((value) => (textResolved2 = value));
      tick();

      expect(id1).toBe('NewItemVersionCrated-test-item-1');
      expect(textResolved1).toBe(`VERSIONS.VERSION_CREATED_SUCCESSFUL {"versionNumber":2,"itemDisplayName":"foo"}`);
      expect(severity1).toBe('success');

      expect(id2).toBe('NewItemVersionCrated-' + contextService.itemId);
      expect(textResolved2).toBe(`VERSIONS.VERSION_CREATED_SUCCESSFUL {"versionNumber":1}`); // In the test suit it return the context page version
      expect(severity2).toBe('success');
      flush();
    }));

    it('should not create a new version for context page if it has been created automatically while saving', fakeAsync(() => {
      // arrange
      getItemSpy.and.resolveTo({ workflow: { finalState: false } });

      const mockedSavedResult: SaveResult = {
        errors: [],
        savedItems: [
          {
            id: 'some-item-id',
            fields: [],
            language,
            revision: revisionNewValue,
            version: 12,
          },
        ],
        validationErrors: [],
        warnings: [],
        newCreatedVersions: [{ itemId: 'test-item-1', displayName: 'foo', versionNumber: 3 }],
      };

      saveDalServiceSpy.savePage.and.returnValue(of(mockedSavedResult));

      setSpiesAndCallSave('test-item-1');
      tick();

      // assert
      expect(versionUtilsServiceSpy.createVersion).not.toHaveBeenCalled();

      const [id, text, severity] = timedNotificationsServiceSpy.push.calls.mostRecent().args;
      const text$ = asObservable(text);
      let textResolved = '';
      text$.subscribe((value) => (textResolved = value));

      tick();

      expect(id).toBe('NewItemVersionCrated-test-item-1');
      expect(textResolved).toBe(`VERSIONS.VERSION_CREATED_SUCCESSFUL {"versionNumber":3,"itemDisplayName":"foo"}`);
      expect(severity).toBe('success');
      flush();
    }));
  });
});
