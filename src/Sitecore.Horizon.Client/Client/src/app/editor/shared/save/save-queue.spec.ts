/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, tick } from '@angular/core/testing';
import { createSpyObserver } from 'app/testing/test.utils';
import { Observable, Subject, from, of } from 'rxjs';
import { delay, toArray } from 'rxjs/operators';
import { FieldState } from '../history/field-state';
import { AggregatedChanges, SaveQueueObj, handleSaveBatch, handleSaveQueue, saveQueue } from './save-queue';

export function mostRecentCallFirstArg(spy: jasmine.Spy) {
  return spy.calls.mostRecent().args[0];
}

// Minimal tests here as there are more specific tests in the other `describe` blocks
describe('saveQueue', () => {
  let queue: Subject<SaveQueueObj>;
  let sut: Observable<SaveQueueObj>;
  let saveOp: jasmine.Spy;
  const saveDuration = 10;

  beforeEach(() => {
    saveOp = jasmine.createSpy('save').and.callFake((change: SaveQueueObj) => of(change).pipe(delay(saveDuration)));
    queue = new Subject();
    sut = queue.pipe(saveQueue(saveOp));
  });

  it('should save', fakeAsync(() => {
    const change: SaveQueueObj = {
      change: { fields: [new FieldState('id', 'item', { rawValue: 'value' }, false, 1)], layout: 'layout' },
      context: { itemId: 'item', language: 'lang', siteName: 'site' },
      changeId: 1,
      layoutEditingKind: 'FINAL',
    };

    const spy = createSpyObserver();
    sut.subscribe(spy);

    queue.next(change);
    // I'm worried this delay may be flaky. One additional tick may be needed due to the async implementation.
    // But it works for not, so just a hint in case it goes wrong.
    tick(saveDuration);
    queue.complete();

    const {
      context: ctxResult,
      change: { fields, layout },
      changeIds,
      layoutEditingKind,
    }: AggregatedChanges = mostRecentCallFirstArg(spy.next);

    expect(spy.next).toHaveBeenCalledTimes(1);
    expect(spy.complete).toHaveBeenCalledTimes(1);
    expect(ctxResult).toBe(change.context);
    expect(fields).toEqual(change.change.fields);
    expect(layout).toBe(change.change.layout);
    expect(layoutEditingKind).toBe(change.layoutEditingKind);
    expect(changeIds).toEqual([change.changeId]);
    flush();
  }));

  it('should save if item version in field state is not provided', fakeAsync(() => {
    const change: SaveQueueObj = {
      change: { fields: [new FieldState('id', 'item', { rawValue: 'value' }, false)], layout: 'layout' },
      context: { itemId: 'item', language: 'lang', siteName: 'site' },
      changeId: 1,
      layoutEditingKind: 'FINAL',
    };

    const spy = createSpyObserver();
    sut.subscribe(spy);

    queue.next(change);
    tick(saveDuration);
    queue.complete();

    const {
      context: ctxResult,
      change: { fields, layout },
      changeIds,
      layoutEditingKind,
    }: AggregatedChanges = mostRecentCallFirstArg(spy.next);

    expect(spy.next).toHaveBeenCalledTimes(1);
    expect(spy.complete).toHaveBeenCalledTimes(1);
    expect(ctxResult).toBe(change.context);
    expect(fields).toEqual(change.change.fields);
    expect(layout).toBe(change.change.layout);
    expect(layoutEditingKind).toBe(change.layoutEditingKind);
    expect(changeIds).toEqual([change.changeId]);
    flush();
  }));
});

describe('handleSaveQueue', () => {
  let queue: Subject<string>;
  let sut: Observable<string>;
  let batchHandler: jasmine.Spy;

  beforeEach(() => {
    batchHandler = jasmine.createSpy('save').and.callFake((value) => value);
    queue = new Subject();
    sut = handleSaveQueue(queue, batchHandler);
  });

  afterEach(() => {
    queue.complete();
  });

  describe('WHEN an item is added to the queue', () => {
    it('should save the item and emit the result', fakeAsync(() => {
      const spy = jasmine.createSpy();
      sut.subscribe(spy);

      queue.next('change');
      tick();

      // assert
      expect(spy).toHaveBeenCalledWith('change');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(batchHandler).toHaveBeenCalledTimes(1);
      flush();
    }));

    describe('AND queue completes', () => {
      it('should emit complete', fakeAsync(() => {
        const spy = jasmine.createSpy();
        sut.subscribe({ complete: spy });

        queue.next('change');
        tick();
        queue.complete();

        // assert
        expect(spy).toHaveBeenCalledTimes(1);
        flush();
      }));
    });

    describe('AND another item is added to the queue AFTER the previous one has been handled', () => {
      it('should handle the new item', fakeAsync(() => {
        const spy = jasmine.createSpy('spy');
        sut.subscribe(spy);

        // act
        queue.next('change');
        tick(10);
        queue.next('change2');
        tick();

        // assert
        expect(spy).toHaveBeenCalledWith('change2');
        expect(spy).toHaveBeenCalledTimes(2);
        expect(batchHandler).toHaveBeenCalledTimes(2);
        flush();
      }));
    });

    describe('AND more items are added to the queue BEFORE the previous one has been handled', () => {
      it('should queue those items for the next batch', fakeAsync(() => {
        const saveTime = 100;
        batchHandler.and.callFake((batch: Observable<SaveQueueObj>) => batch.pipe(toArray(), delay(saveTime)));

        const spy = jasmine.createSpy();
        sut.subscribe(spy);

        // act
        queue.next('change1');
        tick(); // tick to make sure the pushed value is "in"

        // assert
        expect(batchHandler).toHaveBeenCalledTimes(1); // it starts savign immediately
        expect(spy).not.toHaveBeenCalled();

        // act
        tick(10); // with this wait change1 is still being saved.
        queue.next('change2');
        queue.next('change3');
        tick(); // tick to make sure the pushed value is "in"

        // assert
        expect(batchHandler).toHaveBeenCalledTimes(1); // new changes are waiting for change1
        expect(spy).not.toHaveBeenCalled();

        // act
        tick(10); // change1 is still being saved
        queue.next('change4');
        tick(); // tick to make sure the pushed value is "in"

        // assert
        expect(batchHandler).toHaveBeenCalledTimes(1); // changes are still waiting for change1
        expect(spy).not.toHaveBeenCalled();

        // act
        tick(saveTime); // this amout of time should be enough for change1 to be complete

        // assert
        expect(batchHandler).toHaveBeenCalledTimes(2); // the 2nd batch is being saved
        expect(spy).toHaveBeenCalledTimes(1); // only change1 is done
        expect(spy).toHaveBeenCalledWith(['change1']);

        // act
        tick(saveTime); // this amout of time should be enough for the batch including changes 2,3,4 to complete

        // assert
        expect(batchHandler).toHaveBeenCalledTimes(2);
        expect(spy).toHaveBeenCalledTimes(2);
        expect(spy).toHaveBeenCalledWith(['change2', 'change3', 'change4']);
        flush();
      }));
    });
  });
});

describe('handleSaveBatch', () => {
  let saveOp: jasmine.Spy;

  beforeEach(() => {
    saveOp = jasmine.createSpy('save').and.callFake((value) => of(value));
  });

  it('should emit a single change', () => {
    const change: SaveQueueObj = {
      change: { fields: [new FieldState('id', 'item', { rawValue: 'value' }, false, 1)], layout: 'layout' },
      context: { itemId: 'item', language: 'lang', siteName: 'site', itemVersion: 1 },
      changeId: 1,
      layoutEditingKind: 'SHARED',
    };
    const batch: Observable<SaveQueueObj> = from([change]);
    const sut = handleSaveBatch(batch, saveOp);

    const spy = jasmine.createSpy();
    sut.subscribe(spy);

    const {
      context: ctxResult,
      change: { fields, layout },
      changeIds,
      layoutEditingKind,
    }: AggregatedChanges = mostRecentCallFirstArg(spy);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(ctxResult).toBe(change.context);
    expect(fields).toEqual(change.change.fields);
    expect(layout).toBe(change.change.layout);
    expect(layoutEditingKind).toBe(change.layoutEditingKind);
    expect(changeIds).toEqual([change.changeId]);
  });

  it('should emit a single change without item version', () => {
    const change: SaveQueueObj = {
      change: { fields: [new FieldState('id', 'item', { rawValue: 'value' }, false)], layout: 'layout' },
      context: { itemId: 'item', language: 'lang', siteName: 'site' },
      changeId: 1,
      layoutEditingKind: 'FINAL',
    };
    const batch: Observable<SaveQueueObj> = from([change]);
    const sut = handleSaveBatch(batch, saveOp);

    const spy = jasmine.createSpy();
    sut.subscribe(spy);

    const {
      context: ctxResult,
      change: { fields, layout },
      changeIds,
      layoutEditingKind,
    }: AggregatedChanges = mostRecentCallFirstArg(spy);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(ctxResult).toBe(change.context);
    expect(fields).toEqual(change.change.fields);
    expect(layout).toBe(change.change.layout);
    expect(layoutEditingKind).toBe(change.layoutEditingKind);
    expect(changeIds).toEqual([change.changeId]);
  });

  it('should NOT aggregate changes with different contexts', () => {
    const change1: SaveQueueObj = {
      change: { fields: [new FieldState('id', 'item', { rawValue: 'value' }, false, 1)], layout: 'layout' },
      context: { itemId: 'item', language: 'lang', siteName: 'site' },
      changeId: 1,
      layoutEditingKind: 'FINAL',
    };
    const change2: SaveQueueObj = {
      change: { fields: [new FieldState('id', 'item', { rawValue: 'value' }, false, 1)], layout: 'layout' },
      context: { itemId: 'item2', language: 'lang', siteName: 'site' },
      changeId: 2,
      layoutEditingKind: 'SHARED',
    };

    const batch: Observable<SaveQueueObj> = from([change1, change2]);
    const sut = handleSaveBatch(batch, saveOp);

    const spy = jasmine.createSpy();
    sut.subscribe(spy);

    const firstCall: AggregatedChanges = spy.calls.argsFor(0)[0];
    const secondCall: AggregatedChanges = spy.calls.argsFor(1)[0];

    expect(spy).toHaveBeenCalledTimes(2);

    expect(firstCall.change.fields).toEqual(change1.change.fields);
    expect(firstCall.context).toEqual(change1.context);
    expect(firstCall.layoutEditingKind).toEqual(change1.layoutEditingKind);
    expect(firstCall.changeIds).toEqual([change1.changeId]);

    expect(secondCall.change.fields).toEqual(change2.change.fields);
    expect(secondCall.context).toEqual(change2.context);
    expect(secondCall.layoutEditingKind).toEqual(change2.layoutEditingKind);
    expect(secondCall.changeIds).toEqual([change2.changeId]);
  });

  it('should aggregate multiple changes with corresponding context', () => {
    const context = { itemId: 'item', language: 'lang', siteName: 'site', itemVersion: 1 };
    const change1: SaveQueueObj = {
      change: {
        fields: [
          new FieldState('id1', 'item1', { rawValue: 'value' }, false, 1),
          new FieldState('id', 'item', { rawValue: 'initial' }, false, 1),
        ],
        layout: 'layout',
      },
      changeId: 1,
      context,
      layoutEditingKind: 'FINAL',
    };
    const change2: SaveQueueObj = {
      change: {
        fields: [
          new FieldState('id2', 'item2', { rawValue: 'value' }, false, 1),
          new FieldState('id', 'item', { rawValue: 'new' }, false, 1),
        ],
        layout: 'layout2',
      },
      changeId: 2,
      context,
      layoutEditingKind: 'FINAL',
    };

    const batch: Observable<SaveQueueObj> = from([change1, change2]);
    const sut = handleSaveBatch(batch, saveOp);

    const spy = jasmine.createSpy();
    sut.subscribe(spy);

    const {
      context: ctxResult,
      change: { fields, layout },
      changeIds,
      layoutEditingKind,
    }: AggregatedChanges = mostRecentCallFirstArg(spy);

    expect(ctxResult).toBe(context);
    expect(layout).toBe(change2.change.layout);
    expect(layoutEditingKind).toBe(change2.layoutEditingKind);
    expect(fields).toContain(new FieldState('id', 'item', { rawValue: 'new' }, false, 1));
    expect(fields).toContain(new FieldState('id1', 'item1', { rawValue: 'value' }, false, 1));
    expect(fields).toContain(new FieldState('id2', 'item2', { rawValue: 'value' }, false, 1));
    expect(fields.length).toBe(3);
    expect(spy).toHaveBeenCalledTimes(1);

    expect(changeIds).toContain(1);
    expect(changeIds).toContain(2);
  });
});
