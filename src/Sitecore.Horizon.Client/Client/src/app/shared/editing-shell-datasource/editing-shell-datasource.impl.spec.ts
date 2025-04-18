/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { DatasourceDialogService } from 'app/shared/dialogs/datasource-dialog/datasource-dialog.service';
import { EMPTY, of } from 'rxjs';
import { EditingShellDatasourceImpl } from './editing-shell-datasource.impl';

describe(EditingShellDatasourceImpl.name, () => {
  let editingShellDatasourceImpl: EditingShellDatasourceImpl;
  let datasourceDialogServiceSpy: jasmine.SpyObj<DatasourceDialogService>;

  beforeEach(() => {
    datasourceDialogServiceSpy = jasmine.createSpyObj('DatasourceDialogService', ['show']);
    editingShellDatasourceImpl = new EditingShellDatasourceImpl(datasourceDialogServiceSpy);
  });

  describe('prompt()', () => {
    it('should return status "OK" and selected datasource when result is returned', async () => {
      // arrange
      const sampleDatasource = 'a673eae8-f24b-409d-8f2e-a3a5e3ba1fa1';
      datasourceDialogServiceSpy.show.and.returnValue(of({ itemId: sampleDatasource, layoutRecord: sampleDatasource }));

      // act
      const result = await editingShellDatasourceImpl.prompt(
        { renderingId: 'id' },
        { compatibleTemplateIds: ['template1', 'template2'] },
      );

      // assert
      expect(result).toEqual({
        status: 'OK',
        datasource: sampleDatasource,
      });
    });

    it('should pass custom parameters to the dialog', async () => {
      // arrange
      datasourceDialogServiceSpy.show.and.returnValue(
        of({ itemId: 'a673eae8-f24b-409d-8f2e-a3a5e3ba1fa1', layoutRecord: 'a673eae8-f24b-409d-8f2e-a3a5e3ba1fa1' }),
      );
      const renderingParams = { renderingId: 'id' };
      const options = {
        compatibleTemplateIds: ['template1', 'template2'],
        customParameters: { par1: 'val1', par2: 'val2' },
      };

      // act
      await editingShellDatasourceImpl.prompt(renderingParams, options);

      // assert
      expect(datasourceDialogServiceSpy.show).toHaveBeenCalledOnceWith(
        jasmine.objectContaining(renderingParams),
        options,
      );
    });

    it('should return status "Canceled" when no result is returned', async () => {
      // arrange
      datasourceDialogServiceSpy.show.and.returnValue(EMPTY);

      // act
      const result = await editingShellDatasourceImpl.prompt(
        { renderingId: 'id' },
        { compatibleTemplateIds: ['template1', 'template2'] },
      );

      // assert
      expect(result).toEqual({ status: 'Canceled' });
    });
  });
});
