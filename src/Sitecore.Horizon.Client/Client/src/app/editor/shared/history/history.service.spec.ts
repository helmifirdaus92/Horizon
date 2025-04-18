/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { FieldState } from './field-state';
import { HISTORY_ENTRY_FACTORY, HistoryService } from './history.service';
import { PageState } from './page-state';
import { PageStateHistory } from './page-state-history';

function createFakeHistoryEntry() {
  const historySpy = jasmine.createSpyObj<PageStateHistory>('PageStateHistory', [
    'addState',
    'addFieldUpdate',
    'addLayoutUpdate',
    'undo',
    'redo',
  ]);
  (historySpy.isInitial as boolean) = true;
  (historySpy.isInLatest as boolean) = true;
  return historySpy;
}

describe(HistoryService.name, () => {
  let sut: HistoryService;
  let historyFactory: jasmine.Spy;
  let initialHistoryEntry: jasmine.SpyObj<PageStateHistory>;

  let isInitial: jasmine.Spy;
  let isLatest: jasmine.Spy;

  const pageId = 'foo';
  const pageVersion = 1;
  const language = 'neanderthalainian';
  const variant = 'variant';

  beforeEach(() => {
    historyFactory = jasmine.createSpy('provided factory');
    initialHistoryEntry = createFakeHistoryEntry();

    let isInitialHistory = true;
    historyFactory.and.callFake(() => {
      if (isInitialHistory) {
        isInitialHistory = false;
        return initialHistoryEntry;
      }
      return createFakeHistoryEntry();
    });

    sut = new HistoryService();
    sut[HISTORY_ENTRY_FACTORY] = historyFactory;

    isInitial = jasmine.createSpy('initial');
    isLatest = jasmine.createSpy('latest');

    sut.isInitial$.subscribe(isInitial);
    sut.isLatest$.subscribe(isLatest);
  });

  describe('addState()', () => {
    it('should create a new history entry for the given page', () => {
      const state = new PageState([], 'layout');
      sut.setContext(pageId, pageVersion, variant, language);
      sut.addState(state);

      expect(historyFactory).toHaveBeenCalledTimes(1);
    });

    it('should update initial and latest flags', () => {
      (initialHistoryEntry.isInitial as boolean) = false;

      const state = new PageState([], 'layout');
      sut.setContext(pageId, pageVersion, variant, language);
      sut.addState(state);

      expect(isInitial).toHaveBeenCalledWith(false);
      expect(isLatest).toHaveBeenCalledWith(true);
    });

    describe('AND there already is an entry for the page', () => {
      it('should add the state to the existing entry as an update', () => {
        const initialState = new PageState([], 'layout');
        const otherState = new PageState(
          [new FieldState('field', 'item', { rawValue: 'value' }, false, 1)],
          'new layout',
        );
        sut.setContext(pageId, pageVersion, variant, language);
        sut.addState(initialState);
        sut.addState(otherState);

        expect(initialHistoryEntry.addState).toHaveBeenCalledTimes(2);
        expect(initialHistoryEntry.addState).toHaveBeenCalledWith(otherState);
      });
    });

    describe('AND state is added for another page', () => {
      it('should create a new history entry for the other page', () => {
        const state1 = new PageState([], 'layout');
        sut.setContext(pageId, pageVersion, variant, language);
        sut.addState(state1);

        const state2 = new PageState([{ bar: 'foo' } as any], '222');
        sut.setContext('foo2', pageVersion, variant, language);
        sut.addState(state2);

        expect(historyFactory).toHaveBeenCalledTimes(2);
      });
    });
    describe('AND goes back to initial page', () => {
      it('should add the state to the existing page entry as an update', () => {
        const initialState = new PageState([], 'layout');
        const otherState = new PageState(
          [new FieldState('field', 'item', { rawValue: 'value' }, false, 1)],
          'new layout',
        );
        sut.setContext(pageId, pageVersion, variant, language);
        sut.addState(initialState);

        const stateOtherPage = new PageState([{ bar: 'foo' } as any], '222');
        sut.setContext('foo2', pageVersion, variant, language);
        sut.addState(stateOtherPage);

        sut.setContext(pageId, pageVersion, variant, language);
        sut.addState(otherState);

        expect(initialHistoryEntry.addState).toHaveBeenCalledTimes(2);
        expect(initialHistoryEntry.addState).toHaveBeenCalledWith(otherState);
      });
    });
  });

  describe('AND state is added for another version of the same page', () => {
    it('should create a new history entry for each version of the page', () => {
      const state1 = new PageState([], 'layout');
      sut.setContext(pageId, 1, variant, language);
      sut.addState(state1);

      const state2 = new PageState([{ bar: 'foo' } as any], '222');
      sut.setContext(pageId, 2, variant, language);
      sut.addState(state2);

      expect(historyFactory).toHaveBeenCalledTimes(2);
    });
  });

  describe('AND goes back to initial version', () => {
    it('should add the state to the existing entry as an update', () => {
      const initialState = new PageState([], 'layout');
      const otherState = new PageState(
        [new FieldState('field', 'item', { rawValue: 'value' }, false, 1)],
        'new layout',
      );
      sut.setContext(pageId, pageVersion, variant, language);
      sut.addState(initialState);

      const stateOtherPage = new PageState([{ bar: 'foo' } as any], '222');
      sut.setContext(pageId, 2, variant, language);
      sut.addState(stateOtherPage);

      sut.setContext(pageId, pageVersion, variant, language);
      sut.addState(otherState);

      expect(initialHistoryEntry.addState).toHaveBeenCalledTimes(2);
      expect(initialHistoryEntry.addState).toHaveBeenCalledWith(otherState);
    });
  });

  describe('AND state is added for another variant of the same page', () => {
    it('should create a new history entry for each version of the page', () => {
      const state1 = new PageState([], 'layout');
      sut.setContext(pageId, pageVersion, undefined, language);
      sut.addState(state1);

      const state2 = new PageState([{ bar: 'foo' } as any], '222');
      sut.setContext(pageId, pageVersion, variant, language);
      sut.addState(state2);

      expect(historyFactory).toHaveBeenCalledTimes(2);
    });

    describe('AND goes back to initial variant', () => {
      it('should add the state to the existing entry as an update', () => {
        const initialState = new PageState([], 'layout');
        const otherState = new PageState(
          [new FieldState('field', 'item', { rawValue: 'value' }, false, 1)],
          'new layout',
        );
        sut.setContext(pageId, pageVersion, variant, language);
        sut.addState(initialState);

        const stateOtherPage = new PageState([{ bar: 'foo' } as any], '222');
        sut.setContext(pageId, pageVersion, undefined, language);
        sut.addState(stateOtherPage);

        sut.setContext(pageId, pageVersion, variant, language);
        sut.addState(otherState);

        expect(initialHistoryEntry.addState).toHaveBeenCalledTimes(2);
        expect(initialHistoryEntry.addState).toHaveBeenCalledWith(otherState);
      });
    });
  });

  describe('AND state is added for another language', () => {
    it('should create a new history entry for the other language', () => {
      const state1 = new PageState([], 'layout');
      sut.setContext(pageId, pageVersion, variant, language);
      sut.addState(state1);

      const state2 = new PageState([{ bar: 'foo' } as any], '222');
      sut.setContext(pageId, pageVersion, variant, 'cat');
      sut.addState(state2);

      expect(historyFactory).toHaveBeenCalledTimes(2);
    });

    describe('AND goes back to initial language', () => {
      it('should add the state to the existing entry as an update', () => {
        const initialState = new PageState([], 'layout');
        const otherState = new PageState(
          [new FieldState('field', 'item', { rawValue: 'value' }, false, 1)],
          'new layout',
        );
        sut.setContext(pageId, pageVersion, variant, language);
        sut.addState(initialState);

        const stateOtherPage = new PageState([{ bar: 'foo' } as any], '222');
        sut.setContext(pageId, pageVersion, variant, 'cat');
        sut.addState(stateOtherPage);

        sut.setContext(pageId, pageVersion, variant, language);
        sut.addState(otherState);

        expect(initialHistoryEntry.addState).toHaveBeenCalledTimes(2);
        expect(initialHistoryEntry.addState).toHaveBeenCalledWith(otherState);
      });
    });
  });

  describe('clear', () => {
    it('should clear respective history entries', () => {
      // Arrange
      sut.setContext(pageId, pageVersion, '1', language);
      sut.setContext(pageId, pageVersion, '2', language);
      sut.setContext(pageId, pageVersion, '3', language);

      // Act
      sut.clear(pageId, pageVersion, language);

      sut.setContext(pageId, pageVersion, '1', language);
      sut.setContext(pageId, pageVersion, '2', language);
      sut.setContext(pageId, pageVersion, '3', language);

      expect(historyFactory).toHaveBeenCalledTimes(6);
    });
  });

  describe('addFieldUpdate()', () => {
    it('should add the field update to the active history entry', () => {
      const state = new PageState([], 'layout');
      sut.setContext(pageId, pageVersion, variant, language);
      sut.addState(state);

      const fieldUpdate = new FieldState('field', 'item', { rawValue: 'value' }, false, 1);
      sut.addFieldUpdate(fieldUpdate);

      expect(initialHistoryEntry.addFieldUpdate).toHaveBeenCalledWith(fieldUpdate);
      expect(initialHistoryEntry.addFieldUpdate).toHaveBeenCalledTimes(1);
    });

    it('should update initial and latest flags', () => {
      const state = new PageState([], 'layout');
      sut.setContext(pageId, pageVersion, variant, language);
      sut.addState(state);

      (initialHistoryEntry.isInitial as boolean) = false;
      const update = new FieldState('field', 'item', { rawValue: 'value' }, false, 1);
      sut.addFieldUpdate(update);

      expect(isInitial).toHaveBeenCalledWith(false);
      expect(isLatest).toHaveBeenCalledWith(true);
    });
  });

  describe('undo()', () => {
    it('should get undo form the active history entry', () => {
      const undoResult: PageState = { bar: 'foo' } as any;
      initialHistoryEntry.undo.and.returnValue(undoResult);

      const state = new PageState([], 'layout');
      sut.setContext(pageId, pageVersion, variant, language);
      sut.addState(state);

      const res = sut.undo();

      expect(res).toBe(undoResult);
      expect(initialHistoryEntry.undo).toHaveBeenCalled();
    });

    it('should get undo form the active history entry when more than one version of the page', () => {
      const undoResult: PageState = { bar: 'foo' } as any;
      initialHistoryEntry.undo.and.returnValue(undoResult);

      const state = new PageState([], 'layout');
      sut.setContext(pageId, pageVersion, variant, language);
      sut.addState(state);

      const versionTwoState = new PageState([], 'layout 2');
      sut.setContext(pageId, 2, variant, language);
      sut.addState(versionTwoState);

      sut.setContext(pageId, pageVersion, variant, language);

      const res = sut.undo();

      expect(res).toBe(undoResult);
      expect(initialHistoryEntry.undo).toHaveBeenCalled();
    });

    it('should update initial and latest flags', () => {
      const state = new PageState([], 'layout');
      sut.setContext(pageId, pageVersion, variant, language);
      sut.addState(state);

      (initialHistoryEntry.isInitial as boolean) = false;
      const update = new PageState([{ bar: 'foo' } as any], 'hello moon');
      sut.addState(update);

      (initialHistoryEntry.isInitial as boolean) = true;
      (initialHistoryEntry.isInLatest as boolean) = false;
      sut.undo();

      expect(isInitial.calls.mostRecent().args[0]).toBe(true);
      expect(isLatest.calls.mostRecent().args[0]).toBe(false);
    });
  });

  describe('redo()', () => {
    it('should get redo form the active history entry', () => {
      const redoResult: PageState = { bar: 'foo' } as any;
      initialHistoryEntry.redo.and.returnValue(redoResult);

      const state = new PageState([], 'layout');
      sut.setContext(pageId, pageVersion, variant, language);
      sut.addState(state);

      const res = sut.redo();

      expect(res).toBe(redoResult);
      expect(initialHistoryEntry.redo).toHaveBeenCalled();
    });

    it('should update initial and latest flags', () => {
      const state = new PageState([], 'layout');
      sut.setContext(pageId, pageVersion, variant, language);
      sut.addState(state);

      (initialHistoryEntry.isInitial as boolean) = false;
      const update = new PageState([{ bar: 'foo' } as any], 'hello moon');
      sut.addState(update);

      (initialHistoryEntry.isInitial as boolean) = true;
      (initialHistoryEntry.isInLatest as boolean) = false;
      sut.undo();

      (initialHistoryEntry.isInitial as boolean) = false;
      (initialHistoryEntry.isInLatest as boolean) = true;
      sut.redo();

      expect(isInitial.calls.mostRecent().args[0]).toBe(false);
      expect(isLatest.calls.mostRecent().args[0]).toBe(true);
    });

    it('should get redo form the active history entry when more than one version of the page', () => {
      const redoResult: PageState = { bar: 'foo' } as any;
      initialHistoryEntry.redo.and.returnValue(redoResult);

      const state = new PageState([], 'layout');
      sut.setContext(pageId, pageVersion, variant, language);
      sut.addState(state);

      const versionTwoState = new PageState([], 'layout 2');
      sut.setContext(pageId, 2, variant, language);
      sut.addState(versionTwoState);

      sut.setContext(pageId, pageVersion, variant, language);

      const res = sut.redo();

      expect(res).toBe(redoResult);
      expect(initialHistoryEntry.redo).toHaveBeenCalled();
    });
  });
});
