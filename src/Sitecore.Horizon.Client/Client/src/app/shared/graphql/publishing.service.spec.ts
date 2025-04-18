/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NgZone } from '@angular/core';
import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { createSpyObserver, TestBedInjectSpy } from 'app/testing/test.utils';
import { asyncScheduler, NEVER, Observable, of, scheduled, Subscriber, throwError } from 'rxjs';
import { BasePublishingDalService } from './publishing.dal.service';
import { PublishingStatus, PublishItemOutput } from './publishing.interfaces';
import { PublishingService } from './publishing.service';

describe('PublishingService', () => {
  let sut: PublishingService;
  let ngZone: NgZone;
  let publishingDalServiceSpy: jasmine.SpyObj<BasePublishingDalService>;

  const operationId = 'publishing-handle';

  const runningResult: PublishingStatus = {
    state: 'RUNNING',
    isDone: false,
    isFailed: false,
    processed: 0,
  };
  const failedResult: PublishingStatus = {
    state: 'ABORTED',
    isDone: false,
    isFailed: true,
    processed: 0,
  };
  const unKnownResult: PublishingStatus = {
    state: 'UNKNOWN',
    isDone: false,
    isFailed: true,
    processed: 0,
  };
  const completedResult: PublishingStatus = {
    state: 'FINISHED',
    isDone: true,
    isFailed: false,
    processed: 1,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: BasePublishingDalService,
          useValue: jasmine.createSpyObj<BasePublishingDalService>({
            getPublishingStatus: NEVER,
            publishItem: NEVER,
          }),
        },
      ],
    });

    sut = TestBed.inject(PublishingService);
    publishingDalServiceSpy = TestBedInjectSpy(BasePublishingDalService);
    ngZone = TestBed.inject(NgZone);
  });

  describe('publishItem()', () => {
    it('should return result from dal service', () => {
      const publishSubItems = false;
      const publishRelatedItems = false;
      const languages = ['en'];
      const rootItemId = 'test_id';
      const publishItemMode = 'SMART';
      const result: PublishItemOutput = {
        operationId: '123-456',
      };
      publishingDalServiceSpy.publishItem.and.returnValue(of(result));
      const resultSpy = createSpyObserver();

      sut
        .publishItem({ rootItemId, publishSubItems, languages, publishRelatedItems, publishItemMode })
        .subscribe(resultSpy);

      expect(resultSpy.next).toHaveBeenCalledWith(result);
      expect(publishingDalServiceSpy.publishItem).toHaveBeenCalledWith({
        rootItemId,
        publishSubItems,
        languages,
        publishRelatedItems,
        publishItemMode,
      });
    });
  });

  describe('getPublishingStatus()', () => {
    it('should return result from dal service', () => {
      const test_handle = '123-456';
      publishingDalServiceSpy.getPublishingStatus.and.returnValue(of(completedResult));
      const resultSpy = createSpyObserver();

      sut.getPublishingStatus(test_handle).subscribe(resultSpy);

      expect(resultSpy.next).toHaveBeenCalledWith(completedResult);
      expect(publishingDalServiceSpy.getPublishingStatus).toHaveBeenCalledWith(test_handle);
    });
  });

  describe('watchPublishingStatus()', () => {
    it('should fetch getPublishingStatus', () => {
      sut.watchPublishingStatus(operationId).subscribe();
      expect(publishingDalServiceSpy.getPublishingStatus).toHaveBeenCalledTimes(1);
      expect(publishingDalServiceSpy.getPublishingStatus).toHaveBeenCalledWith(operationId);
    });

    it('should retry getPublishingStatus if status is RUNNING after a delay of a 1000', fakeAsync(() => {
      let count = 0;
      const subscribeFn = jasmine.createSpy('subscribe').and.callFake((subscriber: Subscriber<PublishingStatus>) => {
        count++;
        if (count === 1) {
          subscriber.next(runningResult);
          subscriber.complete();
        } else {
          subscriber.complete();
        }
      });

      publishingDalServiceSpy.getPublishingStatus.and.returnValue(new Observable(subscribeFn));

      expect(subscribeFn).not.toHaveBeenCalled();

      sut.watchPublishingStatus(operationId).subscribe();
      expect(subscribeFn).toHaveBeenCalledTimes(1);

      tick(500);
      expect(subscribeFn).toHaveBeenCalledTimes(1);

      tick(500);
      expect(subscribeFn).toHaveBeenCalledTimes(2);
      flush();
    }));

    it('should complete the stream when stateCode is COMPLETED', fakeAsync(() => {
      let count = 0;
      const subscribeFn = jasmine.createSpy('subscribe').and.callFake((subscriber: Subscriber<PublishingStatus>) => {
        count++;
        if (count === 1) {
          setTimeout(() => {
            subscriber.next(runningResult);
            subscriber.complete();
          }, 0);
        } else {
          setTimeout(() => {
            subscriber.next(completedResult);
            subscriber.complete();
          }, 0);
        }
      });

      publishingDalServiceSpy.getPublishingStatus.and.returnValue(new Observable(subscribeFn));

      const spy = createSpyObserver<PublishingStatus>();
      sut.watchPublishingStatus(operationId).subscribe(spy);
      expect(spy.next).not.toHaveBeenCalled();
      tick();
      expect(spy.next).toHaveBeenCalledWith(runningResult);

      tick(1000);
      expect(spy.next).toHaveBeenCalledWith(completedResult);
      expect(spy.complete).toHaveBeenCalled();
      flush();
    }));

    it('should complete the stream when state is UNKNOWN', fakeAsync(() => {
      publishingDalServiceSpy.getPublishingStatus.and.returnValue(scheduled(of(unKnownResult), asyncScheduler));

      const spy = createSpyObserver<PublishingStatus>();
      sut.watchPublishingStatus(operationId).subscribe(spy);

      expect(spy.next).not.toHaveBeenCalled();
      tick();
      expect(spy.next).toHaveBeenCalledWith(unKnownResult);
      expect(spy.complete).toHaveBeenCalled();
      flush();
    }));

    it('should complete the stream when stateCode is FAILED', fakeAsync(() => {
      publishingDalServiceSpy.getPublishingStatus.and.returnValue(of(failedResult));

      const spy = createSpyObserver<PublishingStatus>();
      sut.watchPublishingStatus(operationId).subscribe(spy);
      tick();

      expect(spy.next).toHaveBeenCalledWith(failedResult);
      expect(spy.complete).toHaveBeenCalled();
      flush();
    }));

    it('should error when getPublishingStatus errors', () => {
      publishingDalServiceSpy.getPublishingStatus.and.returnValue(throwError(() => 'kung flu'));

      const spy = createSpyObserver<PublishingStatus>();
      sut.watchPublishingStatus(operationId).subscribe(spy);

      expect(spy.next).not.toHaveBeenCalled();
      expect(spy.complete).not.toHaveBeenCalled();
      expect(spy.error).toHaveBeenCalledWith('kung flu');
    });

    describe('WHEN its the 10t retry or more', () => {
      it('should continue to retry with an extended delay of 5000', fakeAsync(() => {
        const succeedAt = 12;

        let count = 0;
        const subscribeFn = jasmine.createSpy('subscribe').and.callFake((subscriber: Subscriber<PublishingStatus>) => {
          count++;
          if (count < succeedAt) {
            subscriber.next(runningResult);
            subscriber.complete();
          } else {
            subscriber.next(completedResult);
            subscriber.complete();
          }
        });

        publishingDalServiceSpy.getPublishingStatus.and.returnValue(new Observable(subscribeFn));

        const spy = createSpyObserver<PublishingStatus>();
        sut.watchPublishingStatus(operationId).subscribe(spy);

        expect(spy.next).toHaveBeenCalledTimes(1);
        tick(1000);
        expect(spy.next).toHaveBeenCalledTimes(2);
        tick(1000);
        expect(spy.next).toHaveBeenCalledTimes(3);
        tick(1000);
        expect(spy.next).toHaveBeenCalledTimes(4);
        tick(1000);
        expect(spy.next).toHaveBeenCalledTimes(5);
        tick(1000);
        expect(spy.next).toHaveBeenCalledTimes(6);
        tick(1000);
        expect(spy.next).toHaveBeenCalledTimes(7);
        tick(1000);
        expect(spy.next).toHaveBeenCalledTimes(8);
        tick(1000);
        expect(spy.next).toHaveBeenCalledTimes(9);

        tick(1000);
        expect(spy.next).toHaveBeenCalledTimes(10);

        tick(1000);
        // still 10, the delay is now longer
        expect(spy.next).toHaveBeenCalledTimes(10);

        tick(4000);
        expect(spy.next).toHaveBeenCalledTimes(11);

        tick(5000);
        expect(spy.next).toHaveBeenCalledTimes(12);
        expect(spy.next).toHaveBeenCalledWith(completedResult);
        expect(spy.complete).toHaveBeenCalled();
        flush();
      }));
    });

    it('should run delays outside Angular zone', fakeAsync(() => {
      // arrange
      let publishingStatusToReturn = runningResult;
      publishingDalServiceSpy.getPublishingStatus.and.returnValue(
        new Observable((observable) => {
          observable.next(publishingStatusToReturn);
          observable.complete();
        }),
      );

      // act
      ngZone.run(() => {
        sut.watchPublishingStatus(operationId).subscribe(createSpyObserver());
      });

      // assert
      expect(ngZone.isStable).withContext('zone should be stable').toBeTruthy();
      expect(ngZone.hasPendingMacrotasks).withContext('macrotasks should be empty').toBeFalsy();

      // teardown
      // To close pending timers.
      publishingStatusToReturn = completedResult;
      tick(1000);
      flush();
    }));

    it('should run results back inside Angular zone', fakeAsync(() => {
      // arrange
      let publishingStatusToReturn = runningResult;
      publishingDalServiceSpy.getPublishingStatus.and.returnValue(
        new Observable((observable) => {
          observable.next(publishingStatusToReturn);
          observable.complete();
        }),
      );

      const resultObserver = createSpyObserver();
      let resultPushedInAngularZone = true;
      resultObserver.next.and.callFake(() => {
        const inZone = NgZone.isInAngularZone();
        resultPushedInAngularZone = resultPushedInAngularZone && inZone;
      });

      // act
      ngZone.run(() => {
        sut.watchPublishingStatus(operationId).subscribe(resultObserver);
      });
      tick(1000);
      publishingStatusToReturn = completedResult;
      tick(1000);

      // assert
      expect(resultPushedInAngularZone).toBeTrue();
      flush();
    }));
  });
});
