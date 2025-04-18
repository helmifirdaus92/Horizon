/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { DEFAULT_TEST_CONTEXT } from 'app/shared/client-state/context.service.testing';
import { createGqlError, createSpyObserver } from 'app/testing/test.utils';
import {
  ADD_ITEM_VERSION_MUTATION,
  AddItemVersionInput,
  DELETE_ITEM_VERSION_MUTATION,
  RENAME_ITEM_VERSION_MUTATION,
  SET_PUBLISHING_SETTINGS_MUTATION,
  VersionsDalService,
} from './versions.dal.service';

describe(VersionsDalService.name, () => {
  let sut: VersionsDalService;
  let apolloTestingController: ApolloTestingController;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule.withClients(['global'])],
      providers: [VersionsDalService],
    });
  }));

  beforeEach(() => {
    sut = TestBed.inject(VersionsDalService);
    apolloTestingController = TestBed.inject(ApolloTestingController);
  });

  afterEach(() => {
    apolloTestingController.verify();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should extract extension code from GQL error', fakeAsync(() => {
    const resultSpy = createSpyObserver();

    sut.addItemVersion({} as AddItemVersionInput).subscribe(resultSpy);
    const query = apolloTestingController.expectOne(ADD_ITEM_VERSION_MUTATION);

    query.graphqlErrors([createGqlError('failed', 'TEST_ERR_CODE')]);
    tick();

    expect(resultSpy.error).toHaveBeenCalledWith('TEST_ERR_CODE');
    flush();
  }));

  describe('addItemVersion()', () => {
    it('should return result from the mutation', fakeAsync(() => {
      const { itemId, language, siteName } = DEFAULT_TEST_CONTEXT;
      const resultSpy = createSpyObserver();

      const result = {
        success: true,
        item: { id: '123', version: 1, displayName: 'displayName', versionName: 'versionName' },
      };

      sut
        .addItemVersion({ path: itemId, versionName: 'V1', baseVersionNumber: 2, language, siteName })
        .subscribe(resultSpy);
      const mutation = apolloTestingController.expectOne(ADD_ITEM_VERSION_MUTATION);
      mutation.flush({ data: { addItemVersion: result } });
      tick();

      expect(resultSpy.next).toHaveBeenCalledWith({ success: true, itemVersion: 1 }),
        expect(mutation.operation.variables.input).toEqual({
          versionName: 'V1',
          path: itemId,
          baseVersionNumber: 2,
          language,
          site: siteName,
        });
      flush();
    }));

    it('should unwrap gql error code', fakeAsync(() => {
      const { itemId, language, siteName } = DEFAULT_TEST_CONTEXT;
      const resultSpy = createSpyObserver();

      sut.addItemVersion({ path: itemId, versionName: 'V1', language, siteName }).subscribe(resultSpy);
      const mutation = apolloTestingController.expectOne(ADD_ITEM_VERSION_MUTATION);
      mutation.graphqlErrors([createGqlError('failed', 'TEST_ERR_CODE')]);
      tick();

      expect(resultSpy.error).toHaveBeenCalledWith('TEST_ERR_CODE');
      flush();
    }));
  });

  describe('deleteItemVersion()', () => {
    it('should return result from the mutation', fakeAsync(() => {
      const { itemId, language, siteName } = DEFAULT_TEST_CONTEXT;
      const resultSpy = createSpyObserver();

      const result = {
        success: true,
        latestPublishableVersion: { id: '123', version: 1, displayName: 'displayName', versionName: 'versionName' },
      };

      sut.deleteItemVersion({ path: itemId, versionNumber: 2, language, siteName }).subscribe(resultSpy);
      const mutation = apolloTestingController.expectOne(DELETE_ITEM_VERSION_MUTATION);
      mutation.flush({ data: { deleteItemVersion: result } });
      tick();

      expect(resultSpy.next).toHaveBeenCalledWith({ success: true, latestPublishableVersion: 1 });
      expect(mutation.operation.variables.input).toEqual({
        path: itemId,
        versionNumber: 2,
        language,
        site: siteName,
      });
      flush();
    }));

    it('should unwrap gql error code', fakeAsync(() => {
      const { itemId, language, siteName } = DEFAULT_TEST_CONTEXT;
      const resultSpy = createSpyObserver();

      sut.deleteItemVersion({ path: itemId, versionNumber: 1, language, siteName }).subscribe(resultSpy);
      const mutation = apolloTestingController.expectOne(DELETE_ITEM_VERSION_MUTATION);
      mutation.graphqlErrors([createGqlError('failed', 'TEST_ERR_CODE')]);
      tick();

      expect(resultSpy.error).toHaveBeenCalledWith('TEST_ERR_CODE');
      flush();
    }));
  });

  describe('renameItemVersion()', () => {
    it('should return result from the mutation', fakeAsync(() => {
      const { itemId, language, siteName } = DEFAULT_TEST_CONTEXT;
      const resultSpy = createSpyObserver();

      const result = {
        success: true,
      };

      sut
        .renameItemVersion({ path: itemId, versionNumber: 2, newName: 'newName', language, siteName })
        .subscribe(resultSpy);
      const mutation = apolloTestingController.expectOne(RENAME_ITEM_VERSION_MUTATION);
      mutation.flush({ data: { renameItemVersion: result } });
      tick();

      expect(resultSpy.next).toHaveBeenCalledWith(result);
      expect(mutation.operation.variables.input).toEqual({
        path: itemId,
        versionNumber: 2,
        newName: 'newName',
        language,
        site: siteName,
      });
      flush();
    }));

    it('should unwrap gql error code', fakeAsync(() => {
      const { itemId, language, siteName } = DEFAULT_TEST_CONTEXT;
      const resultSpy = createSpyObserver();

      sut
        .renameItemVersion({ path: itemId, versionNumber: 1, newName: 'NewName', language, siteName })
        .subscribe(resultSpy);
      const mutation = apolloTestingController.expectOne(RENAME_ITEM_VERSION_MUTATION);
      mutation.graphqlErrors([createGqlError('failed', 'TEST_ERR_CODE')]);
      tick();

      expect(resultSpy.error).toHaveBeenCalledWith('TEST_ERR_CODE');
      flush();
    }));
  });

  describe('setPublishingSettings()', () => {
    it('should return result from the mutation', fakeAsync(() => {
      const { itemId, language, siteName } = DEFAULT_TEST_CONTEXT;
      const resultSpy = createSpyObserver();

      const result = {
        success: true,
        item: {
          id: itemId,
          version: 2,
          displayName: 'displayName',
          versionName: 'versionName',
          publishing: {
            validFromDate: '2021-09-07T11:19:21',
            validToDate: '2021-09-09T12:20:00',
          },
        },
      };

      sut
        .setPublishingSettings({
          path: itemId,
          versionNumber: 2,
          validFromDate: '2021-09-07T11:19:21',
          validToDate: '2021-09-09T12:20:00',
          isAvailableToPublish: true,
          language,
          siteName,
        })
        .subscribe(resultSpy);
      const publishingSettingsMutation = apolloTestingController.expectOne(SET_PUBLISHING_SETTINGS_MUTATION);
      publishingSettingsMutation.flush({ data: { setPublishingSettings: result } });
      tick();

      expect(publishingSettingsMutation.operation.variables.input).toEqual({
        path: itemId,
        versionNumber: 2,
        validFromDate: '2021-09-07T11:19:21',
        validToDate: '2021-09-09T12:20:00',
        isAvailableToPublish: true,
        language,
        site: siteName,
      });
      expect(resultSpy.next).toHaveBeenCalledWith({ success: true });

      flush();
    }));

    it('should unwrap gql error code', fakeAsync(() => {
      const { itemId, language, siteName } = DEFAULT_TEST_CONTEXT;
      const resultSpy = createSpyObserver();

      sut
        .setPublishingSettings({
          path: itemId,
          versionNumber: 2,
          validFromDate: '2021-09-07T11:19:21',
          validToDate: '2021-09-09T12:20:00',
          isAvailableToPublish: true,
          language,
          siteName,
        })
        .subscribe(resultSpy);
      const publishingSettingsMutation = apolloTestingController.expectOne(SET_PUBLISHING_SETTINGS_MUTATION);
      publishingSettingsMutation.graphqlErrors([createGqlError('failed', 'TEST_ERR_CODE')]);
      tick();

      expect(resultSpy.error).toHaveBeenCalledWith('TEST_ERR_CODE');
      flush();
    }));
  });
});
