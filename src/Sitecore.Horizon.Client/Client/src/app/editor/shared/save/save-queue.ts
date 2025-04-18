/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Context } from 'app/shared/client-state/context.service';
import { LayoutKind } from 'app/shared/graphql/item.interface';
import { bufferWait } from 'app/shared/utils/rxjs/bufferWait';
import { from, GroupedObservable, Observable, OperatorFunction, Subject } from 'rxjs';
import { concatMap, groupBy, map, mergeMap, tap, toArray } from 'rxjs/operators';
import { FieldState } from '../history/field-state';
import { aggregateFields, PageState } from '../history/page-state';

export interface SaveQueueObj {
  change: PageState;
  changeId: number;
  context: Context;
  layoutEditingKind: LayoutKind;
}

export interface AggregatedChanges {
  change: PageState;
  changeIds: number[];
  context: Context;
  layoutEditingKind: LayoutKind;
}

/**
 * This operator handles save queue changes in the following way:
 * * Aggregates changes into batches
 * * A batch is made of individual changes that enter the queue while a previous batch is being saved
 */
export function saveQueue<T>(save: (change: AggregatedChanges) => Observable<T>): OperatorFunction<SaveQueueObj, T> {
  return (source: Observable<SaveQueueObj>) => handleSaveQueue(source, saveBatch(save));
}

export function handleSaveQueue<T, R>(queue: Observable<T>, handleBatchOp: OperatorFunction<T, R>): Observable<R> {
  const saving = new Subject<boolean>();

  return queue.pipe(
    bufferWait(saving),

    // Observify array
    map((batchArray) => from(batchArray)),

    // It should not matter which flattening strategy we use (concat/merge/switch)
    // because batches come one at a time controlled by the previous operator.
    // Nevertheless I choose concat because it seem semantically" correct.
    // If the previous operators were refactored, concatMap still enforces the desired behavior.
    concatMap((batch) => {
      saving.next(true);
      return batch.pipe(handleBatchOp, tap({ complete: () => saving.next(false) }));
    }),
  );
}

function saveBatch<T>(save: (change: AggregatedChanges) => Observable<T>): OperatorFunction<SaveQueueObj, T> {
  return (batch: Observable<SaveQueueObj>) => handleSaveBatch(batch, save);
}

export function handleSaveBatch<T>(
  batch: Observable<SaveQueueObj>,
  saveOp: (change: AggregatedChanges) => Observable<T>,
): Observable<T> {
  return batch.pipe(
    // group by context identity since we can only save together changes for the same context.
    groupBy(({ context }) => context),
    // aggregate changes in each group and flatten the result
    mergeMap(aggregateChanges),
    // use concatMap to wait for previous save transaction to be completed
    concatMap((change) => saveOp(change)),
  );
}

function aggregateChanges(changeGroup: GroupedObservable<Context, SaveQueueObj>): Observable<AggregatedChanges> {
  return changeGroup.pipe(
    // Convert to array before aggregating changes in order to execute in an imperative way which is more memory efficient.
    // PS. Before it was implemented with the `reduce` operator which had to allocate a new instance in each recurssion.
    toArray(),
    map(_aggregateChanges),
  );
}

function _aggregateChanges(changes: SaveQueueObj[]): AggregatedChanges {
  let aggregatedFields: FieldState[] = [];
  let finalLayout = '';
  const changeIds: number[] = [];

  changes.forEach(({ change: { fields, layout }, changeId }) => {
    changeIds.push(changeId);
    aggregatedFields = aggregateFields(fields, aggregatedFields);
    finalLayout = layout || finalLayout;
  });

  return {
    change: new PageState(aggregatedFields, finalLayout),
    changeIds,
    context: changes[0].context,
    layoutEditingKind: changes[0].layoutEditingKind,
  };
}
