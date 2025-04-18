/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable, NgModule } from '@angular/core';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of, queueScheduler } from 'rxjs';
import { BaseItemDalService } from '../graphql/item.dal.service';
import { Item } from '../graphql/item.interface';
import { TimedNotificationsService } from '../notifications/timed-notifications.service';
import { Context, CONTEXT_SERVICE_SCHEDULER, ContextChangeOptions, ContextService } from './context.service';
import { PageInteractionsGuardService } from './page-interactions-guard.service';

export const DEFAULT_TEST_CONTEXT: Context = {
  itemId: '{foo1BAR2-BaZ3-0000-AAAA-bbbbCCCC1234}',
  language: 'pt-BR',
  siteName: 'sitecore1',
  itemVersion: 1,
};

export const DEFAULT_TEST_ITEM: Item = {
  name: 'DefaultItemName',
  id: DEFAULT_TEST_CONTEXT.itemId,
  version: DEFAULT_TEST_CONTEXT.itemVersion!,
  versionName: 'Default Item Version name',
  versions: [],
  revision: 'testRevision001',
  updatedBy: 'Author 1',
  updatedDate: '2021-09-07T11:19:21Z',
  publishing: {
    hasPublishableVersion: true,
    isPublishable: true,
    validFromDate: '2021-09-07T11:19:07Z',
    validToDate: '9999-12-31T23:59:59.9999999Z',
    isAvailableToPublish: true,
  },
  displayName: 'Default Item Display Name',
  icon: 'spd-1',
  path: '/a/b',
  hasChildren: false,
  children: [],
  language: DEFAULT_TEST_CONTEXT.language,
  template: {
    id: '123',
    name: 'templateName',
    displayName: 'Template Display Name',
    path: 'x/y',
    isBranchTemplate: false,
  },
  parent: undefined as any as Item['parent'],
  fields: [],
  isFolder: false,
  ancestors: [],
  workflow: null,
  isLatestPublishableVersion: true,
  creationDate: '2020-09-07T11:19:21Z',
  createdBy: 'User 1',
  insertOptions: [],
  permissions: {
    canWrite: true,
    canDelete: true,
    canRename: true,
    canCreate: true,
    canPublish: true,
  },
  locking: {
    lockedByCurrentUser: false,
    isLocked: false,
  },
  presentationDetails: JSON.stringify({ kind: 'FINAL', body: 'test layout' }),
  layoutEditingKind: 'FINAL',
  route: '/',
  hasVersions: true,
};

@Injectable()
export class ContextServiceTesting extends ContextService {
  /**
   * Use this method to provide test values instead of updateContext
   */
  provideTestValue(contextUpdate: Partial<Context>, options: ContextChangeOptions = null): void {
    this._updateContext(contextUpdate, options);
  }

  async provideTestItemUpdate(itemUpdate: Partial<Item>) {
    const currentItem = await this._itemPromise;
    this._itemPromise = Promise.resolve({ ...currentItem, ...itemUpdate });
  }

  provideDefaultTestContext() {
    this.provideTestValue(DEFAULT_TEST_CONTEXT);
  }

  async provideDefaultTestItem() {
    await this.provideTestItemUpdate(DEFAULT_TEST_ITEM);
  }

  async setTestItemId(value: string) {
    this.provideTestValue({ itemId: value });
    await this.updateTestItemAfterContextUpdate();
  }

  async setTestItemVersion(value: number | undefined) {
    this.provideTestValue({ itemVersion: value });
    this.updateTestItemAfterContextUpdate();
  }

  async setTestLang(value: string) {
    this.provideTestValue({ language: value });
    this.updateTestItemAfterContextUpdate();
  }

  async setTestSite(value: string) {
    this.provideTestValue({ siteName: value });
    this.updateTestItemAfterContextUpdate();
  }

  async setTestVariant(value: string | undefined) {
    this.provideTestValue({ variant: value, itemVersion: this.itemVersion });
    this.updateTestItemAfterContextUpdate();
  }

  private async updateTestItemAfterContextUpdate() {
    await this.provideTestItemUpdate({
      id: this.itemId,
      language: this.language,
      version: this.itemVersion,
    });
  }
}

@NgModule({
  imports: [TranslateServiceStubModule],
  providers: [
    { provide: ContextServiceTesting, useClass: ContextServiceTesting },
    { provide: ContextService, useExisting: ContextServiceTesting },

    // Use synchronous scheduler (`queueScheduler`) for testing, as several test were created on the assumption
    // of a synchronous testing version of ContextService.
    // Consider changing that to test components where async is relevant.
    { provide: CONTEXT_SERVICE_SCHEDULER, useValue: queueScheduler },
    {
      provide: BaseItemDalService,
      useValue: jasmine.createSpyObj<BaseItemDalService>({
        getItem: of({ id: 'id1' } as Item),
        getItemState: of({ id: 'id1' } as Item),
        getItemInsertOptions: of([{ id: 'template1', displayName: 'Template 1' }]),
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
      useValue: {
        onBeforeContextChange: (update: Partial<Context>, options: ContextChangeOptions) =>
          Promise.resolve({ update, options }),
      },
    },
  ],
})
export class ContextServiceTestingModule {}
