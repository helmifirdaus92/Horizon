/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { PageApiService } from 'app/shared/rest/page/page.api.service';
import { ExecuteWorkflowCommandResult } from 'app/shared/rest/page/page.types';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { firstValueFrom, of } from 'rxjs';
import { WorkflowDalRestService } from './workflow.dal.rest.service';

let sut: WorkflowDalRestService;
let pageApiServiceSpy: jasmine.SpyObj<PageApiService>;

describe(WorkflowDalRestService.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, StaticConfigurationServiceStubModule],
      providers: [
        {
          provide: PageApiService,
          useValue: jasmine.createSpyObj<PageApiService>({
            executeWorkflow: undefined,
          }),
        },
        WorkflowDalRestService,
      ],
    });
    sut = TestBed.inject(WorkflowDalRestService);
    pageApiServiceSpy = TestBedInjectSpy(PageApiService);
  });

  it('should be defined', () => {
    expect(sut).toBeTruthy();
  });

  it('should execute workflow command', async () => {
    // Arrange
    const commandId = 'commandId';
    const comments = 'test comments';
    const context = {
      itemId: 'itemId',
      itemVersion: 1,
      language: 'en',
      siteName: 'example-site',
    };

    const mockResponse: ExecuteWorkflowCommandResult = {
      completed: true,
      error: '',
      datasourcesCommandResult: [],
      pageWorkflowValidationResult: {
        pageValidationResult: {
          pageId: 'itemId',
          pageName: 'Item Name',
          pageRulesResult: [],
          fieldRulesResult: [],
        },
        defaultDatasourceItemsResult: [
          {
            pageId: 'defaultDataSourcePageId',
            pageName: 'Default Data Source Page',
            pageRulesResult: [],
            fieldRulesResult: [],
          },
        ],
        personalizedDatasourceItemsResult: [
          {
            pageId: 'personalizedDataSourcePageId',
            pageName: 'Personalized Data Source Page',
            pageRulesResult: [],
            fieldRulesResult: [],
          },
        ],
      },
    };

    pageApiServiceSpy.executeWorkflow.and.returnValue(of(mockResponse));

    // Act
    const result = await firstValueFrom(sut.executeCommand(commandId, comments, context));

    // Assert
    expect(result).toEqual({
      completed: true,
      error: '',
      datasourcesCommandResult: [],
      pageWorkflowValidationResult: {
        pageItemResult: {
          itemId: 'itemId',
          itemName: 'Item Name',
          itemRulesResult: [],
          fieldRulesResult: [],
        },
        defaultDatasourceItemsResult: [
          {
            itemId: 'defaultDataSourcePageId',
            itemName: 'Default Data Source Page',
            itemRulesResult: [],
            fieldRulesResult: [],
          },
        ],
        personalizedDatasourceItemsResult: [
          {
            itemId: 'personalizedDataSourcePageId',
            itemName: 'Personalized Data Source Page',
            itemRulesResult: [],
            fieldRulesResult: [],
          },
        ],
      },
    });

    // Assert
    expect(pageApiServiceSpy.executeWorkflow).toHaveBeenCalledOnceWith(
      'itemId',
      jasmine.objectContaining({
        pageVersion: 1,
        site: 'example-site',
        language: 'en',
        commandId: 'commandId',
        comments: 'test comments',
      }),
    );
  });
});
