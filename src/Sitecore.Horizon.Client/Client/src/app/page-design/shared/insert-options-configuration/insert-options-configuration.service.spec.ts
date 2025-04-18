/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';

import { PageTemplatesService } from 'app/page-design/page-templates.service';
import {
  ItemTemplate,
  ItemTemplateBulkOperationOutput,
  StandardValuesItem,
  TenantPageTemplate,
} from 'app/page-design/page-templates.types';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { of } from 'rxjs';
import { InsertOptionsConfigurationService } from './insert-options-configuration.service';

describe(InsertOptionsConfigurationService.name, () => {
  let sut: InsertOptionsConfigurationService;
  let contextService: ContextServiceTesting;
  let pageTemplatesServiceSpy: jasmine.SpyObj<PageTemplatesService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ContextServiceTestingModule],
      providers: [
        InsertOptionsConfigurationService,
        {
          provide: PageTemplatesService,
          useValue: jasmine.createSpyObj<PageTemplatesService>('PageTemplatesService', [
            'getTenantPageTemplates',
            'createTemplatesStandardValuesItems',
            'updateStandardValuesInsertOptions',
          ]),
        },
      ],
    });

    pageTemplatesServiceSpy = TestBedInjectSpy(PageTemplatesService);
    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideDefaultTestContext();

    sut = TestBed.inject(InsertOptionsConfigurationService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('getTenantPageTemplatesWithStandardValues', () => {
    it('should fetch the templates and get the standard value item for templates without standardvalues', async () => {
      // arrange
      const templatesList: TenantPageTemplate[] = [
        {
          pageDesign: null,
          template: {
            templateId: 'template-id1',
            name: 'template-1',
            standardValuesItem: { itemId: 'sv-id1', insertOptions: [{ templateId: 'template-id1' }] },
          },
        },
        { pageDesign: null, template: { templateId: 'template-id2', name: 'template-2' } },
        { pageDesign: null, template: { templateId: 'template-id3', name: 'template-3' } },
        {
          pageDesign: null,
          template: {
            templateId: 'template-id4',
            name: 'template-4',
            standardValuesItem: {
              itemId: 'sv-id4',
              insertOptions: [{ templateId: 'template-id1' }, { templateId: 'template-id4' }],
            },
          },
        },
      ];

      const updatedTemplates: ItemTemplate[] = [
        {
          templateId: 'template-id2',
          name: 'template-2',
          standardValuesItem: { itemId: 'sv-id2' },
        },
        {
          templateId: 'template-id3',
          name: 'template-3',
          standardValuesItem: { itemId: 'sv-id3' },
        },
      ];

      const expectedResult: TenantPageTemplate[] = [
        { ...templatesList[0] },
        {
          pageDesign: null,
          template: { templateId: 'template-id2', name: 'template-2', standardValuesItem: { itemId: 'sv-id2' } },
        },
        {
          pageDesign: null,
          template: { templateId: 'template-id3', name: 'template-3', standardValuesItem: { itemId: 'sv-id3' } },
        },
        { ...templatesList[3] },
      ];

      const updateTemplateStandardValuesResult: ItemTemplateBulkOperationOutput = {
        successful: true,
        errorMessage: null,
        templates: updatedTemplates,
      };

      pageTemplatesServiceSpy.getTenantPageTemplates.and.returnValue(of(templatesList));
      pageTemplatesServiceSpy.createTemplatesStandardValuesItems.and.returnValue(
        of(updateTemplateStandardValuesResult),
      );

      // act
      const actualResult = await sut.getTenantPageTemplatesWithStandardValues();

      // assert
      expect(pageTemplatesServiceSpy.createTemplatesStandardValuesItems).toHaveBeenCalledWith([
        'template-id2',
        'template-id3',
      ]);
      expect(actualResult).toEqual(expectedResult);
    });
  });

  describe('updateTemplateInsertOptions', () => {
    it('should update template child and parent insert options', async () => {
      // arrange
      const templatesList: TenantPageTemplate[] = [
        {
          pageDesign: null,
          template: {
            templateId: 'template-id1',
            name: 'template-1',
            standardValuesItem: { itemId: 'sv-id1', insertOptions: [{ templateId: 'template-id1' }] },
          },
        },
        {
          pageDesign: null,
          template: { templateId: 'template-id2', name: 'template-2', standardValuesItem: { itemId: 'sv-id2' } },
        },
        {
          pageDesign: null,
          template: { templateId: 'template-id3', name: 'template-3', standardValuesItem: { itemId: 'sv-id3' } },
        },
        {
          pageDesign: null,
          template: {
            templateId: 'template-id4',
            name: 'template-4',
            standardValuesItem: {
              itemId: 'sv-id4',
              insertOptions: [{ templateId: 'template-id1' }, { templateId: 'template-id4' }],
            },
          },
        },
      ];
      const template = templatesList[0];
      const childInsertOptions = ['template-id2', 'template-id4'];
      const parentInsertOptions = ['template-id3'];

      pageTemplatesServiceSpy.updateStandardValuesInsertOptions.and.returnValue(
        of({ successful: true, errorMessage: null, items: [] }),
      );

      // act
      await sut.updateTemplateInsertOptions(template, templatesList, childInsertOptions, parentInsertOptions);

      const expectedUpdates: StandardValuesItem[] = [
        {
          itemId: 'sv-id1',
          insertOptions: [{ templateId: 'template-id2' }, { templateId: 'template-id4' }],
        },
        {
          itemId: 'sv-id3',
          insertOptions: [{ templateId: 'template-id1' }],
        },
        {
          itemId: 'sv-id4',
          insertOptions: [{ templateId: 'template-id4' }],
        },
      ];

      // assert
      expect(pageTemplatesServiceSpy.updateStandardValuesInsertOptions).toHaveBeenCalledWith(expectedUpdates);
    });
  });
});
