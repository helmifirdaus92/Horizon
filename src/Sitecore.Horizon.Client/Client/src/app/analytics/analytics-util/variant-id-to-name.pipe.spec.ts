/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { variantIdToName, VariantIdToNamePipe } from './variant-id-to-name.pipe';

describe('variantIdToName function', () => {
  it('case 1', () => {
    expect(variantIdToName({ name: 'randomindex_en_name1', value: 1 }, [], 'default text')).toEqual({
      name: 'randomindex_en_name1',
      value: 1,
    });
  });

  it('case 2', () => {
    expect(variantIdToName({ name: 'randomindex_en_name1', value: 1 }, [], undefined as any)).toEqual({
      name: 'randomindex_en_name1',
      value: 1,
    });
  });

  it('case 3', () => {
    expect(
      variantIdToName(
        { name: 'randomindex_en_name1', value: 1 },
        [{ variantId: 'name1', variantName: 'new name' }],
        'default text',
      ),
    ).toEqual({ name: 'new name', value: 1 });
  });

  it('case 4', () => {
    expect(
      variantIdToName(
        { name: 'randomindex_en_name1', value: 1 },
        [
          { variantId: 'name1', variantName: 'new name' },
          { variantId: 'name1', variantName: 'new name 2' },
        ],
        'default text',
      ),
    ).toEqual({ name: 'new name', value: 1 });
  });

  it('case 5', () => {
    expect(
      variantIdToName(
        { name: 'randomindex_en_name1', value: 1 },
        [
          { variantId: 'name2', variantName: 'new name' },
          { variantId: 'name1', variantName: 'new name' },
        ],
        'default text',
      ),
    ).toEqual({ name: 'new name', value: 1 });
  });

  it('case 6', () => {
    expect(
      variantIdToName(
        { name: 'randomindex_en_name1', value: 1 },
        [
          { variantId: 'name1', variantName: 'new name' },
          { variantId: 'name2', variantName: 'new name 2' },
        ],
        'default text',
      ),
    ).toEqual({ name: 'new name', value: 1 });
  });
});

describe(VariantIdToNamePipe.name, () => {
  let sut: VariantIdToNamePipe;
  let translateServiceStub: Partial<TranslateService>;

  beforeEach(() => {
    translateServiceStub = {
      get: (val) => of(val),
    };
    sut = new VariantIdToNamePipe(translateServiceStub as any);
  });

  it('create an instance', () => {
    expect(sut).toBeTruthy();
  });

  it('should transform data case 1', async () => {
    expect(
      await sut.transform(null, [
        { variantId: 'name1', variantName: 'new name' },
        { variantId: 'name2', variantName: 'new name 2' },
      ]),
    ).toEqual(null);
  });

  it('should transform data case 2', async () => {
    expect(
      await sut.transform(undefined, [
        { variantId: 'name1', variantName: 'new name' },
        { variantId: 'name2', variantName: 'new name 2' },
      ]),
    ).toEqual(undefined);
  });

  it('should transform data case 3', async () => {
    expect(
      await sut.transform(
        {
          data: {
            current: [],
            historic: [],
          },
        } as any,
        [
          { variantId: 'name1', variantName: 'new name' },
          { variantId: 'name2', variantName: 'new name 2' },
        ],
      ),
    ).toEqual({
      data: {
        current: [],
        historic: [],
      },
    } as any);
  });

  it('should transform data case 4', async () => {
    expect(
      await sut.transform(
        {
          data: {
            current: [
              { name: 'randomindex_en_name1', value: 1 },
              { name: 'randomindex_en_name2', value: 2 },
              { name: 'randomindex_en_name3', value: 3 },
            ],
            historic: [
              { name: 'h-randomindex_en_name1', value: 1 },
              { name: 'h-randomindex_en_name2', value: 2 },
              { name: 'h-randomindex_en_name3', value: 3 },
            ],
          },
        } as any,
        [],
      ),
    ).toEqual({
      data: {
        current: [
          { name: 'randomindex_en_name1', value: 1 },
          { name: 'randomindex_en_name2', value: 2 },
          { name: 'randomindex_en_name3', value: 3 },
        ],
        historic: [
          { name: 'h-randomindex_en_name1', value: 1 },
          { name: 'h-randomindex_en_name2', value: 2 },
          { name: 'h-randomindex_en_name3', value: 3 },
        ],
      },
    } as any);
  });

  it('should transform data case 5', async () => {
    expect(
      await sut.transform(
        {
          data: {
            current: [
              { name: 'randomindex_en_name1', value: 1 },
              { name: 'randomindex_en_name2', value: 2 },
              { name: 'randomindex_en_name3', value: 3 },
            ],
            historic: [
              { name: 'h-randomindex_en_name1', value: 1 },
              { name: 'h-randomindex_en_name2', value: 2 },
              { name: 'h-randomindex_en_name3', value: 3 },
            ],
          },
        } as any,
        [
          { variantId: 'name1', variantName: 'new name' },
          { variantId: 'name2', variantName: 'new name 2' },
        ],
      ),
    ).toEqual({
      data: {
        current: [
          { name: 'new name', value: 1 },
          { name: 'new name 2', value: 2 },
          { name: 'randomindex_en_name3', value: 3 },
        ],
        historic: [
          { name: 'new name', value: 1 },
          { name: 'new name 2', value: 2 },
          { name: 'h-randomindex_en_name3', value: 3 },
        ],
      },
    } as any);
  });
});
