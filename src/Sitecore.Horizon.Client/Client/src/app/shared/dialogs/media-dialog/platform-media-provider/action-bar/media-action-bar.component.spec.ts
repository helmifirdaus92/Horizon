/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingIndicatorModule } from '@sitecore/ng-spd-lib';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { MediaActionBarComponent } from './media-action-bar.component';

describe(MediaActionBarComponent.name, () => {
  let sut: MediaActionBarComponent;
  let fixture: ComponentFixture<MediaActionBarComponent>;
  let searchSpy: jasmine.Spy;
  let inputDe: DebugElement;
  let input: HTMLInputElement;
  const debounceTime = 500;

  const clearBtnDe = () => fixture.debugElement.query(By.css('.close-btn'));
  const loadingIndicator = () => fixture.debugElement.query(By.css('ng-spd-loading-indicator')).nativeElement;
  const uploadButton = () => fixture.debugElement.query(By.css('.mr-md')).nativeElement;
  const refreshButton = () => fixture.debugElement.query(By.css('.refresh-btn')).nativeElement;

  function setValue(value: string) {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule, TranslateServiceStubModule, FormsModule, LoadingIndicatorModule],
      declarations: [MediaActionBarComponent],
      providers: [],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaActionBarComponent);
    sut = fixture.componentInstance;

    fixture.detectChanges();
    inputDe = fixture.debugElement.query(By.css('.search-input'));
    input = inputDe.nativeElement;
    sut.isLoading = false;

    searchSpy = jasmine.createSpy('spy');
    sut.searchChange.subscribe(searchSpy);
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should not render clear btn', () => {
    expect(clearBtnDe()).toBeFalsy();
  });

  describe('AND two characters are typed', () => {
    it('should not emit search, even after 500ms passed', fakeAsync(() => {
      setValue('ab');
      tick(debounceTime);
      fixture.detectChanges();

      expect(searchSpy).not.toHaveBeenCalled();
      flush();
    }));

    it('should enable clear btn', () => {
      setValue('ab');

      expect(clearBtnDe()).toBeDefined();
    });

    describe('AND search field is submitted', () => {
      it('should emit search', () => {
        setValue('ab');
        input.dispatchEvent(new Event('change'));

        expect(searchSpy).toHaveBeenCalledWith('ab');
      });
    });
  });

  describe('AND three characters are typed', () => {
    const value = 'abc';

    it('should emit search after 500ms without typing anything else', fakeAsync(() => {
      setValue(value);
      tick(debounceTime);

      expect(searchSpy).toHaveBeenCalledWith(value);
      flush();
    }));

    it('should enable clear btn', () => {
      setValue(value);

      expect(clearBtnDe()).toBeDefined();
    });

    describe('AND another character is entered before 500ms', () => {
      it('should not emit the initial three chars.', fakeAsync(() => {
        setValue(value);
        tick(100);
        setValue(value + 'd');
        tick(debounceTime);
        expect(searchSpy).not.toHaveBeenCalledWith(value);
        flush();
      }));

      it('should emit search after 500ms without typing anything else', fakeAsync(() => {
        setValue(value);
        tick(100);
        setValue(value + 'd');
        tick(debounceTime - 100);
        expect(searchSpy).not.toHaveBeenCalled();
        tick(100);
        expect(searchSpy).toHaveBeenCalledWith(value + 'd');
        flush();
      }));
    });

    describe('AND search field is submitted', () => {
      it('should emit search', () => {
        setValue(value);
        input.dispatchEvent(new Event('change'));

        expect(searchSpy).toHaveBeenCalledWith(value);
      });
    });
  });

  describe('AND there is already a search value', () => {
    const initialValue = 'abc';

    beforeEach(fakeAsync(() => {
      setValue(initialValue);
      tick(debounceTime);
      input.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      flush();
    }));

    describe('AND value is deleted', () => {
      it('should emit empty after 500ms without typing anything else', fakeAsync(() => {
        setValue('');
        tick(debounceTime);

        expect(searchSpy).toHaveBeenCalledWith('');
        flush();
      }));

      it('should remove clear btn', () => {
        setValue('');

        expect(clearBtnDe()).toBeFalsy();
      });
    });

    describe('AND clear btn is clicked', () => {
      beforeEach(() => {
        clearBtnDe().triggerEventHandler('click', {});
      });

      it('should emit empty search', () => {
        expect(searchSpy).toHaveBeenCalledWith('');
      });

      it('should clear the value from the input field', () => {
        expect(input.value).toBe('');
      });
    });
  });

  describe('Upload media', () => {
    it('should show loading indicator while file is uploading', () => {
      sut.isLoading = true;
      fixture.detectChanges();

      expect(loadingIndicator()).toBeDefined();
    });

    it('should disable media upload button if no write permission', () => {
      sut.hasCreatePermission = false;

      sut.isLoading = false;
      fixture.detectChanges();

      expect(uploadButton()).toBeDefined();
      expect(uploadButton().disabled).toBeTrue();
    });

    it('should enable media upload button if has write permission', () => {
      sut.hasCreatePermission = true;

      fixture.detectChanges();

      expect(uploadButton()).toBeDefined();
      expect(uploadButton().disabled).toBeFalse();
    });

    it('should enable media upload button if has write permission and loading is done', () => {
      sut.hasCreatePermission = true;
      fixture.detectChanges();

      expect(uploadButton()).toBeDefined();
      expect(uploadButton().disabled).toBeFalse();
    });

    it('should disable media upload button if no write permission and loading is done', () => {
      sut.hasCreatePermission = false;
      fixture.detectChanges();

      expect(uploadButton()).toBeDefined();
      expect(uploadButton().disabled).toBeTrue();
    });

    it('should emit the files when an event is passed', () => {
      spyOn(sut.fileChange, 'emit');

      const fileList: FileList = {
        0: { name: 'image1.jpg' } as any,
        length: 1,
        item: (index: number) => fileList[index],
      };

      const event = {
        target: {
          files: fileList,
        } as HTMLInputElement,
      };
      sut.onFileUpload(event as any);

      expect(sut.fileChange.emit).toHaveBeenCalledWith(fileList);
    });

    it('should not emit the files when event is not passed', () => {
      spyOn(sut.fileChange, 'emit');

      const event = {};

      sut.onFileUpload(event as any);

      expect(sut.fileChange.emit).not.toHaveBeenCalled();
    });

    it('should show the total number of media items', () => {
      sut.totalMediaItems = 2;
      fixture.detectChanges();

      const itemEl = fixture.debugElement.query(By.css('.media-count')).nativeElement;

      expect(itemEl.innerText).toContain('{"count":2}');
    });

    it('should emit refreshItem event when refresh button is clicked', () => {
      spyOn(sut.refreshItem, 'emit');

      refreshButton().dispatchEvent(new Event('click'));

      expect(sut.refreshItem.emit).toHaveBeenCalled();
    });
  });
});
