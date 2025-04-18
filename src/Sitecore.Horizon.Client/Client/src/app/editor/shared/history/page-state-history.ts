/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { PageLayout } from 'app/editor/shared/layout/page-layout';
import { FieldState } from './field-state';
import { aggregateFields, diff, PageState, withField } from './page-state';

export class PageStateHistory {
  private index = -1;
  private readonly updates: PageState[] = [];

  get isInitial(): boolean {
    return this.index <= 0;
  }

  get isInLatest(): boolean {
    return this.index === this.updates.length - 1;
  }

  // Cache of the current state.
  private aggregatedStateCache?: PageState;

  get state(): PageState {
    this.aggregatedStateCache = this.aggregatedStateCache || this.getAggregatedState();
    return this.aggregatedStateCache;
  }

  private get currentUpdate(): PageState {
    return this.updates[this.index];
  }

  /**
   * If history is not initialized, sets the state as the initial state.
   * Otherwise treats the given state as an update.
   */
  addState(state: PageState): void {
    if (this.updates.length === 0) {
      this.initialize(state);
      return;
    }

    const changes = diff(state, this.state);
    // Fall back to specialized update methods as they offer better performance.
    // When used they incrementally recalculate aggregated state instead of re-calculating it.
    const changedFields = changes.updated?.fields || [];
    if (changedFields.length === 1 && state.layout === undefined) {
      this.addFieldUpdate(changedFields[0]);
      return;
    }
    if (state.layout !== undefined && state.fields.length === 0) {
      this.addLayoutUpdate(state.layout);
      return;
    }

    if (changes.added) {
      this.addToInitialState(changes.added.fields, changes.added.layout);
    }

    if (changes.updated) {
      this.pushAtCurrentIndex(changes.updated);
    }

    if (changes.added || changes.updated) {
      this.invalidateAggregatedStateCache();
    }
  }

  /**
   * Register a field change.
   */
  addFieldUpdate(field: FieldState): void {
    const foundField = this.state.fields.find((existingField) => existingField.isSameField(field));

    if (!foundField) {
      this.addToInitialState([field], undefined);
      this.invalidateAggregatedStateCache();
      return;
    }

    if (foundField.rawValue === field.rawValue && foundField.reset === field.reset) {
      return;
    }

    this.pushAtCurrentIndex(new PageState([field]));
    this.aggregatedStateCache = new PageState(withField(field, this.state.fields), this.state.layout);
  }

  /**
   * Register a layout change.
   */
  addLayoutUpdate(layout: string): void {
    if (this.state.layout === undefined) {
      this.addToInitialState([], layout);
      this.invalidateAggregatedStateCache();
      return;
    }

    if (PageLayout.isSameLayout(this.state.layout, layout)) {
      return;
    }

    this.pushAtCurrentIndex(new PageState([], layout));
    this.aggregatedStateCache = new PageState(this.state.fields, layout);
  }

  /**
   * Returns a state update that will undo the latest change.
   */
  undo(): PageState | undefined {
    if (this.isInitial) {
      return;
    }

    const updateToRevert = this.currentUpdate;

    this.index--;
    this.invalidateAggregatedStateCache();

    const desiredState = this.state;
    const change = this.calculateRevertUpdate(updateToRevert, desiredState);
    return change;
  }

  redo(): PageState | undefined {
    if (this.isInLatest) {
      return;
    }

    this.index++;
    this.invalidateAggregatedStateCache();

    return this.currentUpdate;
  }

  private initialize(state: PageState): void {
    this.updates.push(state);
    this.index = 0;
    this.aggregatedStateCache = state;
  }

  private invalidateAggregatedStateCache() {
    this.aggregatedStateCache = undefined;
  }

  private pushAtCurrentIndex(update: PageState) {
    this.updates.splice(this.index + 1);
    this.updates.push(update);
    this.index++;
  }

  private addToInitialState(fields: readonly FieldState[], layout: string | undefined): void {
    if (this.updates.length === 0) {
      throw Error('BUG: Updates expected to be present at this stage');
    }

    const initialState = this.updates[0];
    this.updates[0] = new PageState([...initialState.fields, ...fields], initialState.layout ?? layout);
  }

  private getAggregatedState(): PageState {
    const result = this._getAggregatedState(this.index);

    // There should always be a state for current index, otherwise history is corrupted and should throw an error.
    if (!result) {
      throw Error('Failed to get aggregated history, history may be corrupted');
    }
    return result;
  }

  private _getAggregatedState(endIndex: number): PageState | undefined {
    // Index must be within the boundaries of history
    if (endIndex > this.updates.length - 1 || endIndex < 0) {
      return undefined;
    }

    let aggregatedFields: FieldState[] = [];
    let finalLayout = '';

    // slice doesn't include element at the end.
    const rangeOfUpdates = this.updates.slice(0, endIndex + 1);
    rangeOfUpdates.forEach(({ fields, layout }) => {
      aggregatedFields = aggregateFields(fields, aggregatedFields);
      finalLayout = layout || finalLayout;
    });

    return new PageState(aggregatedFields, finalLayout);
  }

  private calculateRevertUpdate(updateToRevert: PageState, desiredState: PageState): PageState {
    const fields = updateToRevert.fields.reduce((acc, field) => {
      const desiredField = desiredState.fields.find((_field) => _field.isSameField(field));
      if (
        desiredField &&
        (field.rawValue !== desiredField.rawValue ||
          (field.rawValue === desiredField.rawValue && field.reset !== desiredField.reset))
      ) {
        acc.push(desiredField);
      }

      return acc;
    }, new Array<FieldState>());

    const layout =
      updateToRevert.layout && !PageLayout.isSameLayout(updateToRevert.layout, desiredState.layout)
        ? desiredState.layout
        : undefined;

    return new PageState(fields, layout);
  }
}
