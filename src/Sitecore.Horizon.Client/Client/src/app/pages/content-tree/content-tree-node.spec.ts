/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Item } from 'app/shared/graphql/item.interface';
import { ContentTreeLocking } from './content-tree-locking';
import { ContentTreeNode } from './content-tree-node';
import { ContentTreePermissions } from './content-tree-permissions';

function createNode(init?: { id?: string; text?: string; children?: ContentTreeNode[] }): ContentTreeNode {
  const node = new ContentTreeNode({
    id: 'test-node',
    item: {} as Item,
    text: 'test-node-name',
    permissions: ContentTreePermissions.empty(),
    locking: ContentTreeLocking.empty(),
    ...init,
  });

  if (init?.children) {
    node.updateChildren(init.children);
    init.children.forEach((child) => (child.parent = node));
  }

  return node;
}

function createSingleTestNode() {
  return new ContentTreeNode({
    id: 'id333',
    item: {} as Item,
    text: 'testing...',
    permissions: ContentTreePermissions.empty(),
    locking: ContentTreeLocking.empty(),
  });
}

/**
 * Expect tree structure, node text, hasChildren, and node ids to match.
 */
function expectEqualtree(a: readonly ContentTreeNode[], b: readonly ContentTreeNode[]) {
  expect(a.length === b.length);

  for (let i = 0; i < a.length; i++) {
    const nodea = a[i];
    const nodeb = b[i];

    expect(nodea.id).toBe(nodeb.id);
    expect(nodea.text).toBe(nodeb.text);
    expect(nodea.hasChildren).toBe(nodea.children.length > 0);
    expect(nodeb.hasChildren).toBe(nodea.hasChildren);

    expectEqualtree(nodea.children, nodeb.children);
  }
}

describe('ContentTreeNode', () => {
  describe('updateChildren()', () => {
    it('should set the children', () => {
      const sut = createSingleTestNode();
      const childNode = ContentTreeNode.createEmpty();
      sut.updateChildren([childNode]);

      expect(sut.children).toEqual([childNode]);
    });
  });

  describe('resetChildren()', () => {
    it('should set children to `[]` without changing `hasChildren`', () => {
      const sut = createSingleTestNode();
      const childNode = ContentTreeNode.createEmpty();
      sut.updateChildren([childNode]);
      sut.resetChildren();

      expect(sut.children).toEqual([]);
    });
  });

  describe('addChild()', () => {
    it('should add child at the beggining if index is 0', () => {
      const sut = createNode({
        text: 'root',
        children: [
          createNode({ text: '#1' }),
          createNode({ text: '#2' }),
          createNode({ text: '#3' }),
          createNode({ text: '#4' }),
        ],
      });

      const newNode = createNode({ text: 'Hi im new here. Nice to meet you!' });

      sut.addChild(newNode, 0);

      const result = createNode({
        text: 'root',
        children: [
          createNode({ text: 'Hi im new here. Nice to meet you!' }),
          createNode({ text: '#1' }),
          createNode({ text: '#2' }),
          createNode({ text: '#3' }),
          createNode({ text: '#4' }),
        ],
      });

      expectEqualtree([sut], [result]);
    });

    it('should add child at the end if index is length', () => {
      const sut = createNode({
        text: 'root',
        children: [
          createNode({ text: '#1' }),
          createNode({ text: '#2' }),
          createNode({ text: '#3' }),
          createNode({ text: '#4' }),
        ],
      });

      const newNode = createNode({ text: 'Hi im new here. Nice to meet you!' });

      sut.addChild(newNode, sut.children.length);

      const result = createNode({
        text: 'root',
        children: [
          createNode({ text: '#1' }),
          createNode({ text: '#2' }),
          createNode({ text: '#3' }),
          createNode({ text: '#4' }),
          createNode({ text: 'Hi im new here. Nice to meet you!' }),
        ],
      });

      expectEqualtree([sut], [result]);
    });

    it('should add child at given index', () => {
      const sut = createNode({
        text: 'root',
        children: [
          createNode({ text: '#1' }),
          createNode({ text: '#2' }),
          createNode({ text: '#3' }),
          createNode({ text: '#4' }),
        ],
      });

      const newNode = createNode({ text: 'Hi im new here. Nice to meet you!' });

      sut.addChild(newNode, 1);

      const result = createNode({
        text: 'root',
        children: [
          createNode({ text: '#1' }),
          createNode({ text: 'Hi im new here. Nice to meet you!' }),
          createNode({ text: '#2' }),
          createNode({ text: '#3' }),
          createNode({ text: '#4' }),
        ],
      });

      expectEqualtree([sut], [result]);
    });

    it('should add child even if node didnt have children', () => {
      const sut = createNode({
        text: 'root',
      });

      const newNode = createNode({ text: 'Hi im new here. Nice to meet you!' });

      sut.addChild(newNode, 0);

      const result = createNode({
        text: 'root',
        children: [createNode({ text: 'Hi im new here. Nice to meet you!' })],
      });

      expectEqualtree([sut], [result]);
    });
  });

  describe('removeChild', () => {
    it('should remove the child', () => {
      const sut = createNode({
        text: 'root',
        children: [createNode({ text: '#1' }), createNode({ text: '#2' }), createNode({ text: '#3' })],
      });

      sut.removeChild(sut.children[1]);

      const result = createNode({
        text: 'root',
        children: [createNode({ text: '#1' }), createNode({ text: '#3' })],
      });

      expectEqualtree([sut], [result]);
    });

    it('should leave a tree with no children if the only child is removed', () => {
      const sut = createNode({
        text: 'root',
        children: [createNode({ text: '#1' })],
      });

      sut.removeChild(sut.children[0]);

      const result = createNode({ text: 'root' });

      expectEqualtree([sut], [result]);
    });
  });
});
