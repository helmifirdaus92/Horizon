/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { PageLayout } from 'app/editor/shared/layout/page-layout';
import { WorkspaceItemStateUpdate } from 'sdk';
import { FieldState } from './field-state';

export class PageState {
  static fromWorkspaceItemState(state: WorkspaceItemStateUpdate): PageState {
    const fieldStates = state.fields?.map(
      ({ fieldId, itemId, value, itemVersion, reset }) => new FieldState(fieldId, itemId, value, reset, itemVersion),
    );
    return new PageState(fieldStates ?? [], state.layout);
  }

  constructor(
    public readonly fields: readonly FieldState[],
    public readonly layout?: string,
  ) {}
}

export function withField(field: FieldState, fields: readonly FieldState[]): FieldState[] {
  const result = [...fields];
  addOrReplaceField(field, result);
  return result;
}

export function aggregateFields(fields: readonly FieldState[], baseFields: readonly FieldState[]): FieldState[] {
  return fields.reduce(
    (memo: FieldState[], field: FieldState) => {
      addOrReplaceField(field, memo);
      return memo;
    },
    [...baseFields],
  );
}

function addOrReplaceField(field: FieldState, fields: FieldState[]): void {
  const index = fields.findIndex((existingField) => existingField.isSameField(field));
  if (index >= 0) {
    fields[index] = field;
  } else {
    fields.push(field);
  }
}

/**
 * Returns an update with changes that the given `update` contains compared to the given `baseState`.
 * New fields are returned separately.
 */
export function diff(update: PageState, baseState: PageState): { added?: PageState; updated?: PageState } {
  const newFields: FieldState[] = [];
  const modifiedFields: FieldState[] = [];

  update.fields.forEach((fld) => {
    const baseField = baseState.fields.find((f) => f.isSameField(fld));
    if (!baseField) {
      newFields.push(fld);
    } else if (fld.rawValue !== baseField.rawValue || fld.reset !== baseField.reset) {
      modifiedFields.push(fld);
    }
  });

  const newLayout = update.layout !== undefined && baseState.layout === undefined ? update.layout : undefined;
  const layoutUpdate =
    newLayout === undefined && update.layout !== undefined && !PageLayout.isSameLayout(update.layout, baseState.layout)
      ? update.layout
      : undefined;

  let addedState;
  if (newFields.length > 0 || newLayout !== undefined) {
    addedState = new PageState(newFields, newLayout);
  }

  let updatedState;
  if (modifiedFields.length > 0 || layoutUpdate !== undefined) {
    updatedState = new PageState(modifiedFields, layoutUpdate);
  }

  return {
    added: addedState,
    updated: updatedState,
  };
}
