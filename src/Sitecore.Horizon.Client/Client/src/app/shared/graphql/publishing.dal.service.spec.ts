/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { of } from 'rxjs';
import { PUBLISH_ITEM_MUTATION, PUBLISHING_STATUS_QUERY, PublishingDalService } from './publishing.dal.service';
import { PublishingStatus, PublishItemInput, PublishItemOutput } from './publishing.interfaces';

describe('PublishingDalService', () => {
  let sut: PublishingDalService;
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule.withClients(['global'])],
      providers: [PublishingDalService],
    });

    sut = TestBed.inject(PublishingDalService);
    controller = TestBed.inject(ApolloTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  describe('publishItem()', () => {
    it('should perform publish and emit the result', fakeAsync(() => {
      const mockTargets = ['experienceedge'];
      spyOn(sut as any, 'getPublishingTargets').and.returnValue(of(mockTargets));

      const mockPublishInput: PublishItemInput = {
        rootItemId: 'test_id',
        languages: ['en'],
        publishRelatedItems: false,
        publishSubItems: false,
        publishItemMode: 'SMART',
        targetDatabases: ['experienceedge'],
      };
      const mockPublishOutput: PublishItemOutput = { operationId: '123-456' };
      const spy = jasmine.createSpy();
      sut.publishItem(mockPublishInput).subscribe(spy);

      const op = controller.expectOne(PUBLISH_ITEM_MUTATION);
      expect(op.operation.variables).toEqual({
        input: mockPublishInput,
      });

      op.flush({ data: { publishItem: mockPublishOutput } });
      tick();

      expect(spy).toHaveBeenCalledWith(mockPublishOutput);
      flush();
    }));
  });

  describe('getPublishingStatus()', () => {
    it('should query the publishing status and emit the result', fakeAsync(() => {
      const publishingOperationId = '123-456';
      const spy = jasmine.createSpy();

      sut.getPublishingStatus(publishingOperationId).subscribe(spy);

      const op = controller.expectOne(PUBLISHING_STATUS_QUERY);
      expect(op.operation.variables).toEqual({ publishingOperationId });

      const result: PublishingStatus = {
        isDone: true,
        isFailed: false,
        processed: 0,
        state: 'FINISHED',
      };

      op.flush({ data: { publishingStatus: result } });
      tick();

      expect(spy).toHaveBeenCalledWith(result);
      flush();
    }));
  });
});
