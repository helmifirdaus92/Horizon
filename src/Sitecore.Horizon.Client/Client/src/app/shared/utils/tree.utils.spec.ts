/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { convertToNestedTree, findNodeAncestors } from './tree.utils';

describe('tree utils', () => {
  describe('convertToNestedTree', () => {
    it('should convert a flat tree to nested', () => {
      const input = [
        { id: 'a', parentId: '', bar: 'foo' },
        { id: 'b', parentId: '', bar: 'foo' },
        { id: 'c', parentId: 'b', bar: 'foo' },
        { id: 'd', parentId: 'c', bar: 'foo' },
        { id: 'e', parentId: 'b', bar: 'foo' },
      ];
      const expectedOutput = [input[0], { ...input[1], children: [{ ...input[2], children: [input[3]] }, input[4]] }];

      expect(convertToNestedTree(input)).toEqual(expectedOutput);
    });
  });

  describe('findNodeAncestors', () => {
    it('should return an array of ancestor nodes for the given node id', () => {
      const nodeToFind = {
        id: 'a21',
      };
      const tree = [
        {
          id: 'a',
          children: [
            {
              id: 'a1',
            },
            {
              id: 'a2',
              children: [nodeToFind],
            },
            {
              id: 'a3',
            },
          ],
        },
        { id: 'b' },
      ];

      const output = findNodeAncestors(tree, 'id', nodeToFind.id);

      expect(output.length).toBe(3);
      expect(output[0]).toBe(tree[0]);
      expect(output[1]).toBe(tree[0].children![1]);
      expect(output[2]).toBe(nodeToFind);
    });
  });
});
