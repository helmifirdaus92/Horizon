/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { DEFAULT_TEST_CONTEXT } from 'app/shared/client-state/context.service.testing';
import { createGqlError, createSpyObserver } from 'app/testing/test.utils';
import { EXECUTE_COMMAND_MUTATION, WorkflowDalService } from './workflow.dal.service';

describe(WorkflowDalService.name, () => {
  let sut: WorkflowDalService;
  let apolloTestingController: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [WorkflowDalService],
    });

    sut = TestBed.inject(WorkflowDalService);
    apolloTestingController = TestBed.inject(ApolloTestingController);
  });

  afterEach(() => {
    apolloTestingController.verify();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('executeCommand()', () => {
    it('should return result from the mutation', fakeAsync(() => {
      const commandId = 'cmd-id-test';
      const comments = 'test-comment';
      const context = DEFAULT_TEST_CONTEXT;
      const result = {
        completed: true,
        error: 'blah',
        datasourcesCommandResult: [
          {
            completed: true,
            error: 'blah',
          },
        ],
      };
      const resultSpy = createSpyObserver();

      sut.executeCommand(commandId, comments, context).subscribe(resultSpy);
      const mutation = apolloTestingController.expectOne(EXECUTE_COMMAND_MUTATION);
      mutation.flush({ data: { executeWorkflowCommand: result } });
      tick();

      expect(resultSpy.next).toHaveBeenCalledWith(result);
      expect(mutation.operation.variables.input).toEqual({
        commandId,
        comments,
        itemId: context.itemId,
        itemVersion: context.itemVersion,
        language: context.language,
        site: context.siteName,
      });

      flush();
    }));

    it('should unwrap gql error code', fakeAsync(() => {
      const commandId = 'cmd-id-test';
      const comments = 'test-comment';
      const context = DEFAULT_TEST_CONTEXT;
      const resultSpy = createSpyObserver();

      sut.executeCommand(commandId, comments, context).subscribe(resultSpy);
      const mutation = apolloTestingController.expectOne(EXECUTE_COMMAND_MUTATION);
      mutation.graphqlErrors([createGqlError('failed', 'TEST_ERR_CODE')]);
      tick();

      expect(resultSpy.error).toHaveBeenCalledWith('TEST_ERR_CODE');
      flush();
    }));
  });
});
