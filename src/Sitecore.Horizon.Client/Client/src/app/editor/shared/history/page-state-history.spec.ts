/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { PageLayout } from '../layout/page-layout';
import { FieldState } from './field-state';
import { PageState } from './page-state';
import { PageStateHistory } from './page-state-history';

const LAYOUT1 = PageLayout.stringifyLayoutDefinition({ devices: [] });
const LAYOUT2 = PageLayout.stringifyLayoutDefinition({
  devices: [
    {
      id: 'device1',
      layoutId: 'deviceLayoutId1',
      placeholders: [],
      renderings: [],
    },
  ],
});

describe(PageStateHistory.name, () => {
  let sut: PageStateHistory;
  let initialState: PageState;

  describe('WHEN not initialized', () => {
    beforeEach(() => {
      sut = new PageStateHistory();
    });

    it('should be in initial and latest states', () => {
      expect(sut.isInitial).toBe(true);
      expect(sut.isInLatest).toBe(true);
    });

    describe('addState()', () => {
      it('should update initial state if layout is provided for the first time', () => {
        sut.addState(new PageState([new FieldState('field', 'item', { rawValue: '42' }, false, 1)]));

        sut.addState(new PageState([], LAYOUT1));

        expect(sut.isInitial).toBeTrue();
        expect(sut.isInLatest).toBeTrue();
        expect(sut.state.layout).toBe(LAYOUT1);
      });

      it('should update initial state if layout is initially provided altogether with fields', () => {
        sut.addState(new PageState([new FieldState('field', 'item', { rawValue: '42' }, false, 1)]));

        sut.addState(new PageState([new FieldState('new field', 'item', { rawValue: '24' }, false, 1)], LAYOUT1));

        expect(sut.isInitial).toBeTrue();
        expect(sut.isInLatest).toBeTrue();
        expect(sut.state.layout).toBe(LAYOUT1);
      });
    });

    describe('addLayoutUpdate()', () => {
      it('should update initial state if layout is provided for the first time', () => {
        sut.addState(new PageState([new FieldState('field', 'item', { rawValue: '42' }, false, 1)]));

        sut.addLayoutUpdate(LAYOUT1);

        expect(sut.isInitial).toBeTrue();
        expect(sut.isInLatest).toBeTrue();
        expect(sut.state.layout).toBe(LAYOUT1);
      });
    });
  });

  describe('WHEN initialized', () => {
    beforeEach(() => {
      initialState = new PageState([new FieldState('field', 'item', { rawValue: '4242' }, false, 1)], LAYOUT1);
      sut = new PageStateHistory();
      sut.addState(initialState);
    });

    describe('addState()', () => {
      it('should add provided page state to the end of state history', () => {
        const update = new PageState([new FieldState('foo', 'item', { rawValue: 'foo' }, false, 1)], LAYOUT2);
        sut.addState(update);

        expect(sut.state.fields).toContain(update.fields[0]);
      });

      it('should correctly add state with mix of new and modified fields', () => {
        const initialFld = initialState.fields[0];
        const initialFldUpd = new FieldState('field', 'item', { rawValue: 'new value' }, false, 1);
        const newFld = new FieldState('new field', 'item', { rawValue: 'new field value' }, false, 1);

        sut.addState(new PageState([initialFldUpd, newFld], LAYOUT1));
        const stateSnapshot1 = sut.state;
        sut.undo();
        const stateSnapshot2 = sut.state;

        expect(stateSnapshot1.fields).toEqual([initialFldUpd, newFld]);
        expect(stateSnapshot2.fields).toEqual([initialFld, newFld]);
      });
    });

    describe('isInitial', () => {
      describe('AND there are no updates', () => {
        it('should return true', () => {
          expect(sut.isInitial).toBe(true);
        });
      });
    });

    describe('isInLatest', () => {
      it('should return true', () => {
        expect(sut.isInLatest).toBe(true);
      });
    });

    describe('undo()', () => {
      it('should move the current state to point to the previous step', () => {
        const update = new FieldState('field', 'item', { rawValue: 'foo updated' }, false, 1);
        sut.addFieldUpdate(update);
        sut.undo();

        expect(sut.state).toEqual(initialState);
      });

      it('should return an update that reverts the last update', () => {
        // arrange
        sut = new PageStateHistory();
        sut.addState(
          new PageState(
            [
              new FieldState('fieldA', 'itemA', { rawValue: 'valueA1' }, false, 1),
              new FieldState('fieldB', 'itemA', { rawValue: 'valueB1' }, false, 1),
              new FieldState('fieldC', 'itemB', { rawValue: 'valueC1' }, false, 1),
            ],
            LAYOUT1,
          ),
        );

        sut.addFieldUpdate(new FieldState('fieldC', 'itemB', { rawValue: 'valueC2' }, false, 1));
        sut.addFieldUpdate(new FieldState('fieldB', 'itemA', { rawValue: 'valueB2' }, false, 1));

        // act
        const undoStep = sut.undo();

        // assert
        expect(undoStep).toEqual(new PageState([new FieldState('fieldB', 'itemA', { rawValue: 'valueB1' }, false, 1)]));
      });

      it('should revert layout changes', () => {
        sut.addState(new PageState([], LAYOUT2));
        expect(sut.undo()!.layout).toBe(initialState.layout);
      });

      it('should return delta of page state of changed fields with previous value', () => {
        sut = new PageStateHistory();
        sut.addState(
          new PageState(
            [
              new FieldState('fieldA', 'itemA', { rawValue: 'value1' }, false, 1),
              new FieldState('fieldB', 'itemB', { rawValue: 'value1' }, false, 1),
            ],
            LAYOUT1,
          ),
        );

        sut.addFieldUpdate(new FieldState('fieldA', 'itemA', { rawValue: 'value2' }, false, 1));
        sut.addFieldUpdate(new FieldState('fieldA', 'itemA', { rawValue: 'value3' }, false, 1));

        const undoStep = sut.undo();

        expect(undoStep).toEqual(new PageState([new FieldState('fieldA', 'itemA', { rawValue: 'value2' }, false, 1)]));
      });

      it('should return delta of page state of changed fields of the correct item', () => {
        sut = new PageStateHistory();
        sut.addState(
          new PageState(
            [
              new FieldState('fieldA', 'itemA', { rawValue: 'value1' }, false, 1),
              new FieldState('fieldA', 'itemB', { rawValue: 'value1' }, false, 1),
            ],
            LAYOUT1,
          ),
        );

        sut.addFieldUpdate(new FieldState('fieldA', 'itemA', { rawValue: 'value2a' }, false, 1));
        sut.addFieldUpdate(new FieldState('fieldA', 'itemB', { rawValue: 'value2b' }, false, 1));
        sut.undo();

        const undoStep = sut.undo();

        expect(undoStep).toEqual(new PageState([new FieldState('fieldA', 'itemA', { rawValue: 'value1' }, false, 1)]));
      });

      describe('AND is in initial state', () => {
        it('should return undefined', () => {
          expect(sut.undo()).toBe(undefined);
        });
      });
    });

    describe('redo()', () => {
      it('should move the current state to point to the next step', () => {
        const update = new FieldState('field', 'item', { rawValue: 'new foo' }, false, 1);
        sut.addFieldUpdate(update);
        sut.undo();
        sut.redo();

        const expectedState: PageState = new PageState([update], initialState.layout);
        expect(sut.state).toEqual(expectedState);
      });

      it('should return next change from history', () => {
        const update = new FieldState('field', 'item', { rawValue: 'new foo' }, false, 1);
        sut.addFieldUpdate(update);
        sut.undo();

        expect(sut.redo()).toEqual(new PageState([update]));
      });

      it('should return delta of page state of changed fields of the correct item', () => {
        sut = new PageStateHistory();
        sut.addState(
          new PageState(
            [
              new FieldState('fieldA', 'itemA', { rawValue: 'value1' }, false, 1),
              new FieldState('fieldA', 'itemB', { rawValue: 'value1' }, false, 1),
            ],
            LAYOUT1,
          ),
        );

        sut.addFieldUpdate(new FieldState('fieldA', 'itemA', { rawValue: 'value2a' }, false, 1));
        sut.addFieldUpdate(new FieldState('fieldA', 'itemB', { rawValue: 'value2b' }, false, 1));
        sut.undo();

        const nextState = sut.redo();

        expect(nextState).toEqual(
          new PageState([new FieldState('fieldA', 'itemB', { rawValue: 'value2b' }, false, 1)]),
        );
      });

      it('should redo layout changes', () => {
        sut.addFieldUpdate(new FieldState('a', 'b', { rawValue: 'c' }, false, 1));
        sut.addState(new PageState([], LAYOUT2));

        sut.undo();

        expect(sut.redo()!.layout).toBe(LAYOUT2);
      });

      describe('AND is in latest state', () => {
        it('should return undefined', () => {
          expect(sut.redo()).toBe(undefined);
        });
      });
    });

    describe('state', () => {
      it('should include the latest layout', () => {
        // arrange
        sut = new PageStateHistory();
        sut.addState(
          new PageState(
            [
              new FieldState('fieldA', 'itemA', { rawValue: 'valueA1' }, false),
              new FieldState('fieldB', 'itemA', { rawValue: 'valueB1' }, false),
              new FieldState('fieldC', 'itemB', { rawValue: 'valueC1' }, false),
              new FieldState('fieldA', 'itemC', { rawValue: 'datasource1' }, false),
              new FieldState('fieldB', 'itemC', { rawValue: 'datasource2' }, false),
            ],
            LAYOUT1,
          ),
        );

        sut.addFieldUpdate(new FieldState('fieldC', 'itemB', { rawValue: 'valueC2' }, false));
        sut.addFieldUpdate(new FieldState('fieldB', 'itemA', { rawValue: 'valueB2' }, false));
        sut.addState(new PageState([], LAYOUT2));
        sut.addFieldUpdate(new FieldState('fieldA', 'itemC', { rawValue: 'datasource12' }, false));

        // act
        const aggState = sut.state;

        // assert
        expect(aggState.layout).toBe(LAYOUT2);
      });

      it('should aggregate latest field state values', () => {
        // arrange
        sut = new PageStateHistory();
        sut.addState(
          new PageState(
            [
              new FieldState('fieldA', 'itemA', { rawValue: 'valueA1' }, false, 1),
              new FieldState('fieldB', 'itemA', { rawValue: 'valueB1' }, false, 1),
              new FieldState('fieldC', 'itemB', { rawValue: 'valueC1' }, false, 1),
              new FieldState('fieldA', 'itemC', { rawValue: 'datasource1' }, false, 1),
              new FieldState('fieldB', 'itemC', { rawValue: 'datasource2' }, false, 1),
            ],
            LAYOUT1,
          ),
        );

        sut.addFieldUpdate(new FieldState('fieldC', 'itemB', { rawValue: 'valueC2' }, false, 1));
        sut.addFieldUpdate(new FieldState('fieldB', 'itemA', { rawValue: 'valueB2' }, false, 1));
        sut.addState(new PageState([], LAYOUT2));
        sut.addFieldUpdate(new FieldState('fieldA', 'itemC', { rawValue: 'datasource12' }, false, 1));

        // act
        const aggState = sut.state;

        // assert
        const fieldAItemA = aggState.fields.find((field) => field.fieldId === 'fieldA' && field.itemId === 'itemA');
        const fieldBItemA = aggState.fields.find((field) => field.fieldId === 'fieldB' && field.itemId === 'itemA');
        const fieldCItemB = aggState.fields.find((field) => field.fieldId === 'fieldC' && field.itemId === 'itemB');
        const fieldAItemC = aggState.fields.find((field) => field.fieldId === 'fieldA' && field.itemId === 'itemC');
        const fieldBItemC = aggState.fields.find((field) => field.fieldId === 'fieldB' && field.itemId === 'itemC');

        expect(aggState.fields.length).toBe(5);
        expect(fieldAItemC!.value.rawValue).toBe('datasource12');
        expect(fieldBItemA!.value.rawValue).toBe('valueB2');
        expect(fieldCItemB!.value.rawValue).toBe('valueC2');
        expect(fieldAItemA!.value.rawValue).toBe('valueA1');
        expect(fieldBItemC!.value.rawValue).toBe('datasource2');
      });

      describe('AND there are no updates', () => {
        it('should return initial state', () => {
          expect(sut.state).toEqual(initialState);
        });
      });
    });

    describe('addFieldUpdate()', () => {
      describe('and field is new', () => {
        it('should update initial state and do not create a new state', () => {
          const field = new FieldState('id123', 'item', { rawValue: 'myvalue' }, false, 1);
          sut.addFieldUpdate(field);
          expect(sut.state.fields).toContain(field);
          expect(sut.isInitial).toBe(true);
        });
      });

      describe('and field already exists but has a new value', () => {
        it('should add an update with the field', () => {
          const initialField = initialState.fields[0];
          const field = new FieldState(
            initialField.fieldId,
            initialField.itemId,
            {
              rawValue: initialField.value + ' changed',
            },
            false,
            initialField.itemVersion,
          );
          sut.addFieldUpdate(field);
          expect(sut.state.fields).not.toContain(initialField);
          expect(sut.state.fields).toContain(field);
          expect(sut.isInitial).toBe(false);
        });
      });

      describe('and field already exists with the same value', () => {
        it('should ignore the field', () => {
          sut.addFieldUpdate(initialState.fields[0]);
          expect(sut.isInitial).toBe(true);
        });
      });

      describe('and field has the same rawValue but a different value', () => {
        it('should ignore the field', () => {
          const update1 = new FieldState('1', '1', { rawValue: '123' }, false, 1);
          // update2 should be ignored
          const update2 = new FieldState('1', '1', { rawValue: '123' }, false, 1);

          sut.addFieldUpdate(update1);
          sut.addFieldUpdate(update2);
          sut.undo();

          expect(sut.isInitial).toBe(true);
        });
      });
    });

    describe('addLayoutUpdate()', () => {
      describe('and value has not changed', () => {
        it('should ignore the update', () => {
          sut.addLayoutUpdate(initialState.layout!);
          expect(sut.isInitial).toBe(true);
        });
      });

      describe('and value has changed', () => {
        it('should register the update', () => {
          sut.addLayoutUpdate(LAYOUT2);
          expect(sut.state.layout).toBe(LAYOUT2);
          expect(sut.isInitial).toBe(false);
        });
      });
    });
  });
});
