/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of, throwError } from 'rxjs';
import { BaseItemDalService } from '../graphql/item.dal.service';
import { Item } from '../graphql/item.interface';
import { TimedNotificationsService } from '../notifications/timed-notifications.service';
import { ContextHelper } from './context.helper';
import { Context, ContextChange, ContextChangeOptions, ContextService } from './context.service';
import { ItemChangeScope } from './item-change-service';
import { PageInteractionsGuardService } from './page-interactions-guard.service';

const itemValue = 'foo';
const language = 'lang';
const siteName = 'site';
const itemVersion = 1;

const initialContext: Context = { itemId: itemValue, language, siteName, deviceLayoutId: '' };

const initialContextWithItemVersion: Context = {
  itemId: itemValue,
  itemVersion,
  language,
  siteName,
  deviceLayoutId: '',
};

describe(ContextService.name, () => {
  let itemDalServiceSpy: jasmine.SpyObj<BaseItemDalService>;
  let timedNotificationsServiceSpy: jasmine.SpyObj<TimedNotificationsService>;

  const pageInteractionsGuardServiceMock = {
    onBeforeContextChange: (update: Partial<Context>, options: ContextChangeOptions) =>
      Promise.resolve({ update, options }),
  };

  let sut: ContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateServiceStubModule],
      providers: [
        {
          provide: BaseItemDalService,
          useValue: jasmine.createSpyObj<BaseItemDalService>({
            getItem: of({} as Item),
            getItemState: of({} as Item),
          }),
        },
        {
          provide: TimedNotificationsService,
          useValue: jasmine.createSpyObj<TimedNotificationsService>({
            push: of({}) as any,
            pushNotification: of({}) as any,
          }),
        },
        {
          provide: PageInteractionsGuardService,
          useValue: pageInteractionsGuardServiceMock,
        },
      ],
    });

    sut = TestBed.inject(ContextService);

    itemDalServiceSpy = TestBedInjectSpy(BaseItemDalService);
    timedNotificationsServiceSpy = TestBedInjectSpy(TimedNotificationsService);
  });

  describe('when service is initialized', () => {
    beforeEach(async () => {
      await sut.init(initialContext);
    });

    describe('value', () => {
      it('should return context', () => {
        expect(sut.value).toEqual(initialContext);
      });
    });

    describe('itemId', () => {
      it('should return itemId', () => {
        expect(sut.itemId).toBe(itemValue);
      });
    });

    describe('language', () => {
      it('should return language', () => {
        expect(sut.language).toBe(language);
      });
    });

    describe('siteName', () => {
      it('should return siteName', () => {
        expect(sut.siteName).toBe(siteName);
      });
    });

    describe('value$', () => {
      it('should emit context', fakeAsync(() => {
        const spy = jasmine.createSpy('spy');
        sut.value$.subscribe(spy);
        tick();

        expect(spy.calls.mostRecent().args[0]).toEqual(initialContext);
        flush();
      }));
    });

    describe('itemId$', () => {
      it('should emit context itemId', fakeAsync(() => {
        const spy = jasmine.createSpy('spy');
        sut.itemId$.subscribe(spy);
        tick();

        expect(spy).toHaveBeenCalledWith(itemValue);
        flush();
      }));
    });

    describe('language$', () => {
      it('should emit context language', fakeAsync(() => {
        const spy = jasmine.createSpy('spy');
        sut.language$.subscribe(spy);
        tick();

        expect(spy).toHaveBeenCalledWith(language);
        flush();
      }));
    });

    describe('siteName$', () => {
      it('should emit context siteName', fakeAsync(() => {
        const spy = jasmine.createSpy('spy');
        sut.siteName$.subscribe(spy);
        tick();

        expect(spy).toHaveBeenCalledWith(siteName);
        flush();
      }));
    });
    describe('itemVersion$', () => {
      it('should emit context itemVersion', fakeAsync(() => {
        const spy = jasmine.createSpy('spy');
        sut.itemVersion$.subscribe(spy);
        tick();

        expect(spy).toHaveBeenCalledWith(undefined);
        flush();
      }));
    });

    describe('variant$', () => {
      it('should emit context variant', fakeAsync(() => {
        const spy = jasmine.createSpy('spy');
        sut.variant$.subscribe(spy);
        tick();

        expect(spy).toHaveBeenCalledWith(undefined);
        flush();
      }));
    });
  });

  describe('when gql operation has not completed', () => {
    describe('value', () => {
      it('should be empty', () => {
        expect(sut.value).toEqual(ContextHelper.empty);
      });
    });

    describe('value$', () => {
      it('should not emit', () => {
        const spy = jasmine.createSpy('spy');
        sut.value$.subscribe(spy);

        expect(spy).not.toHaveBeenCalled();
      });
    });
  });

  describe('when service is not initialized', () => {
    describe('value$', () => {
      it('should not emit', () => {
        const spy = jasmine.createSpy('spy');
        sut.value$.subscribe(spy);

        expect(spy).not.toHaveBeenCalled();
      });
    });
  });

  describe('valueChanges$', () => {
    it('should include the source', fakeAsync(() => {
      const spy = jasmine.createSpy('spy');
      sut.valueChanges$.subscribe(spy);

      const value: ContextChange = {
        context: initialContext,
        options: {
          eventSource: 'CANVAS_BEACON',
        },
      };

      sut.updateContext(value.context, value.options);
      tick();

      expect(spy).toHaveBeenCalledWith(value);
      flush();
    }));

    describe('WHEN the same context is emitted from different sources', () => {
      it('should emit valueChanges$ for each source', fakeAsync(() => {
        const spy = jasmine.createSpy('spy');
        sut.valueChanges$.subscribe(spy);

        sut.updateContext(initialContext);
        sut.updateContext(initialContext, { eventSource: 'CANVAS_BEACON' });
        tick();

        expect(spy).toHaveBeenCalledTimes(2);
        flush();
      }));

      it('should emit value$ only once', fakeAsync(() => {
        const spy = jasmine.createSpy('spy');
        sut.value$.subscribe(spy);

        sut.updateContext(initialContext);
        sut.updateContext(initialContext, { eventSource: 'CANVAS_BEACON' });
        tick();

        expect(spy).toHaveBeenCalledTimes(1);
        flush();
      }));
    });
  });

  describe('when service is initialized with itemVersion', () => {
    beforeEach(async () => {
      await sut.init(initialContextWithItemVersion);
    });

    describe('context', () => {
      it('should return context', () => {
        expect(sut.value).toEqual(initialContextWithItemVersion);
      });

      it('should emit context itemVersion', fakeAsync(() => {
        const spy = jasmine.createSpy('spy');
        sut.itemVersion$.subscribe(spy);
        tick();

        expect(spy).toHaveBeenCalledWith(itemVersion);
        flush();
      }));
    });

    describe('Update context with variant name', () => {
      it('should set variant name IF it is provided', fakeAsync(() => {
        const spy = jasmine.createSpy('spy');
        sut.value$.subscribe(spy);

        const contextWithSegmentId: Context = {
          itemId: itemValue,
          itemVersion,
          language,
          siteName,
          deviceLayoutId: '',
          variant: 'A',
        };

        const contextWithoutSegmentId: Partial<Context> = {
          itemVersion: 3,
          variant: 'B',
        };

        const expectedContext: Context = {
          itemId: itemValue,
          language,
          siteName,
          deviceLayoutId: '',
          itemVersion: 3,
          variant: 'B',
        };

        sut.updateContext(contextWithSegmentId);
        sut.updateContext(contextWithoutSegmentId);
        tick();

        expect(spy.calls.mostRecent().args[0]).toEqual(expectedContext);
        flush();
      }));

      it('should reset variant Name IF it is not provided', fakeAsync(() => {
        const spy = jasmine.createSpy('spy');
        sut.value$.subscribe(spy);

        const contextWithSegmentId: Context = {
          itemId: itemValue,
          itemVersion,
          language,
          siteName,
          deviceLayoutId: '',
          variant: 'boxever',
        };

        const contextWithoutSegmentId: Partial<Context> = {
          itemVersion: 3,
        };

        const expectedContext: Context = {
          itemId: itemValue,
          language,
          siteName,
          deviceLayoutId: '',
          itemVersion: 3,
          variant: undefined,
        };

        sut.updateContext(contextWithSegmentId);
        sut.updateContext(contextWithoutSegmentId);
        tick();

        expect(spy.calls.mostRecent().args[0]).toEqual(expectedContext);
        flush();
      }));
    });
  });

  describe('getItem', () => {
    it('should fetch item on context change', fakeAsync(async () => {
      const spy = jasmine.createSpy('spy');
      sut.valueChanges$.subscribe(spy);
      const item1 = { id: 'item1', language: initialContext.language, version: initialContext.itemVersion } as Item;
      const item2 = { id: 'item2', language: initialContext.language, version: initialContext.itemVersion } as Item;
      const item3 = { id: 'item3', language: initialContext.language, version: initialContext.itemVersion } as Item;

      itemDalServiceSpy.getItem.and.returnValue(of(item1));
      sut.updateContext(initialContext);
      tick();
      let item = await sut.getItem();
      expect(item).toBe(item1);

      // context has changed - new item should be fetched
      itemDalServiceSpy.getItem.and.returnValue(of(item2));
      sut.updateContext({ itemId: 'item2' });
      tick();
      item = await sut.getItem();
      expect(item).toBe(item2);

      // context has not changed - same item is already fetched - should not fetch new
      itemDalServiceSpy.getItem.and.returnValue(of(item3));
      sut.updateContext({ itemId: 'item2' });
      tick();
      item = await sut.getItem();
      expect(item).toBe(item2);
      flush();
    }));

    it('should not re-fetch item on every getItem() call if context has not changed', fakeAsync(async () => {
      const spy = jasmine.createSpy('spy');
      sut.valueChanges$.subscribe(spy);
      const item1 = { id: 'item1', language: initialContext.language, version: initialContext.itemVersion } as Item;

      itemDalServiceSpy.getItem.and.returnValue(of(item1));
      sut.updateContext(initialContext);
      tick();
      await sut.getItem();
      await sut.getItem();
      await sut.getItem();

      expect(itemDalServiceSpy.getItem).toHaveBeenCalledOnceWith(
        initialContext.itemId,
        initialContext.language,
        initialContext.siteName,
        initialContext.itemVersion,
      );
      flush();
    }));

    it('should re-fetch item only once when notifyItemStateUpdate was called', fakeAsync(async () => {
      itemDalServiceSpy.getItem.and.returnValue(of({} as Item));
      await sut.updateContext(initialContext);

      const scopes: ItemChangeScope[] = ['data-fields', 'display-name', 'layout'];
      sut.notifyItemStateUpdate(initialContext.itemId, scopes);
      tick();
      await sut.getItem();
      await sut.getItem();
      await sut.getItem();

      expect(itemDalServiceSpy.getItemState).toHaveBeenCalledOnceWith(
        initialContext.itemId,
        initialContext.language,
        initialContext.siteName,
        initialContext.itemVersion,
        scopes,
      );
      flush();
    }));

    it('should show error notification IF getItem fails', fakeAsync(async () => {
      itemDalServiceSpy.getItem.and.returnValue(throwError(() => new Error('some error')));
      sut.updateContext(initialContext);

      tick();
      sut.getItem();
      tick();

      const result = timedNotificationsServiceSpy.pushNotification.calls.mostRecent().args[0];
      expect(result.text).toContain('ERRORS.APP_RESET_TO_HOME');
      flush();
    }));
  });
});
