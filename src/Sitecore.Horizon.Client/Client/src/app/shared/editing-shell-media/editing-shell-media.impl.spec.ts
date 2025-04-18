/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MediaValue } from 'app/editor/right-hand-side/image-field/image-field-messaging.service';
import { EMPTY, of } from 'rxjs';
import { MediaPickerSelection } from 'sdk';
import { MediaDialogService } from '../dialogs/media-dialog/media-dialog.service';
import { EditingShellMediaImpl } from './editing-shell-media.impl';

describe('EditingShellMediaImpl', () => {
  let editingShellMediaImpl: EditingShellMediaImpl;
  let mediaDialogServiceSpy: jasmine.SpyObj<MediaDialogService>;

  beforeEach(() => {
    mediaDialogServiceSpy = jasmine.createSpyObj('MediaDialogService', ['show']);
    editingShellMediaImpl = new EditingShellMediaImpl(mediaDialogServiceSpy);
  });

  describe('prompt()', () => {
    it('should return status "OK" and selected id when result is returned', async () => {
      // arrange
      const selectedValue: MediaValue = {
        src: '',
        rawValue: '',
        embeddedHtml: '',
        alt: undefined,
        height: undefined,
        width: undefined,
      };
      mediaDialogServiceSpy.show.and.returnValue(of(selectedValue));

      // act
      const result = await editingShellMediaImpl.prompt({ sources: [] });

      // assert
      expect(result).toEqual({
        status: 'OK',
        selectedValue: selectedValue as MediaPickerSelection,
      });
    });

    it('should return status "Canceled" when no result is returned', async () => {
      // arrange
      mediaDialogServiceSpy.show.and.returnValue(EMPTY);

      // act
      const result = await editingShellMediaImpl.prompt({ sources: [] });

      // assert
      expect(result).toEqual({ status: 'Canceled' });
    });
  });
});
