/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { SaveFieldDetails, SaveLayoutDetails, SaveResult } from '../save.interfaces';
import { SaveDalService } from './save.dal.service';

let sut: SaveDalService;
let controller: ApolloTestingController;
describe(SaveDalService.name, () => {
  const queries = require('graphql-tag/loader!./save.service.graphql');
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [
        SaveDalService,
        {
          provide: ConfigurationService,
          useValue: jasmine.createSpyObj<ConfigurationService>({}, {
            isSaveSupportFieldsValidation: () => true,
          } as any),
        },
      ],
    });

    sut = TestBed.inject(SaveDalService);
    controller = TestBed.inject(ApolloTestingController);
  });

  it('should be defined', () => {
    expect(sut).toBeTruthy();
  });

  describe('savePage()', () => {
    it('should save page layout and field details and emit the result', fakeAsync(() => {
      const language = 'en';
      const site = 'example.com';
      const saveLayoutDetail: SaveLayoutDetails = {
        itemId: '123',
        presentationDetails: {
          kind: 'FINAL',
          body: '<div>Layout Body</div>',
        },
        originalPresentationDetails: {
          kind: 'FINAL',
          body: '<div>Original Layout Body</div>',
        },
        revision: null,
      };
      const saveFieldDetails: SaveFieldDetails = {
        itemId: '123',
        revision: '12345',
        fields: [
          {
            id: 'fieldId',
            originalValue: 'Original Value',
            value: 'New Value',
            reset: false,
          },
        ],
      };

      const spy = jasmine.createSpy();
      sut.savePage(language, site, [saveLayoutDetail], [saveFieldDetails]).subscribe(spy);

      const op = controller.expectOne(queries['Save']);
      expect(op.operation.variables).toEqual({
        input: {
          site,
          language,
          items: [saveLayoutDetail, saveFieldDetails],
        },
      });

      const result: SaveResult = {
        errors: [],
        savedItems: [],
        validationErrors: [],
        warnings: [],
        newCreatedVersions: [],
      };

      op.flush({ data: { saveItem: result } });
      tick();

      expect(spy).toHaveBeenCalledWith(result);
      flush();
    }));
  });
});
