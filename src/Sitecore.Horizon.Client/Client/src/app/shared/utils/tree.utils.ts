/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ContentTreeNode } from 'app/pages/content-tree/content-tree-node';
import {
  ParentItemHierarchy,
  VIRTUAL_PAGE_TEMPLATE_ID,
} from '../dialogs/datasource-picker/datasource-picker.component';
import { TreeNode } from '../item-tree/item-tree.component';
import { isSameGuid } from './utils';

interface FlatNode {
  id: string;
  parentId: string;
}

interface Node<T extends Node<T>> {
  children?: T[];
}

/**
 * Adds hierarchy to the given `flatTree` by adding each node to the `children` of its corresponding parent.
 * It preserves the given order.
 * The nodes in the result are copies of the given nodes.
 * @param flatTree is sorted in a way that any parent node must be placed before its children.
 */
export function convertToNestedTree<T extends FlatNode & Node<T>>(flatTree: readonly T[]): T[] {
  // aux. stack of nodes
  const parentCandidates: T[] = [];
  const findParentInCurrentStack = (id: string) => {
    do {
      const parent = parentCandidates[parentCandidates.length - 1];
      if (parent && parent.id === id) {
        return parent;
      }
    } while (parentCandidates.pop());
    return undefined;
  };
  const addNodeToStack = (node: T) => parentCandidates.push(node);

  return flatTree.reduce<T[]>((acc, current) => {
    const parent = findParentInCurrentStack(current.parentId);
    const copy = { ...current };
    addNodeToStack(copy);

    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(copy);
    } else {
      acc.push(copy);
    }
    return acc;
  }, []);
}

function _findNodeAncestors<T extends Node<T>, K extends keyof T>(
  branch: T,
  id: T[K],
  key: K,
  ancestors: T[] = [],
): T[] | undefined {
  ancestors.push(branch);

  if (branch[key] === id) {
    return ancestors;
  }

  for (const child of branch.children || []) {
    const foundInChild = _findNodeAncestors(child, id, key, [...ancestors]);
    if (foundInChild) {
      return foundInChild;
    }
  }
  return undefined;
}

export function findNodeAncestors<T extends Node<T>, K extends keyof T>(tree: readonly T[], idKey: K, id: T[K]): T[] {
  for (const branch of tree) {
    const foundInBranch = _findNodeAncestors(branch, id, idKey);
    if (foundInBranch) {
      return foundInBranch;
    }
  }
  return [];
}

export function isVirtualPageTemplate(templateId: string | undefined): boolean {
  return isSameGuid(templateId, VIRTUAL_PAGE_TEMPLATE_ID);
}

export function findTreeNode(itemId: string, items: readonly ContentTreeNode[]): ContentTreeNode | undefined {
  const item = items.find((node) => isSameGuid(node.id, itemId));
  if (!item) {
    for (const node of items) {
      const children = node.children;
      const subItem = findTreeNode(itemId, children);

      if (subItem) {
        return subItem;
      }
    }
  }

  return item;
}

export function retrieveParentHierarchy(
  tree: TreeNode[],
  id: string,
  parent: ParentItemHierarchy | undefined = undefined,
): ParentItemHierarchy | undefined {
  for (const node of tree) {
    const currentParent: ParentItemHierarchy = {
      id: node.id,
      template: { id: node.template?.id ?? '', baseTemplateIds: node.template?.baseTemplateIds || [] },
      parent,
    };

    if (isSameGuid(node.id, id)) {
      return parent;
    }

    if (node.children) {
      const found = retrieveParentHierarchy(node.children, id, currentParent);
      if (found) return found;
    }
  }
  return undefined;
}
