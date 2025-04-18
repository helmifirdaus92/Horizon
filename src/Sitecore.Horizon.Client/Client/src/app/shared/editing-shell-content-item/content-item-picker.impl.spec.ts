/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ContentItemDialogService } from 'app/shared/dialogs/content-item-dialog/content-item-dialog.service';
import { EMPTY, of } from 'rxjs';
import { EditingShellContentItemPickerImpl } from './content-item-picker.impl';

describe('EditingShellContentItemPickerImpl', () => {
  let editingShellContentItemPickerImpl: EditingShellContentItemPickerImpl;
  let contentItemDialogServiceSpy: jasmine.SpyObj<ContentItemDialogService>;

  beforeEach(() => {
    contentItemDialogServiceSpy = jasmine.createSpyObj('ContentItemDialogService', ['show']);
    editingShellContentItemPickerImpl = new EditingShellContentItemPickerImpl(contentItemDialogServiceSpy);
  });

  describe('prompt()', () => {
    it('should return status "OK" and selected datasource when result is returned', async () => {
      // arrange
      const sampleItem = {
        id: 'a673eae8-f24b-409d-8f2e-a3a5e3ba1fa1',
        path: 'path001',
        language: 'example-language',
        site: 'example-site',
        url: 'url001',
        displayName: 'dName001',
      };
      contentItemDialogServiceSpy.show.and.returnValue(of(sampleItem));

      // act
      const result = await editingShellContentItemPickerImpl.prompt({
        id: null,
        language: '',
        site: 'sample-site',
      });

      // assert
      expect(result).toEqual({
        status: 'OK',
        item: sampleItem,
      });
    });

    it('should return status "Canceled" when no result is returned', async () => {
      // arrange
      contentItemDialogServiceSpy.show.and.returnValue(EMPTY);

      // act
      const result = await editingShellContentItemPickerImpl.prompt({
        id: null,
        language: '',
        site: 'sample-site',
      });

      // assert
      expect(result).toEqual({ status: 'Canceled' });
    });
  });
});
